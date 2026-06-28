<?php

namespace App\Services\Dashboard;

use App\Models\Branch;
use App\Models\Customer;
use App\Models\Employee;
use App\Models\ExpenseRecord;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPaymentHistory;
use App\Models\Item;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DashboardService
{
    public function canViewCollectionDashboard(User $user): bool
    {
        $roles = $user->getRoleNames();

        return $roles->contains('super admin') || $roles->contains('cashier');
    }

    public function isSuperAdmin(User $user): bool
    {
        return $user->getRoleNames()->contains('super admin');
    }

    public function inventoryOverview(): array
    {
        $inventoryData = Item::whereNull('date_out')
            ->selectRaw('item_type AS category, SUM(srp) AS srp, SUM(unit_cost) AS unitCost')
            ->groupBy('item_type')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'srp' => (int) $row->srp,
                'unitCost' => (int) $row->unitCost,
            ])
            ->values();

        $srpTotal = $inventoryData->sum('srp');
        $unitCostTotal = $inventoryData->sum('unitCost');
        $marginPercent = $unitCostTotal > 0
            ? (($srpTotal - $unitCostTotal) / $unitCostTotal) * 100
            : 0;

        return [
            'srpTotal' => number_format($srpTotal, 2, '.', ','),
            'unitTotalCost' => number_format($unitCostTotal, 2, '.', ','),
            'customers' => Customer::count(),
            'users' => User::count(),
            'employees' => Employee::count(),
            'marginPercent' => number_format($marginPercent),
            'potentialProfit' => number_format($srpTotal - $unitCostTotal, 2, '.', ','),
            'inventoryData' => $inventoryData->toArray(),
        ];
    }

    public function collectionDashboard(array $input, ?int $userId = null): array
    {
        $filters = $this->filters($input);
        $transactions = $this->transactions($filters, $userId);
        $totals = $this->totals($transactions['calculationRows']);

        return [
            'allTransactions' => $transactions['displayRows'],
            'mops' => $totals['mops'],
            'miCollection' => $totals['miCollection'],
            'dpCollection' => $totals['dpCollection'],
            'cashCollection' => $totals['cashCollection'],
            'netCollection' => $totals['netCollection'],
            'expenses' => $this->approvedExpenses($filters, $userId),
            'totalCashOnHand' => $totals['totalCashOnHand'],
            'totalOtherMop' => $totals['totalOtherMop'],
            'employees' => Branch::dropdown(),
            'filters' => [
                'from_date' => $filters['from_date'],
                'to_date' => $filters['to_date'],
                'employee_id' => $filters['branch_id'],
            ],
        ];
    }

    public function transactionsPdf(array $input, ?int $userId = null): array
    {
        $filters = $this->filters($input);
        $dashboard = $this->collectionDashboard($input, $userId);

        return array_merge($dashboard, [
            'fromDate' => Carbon::parse($filters['from_date'])->format('F d, Y'),
            'toDate' => Carbon::parse($filters['to_date'])->format('F d, Y'),
            'employeeName' => $this->branchName($filters['branch_id']),
            'generatedAt' => now()->format('F d, Y h:i A'),
        ]);
    }

    private function filters(array $input): array
    {
        $branchId = $input['branch_id'] ?? null;

        return [
            'from_date' => $input['from_date'] ?? today()->toDateString(),
            'to_date' => $input['to_date'] ?? today()->toDateString(),
            'branch_id' => $branchId && $branchId !== 'all' ? $branchId : null,
        ];
    }

    private function transactions(array $filters, ?int $userId): array
    {
        $cashOrders = $this->cashOrdersQuery($filters, $userId)->get();
        $installmentOrders = $this->installmentOrdersQuery($filters, $userId)
            ->get()
            ->map(fn (InstallmentOrder $order) => $this->installmentOrderRow($order));
        $installmentPayments = $this->installmentPaymentsQuery($filters, $userId)
            ->get()
            ->map(fn (InstallmentOrderPaymentHistory $payment) => $this->installmentPaymentRow($payment));

        $displayRows = collect()
            ->concat($cashOrders->map(fn (Order $order) => $this->cashOrderDisplayRow($order)))
            ->concat($installmentOrders)
            ->concat($this->groupInstallmentPaymentsForDisplay($installmentPayments))
            ->sortByDesc('date')
            ->values();

        $calculationRows = collect()
            ->concat($cashOrders->flatMap(fn (Order $order) => $this->cashOrderPaymentRows($order)))
            ->concat($installmentOrders)
            ->concat($installmentPayments);

        return compact('displayRows', 'calculationRows');
    }

    private function cashOrdersQuery(array $filters, ?int $userId): Builder
    {
        return Order::with(['customer', 'order_items.item', 'employee', 'payments'])
            ->whereBetween(DB::raw('DATE(transaction_date)'), [$filters['from_date'], $filters['to_date']])
            ->when($filters['branch_id'], fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($userId, fn (Builder $query) => $query->where('employee_id', $userId));
    }

    private function installmentOrdersQuery(array $filters, ?int $userId): Builder
    {
        return InstallmentOrder::with(['customer', 'user', 'installment_order_items.item'])
            ->whereBetween(DB::raw('DATE(transaction_date)'), [$filters['from_date'], $filters['to_date']])
            ->when($filters['branch_id'], fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($userId, fn (Builder $query) => $query->where('user_id', $userId));
    }

    private function installmentPaymentsQuery(array $filters, ?int $userId): Builder
    {
        return InstallmentOrderPaymentHistory::with([
            'installment_order_payment.installment_order.customer',
            'installment_order_payment.installment_order.installment_order_items.item',
            'user',
        ])
            ->whereBetween(DB::raw('DATE(paid_date)'), [$filters['from_date'], $filters['to_date']])
            ->whereHas('installment_order_payment.installment_order', fn (Builder $query) => $query->where('is_voided', false))
            ->when($filters['branch_id'], fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($userId, fn (Builder $query) => $query->where('user_id', $userId));
    }

    private function totals(Collection $transactions): array
    {
        $activeTransactions = $transactions->where('is_voided', false);
        $miCollection = $activeTransactions->where('m_i', '!=', null)->sum('m_i') ?? 0;
        $dpCollection = $activeTransactions->where('d_p', '!=', null)->sum('d_p') ?? 0;
        $cashCollection = $activeTransactions->where('amount_paid', '!=', null)->sum('amount_paid') ?? 0;

        $mops = $activeTransactions
            ->groupBy('payment_method')
            ->map(fn (Collection $group) => $group->sum(
                fn (array $transaction) => ($transaction['m_i'] ?? 0)
                    + ($transaction['d_p'] ?? 0)
                    + ($transaction['amount_paid'] ?? 0)
            ));

        return [
            'miCollection' => $miCollection,
            'dpCollection' => $dpCollection,
            'cashCollection' => $cashCollection,
            'netCollection' => $miCollection + $dpCollection + $cashCollection,
            'mops' => $mops,
            'totalCashOnHand' => $mops->get('cash', 0),
            'totalOtherMop' => $mops->except(['cash'])->sum(),
        ];
    }

    private function approvedExpenses(array $filters, ?int $userId): float|int
    {
        return ExpenseRecord::where('status', 'approved')
            ->whereDate('expense_date', '>=', $filters['from_date'])
            ->whereDate('expense_date', '<=', $filters['to_date'])
            ->when($filters['branch_id'], fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($userId, fn (Builder $query) => $query->where('user_id', $userId))
            ->sum('amount');
    }

    private function cashOrderPaymentRows(Order $order): Collection
    {
        return $this->effectiveOrderPayments($order)
            ->map(fn (array $payment) => array_merge($this->baseCashOrderRow($order), [
                'amount_paid' => $payment['amount'],
                'payment_method' => $this->normalizePaymentMethod($payment['payment_method']),
                'reference_number' => $payment['reference_number'],
            ]));
    }

    private function cashOrderDisplayRow(Order $order): array
    {
        $payments = $this->effectiveOrderPayments($order);

        return array_merge($this->baseCashOrderRow($order), [
            'amount_paid' => $order->total_price,
            'payment_method' => $payments->count() > 1
                ? 'Split: '.$payments
                    ->groupBy('payment_method')
                    ->map(fn (Collection $items, string $method) => ucfirst($this->normalizePaymentMethod($method)).' ₱'.number_format($items->sum('amount'), 2))
                    ->implode(', ')
                : $this->normalizePaymentMethod($payments->first()['payment_method']),
            'reference_number' => $payments->pluck('reference_number')->filter()->implode(', '),
            'type' => 'cash',
            'order_number' => $order->order_number
        ]);
    }

    private function baseCashOrderRow(Order $order): array
    {
        return [
            'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
            'receipt_number' => $order->receipt_number,
            'customer' => $order->customer->full_name,
            'm_i' => null,
            'd_p' => null,
            'amount_paid' => null,
            'payment_method' => null,
            'reference_number' => null,
            'is_voided' => $order->is_void,
            'created_at' => $order->created_at,
            'employee_name' => $order->employee->full_name ?? 'N/A',
            'remarks' => $order->order_items->map(fn ($item) => $item->item->model)->implode(', '),
            'type' => 'cash',
            'order_number' => $order->order_number
        ];
    }

    private function installmentOrderRow(InstallmentOrder $order): array
    {
        return [
            'date' => Carbon::parse($order->transaction_date)->format('F d, Y'),
            'receipt_number' => $order->receipt_number,
            'customer' => $order->customer->full_name,
            'm_i' => null,
            'd_p' => $order->down_payment,
            'amount_paid' => null,
            'payment_method' => $this->normalizePaymentMethod($order->payment_method),
            'reference_number' => $order->reference_number,
            'is_voided' => $order->is_voided,
            'created_at' => $order->created_at,
            'employee_name' => $order->user->full_name ?? 'N/A',
            'remarks' => $order->installment_order_items->map(fn ($item) => $item->item->model)->implode(', '),
            'type' => 'installment',
            'order_number' => $order->order_number
        ];
    }

    private function installmentPaymentRow(InstallmentOrderPaymentHistory $payment): array
    {
        $order = $payment->installment_order_payment->installment_order;

        return [
            'date' => Carbon::parse($payment->paid_date)->format('F d, Y'),
            'receipt_number' => $payment->collection_receipt_number,
            'customer' => $order->customer->full_name,
            'm_i' => $payment->amount,
            'd_p' => null,
            'amount_paid' => null,
            'payment_method' => $this->normalizePaymentMethod($payment->payment_method),
            'reference_number' => $payment->reference_number,
            'is_voided' => false,
            'created_at' => $payment->created_at,
            'employee_name' => $payment->user->full_name ?? 'N/A',
            'remarks' => $order->installment_order_items->map(fn ($item) => $item->item->model)->implode(', '),
            'type' => 'installment',
            'order_number' => $order->order_number
        ];
    }

    private function groupInstallmentPaymentsForDisplay(Collection $payments): Collection
    {
        return $payments
            ->groupBy('receipt_number')
            ->map(function (Collection $group) {
                $paymentMethods = $group->pluck('payment_method')->unique();
                $amounts = $group->groupBy('payment_method')->map(fn (Collection $items) => $items->sum('m_i'));

                return [
                    'date' => $group->first()['date'],
                    'receipt_number' => $group->first()['receipt_number'],
                    'customer' => $group->first()['customer'],
                    'm_i' => $group->sum('m_i'),
                    'd_p' => null,
                    'amount_paid' => null,
                    'payment_method' => $paymentMethods->count() > 1
                        ? 'Split: '.$amounts->map(fn ($amount, $method) => ucfirst($method).' ₱'.number_format($amount, 2))->implode(', ')
                        : $group->first()['payment_method'],
                    'reference_number' => $group->first()['reference_number'],
                    'is_voided' => false,
                    'employee_name' => $group->first()['employee_name'],
                    'remarks' => $group->first()['remarks'],
                    'type' => 'installment',
                    'order_number' => $group->first()['order_number'],
                ];
            })
            ->values();
    }

    private function effectiveOrderPayments(Order $order): Collection
    {
        if ($order->relationLoaded('payments') && $order->payments->isNotEmpty()) {
            return $order->payments
                ->map(fn ($payment) => [
                    'payment_method' => $payment->payment_method,
                    'amount' => (float) $payment->amount,
                    'reference_number' => $payment->reference_number,
                ])
                ->values();
        }

        return collect([[
            'payment_method' => $order->payment_method,
            'amount' => (float) $order->total_price,
            'reference_number' => $order->reference_number,
        ]]);
    }

    private function normalizePaymentMethod(?string $method): string
    {
        return (string) Str::of(strtolower($method ?? ''))->replace('_', ' ');
    }

    private function branchName(?string $branchId): ?string
    {
        if (! $branchId) {
            return null;
        }

        return Branch::find($branchId)?->name ?? 'N/A';
    }
}
