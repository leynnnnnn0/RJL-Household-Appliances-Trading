<?php

namespace App\Services\Aging;

use App\Models\Branch;
use App\Models\InstallmentOrder;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AgingReportService
{
    public const BUCKETS = [
        'current' => 'Current',
        '1_30' => '30',
        '31_60' => '60',
        '61_90' => '90',
        '90_plus' => '90+',
    ];

    public function filters(array $input): array
    {
        $asOfDate = match (true) {
            isset($input['as_of_date']) => Carbon::parse($input['as_of_date']),
            isset($input['month']) => Carbon::createFromFormat('Y-m-d', $input['month'].'-06'),
            default => $this->defaultReportDate(),
        };

        return [
            'month' => $asOfDate->format('Y-m'),
            'branch_id' => ($input['branch_id'] ?? 'all') ?: 'all',
            'item_type' => ($input['item_type'] ?? 'all') ?: 'all',
            'as_of_date' => $asOfDate->toDateString(),
            'search' => trim($input['search'] ?? ''),
        ];
    }

    public function index(array $input): array
    {
        $filters = $this->filters($input);
        $tables = $this->bucketTablesForFilters($filters);

        return [
            'filters' => $filters,
            'branches' => $this->branches(),
            'bucketLabels' => self::BUCKETS,
            'agingTables' => collect($tables)
                ->map(fn (array $table) => array_merge($table, ['rows' => array_slice($table['rows'], 0, 10)]))
                ->all(),
            'newReleases' => $this->newReleases($filters),
        ];
    }

    public function bucketPage(array $input): array
    {
        $filters = $this->filters($input);
        $bucket = $input['bucket'];
        $table = $this->bucketTablesForFilters($filters)[$bucket];

        return [
            'filters' => $filters,
            'bucket' => $bucket,
            'bucketLabel' => self::BUCKETS[$bucket],
            'branches' => $this->branches(),
            'table' => $table,
        ];
    }

    public function pdfData(array $input): array
    {
        $filters = $this->filters($input);
        $tables = $this->bucketTablesForFilters($filters);
        $bucket = $input['bucket'] ?? 'all';

        return [
            'filters' => $filters,
            'bucket' => $bucket,
            'bucketLabels' => self::BUCKETS,
            'tables' => $bucket === 'all' ? $tables : [$bucket => $tables[$bucket]],
            'generatedAt' => now()->format('F d, Y h:i A'),
        ];
    }

    public function summary(array $filters): array
    {
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows($orders, Carbon::parse($filters['as_of_date']));
        $remaining = round($agingRows->sum('remaining_balance'), 2);
        $activeOrders = $orders->where('is_completed', false)->where('is_defaulted', false);
        $activePnv = round($activeOrders->sum(fn (InstallmentOrder $order) => $this->pnvOf($order)), 2);

        return [
            'accounts' => $agingRows->pluck('order_id')->unique()->count(),
            'active_accounts' => $activeOrders->count(),
            'pnv' => $activePnv,
            'remaining_balance' => $remaining,
            'risk_balance' => round($agingRows->whereIn('bucket', ['61_90', '90_plus'])->sum('remaining_balance'), 2),
            'collection_rate' => $activePnv > 0 ? round((($activePnv - $remaining) / $activePnv) * 100, 2) : 0,
        ];
    }

    private function branches(): Collection
    {
        return Branch::select('id', 'name')->orderBy('name')->get();
    }

    private function bucketTablesForFilters(array $filters): array
    {
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows($orders, Carbon::parse($filters['as_of_date']));

        return $this->bucketTables($agingRows);
    }

    private function orders(array $filters): Collection
    {
        return InstallmentOrder::query()
            ->with([
                'branch',
                'customer',
                'installment_order_items.item',
                'installment_order_payments.installment_order_payment_history',
            ])
            ->where('is_voided', false)
            ->where('is_defaulted', false)
            ->whereDate('transaction_date', '<=', $filters['as_of_date'])
            ->when($filters['branch_id'] !== 'all', fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['item_type'] !== 'all', fn (Builder $query) => $query->whereHas(
                'installment_order_items.item',
                fn (Builder $itemQuery) => $itemQuery->where('item_type', $filters['item_type'])
            ))
            ->when($filters['search'] !== '', fn (Builder $query) => $query->whereHas(
                'customer',
                fn (Builder $customerQuery) => $customerQuery
                    ->where('first_name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('last_name', 'like', '%'.$filters['search'].'%')
            ))
            ->get();
    }

    private function agingRows(Collection $orders, Carbon $asOfDate): Collection
    {
        return $orders
            ->map(fn (InstallmentOrder $order) => $this->agingRowForOrder($order, $asOfDate))
            ->filter()
            ->values();
    }

    private function agingRowForOrder(InstallmentOrder $order, Carbon $asOfDate): ?array
    {
        $reportCycleMonth = $this->reportCycleMonth($asOfDate);
        $primaryItem = $order->installment_order_items->first()?->item;
        $models = $order->installment_order_items
            ->map(fn ($orderItem) => $orderItem->item?->model)
            ->filter()
            ->implode(', ');

        $scheduledPayments = $order->installment_order_payments
            ->map(fn ($payment) => $this->paymentAgingState($payment, $asOfDate))
            ->filter(fn (array $payment) => $payment['cycle_month']->lte($reportCycleMonth))
            ->values();

        if ($scheduledPayments->isEmpty()) {
            return null;
        }

        $unpaidPayments = $scheduledPayments
            ->filter(fn (array $payment) => $payment['remaining'] > 0)
            ->values();

        if ($unpaidPayments->isNotEmpty()) {
            $oldestLateOrUnpaid = $scheduledPayments
                ->filter(fn (array $payment) => $payment['remaining'] > 0 || ! $payment['paid_on_time'])
                ->sortBy('cycle_month')
                ->first();
            $includedPayments = $scheduledPayments
                ->filter(fn (array $payment) => $payment['cycle_month']->gte($oldestLateOrUnpaid['cycle_month']))
                ->values();
            $bucket = $this->bucketForCycle($oldestLateOrUnpaid['cycle_month'], $reportCycleMonth);
            $referenceDueDate = $oldestLateOrUnpaid['due_date'];
        } else {
            $includedPayments = $scheduledPayments
                ->filter(fn (array $payment) => $payment['cycle_month']->equalTo($reportCycleMonth)
                    && $payment['paid_in_report_window'])
                ->values();

            if ($includedPayments->isEmpty()) {
                return null;
            }

            $bucket = 'current';
            $referenceDueDate = $includedPayments->sortBy('due_date')->first()['due_date'];
        }

        $lastScheduleCycleMonth = $order->installment_order_payments
            ->map(fn ($payment) => $this->paymentCycleMonth(Carbon::parse($payment->due_date)))
            ->sortBy(fn (Carbon $cycleMonth) => $cycleMonth->timestamp)
            ->last();
        $isPaid = $includedPayments->sum('remaining') <= 0;

        return [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $this->customerListName($order),
            'address' => $order->customer->address,
            'branch' => $order->branch?->name ?? 'N/A',
            'item_type' => $primaryItem?->item_type ?? 'Unclassified',
            'model' => $models ?: 'N/A',
            'term' => $order->number_of_terms,
            'date_released' => Carbon::parse($order->transaction_date)->format('M d, Y'),
            'due_date' => $referenceDueDate->format('M d, Y'),
            'days_overdue' => max($referenceDueDate->diffInDays($asOfDate, false), 0),
            'bucket' => $bucket,
            'monthly_installment' => round((float) $includedPayments->first()['model']->amount_due, 2),
            'pnv' => round((float) $this->pnvOf($order), 2),
            'amount_due' => round($includedPayments->sum(fn (array $payment) => (float) $payment['model']->amount_due), 2),
            'amount_paid' => round($includedPayments->sum('paid_as_of_report'), 2),
            'remaining_balance' => round($includedPayments->sum('remaining'), 2),
            'installments_count' => $includedPayments->count(),
            'is_paid' => $isPaid,
            'is_final_payment_paid' => $isPaid && ((bool) $order->is_completed || $lastScheduleCycleMonth?->equalTo($reportCycleMonth)),
        ];
    }

    private function bucketTables(Collection $agingRows): array
    {
        return collect(self::BUCKETS)
            ->mapWithKeys(function (string $label, string $bucket) use ($agingRows) {
                $rows = $agingRows
                    ->where('bucket', $bucket)
                    ->sortBy('customer_name', SORT_NATURAL | SORT_FLAG_CASE)
                    ->values()
                    ->all();

                return [$bucket => [
                    'label' => $label,
                    'total_accounts' => count($rows),
                    'total_due' => round(collect($rows)->sum('amount_due'), 2),
                    'total_paid' => round(collect($rows)->sum('amount_paid'), 2),
                    'total_balance' => round(collect($rows)->sum('remaining_balance'), 2),
                    'rows' => $rows,
                ]];
            })
            ->all();
    }

    private function bucketForCycle(Carbon $paymentCycleMonth, Carbon $reportCycleMonth): string
    {
        $periodsPastDue = (int) max($paymentCycleMonth->diffInMonths($reportCycleMonth), 0);

        if ($periodsPastDue === 0) {
            return 'current';
        }

        if ($periodsPastDue === 1) {
            return '1_30';
        }

        if ($periodsPastDue === 2) {
            return '31_60';
        }

        if ($periodsPastDue === 3) {
            return '61_90';
        }

        return '90_plus';
    }

    private function defaultReportDate(): Carbon
    {
        $today = now();

        if ($today->day <= 6) {
            return $today->copy()->day(6);
        }

        return $today->copy()->addMonthNoOverflow()->day(7);
    }

    private function reportCycleMonth(Carbon $asOfDate): Carbon
    {
        return $asOfDate->copy()->subMonthNoOverflow()->startOfMonth();
    }

    private function reportWindowStart(Carbon $asOfDate): Carbon
    {
        return $this->reportCycleMonth($asOfDate)->copy()->day(6)->startOfDay();
    }

    private function paymentCycleMonth(Carbon $dueDate): Carbon
    {
        return $dueDate->copy()->startOfMonth();
    }

    private function paymentAgingState($payment, Carbon $asOfDate): array
    {
        $cycleMonth = $this->paymentCycleMonth(Carbon::parse($payment->due_date));
        $paidInFullAt = $this->paidInFullAt($payment, $asOfDate);
        $paidAsOfReport = $this->paidAsOfReport($payment, $asOfDate);
        $amountDue = $this->effectiveAmountDue($payment);
        $remaining = round(max($amountDue - $paidAsOfReport, 0), 2);

        return [
            'model' => $payment,
            'due_date' => Carbon::parse($payment->due_date),
            'cycle_month' => $cycleMonth,
            'paid_as_of_report' => $paidAsOfReport,
            'remaining' => $remaining,
            'paid_on_time' => $paidInFullAt !== null && $paidInFullAt->lte($this->paymentCutoffDate($cycleMonth)),
            'paid_in_report_window' => $this->paidInReportWindow($paidInFullAt, $asOfDate),
        ];
    }

    private function paidInReportWindow(?Carbon $paidInFullAt, Carbon $asOfDate): bool
    {
        if ($paidInFullAt === null) {
            return false;
        }

        return $paidInFullAt->gt($this->reportWindowStart($asOfDate))
            && $paidInFullAt->lte($asOfDate->copy()->endOfDay());
    }

    private function paidInFullAt($payment, Carbon $asOfDate): ?Carbon
    {
        $amountDue = $this->effectiveAmountDue($payment);
        $runningTotal = 0.0;

        foreach ($payment->installment_order_payment_history->sortBy('paid_date') as $history) {
            $paidDate = Carbon::parse($history->paid_date);

            if ($paidDate->gt($asOfDate)) {
                continue;
            }

            $runningTotal += (float) $history->amount;

            if ($runningTotal >= $amountDue) {
                return $paidDate;
            }
        }

        if ((float) $payment->amount_paid >= $amountDue && $payment->paid_date && Carbon::parse($payment->paid_date)->lte($asOfDate)) {
            return Carbon::parse($payment->paid_date);
        }

        if ((float) $payment->amount_paid >= $amountDue && $payment->installment_order_payment_history->isEmpty()) {
            return Carbon::parse($payment->paid_date ?? $payment->updated_at ?? $asOfDate);
        }

        return null;
    }

    private function paidAsOfReport($payment, Carbon $asOfDate): float
    {
        $historyTotal = $payment->installment_order_payment_history
            ->filter(fn ($history) => Carbon::parse($history->paid_date)->lte($asOfDate))
            ->sum(fn ($history) => (float) $history->amount);

        if ($historyTotal > 0) {
            return round($historyTotal + (float) $payment->rebate_amount, 2);
        }

        if ($payment->paid_date && Carbon::parse($payment->paid_date)->lte($asOfDate)) {
            return round((float) $payment->amount_paid + (float) $payment->rebate_amount, 2);
        }

        if (! $payment->paid_date && $payment->installment_order_payment_history->isEmpty()) {
            return round((float) $payment->amount_paid + (float) $payment->rebate_amount, 2);
        }

        return 0.0;
    }

    private function effectiveAmountDue($payment): float
    {
        return round(max((float) $payment->amount_due - (float) $payment->rebate_amount, 0), 2);
    }

    private function paymentCutoffDate(Carbon $cycleMonth): Carbon
    {
        return $cycleMonth->copy()->addMonthNoOverflow()->day(6)->endOfDay();
    }

    private function remainingPaymentBalance($payment): float
    {
        $paid = (float) $payment->amount_paid + (float) $payment->rebate_amount;

        return round(max((float) $payment->amount_due - $paid, 0), 2);
    }

    private function newReleases(array $filters): array
    {
        $orders = InstallmentOrder::query()
            ->with(['branch', 'customer', 'installment_order_items.item'])
            ->where('is_voided', false)
            ->where('is_defaulted', false)
            ->whereDate('transaction_date', $filters['as_of_date'])
            ->when($filters['branch_id'] !== 'all', fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['item_type'] !== 'all', fn (Builder $query) => $query->whereHas(
                'installment_order_items.item',
                fn (Builder $itemQuery) => $itemQuery->where('item_type', $filters['item_type'])
            ))
            ->when($filters['search'] !== '', fn (Builder $query) => $query->whereHas(
                'customer',
                fn (Builder $customerQuery) => $customerQuery
                    ->where('first_name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('last_name', 'like', '%'.$filters['search'].'%')
            ))
            ->latest('transaction_date')
            ->get();

        $rows = $orders->map(function (InstallmentOrder $order) {
            $primaryItem = $order->installment_order_items->first()?->item;
            $models = $order->installment_order_items
                ->map(fn ($orderItem) => $orderItem->item?->model)
                ->filter()
                ->implode(', ');

            return [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $this->customerListName($order),
                'branch' => $order->branch?->name ?? 'N/A',
                'item_type' => $primaryItem?->item_type ?? 'Unclassified',
                'model' => $models ?: 'N/A',
                'term' => $order->number_of_terms,
                'transaction_date' => Carbon::parse($order->transaction_date)->format('M d, Y'),
                'pnv' => round((float) $this->pnvOf($order), 2),
            ];
        })
            ->sortBy('customer_name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        return [
            'total_accounts' => $rows->count(),
            'total_pnv' => round($rows->sum('pnv'), 2),
            'rows' => $rows->all(),
        ];
    }

    private function pnvOf(InstallmentOrder $order): float
    {
        if ((float) $order->promisory_note_value_interest < 0.01) {
            return (float) $order->loan_contract_price - (float) $order->down_payment;
        }

        return ((float) $order->promisory_note_value * (float) $order->promisory_note_value_interest)
            + (float) $order->promisory_note_value_interest_additional_charge;
    }

    private function customerListName(InstallmentOrder $order): string
    {
        $lastName = trim((string) $order->customer->last_name);
        $firstName = trim((string) $order->customer->first_name);

        return trim($lastName.' '.$firstName) ?: $order->customer->full_name;
    }
}
