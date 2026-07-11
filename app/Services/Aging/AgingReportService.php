<?php

namespace App\Services\Aging;

use App\Models\Branch;
use App\Models\InstallmentOrder;
use App\Models\InstallmentOrderPaymentHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
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

    public const DETAIL_TYPES = [
        'total-accounts' => 'Total Accounts',
        'paid-accounts' => 'Fully Paid Accounts',
        'unpaid-accounts' => 'Accounts with Outstanding Balance',
        'current' => 'Current Accounts',
        'aging-30' => '30-Day Aging Accounts',
        'aging-60' => '60-Day Aging Accounts',
        'aging-90' => '90+ Day Aging Accounts',
        'expected-collection' => 'Expected Collection',
        'collected' => 'Collected Amount',
        'outstanding' => 'Outstanding Amount',
        'collection-percentage' => 'Collection Percentage',
        'advance-payments' => 'Advance Payments',
        'rebates' => 'Rebates',
        'revenue-with-advance' => 'Collection Revenue Including Advance Payments',
        'revenue-without-advance' => 'Collection Revenue Without Advance Payments',
    ];

    public function filters(array $input): array
    {
        $asOfDate = match (true) {
            isset($input['as_of_date']) => Carbon::parse($input['as_of_date']),
            isset($input['month']) => Carbon::createFromFormat('Y-m-d', $input['month'].'-06'),
            default => $this->defaultReportDate(),
        };
        $cutoffStart = isset($input['cutoff_start'])
            ? Carbon::parse($input['cutoff_start'])
            : $asOfDate->copy()->subMonthNoOverflow();

        if ($cutoffStart->gte($asOfDate)) {
            $cutoffStart = $asOfDate->copy()->subMonthNoOverflow();
        }

        return [
            'month' => $asOfDate->format('Y-m'),
            'branch_id' => ($input['branch_id'] ?? 'all') ?: 'all',
            'item_type' => ($input['item_type'] ?? 'all') ?: 'all',
            'as_of_date' => $asOfDate->toDateString(),
            'cutoff_start' => $cutoffStart->toDateString(),
            'collector_id' => ($input['collector_id'] ?? 'all') ?: 'all',
            'search' => trim($input['search'] ?? ''),
        ];
    }

    public function index(array $input): array
    {
        $filters = $this->filters($input);
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows(
            $orders,
            Carbon::parse($filters['as_of_date']),
            Carbon::parse($filters['cutoff_start'])
        );
        $tables = $this->bucketTables($agingRows);

        return [
            'filters' => $filters,
            'branches' => $this->branches(),
            'collectors' => $this->collectors(),
            'bucketLabels' => self::BUCKETS,
            'statistics' => $this->statistics($orders, $agingRows, $filters),
            'agingTables' => collect($tables)
                ->map(fn (array $table) => array_merge($table, ['rows' => array_slice($table['rows'], 0, 10)]))
                ->all(),
            'newReleases' => $this->newReleases($filters),
        ];
    }

    public function details(array $input): array
    {
        $filters = $this->filters($input);
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows(
            $orders,
            Carbon::parse($filters['as_of_date']),
            Carbon::parse($filters['cutoff_start'])
        );
        $calculation = $this->statisticsData($orders, $agingRows, $filters);
        $type = $input['type'];
        $definition = $calculation['details'][$type];
        $rows = collect($definition['rows']);
        $agingCategory = $input['aging_category'] ?? null;
        $paymentStatus = $input['payment_status'] ?? null;

        if ($agingCategory !== null) {
            $agingLabel = match ($agingCategory) {
                'current' => 'Current',
                'aging-30' => '30 Days',
                'aging-60' => '60 Days',
                default => '90+ Days',
            };
            $rows = $rows->where('aging_category', $agingLabel);
        }

        if ($paymentStatus !== null) {
            $rows = $rows->filter(fn (array $row) => mb_strtolower($row['payment_status']) === $paymentStatus);
        }

        $cardRows = $rows->values();
        $totalAmount = $definition['amount_field'] === null
            ? null
            : round($cardRows->sum($definition['amount_field']), 2);
        $search = trim($input['detail_search'] ?? '');
        $sort = $input['sort'] ?? 'customer_name';
        $direction = $input['direction'] ?? 'asc';

        if ($search !== '') {
            $needle = mb_strtolower($search);
            $rows = $rows->filter(fn (array $row) => collect([
                $row['customer_name'],
                $row['order_number'],
                $row['payment_schedule_id'],
                $row['collector'],
                $row['branch'],
            ])->contains(fn ($value) => str_contains(mb_strtolower((string) $value), $needle)));
        }

        $rows = $rows->sortBy(
            fn (array $row) => $row[$sort] ?? '',
            SORT_NATURAL | SORT_FLAG_CASE,
            $direction === 'desc'
        )->values();
        $page = max((int) ($input['page'] ?? 1), 1);
        $perPage = 20;
        $records = new LengthAwarePaginator(
            $rows->forPage($page, $perPage)->values(),
            $rows->count(),
            $perPage,
            $page,
            [
                'path' => route('aging.details'),
                'query' => request()->query(),
            ]
        );

        return [
            'filters' => $filters,
            'type' => $type,
            'title' => self::DETAIL_TYPES[$type],
            'columns' => $definition['columns'],
            'totalRecords' => $cardRows->count(),
            'totalAmount' => $totalAmount,
            'records' => $records,
            'tableFilters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $direction,
            ],
            'contextFilters' => [
                'aging_category' => $agingCategory,
                'payment_status' => $paymentStatus,
            ],
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
            'collectors' => $this->collectors(),
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
        $agingRows = $this->agingRows(
            $orders,
            Carbon::parse($filters['as_of_date']),
            Carbon::parse($filters['cutoff_start'])
        );
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

    private function collectors(): Collection
    {
        return User::query()
            ->select('id', 'first_name', 'last_name')
            ->whereIn('id', InstallmentOrderPaymentHistory::query()
                ->select('user_id')
                ->whereNotNull('user_id')
                ->distinct())
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->full_name,
            ]);
    }

    private function bucketTablesForFilters(array $filters): array
    {
        $orders = $this->orders($filters);
        $agingRows = $this->agingRows(
            $orders,
            Carbon::parse($filters['as_of_date']),
            Carbon::parse($filters['cutoff_start'])
        );

        return $this->bucketTables($agingRows);
    }

    private function orders(array $filters): Collection
    {
        return InstallmentOrder::query()
            ->with([
                'branch',
                'customer',
                'installment_order_items.item',
                'installment_order_payments.installment_order_payment_history.user',
            ])
            ->where('is_voided', false)
            ->where('is_defaulted', false)
            ->whereDate('transaction_date', '<=', $filters['as_of_date'])
            ->when($filters['branch_id'] !== 'all', fn (Builder $query) => $query->where('branch_id', $filters['branch_id']))
            ->when($filters['collector_id'] !== 'all', fn (Builder $query) => $query->whereHas(
                'installment_order_payments.installment_order_payment_history',
                fn (Builder $historyQuery) => $historyQuery
                    ->where('user_id', $filters['collector_id'])
                    ->whereDate('paid_date', '>=', $filters['cutoff_start'])
                    ->whereDate('paid_date', '<', $filters['as_of_date'])
            ))
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

    private function agingRows(Collection $orders, Carbon $asOfDate, Carbon $cutoffStart): Collection
    {
        return $orders
            ->map(fn (InstallmentOrder $order) => $this->agingRowForOrder($order, $asOfDate, $cutoffStart))
            ->filter()
            ->values();
    }

    private function agingRowForOrder(InstallmentOrder $order, Carbon $asOfDate, Carbon $cutoffStart): ?array
    {
        $reportCycleMonth = $this->reportCycleMonth($asOfDate);
        $primaryItem = $order->installment_order_items->first()?->item;
        $models = $order->installment_order_items
            ->map(fn ($orderItem) => $orderItem->item?->model)
            ->filter()
            ->implode(', ');

        $allPaymentStates = $order->installment_order_payments
            ->map(fn ($payment) => $this->paymentAgingState($payment, $cutoffStart, $asOfDate))
            ->sortBy('due_date')
            ->values();

        if ((bool) $order->is_completed) {
            $regularCompletionPayments = $allPaymentStates
                ->filter(fn (array $payment) => $payment['due_date']->lt($asOfDate)
                    && $payment['paid_in_report_window'])
                ->values();

            if ($regularCompletionPayments->isEmpty()) {
                return null;
            }

            $includedPayments = $regularCompletionPayments;
            $bucket = 'current';
            $referenceDueDate = $regularCompletionPayments->sortBy('due_date')->first()['due_date'];
        } else {
            $scheduledPayments = $allPaymentStates
                ->filter(fn (array $payment) => $payment['cycle_month']->lte($reportCycleMonth))
                ->values();

            if ($scheduledPayments->isEmpty()) {
                return null;
            }

            $lateOrUnpaidPayments = $scheduledPayments
                ->filter(fn (array $payment) => $payment['remaining'] > 0
                    || (! $payment['paid_on_time'] && $payment['paid_in_report_window']))
                ->values();

            if ($lateOrUnpaidPayments->isNotEmpty()) {
                $oldestLateOrUnpaid = $lateOrUnpaidPayments
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
            'collection_expected' => round($includedPayments->sum('effective_amount_due'), 2),
            'collection_collected' => round($includedPayments->sum(
                fn (array $payment) => min($payment['paid_as_of_report'], $payment['effective_amount_due'])
            ), 2),
            'statistics_due_date' => $referenceDueDate->toDateString(),
            'statistics_payments' => $includedPayments->map(fn (array $payment) => [
                'payment_schedule_id' => $payment['model']->id,
                'due_date' => $payment['due_date']->toDateString(),
                'paid_date' => $this->latestPaymentDate($payment['model'], $asOfDate->copy()->subMicrosecond()),
                'scheduled_amount' => $payment['effective_amount_due'],
                'amount_paid' => round(min($payment['paid_as_of_report'], $payment['effective_amount_due']), 2),
                'outstanding_balance' => $payment['remaining'],
                'rebate_amount' => round((float) $payment['model']->rebate_amount, 2),
                'payment_status' => $payment['model']->status,
                'collector' => $this->paymentCollectors($payment['model'], null, $asOfDate),
            ])->all(),
            'installments_count' => $includedPayments->count(),
            'is_paid' => $isPaid,
            'is_final_payment_paid' => $isPaid && ((bool) $order->is_completed || $lastScheduleCycleMonth?->equalTo($reportCycleMonth)),
        ];
    }

    private function bucketTables(Collection $agingRows): array
    {
        return collect(self::BUCKETS)
            ->mapWithKeys(function (string $label, string $bucket) use ($agingRows) {
                $bucketRows = $agingRows
                    ->where('bucket', $bucket)
                    ->sortBy('customer_name', SORT_NATURAL | SORT_FLAG_CASE)
                    ->values();
                $rows = $bucketRows
                    ->map(fn (array $row) => collect($row)
                        ->except(['statistics_due_date', 'statistics_payments'])
                        ->all())
                    ->all();

                return [$bucket => [
                    'label' => $label,
                    'total_accounts' => count($rows),
                    'total_due' => round($bucketRows->sum('amount_due'), 2),
                    'total_paid' => round($bucketRows->sum('amount_paid'), 2),
                    'total_balance' => round($bucketRows->sum('remaining_balance'), 2),
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

    private function paymentCycleMonth(Carbon $dueDate): Carbon
    {
        return $dueDate->copy()->startOfMonth();
    }

    private function paymentAgingState($payment, Carbon $cutoffStart, Carbon $cutoffEnd): array
    {
        $stateAsOf = $cutoffEnd->copy()->subMicrosecond();
        $cycleMonth = $this->paymentCycleMonth(Carbon::parse($payment->due_date));
        $paidInFullAt = $this->paidInFullAt($payment, $stateAsOf);
        $paidAsOfReport = $this->paidAsOfReport($payment, $stateAsOf);
        $amountDue = $this->effectiveAmountDue($payment);
        $remaining = round(max($amountDue - $paidAsOfReport, 0), 2);

        return [
            'model' => $payment,
            'due_date' => Carbon::parse($payment->due_date),
            'cycle_month' => $cycleMonth,
            'paid_as_of_report' => $paidAsOfReport,
            'effective_amount_due' => $amountDue,
            'remaining' => $remaining,
            'paid_on_time' => $paidInFullAt !== null && $paidInFullAt->lte($this->paymentCutoffDate($cycleMonth)),
            'paid_in_report_window' => $this->paidInReportWindow($paidInFullAt, $cutoffStart, $cutoffEnd),
        ];
    }

    private function paidInReportWindow(?Carbon $paidInFullAt, Carbon $cutoffStart, Carbon $cutoffEnd): bool
    {
        if ($paidInFullAt === null) {
            return false;
        }

        return $paidInFullAt->gte($cutoffStart->copy()->startOfDay())
            && $paidInFullAt->lt($cutoffEnd->copy()->startOfDay());
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
            return Carbon::parse($payment->paid_date ?? $asOfDate);
        }

        return null;
    }

    private function paidAsOfReport($payment, Carbon $asOfDate): float
    {
        $historyTotal = $payment->installment_order_payment_history
            ->filter(fn ($history) => Carbon::parse($history->paid_date)->lte($asOfDate))
            ->sum(fn ($history) => (float) $history->amount);

        if ($historyTotal > 0) {
            return round($historyTotal, 2);
        }

        if ($payment->paid_date && Carbon::parse($payment->paid_date)->lte($asOfDate)) {
            return round((float) $payment->amount_paid, 2);
        }

        if (! $payment->paid_date && $payment->installment_order_payment_history->isEmpty()) {
            return round((float) $payment->amount_paid, 2);
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

    private function statistics(Collection $orders, Collection $agingRows, array $filters): array
    {
        return $this->statisticsData($orders, $agingRows, $filters, false)['summary'];
    }

    private function statisticsData(
        Collection $orders,
        Collection $agingRows,
        array $filters,
        bool $includeDetails = true
    ): array {
        $cutoffStart = Carbon::parse($filters['cutoff_start'])->startOfDay();
        $cutoffEnd = Carbon::parse($filters['as_of_date'])->startOfDay();
        $collectorId = $filters['collector_id'] === 'all' ? null : (int) $filters['collector_id'];
        $totalAccounts = $agingRows->count();

        $dashboardBuckets = [
            'current' => ['label' => 'Current', 'source' => ['current']],
            '30_days' => ['label' => '30 Days', 'source' => ['1_30']],
            '60_days' => ['label' => '60 Days', 'source' => ['31_60']],
            '90_plus' => ['label' => '90+ Days', 'source' => ['61_90', '90_plus']],
        ];

        $agingDistribution = collect($dashboardBuckets)
            ->map(function (array $config) use ($agingRows, $totalAccounts) {
                $rows = $agingRows->whereIn('bucket', $config['source']);
                $accounts = $rows->count();
                $expected = round($rows->sum('collection_expected'), 2);
                $collected = round($rows->sum('collection_collected'), 2);
                $outstanding = round($rows->sum('remaining_balance'), 2);

                return [
                    'label' => $config['label'],
                    'accounts' => $accounts,
                    'paid_accounts' => $rows->where('is_paid', true)->count(),
                    'unpaid_accounts' => $rows->where('is_paid', false)->count(),
                    'account_percentage' => $totalAccounts > 0
                        ? round(($accounts / $totalAccounts) * 100, 2)
                        : 0.0,
                    'expected_amount' => $expected,
                    'collected_amount' => $collected,
                    'outstanding_amount' => $outstanding,
                    'collection_percentage' => $expected > 0
                        ? round(($collected / $expected) * 100, 2)
                        : 0.0,
                ];
            })
            ->all();

        $expectedCollection = round(collect($agingDistribution)->sum('expected_amount'), 2);
        $collectedAmount = round(collect($agingDistribution)->sum('collected_amount'), 2);
        $outstandingAmount = round(collect($agingDistribution)->sum('outstanding_amount'), 2);

        $periodPayments = $orders
            ->flatMap(fn (InstallmentOrder $order) => $order->installment_order_payments
                ->map(fn ($payment) => ['order' => $order, 'payment' => $payment]))
            ->map(function (array $record) use ($cutoffStart, $cutoffEnd, $collectorId) {
                $payment = $record['payment'];
                $dueDate = Carbon::parse($payment->due_date)->startOfDay();

                return [
                    'order' => $record['order'],
                    'payment' => $payment,
                    'due_in_period' => $dueDate->gte($cutoffStart) && $dueDate->lt($cutoffEnd),
                    'future_due' => $dueDate->gte($cutoffEnd),
                    'collected_in_period' => $this->paymentAmountInWindow(
                        $payment,
                        $cutoffStart,
                        $cutoffEnd,
                        $collectorId
                    ),
                ];
            });

        $regularPayments = $periodPayments->where('due_in_period', true);
        $advancePayments = $periodPayments
            ->where('future_due', true)
            ->filter(fn (array $payment) => $payment['collected_in_period'] > 0);
        $regularRevenue = round($regularPayments->sum('collected_in_period'), 2);
        $advanceAmount = round($advancePayments->sum('collected_in_period'), 2);
        $rebatePayments = $regularPayments
            ->filter(fn (array $payment) => (float) $payment['payment']->rebate_amount > 0);

        $summary = [
            'cutoff' => [
                'start' => $cutoffStart->toDateString(),
                'end' => $cutoffEnd->toDateString(),
            ],
            'accounts' => [
                'total' => $totalAccounts,
                'fully_paid' => $agingRows->where('is_paid', true)->count(),
                'outstanding' => $agingRows->where('is_paid', false)->count(),
            ],
            'aging_distribution' => $agingDistribution,
            'collection_summary' => [
                'expected_amount' => $expectedCollection,
                'collected_amount' => $collectedAmount,
                'outstanding_amount' => $outstandingAmount,
                'collection_percentage' => $expectedCollection > 0
                    ? round(($collectedAmount / $expectedCollection) * 100, 2)
                    : 0.0,
            ],
            'advance_payments' => [
                'count' => $advancePayments->count(),
                'amount' => $advanceAmount,
            ],
            'rebates' => [
                'count' => $rebatePayments->count(),
                'amount' => round($rebatePayments->sum(
                    fn (array $payment) => (float) $payment['payment']->rebate_amount
                ), 2),
            ],
            'revenue' => [
                'without_advance' => $regularRevenue,
                'including_advance' => round($regularRevenue + $advanceAmount, 2),
            ],
        ];

        return [
            'summary' => $summary,
            'details' => $includeDetails
                ? $this->statisticsDetailCollections(
                    $agingRows,
                    $regularPayments,
                    $advancePayments,
                    $rebatePayments,
                    $cutoffStart,
                    $cutoffEnd,
                    $collectorId
                )
                : [],
        ];
    }

    private function statisticsDetailCollections(
        Collection $agingRows,
        Collection $regularPayments,
        Collection $advancePayments,
        Collection $rebatePayments,
        Carbon $cutoffStart,
        Carbon $cutoffEnd,
        ?int $collectorId
    ): array {
        $accountRows = $agingRows->map(fn (array $row) => $this->accountDetailRow($row));
        $agingPaymentRows = $agingRows->flatMap(function (array $row) {
            return collect($row['statistics_payments'])->map(fn (array $payment) => array_merge($payment, [
                'record_id' => 'schedule-'.$payment['payment_schedule_id'],
                'installment_order_id' => $row['order_id'],
                'order_number' => $row['order_number'],
                'customer_name' => $row['customer_name'],
                'aging_category' => $this->dashboardBucketLabel($row['bucket']),
                'branch' => $row['branch'],
            ]));
        })->values();
        $regularRows = $regularPayments
            ->map(fn (array $record) => $this->periodPaymentDetailRow(
                $record,
                $cutoffStart,
                $cutoffEnd,
                $collectorId
            ));
        $advanceRows = $advancePayments
            ->map(fn (array $record) => $this->periodPaymentDetailRow(
                $record,
                $cutoffStart,
                $cutoffEnd,
                $collectorId
            ));

        $accountColumns = $this->detailColumns([
            'customer_name', 'order_number', 'due_date', 'aging_category', 'payment_status', 'branch',
        ]);
        $agingColumns = $this->detailColumns([
            'customer_name', 'order_number', 'due_date', 'scheduled_amount', 'amount_paid',
            'outstanding_balance', 'aging_category', 'payment_status', 'branch',
        ]);
        $scheduleColumns = $this->detailColumns([
            'customer_name', 'order_number', 'payment_schedule_id', 'due_date', 'scheduled_amount',
            'amount_paid', 'outstanding_balance', 'rebate_amount', 'aging_category', 'payment_status',
            'branch', 'collector',
        ]);
        $collectedColumns = $this->detailColumns([
            'customer_name', 'order_number', 'payment_schedule_id', 'due_date', 'paid_date',
            'amount_paid', 'payment_status', 'branch', 'collector',
        ]);
        $advanceColumns = $this->detailColumns([
            'customer_name', 'order_number', 'payment_schedule_id', 'due_date', 'paid_date',
            'amount_paid', 'branch', 'collector',
        ]);
        $rebateColumns = $this->detailColumns([
            'customer_name', 'order_number', 'payment_schedule_id', 'due_date', 'scheduled_amount',
            'rebate_amount', 'payment_status', 'branch',
        ]);

        $definitions = [
            'total-accounts' => [$accountRows, $accountColumns, null],
            'paid-accounts' => [
                $accountRows->where('payment_status', 'Paid')->values(),
                $this->detailColumns([
                    'customer_name', 'order_number', 'due_date', 'paid_date', 'amount_paid',
                    'aging_category', 'branch', 'collector',
                ]),
                null,
            ],
            'unpaid-accounts' => [
                $accountRows->where('payment_status', 'Unpaid')->values(),
                $this->detailColumns([
                    'customer_name', 'order_number', 'due_date', 'outstanding_balance',
                    'aging_category', 'payment_status', 'branch',
                ]),
                null,
            ],
            'current' => [$accountRows->where('aging_category', 'Current')->values(), $agingColumns, null],
            'aging-30' => [$accountRows->where('aging_category', '30 Days')->values(), $agingColumns, null],
            'aging-60' => [$accountRows->where('aging_category', '60 Days')->values(), $agingColumns, null],
            'aging-90' => [$accountRows->where('aging_category', '90+ Days')->values(), $agingColumns, null],
            'expected-collection' => [$agingPaymentRows, $scheduleColumns, 'scheduled_amount'],
            'collected' => [
                $agingPaymentRows->where('amount_paid', '>', 0)->values(),
                $collectedColumns,
                'amount_paid',
            ],
            'outstanding' => [
                $agingPaymentRows->where('outstanding_balance', '>', 0)->values(),
                $scheduleColumns,
                'outstanding_balance',
            ],
            'collection-percentage' => [$agingPaymentRows, $scheduleColumns, null],
            'advance-payments' => [$advanceRows, $advanceColumns, 'amount_paid'],
            'rebates' => [
                $rebatePayments->map(fn (array $record) => $this->periodPaymentDetailRow(
                    $record,
                    $cutoffStart,
                    $cutoffEnd,
                    $collectorId
                )),
                $rebateColumns,
                'rebate_amount',
            ],
            'revenue-without-advance' => [
                $regularRows->where('amount_paid', '>', 0)->values(),
                $collectedColumns,
                'amount_paid',
            ],
            'revenue-with-advance' => [
                $regularRows->where('amount_paid', '>', 0)->concat($advanceRows)->values(),
                $collectedColumns,
                'amount_paid',
            ],
        ];

        return collect($definitions)->map(function (array $definition) {
            [$rows, $columns, $amountField] = $definition;
            $rows = collect($rows)->values();

            return [
                'rows' => $rows->all(),
                'columns' => $columns,
                'total_amount' => $amountField === null ? null : round($rows->sum($amountField), 2),
                'amount_field' => $amountField,
            ];
        })->all();
    }

    private function accountDetailRow(array $row): array
    {
        $payments = collect($row['statistics_payments']);

        return [
            'record_id' => 'account-'.$row['order_id'],
            'installment_order_id' => $row['order_id'],
            'order_number' => $row['order_number'],
            'customer_name' => $row['customer_name'],
            'payment_schedule_id' => null,
            'due_date' => $row['statistics_due_date'],
            'paid_date' => $payments->pluck('paid_date')->filter()->sort()->last(),
            'scheduled_amount' => $row['collection_expected'],
            'amount_paid' => $row['collection_collected'],
            'outstanding_balance' => $row['remaining_balance'],
            'rebate_amount' => round($payments->sum('rebate_amount'), 2),
            'aging_category' => $this->dashboardBucketLabel($row['bucket']),
            'payment_status' => $row['is_paid'] ? 'Paid' : 'Unpaid',
            'branch' => $row['branch'],
            'collector' => $payments->pluck('collector')->filter()->unique()->implode(', ') ?: 'Unassigned',
        ];
    }

    private function periodPaymentDetailRow(
        array $record,
        Carbon $cutoffStart,
        Carbon $cutoffEnd,
        ?int $collectorId
    ): array {
        $order = $record['order'];
        $payment = $record['payment'];
        $effectiveAmount = $this->effectiveAmountDue($payment);
        $paidAsOfReport = min($this->paidAsOfReport($payment, $cutoffEnd), $effectiveAmount);

        return [
            'record_id' => 'schedule-'.$payment->id,
            'installment_order_id' => $order->id,
            'order_number' => $order->order_number,
            'customer_name' => $this->customerListName($order),
            'payment_schedule_id' => $payment->id,
            'due_date' => Carbon::parse($payment->due_date)->toDateString(),
            'paid_date' => $this->latestPaymentDate($payment, $cutoffEnd, $cutoffStart, $collectorId),
            'scheduled_amount' => $effectiveAmount,
            'amount_paid' => $record['collected_in_period'],
            'outstanding_balance' => round(max($effectiveAmount - $paidAsOfReport, 0), 2),
            'rebate_amount' => round((float) $payment->rebate_amount, 2),
            'aging_category' => $this->dashboardBucketLabel(
                $this->bucketForCycle(
                    $this->paymentCycleMonth(Carbon::parse($payment->due_date)),
                    $this->reportCycleMonth($cutoffEnd)
                )
            ),
            'payment_status' => ucfirst((string) $payment->status),
            'branch' => $order->branch?->name ?? 'N/A',
            'collector' => $this->paymentCollectors($payment, $cutoffStart, $cutoffEnd, $collectorId),
        ];
    }

    private function detailColumns(array $keys): array
    {
        $columns = [
            'customer_name' => ['label' => 'Account / Customer', 'format' => 'text'],
            'order_number' => ['label' => 'Installment Order', 'format' => 'text'],
            'payment_schedule_id' => ['label' => 'Schedule ID', 'format' => 'text'],
            'due_date' => ['label' => 'Due Date', 'format' => 'date'],
            'paid_date' => ['label' => 'Paid Date', 'format' => 'date'],
            'scheduled_amount' => ['label' => 'Scheduled Amount', 'format' => 'money'],
            'amount_paid' => ['label' => 'Amount Paid', 'format' => 'money'],
            'outstanding_balance' => ['label' => 'Outstanding Balance', 'format' => 'money'],
            'rebate_amount' => ['label' => 'Rebate Amount', 'format' => 'money'],
            'aging_category' => ['label' => 'Aging Category', 'format' => 'text'],
            'payment_status' => ['label' => 'Payment Status', 'format' => 'status'],
            'branch' => ['label' => 'Branch', 'format' => 'text'],
            'collector' => ['label' => 'Collector', 'format' => 'text'],
        ];

        return collect($keys)->map(fn (string $key) => [
            'key' => $key,
            ...$columns[$key],
        ])->all();
    }

    private function dashboardBucketLabel(string $bucket): string
    {
        return match ($bucket) {
            'current' => 'Current',
            '1_30' => '30 Days',
            '31_60' => '60 Days',
            default => '90+ Days',
        };
    }

    private function latestPaymentDate(
        $payment,
        ?Carbon $end = null,
        ?Carbon $start = null,
        ?int $collectorId = null
    ): ?string {
        $histories = $payment->installment_order_payment_history
            ->filter(function ($history) use ($start, $end, $collectorId) {
                $paidDate = Carbon::parse($history->paid_date);

                if ($collectorId !== null && (int) $history->user_id !== $collectorId) {
                    return false;
                }

                if ($start !== null && $paidDate->lt($start)) {
                    return false;
                }

                return $end === null || ($start === null ? $paidDate->lte($end) : $paidDate->lt($end));
            });

        if ($histories->isNotEmpty()) {
            return Carbon::parse($histories->sortBy('paid_date')->last()->paid_date)->toDateString();
        }

        if ($collectorId !== null || ! $payment->paid_date) {
            return null;
        }

        $paidDate = Carbon::parse($payment->paid_date);
        $inRange = ($start === null || $paidDate->gte($start))
            && ($end === null || ($start === null ? $paidDate->lte($end) : $paidDate->lt($end)));

        return $inRange ? $paidDate->toDateString() : null;
    }

    private function paymentCollectors(
        $payment,
        ?Carbon $start = null,
        ?Carbon $end = null,
        ?int $collectorId = null
    ): string {
        $names = $payment->installment_order_payment_history
            ->filter(function ($history) use ($start, $end, $collectorId) {
                $paidDate = Carbon::parse($history->paid_date);

                return ($start === null || $paidDate->gte($start))
                    && ($end === null || ($start === null ? $paidDate->lte($end) : $paidDate->lt($end)))
                    && ($collectorId === null || (int) $history->user_id === $collectorId);
            })
            ->map(fn ($history) => $history->user?->full_name)
            ->filter()
            ->unique()
            ->values();

        return $names->implode(', ') ?: 'Unassigned';
    }

    private function paymentAmountInWindow(
        $payment,
        Carbon $cutoffStart,
        Carbon $cutoffEnd,
        ?int $collectorId
    ): float {
        $histories = $payment->installment_order_payment_history;

        if ($histories->isNotEmpty()) {
            return round($histories
                ->filter(function ($history) use ($cutoffStart, $cutoffEnd, $collectorId) {
                    $paidDate = Carbon::parse($history->paid_date);

                    return $paidDate->gte($cutoffStart)
                        && $paidDate->lt($cutoffEnd)
                        && ($collectorId === null || (int) $history->user_id === $collectorId);
                })
                ->sum(fn ($history) => (float) $history->amount), 2);
        }

        if ($collectorId !== null || ! $payment->paid_date) {
            return 0.0;
        }

        $paidDate = Carbon::parse($payment->paid_date);

        return $paidDate->gte($cutoffStart) && $paidDate->lt($cutoffEnd)
            ? round((float) $payment->amount_paid, 2)
            : 0.0;
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
