<?php

namespace App\Exports;

use App\Models\InstallmentOrder;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class AgingReportExport implements FromCollection, WithEvents, WithTitle
{
    protected string $zone;
    protected ?int $branchId;

    const LAST_COL = 'T';

    const ITEM_TYPES = [
        'appliances' => 'APPLIANCES',
        'furniture'  => 'FURNITURE',
        'gadgets'    => 'GADGETS',
    ];

    const BUCKETS = [
        'new'     => ['label' => 'NEW RELEASES',           'color' => 'D9E1F2'],
        'current' => ['label' => 'CURRENT (1-30 DAYS)',    'color' => '92D050'],
        '30'      => ['label' => '30 DAYS (31-60)',         'color' => 'FFFF00'],
        '60'      => ['label' => '60 DAYS (61-90)',         'color' => 'FFC7CE'],
        '90'      => ['label' => '90 DAYS (91-120)',        'color' => 'FF7043'],
        '90+'     => ['label' => '90+ DAYS',                'color' => 'FF0000'],
    ];

    const ITEM_TYPE_COLORS = [
        'appliances' => '1F4E79',
        'furniture'  => '375623',
        'gadgets'    => '4A235A',
    ];

    public function __construct(string $zone, ?int $branchId = null)
    {
        $this->zone     = $zone;
        $this->branchId = $branchId;
    }

    public function collection(): Collection
    {
        return collect();
    }

    /**
     * "New release" boundary: 7th of next month.
     * e.g. April 28 → May 7
     */
    protected function newReleaseCutoff(): Carbon
    {
        return now()->addMonthNoOverflow()->startOfMonth()->addDays(6);
    }

    protected function getOrders(?string $itemType, string $bucket): Collection
    {
        $today            = now();
        $newReleaseCutoff = $this->newReleaseCutoff();

        $base = InstallmentOrder::with([
            'customer',
            'installment_order_items.item',
            'installment_order_payments.installment_order_payment_history',
        ])
            ->where('is_voided', false)
            ->where('is_defaulted', false)
            ->where('is_accelerated', false)
            ->where('is_completed', false);

        if ($itemType !== null) {
            $base->whereHas(
                'installment_order_items.item',
                fn($q) => $q->where('item_type', $itemType)
            );
        }

        if ($this->branchId) {
            $base->where('branch_id', $this->branchId);
        }

        // ── NEW RELEASES ──────────────────────────────────────────────────────
        // First ever payment due date is beyond the 7th of next month.
        if ($bucket === 'new') {
            $base->whereHas('installment_order_payments', function ($q) {
                $q->whereRaw("
        due_date = (
            SELECT MIN(iop.due_date)
            FROM installment_order_payments iop
            WHERE iop.installment_order_id = installment_order_payments.installment_order_id
        )
    ")
                    ->whereDate('due_date', '>', today());
            });

            return $base->get()
                ->sortBy(fn($o) => $o->customer?->last_name ?? '')
                ->values();
        }

        // ── CURRENT ───────────────────────────────────────────────────────────
        // Has ANY unpaid payment whose due_date falls between today-30 and the
        // newReleaseCutoff (May 7). No LIMIT 1 anchor — catches partial/future
        // payments like May 29 when earlier ones are already paid.
        if ($bucket === 'current') {
            $base->whereHas('installment_order_payments', function ($q) use ($today, $newReleaseCutoff) {
                $q->whereRaw('amount_paid <= (amount_due - COALESCE(rebate_amount, 0))')
                    ->where('due_date', '>=', $today->copy()->subDays(30))
                    ->where('due_date', '<=', $newReleaseCutoff);
            })
                ->whereDoesntHave('installment_order_payments', function ($q) use ($today) {
                    $q->whereRaw('amount_paid < (amount_due - COALESCE(rebate_amount, 0))')
                        ->where('due_date', '<', $today->copy()->subDays(30))
                        ->whereRaw('NOT EXISTS (
              SELECT 1 FROM installment_order_payments AS iop2
              WHERE iop2.installment_order_id = installment_order_payments.installment_order_id
                AND iop2.amount_paid < (iop2.amount_due - COALESCE(iop2.rebate_amount, 0))
                AND iop2.due_date < installment_order_payments.due_date
          )');
                });

            return $base->get()
                ->sortBy(fn($o) => $o->customer?->last_name ?? '')
                ->values();
        }else {
            // ── OVERDUE BUCKETS (30 / 60 / 90 / 90+) ────────────────────────────
            // Anchor on the oldest unpaid payment to place the order in exactly
            // one overdue bucket.
            $base->whereHas('installment_order_payments', function ($q) use ($today, $bucket) {
                $q->whereRaw('amount_paid < (amount_due - COALESCE(rebate_amount, 0))')
                    ->whereRaw('id = (
                    SELECT id FROM installment_order_payments AS iop
                    WHERE iop.installment_order_id = installment_order_payments.installment_order_id
                      AND iop.amount_paid < (iop.amount_due - COALESCE(iop.rebate_amount, 0))
                    ORDER BY iop.due_date ASC
                    LIMIT 1
                )');

                match ($bucket) {
                    '30'  => $q->where('due_date', '<', $today->copy()->subDays(30))
                        ->where('due_date', '>=', $today->copy()->subDays(60)),
                    '60'  => $q->where('due_date', '<', $today->copy()->subDays(60))
                        ->where('due_date', '>=', $today->copy()->subDays(90)),
                    '90'  => $q->where('due_date', '<', $today->copy()->subDays(90))
                        ->where('due_date', '>=', $today->copy()->subDays(120)),
                    '90+' => $q->where('due_date', '<', $today->copy()->subDays(120)),
                };
            });
        }

        

        return $base->get()
            ->sortBy(fn($o) => $o->customer?->last_name ?? '')
            ->values();
    }

    protected function buildRow(int $index, InstallmentOrder $order, string $bucket): array
    {
        $today            = now();
        $newReleaseCutoff = $this->newReleaseCutoff();
        $customer         = $order->customer;
        $item             = $order->installment_order_items->first()?->item;

        $mi        = round($order->monthly_payment ?? 0, 2);
        $pnv       = round($order->total_pnv ?? 0, 2);
        $remaining = round($order->remaining_balance ?? 0, 2);

        $bucketPayments = $order->installment_order_payments->filter(function ($p) use ($today, $newReleaseCutoff, $bucket) {
            if (!$p->due_date) return false;
            $due  = Carbon::parse($p->due_date);
            $days = $due->diffInDays($today, false);

            return match ($bucket) {
                'new'     => true,
                // Current: any payment in the window, paid or unpaid
                'current' => $due->gte($today->copy()->subDays(30)) && $due->lte($newReleaseCutoff),
                '30'      => $days > 30  && $days <= 60,
                '60'      => $days > 60  && $days <= 90,
                '90'      => $days > 90  && $days <= 120,
                '90+'     => $days > 120,
                default   => false,
            };
        });

        $totalDue = round(
            $bucketPayments->sum(fn($p) => max(0, $p->amount_due - ($p->rebate_amount ?? 0) - $p->amount_paid)),
            2
        );

        $periodStart = $today->copy()->startOfMonth();
        $periodEnd   = $today->copy();

        $totalPaid = round(
            $bucketPayments
                ->flatMap(fn($p) => $p->installment_order_payment_history)
                ->filter(fn($h) => $h->paid_date
                    && Carbon::parse($h->paid_date)->between($periodStart, $periodEnd))
                ->sum('amount'),
            2
        );

        $creditedOnBalance = round($order->total_amount_paid ?? 0, 2);
        $noOfAccounts      = $totalPaid > 0 ? 1 : 0;
        $advance           = round($order->total_advanced_payment ?? 0, 2);
        $penalty           = round($order->installment_order_payments->sum('penalty_amount') ?? 0, 2);
        $rebate            = round($order->total_rebate_amount ?? 0, 2);

        $latestHistory = $order->installment_order_payments
            ->flatMap(fn($p) => $p->installment_order_payment_history)
            ->sortByDesc('paid_date')
            ->first();

        $orNoDate = $latestHistory
            ? ($latestHistory->collection_receipt_number . ' / ' . Carbon::parse($latestHistory->paid_date)->format('m/d/Y'))
            : '';

        return [
            $index,
            strtoupper(trim(($customer?->last_name ?? '') . ', ' . ($customer?->first_name ?? ''))),
            strtoupper($customer?->address ?? ''),
            strtoupper($item?->model ?? $item?->description ?? ''),
            $order->number_of_terms,
            $order->transaction_date ? Carbon::parse($order->transaction_date)->format('d-M') : '',
            $order->transaction_date ? Carbon::parse($order->transaction_date)->day : '',
            $mi        ?: '',
            $pnv       ?: '',
            $remaining ?: '',
            $totalDue  ?: '',
            $totalPaid ?: '',
            $creditedOnBalance ?: '',
            $totalPaid ?: '',
            $noOfAccounts ?: '',
            $advance  ?: '',
            $penalty  ?: '',
            $rebate   ?: '',
            $orNoDate,
            '',
        ];
    }

    protected function writeBanner(
        Worksheet $sheet,
        int $row,
        string $label,
        string $bgColor,
        string $fontColor = '000000'
    ): int {
        $lastCol = self::LAST_COL;
        $sheet->mergeCells("A{$row}:{$lastCol}{$row}");
        $sheet->setCellValue("A{$row}", $label);
        $sheet->getStyle("A{$row}")->applyFromArray([
            'font'      => ['bold' => true, 'size' => 11, 'name' => 'Arial', 'color' => ['rgb' => $fontColor]],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bgColor]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);
        $sheet->getRowDimension($row)->setRowHeight(20);
        return $row + 1;
    }

    protected function writeBucketSections(
        Worksheet $sheet,
        int $currentRow,
        ?string $itemType,
        array $headers,
        array $numericCols,
        array $colLetters
    ): int {
        $lastCol = self::LAST_COL;

        foreach (self::BUCKETS as $bucket => $bucketConfig) {
            $orders      = $this->getOrders($itemType, $bucket);
            $bucketColor = $bucketConfig['color'];
            $bucketLabel = $bucketConfig['label'];

            // Bucket title row
            $sheet->mergeCells("A{$currentRow}:{$lastCol}{$currentRow}");
            $sheet->setCellValue("A{$currentRow}", $bucketLabel);
            $sheet->getStyle("A{$currentRow}")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 9, 'name' => 'Arial'],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $bucketColor]],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);
            $sheet->getRowDimension($currentRow)->setRowHeight(15);
            $currentRow++;

            // Column header row
            foreach ($headers as $col => $text) {
                $sheet->setCellValue("{$col}{$currentRow}", $text);
            }
            $sheet->getStyle("A{$currentRow}:{$lastCol}{$currentRow}")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 8, 'name' => 'Arial'],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'BDD7EE']],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER,
                    'wrapText'   => true,
                ],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);
            $sheet->getRowDimension($currentRow)->setRowHeight(28);
            $currentRow++;

            // Data rows
            $idx    = 1;
            $totals = array_fill(0, 20, 0);

            foreach ($orders as $order) {
                $row = $this->buildRow($idx++, $order, $bucket);
                $sheet->fromArray($row, null, "A{$currentRow}");
                $sheet->getStyle("A{$currentRow}:{$lastCol}{$currentRow}")->applyFromArray([
                    'font'      => ['size' => 8, 'name' => 'Arial'],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
                    'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                ]);
                foreach ($numericCols as $ci) {
                    $sheet->getStyle("{$colLetters[$ci]}{$currentRow}")
                        ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $totals[$ci] += is_numeric($row[$ci]) ? $row[$ci] : 0;
                }
                $currentRow++;
            }

            // Totals row
            $count = $idx - 1;
            $sheet->mergeCells("A{$currentRow}:G{$currentRow}");
            $sheet->setCellValue("A{$currentRow}", "{$count} TOTAL - {$bucketLabel}");
            foreach ($numericCols as $ci) {
                $sheet->setCellValue("{$colLetters[$ci]}{$currentRow}", $totals[$ci] ?: '');
            }
            $sheet->getStyle("A{$currentRow}:{$lastCol}{$currentRow}")->applyFromArray([
                'font'      => ['bold' => true, 'size' => 8, 'name' => 'Arial'],
                'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D6DCE4']],
                'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
            ]);

            $currentRow += 2;
        }

        return $currentRow;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet            = $event->sheet->getDelegate();
                $today            = now();
                $newReleaseCutoff = $this->newReleaseCutoff();
                $lastCol          = self::LAST_COL;
                $colLetters       = range('A', 'T');

                $numericCols = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

                $headers = [
                    'A' => 'NO.',
                    'B' => 'NAME OF CUSTOMER',
                    'C' => 'ADDRESS',
                    'D' => 'MODEL',
                    'E' => 'TERM',
                    'F' => 'DATE RELEASED',
                    'G' => 'DUE DATE',
                    'H' => 'MI',
                    'I' => 'PNV',
                    'J' => 'REMAINING BALANCE',
                    'K' => 'TOTAL DUE',
                    'L' => 'TOTAL AMT PAID',
                    'M' => 'CREDITED ON BALANCE',
                    'N' => 'AMT CREDITED',
                    'O' => 'NO. OF ACCOUNTS',
                    'P' => 'ADVANCE',
                    'Q' => 'PENALTY',
                    'R' => 'REBATE',
                    'S' => 'OR NO./DATE',
                    'T' => 'REMARKS',
                ];

                $widths = [
                    'A' => 5,
                    'B' => 26,
                    'C' => 22,
                    'D' => 28,
                    'E' => 6,
                    'F' => 11,
                    'G' => 7,
                    'H' => 10,
                    'I' => 12,
                    'J' => 14,
                    'K' => 12,
                    'L' => 13,
                    'M' => 17,
                    'N' => 12,
                    'O' => 13,
                    'P' => 10,
                    'Q' => 10,
                    'R' => 10,
                    'S' => 18,
                    'T' => 14,
                ];
                foreach ($widths as $col => $width) {
                    $sheet->getColumnDimension($col)->setWidth($width);
                }

                // Row 1: Report title
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->setCellValue('A1', "AGING REPORT - {$this->zone}");
                $sheet->getStyle('A1')->applyFromArray([
                    'font'      => ['bold' => true, 'size' => 13, 'name' => 'Arial', 'color' => ['rgb' => 'FFFFFF']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1F3864']],
                ]);
                $sheet->getRowDimension(1)->setRowHeight(24);

                // Row 2: Date
                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->setCellValue('A2', 'AS OF ' . $today->format('F j, Y') . '   |   New Releases = first due after ' . $newReleaseCutoff->format('F j, Y'));
                $sheet->getStyle('A2')->applyFromArray([
                    'font'      => ['bold' => true, 'size' => 10, 'name' => 'Arial'],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9E1F2']],
                ]);
                $sheet->getRowDimension(2)->setRowHeight(16);

                $currentRow = 3;

                // ════════════════════════════════════════════
                // PART 1 - ALL ACCOUNTS (UNFILTERED)
                // ════════════════════════════════════════════
                $currentRow = $this->writeBanner(
                    $sheet,
                    $currentRow,
                    '  ALL ACCOUNTS (UNFILTERED)',
                    '2E4057',
                    'FFFFFF'
                );
                $currentRow = $this->writeBucketSections(
                    $sheet,
                    $currentRow,
                    null,
                    $headers,
                    $numericCols,
                    $colLetters
                );
                $currentRow++;

                // ════════════════════════════════════════════
                // PART 2 - BREAKDOWN BY ITEM TYPE
                // ════════════════════════════════════════════
                $currentRow = $this->writeBanner(
                    $sheet,
                    $currentRow,
                    '  BREAKDOWN BY ITEM TYPE',
                    '2E4057',
                    'FFFFFF'
                );
                $currentRow++;

                foreach (self::ITEM_TYPES as $itemType => $itemLabel) {
                    $currentRow = $this->writeBanner(
                        $sheet,
                        $currentRow,
                        "    {$itemLabel}",
                        self::ITEM_TYPE_COLORS[$itemType],
                        'FFFFFF'
                    );
                    $currentRow = $this->writeBucketSections(
                        $sheet,
                        $currentRow,
                        $itemType,
                        $headers,
                        $numericCols,
                        $colLetters
                    );
                    $currentRow++;
                }

                $sheet->freezePane('A3');
            },
        ];
    }

    public function title(): string
    {
        return "AGING - {$this->zone}";
    }
}
