<?php

namespace App\Services\POSCreditOrders;

use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPayment;
use App\Models\InstallmentOrderPaymentHistory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class POSCreditOrderService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return $this->indexQuery($filters)
            ->latest('transaction_date')
            ->paginate(8)
            ->withQueryString();
    }

    public function findByOrderNumber(string $orderNumber): InstallmentOrder
    {
        return InstallmentOrder::with([
            'remarks.user',
            'customer',
            'location',
            'user',
            'voider',
            'branch',
            'installment_order_items.item',
            'installment_order_payments.installment_order_payment_history.user',
        ])->where('order_number', $orderNumber)->firstOrFail();
    }

    public function paymentHistory(InstallmentOrder $order): Collection
    {
        return $order->installment_order_payments
            ->flatMap(fn ($payment) => $payment->installment_order_payment_history);
    }

    public function recordPayment(array $data): void
    {
        DB::transaction(function () use ($data) {
            $installmentOrder = InstallmentOrder::findOrFail($data['installment_order_id']);
            $this->allocatePayment($installmentOrder, $data['amount_paid'], $data);
            $this->syncCompletion($installmentOrder);
        });
    }

    public function void(int $id, array $data): void
    {
        DB::transaction(function () use ($id, $data) {
            $order = InstallmentOrder::with('installment_order_items.item')->findOrFail($id);

            $order->update([
                'is_voided' => true,
                'reason_for_cancellation' => $data['reason_for_cancellation'],
                'void_date' => now(),
                'voider_id' => Auth::id(),
            ]);

            $this->clearItemDateOut($order);
        });
    }

    public function default(int $id, array $data): void
    {
        DB::transaction(function () use ($id, $data) {
            $order = InstallmentOrder::with('installment_order_items.item')->findOrFail($id);

            $order->update([
                'is_defaulted' => true,
                'default_reason' => $data['default_reason'],
                'default_date' => now(),
                'defaulter_id' => Auth::id(),
            ]);

            $this->clearItemDateOut($order);
        });
    }

    public function reactivate(int $id, array $data): void
    {
        DB::transaction(function () use ($id, $data) {
            $order = InstallmentOrder::with('installment_order_items.item')->findOrFail($id);

            $order->update([
                'is_defaulted' => false,
                'is_reactivated' => true,
                'reactivation_reason' => $data['reactivation_reason'],
                'reactivation_date' => now(),
                'reactivator_id' => Auth::id(),
            ]);

            $order->installment_order_items->each(function ($orderItem) use ($order) {
                $orderItem->item?->update(['date_out' => $order->transaction_date]);
            });
        });
    }

    public function rebate(array $data): void
    {
        DB::transaction(function () use ($data) {
            $payment = InstallmentOrderPayment::findOrFail($data['installment_order_payment_id']);
            $newRebateAmount = $payment->rebate_amount + $data['rebate_amount'];
            $effectiveAmountDue = $payment->amount_due - $newRebateAmount;
            $amountPaid = $payment->amount_paid ?? 0;

            if ($amountPaid >= $effectiveAmountDue) {
                $newStatus = 'paid';
            } elseif ($amountPaid > 0) {
                $newStatus = 'partial';
            } else {
                $newStatus = $payment->status;
            }

            $payment->update([
                'rebate_amount' => $newRebateAmount,
                'rebate_reason' => $data['rebate_reason'],
                'status' => $newStatus,
            ]);

            $installmentOrder = InstallmentOrder::with('installment_order_payments')
                ->findOrFail($payment->installment_order_id);
            $this->syncCompletion($installmentOrder, onlyWhenComplete: true);
        });
    }

    public function accelerate(array $data): void
    {
        DB::transaction(function () use ($data) {
            $installmentOrder = InstallmentOrder::findOrFail($data['installment_order_id']);

            $installmentOrder->update([
                'acceleration_date' => now(),
                'is_accelerated' => true,
                'reason_for_acceleration' => $data['reason_for_acceleration'],
                'acceleration_discount' => $data['acceleration_discount'],
            ]);

            $this->allocatePayment($installmentOrder, $data['amount_paid'], $data, partialStatus: 'paid');
            $installmentOrder->update(['is_completed' => true]);
        });
    }

    public function updatePaymentHistory(int $historyId, array $data): void
    {
        DB::transaction(function () use ($historyId, $data) {
            $paymentHistory = InstallmentOrderPaymentHistory::findOrFail($historyId);
            $payment = InstallmentOrderPayment::findOrFail($paymentHistory->payment_id);
            $installmentOrder = InstallmentOrder::findOrFail($payment->installment_order_id);
            $amountDifference = $data['amount'] - $paymentHistory->amount;

            $paymentHistory->update([
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'reference_number' => $data['reference_number'],
                'paid_date' => $data['paid_date'],
                'collection_receipt_number' => $data['collection_receipt_number'],
                'branch_id' => $data['branch_id'],
            ]);

            $this->updatePaymentAmount($payment, $payment->amount_paid + $amountDifference, $data);
            $this->syncCompletion($installmentOrder);
        });
    }

    public function deletePaymentHistory(int $historyId): void
    {
        DB::transaction(function () use ($historyId) {
            $paymentHistory = InstallmentOrderPaymentHistory::findOrFail($historyId);
            $payment = InstallmentOrderPayment::findOrFail($paymentHistory->payment_id);
            $installmentOrder = InstallmentOrder::findOrFail($payment->installment_order_id);

            $newTotalPaid = $payment->amount_paid - $paymentHistory->amount;
            $this->updatePaymentAmount($payment, max(0, $newTotalPaid));

            $paymentHistory->delete();
            $this->syncCompletion($installmentOrder);
        });
    }

    public function findForPaymentSchedule(int $id): InstallmentOrder
    {
        return InstallmentOrder::with([
            'customer',
            'branch',
            'user',
            'installment_order_items.item',
            'installment_order_payments' => fn ($query) => $query->orderBy('installment_number'),
            'installment_order_payments.installment_order_payment_history.user',
        ])->findOrFail($id);
    }

    public function paymentScheduleData(InstallmentOrder $order): array
    {
        $lcp = $order->loan_contract_price;
        $down = $order->down_payment;
        $pnv = $lcp - $down;
        $pnvCharge = (float) $order->promisory_note_value_interest_additional_charge;
        $finalPnv = $pnv * $order->promisory_note_value_interest + $pnvCharge;
        if ($finalPnv == 0) {
            $finalPnv = $lcp;
        }

        $totalPaid = (float) $order->total_amount_paid;
        $totalRebate = (float) $order->total_rebate_amount;
        $remainingBalance = (float) $order->remaining_balance - $totalRebate;
        $progress = ($finalPnv > 0 && $totalPaid > 0)
            ? round(($totalPaid / $finalPnv) * 100, 1)
            : 0;

        return [
            'order' => $order,
            'finalPnv' => $finalPnv,
            'totalPaid' => $totalPaid,
            'remainingBalance' => $remainingBalance,
            'progress' => $progress,
            'generatedAt' => now()->format('F d, Y h:i A'),
        ];
    }

    private function indexQuery(array $filters): Builder
    {
        $query = InstallmentOrder::with([
            'customer',
            'user',
            'location',
            'branch',
            'installment_order_items.item',
            'installment_order_payments.installment_order_payment_history',
        ]);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $query) use ($search) {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', function (Builder $customerQuery) use ($search) {
                        $customerQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                    });
            });
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('transaction_date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->whereDate('transaction_date', '<=', $filters['date_to']);
        }

        if (! empty($filters['location_id']) && $filters['location_id'] !== 'all') {
            $query->where('branch_id', $filters['location_id']);
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->when($filters['status'] === 'active', fn (Builder $query) => $query->where('is_voided', false)
                ->where('is_defaulted', false)
                ->where('is_completed', false))
                ->when($filters['status'] === 'voided', fn (Builder $query) => $query->where('is_voided', true))
                ->when($filters['status'] === 'defaulted', fn (Builder $query) => $query->where('is_defaulted', true))
                ->when($filters['status'] === 'complete', fn (Builder $query) => $query->where('is_completed', true));
        }

        if (! empty($filters['item_type']) && $filters['item_type'] !== 'all') {
            $query->whereHas('installment_order_items.item', function (Builder $query) use ($filters) {
                $query->where('item_type', $filters['item_type']);
            });
        }

        if (! empty($filters['advanced_filter']) && $filters['advanced_filter'] !== 'all') {
            $this->applyAdvancedFilter($query, $filters['advanced_filter']);
        }

        return $query;
    }

    private function applyAdvancedFilter(Builder $query, string $advancedFilter): void
    {
        $today = now();

        $query->where('is_voided', false)
            ->where('is_defaulted', false)
            ->where('is_accelerated', false)
            ->where('is_completed', false);

        match ($advancedFilter) {
            '1_30_days_aging' => $query->whereHas('installment_order_payments', fn (Builder $query) => $this->applyOldestUnpaidDueDateFilter(
                $query,
                '<',
                $today,
                '>=',
                $today->copy()->subDays(30)
            )),
            '31_60_days_aging' => $query->whereHas('installment_order_payments', fn (Builder $query) => $this->applyOldestUnpaidDueDateFilter(
                $query,
                '<',
                $today->copy()->subDays(30),
                '>=',
                $today->copy()->subDays(60)
            )),
            '61_90_days_aging' => $query->whereHas('installment_order_payments', fn (Builder $query) => $this->applyOldestUnpaidDueDateFilter(
                $query,
                '<',
                $today->copy()->subDays(60),
                '>=',
                $today->copy()->subDays(90)
            )),
            '90+_days_aging' => $query->whereHas('installment_order_payments', fn (Builder $query) => $this->applyOldestUnpaidDueDateFilter(
                $query,
                '<=',
                $today->copy()->subDays(90)
            )),
            'due_loans' => $query->whereHas('installment_order_payments', fn (Builder $query) => $this->applyOldestUnpaidDueDateFilter(
                $query,
                '=',
                $today->copy()->format('Y-m-d')
            )),
            default => null,
        };
    }

    private function applyOldestUnpaidDueDateFilter(
        Builder $query,
        string $firstOperator,
        mixed $firstDate,
        ?string $secondOperator = null,
        mixed $secondDate = null
    ): Builder {
        $query->whereRaw('amount_paid < (amount_due - rebate_amount)')
            ->where('due_date', $firstOperator, $firstDate)
            ->whereRaw('id = (
                SELECT id
                FROM installment_order_payments AS iop
                WHERE iop.installment_order_id = installment_order_payments.installment_order_id
                    AND iop.amount_paid < (iop.amount_due - iop.rebate_amount)
                ORDER BY iop.due_date ASC
                LIMIT 1
            )');

        if ($secondOperator !== null) {
            $query->where('due_date', $secondOperator, $secondDate);
        }

        return $query;
    }

    private function allocatePayment(
        InstallmentOrder $installmentOrder,
        float|int|string $amount,
        array $data,
        string $partialStatus = 'partial'
    ): void {
        $remainingPayment = $amount;
        $payments = $installmentOrder->installment_order_payments()
            ->whereIn('status', ['pending', 'partial', 'overdue'])
            ->orderBy('installment_number')
            ->get();

        foreach ($payments as $payment) {
            if ($remainingPayment <= 0) {
                break;
            }

            $currentAmountPaid = $payment->amount_paid ?? 0;
            $remainingDue = ($payment->amount_due - $payment->rebate_amount) - $currentAmountPaid;

            if ($remainingPayment >= $remainingDue) {
                $paymentAmount = $remainingDue;
                $payment->update([
                    'amount_paid' => $payment->amount_due - $payment->rebate_amount,
                    'status' => 'paid',
                    'payment_method' => $data['payment_method'],
                    'reference_number' => $data['reference_number'],
                    'paid_date' => $data['paid_date'],
                ]);
            } else {
                $paymentAmount = $remainingPayment;
                $newTotalPaid = $currentAmountPaid + $remainingPayment;
                $status = $newTotalPaid >= $payment->amount_due - $payment->rebate_amount ? 'paid' : $partialStatus;

                $payment->update([
                    'amount_paid' => $newTotalPaid,
                    'status' => $status,
                    'payment_method' => $data['payment_method'],
                    'reference_number' => $data['reference_number'],
                    'paid_date' => $data['paid_date'],
                ]);
            }

            InstallmentOrderPaymentHistory::create([
                'payment_id' => $payment->id,
                'amount' => $paymentAmount,
                'payment_method' => $data['payment_method'],
                'reference_number' => $data['reference_number'],
                'paid_date' => $data['paid_date'],
                'user_id' => Auth::id(),
                'collection_receipt_number' => $data['collection_receipt_number'],
                'branch_id' => $data['branch_id'],
            ]);

            $remainingPayment -= $paymentAmount;
        }
    }

    private function updatePaymentAmount(InstallmentOrderPayment $payment, float|int|string $newTotalPaid, array $data = []): void
    {
        $effectiveAmountDue = $payment->amount_due - $payment->rebate_amount;

        if ($newTotalPaid >= $effectiveAmountDue) {
            $newStatus = 'paid';
        } elseif ($newTotalPaid > 0) {
            $newStatus = 'partial';
        } else {
            $newStatus = now()->gt($payment->due_date) ? 'overdue' : 'pending';
        }

        $update = [
            'amount_paid' => max(0, $newTotalPaid),
            'status' => $newStatus,
        ];

        foreach (['payment_method', 'reference_number', 'paid_date'] as $key) {
            if (array_key_exists($key, $data)) {
                $update[$key] = $data[$key];
            }
        }

        $payment->update($update);
    }

    private function syncCompletion(InstallmentOrder $installmentOrder, bool $onlyWhenComplete = false): void
    {
        $unpaidCount = $installmentOrder->installment_order_payments()
            ->where('status', '!=', 'paid')
            ->count();

        if ($onlyWhenComplete) {
            if ($unpaidCount === 0 && ! $installmentOrder->is_completed) {
                $installmentOrder->update(['is_completed' => true]);
            }

            return;
        }

        $installmentOrder->update(['is_completed' => $unpaidCount === 0]);
    }

    private function clearItemDateOut(InstallmentOrder $order): void
    {
        $order->installment_order_items->each(function ($orderItem) {
            $orderItem->item?->update(['date_out' => null]);
        });
    }
}
