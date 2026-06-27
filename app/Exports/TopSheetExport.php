<?php

namespace App\Exports;

use App\Models\InstallmentOrder;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class TopsheetExport implements FromCollection, WithEvents, WithTitle
{
    protected string $zone;
    protected ?int $branchId;
    protected Carbon $periodStart;
    protected Carbon $periodEnd;
    public function __construct(string $zone, ?int $branchId, Carbon $periodStart, Carbon $periodEnd)
    {
        $this->zone        = $zone;
        $this->branchId    = $branchId;
        $this->periodStart = $periodStart;
        $this->periodEnd   = $periodEnd;
    }
    public function collection(): Collection
    {
        return collect();
    }
    public function title(): string
    {
        return "TOPSHEET - {$this->zone}";
    }
    /**
     * Compute all topsheet data using the same logic as POSCreditOrderSalesController.
     */
    protected function computeData(): array
    {
        $today       = now();
        $periodStart = $this->periodStart;
        $periodEnd   = $this->periodEnd;
        $query = InstallmentOrder::with([
            'installment_order_payments.installment_order_payment_history',
            'installment_order_items.item',
        ])
            ->where('is_voided', false)
            ->where('is_completed', false)
            ->where('is_defaulted', false)
            ->where('is_accelerated', false);
        if ($this->branchId) {
            $query->where('branch_id', $this->branchId);
        }
        $orders = $query->get();
        $itemTypes = ['appliances', 'furniture', 'gadgets'];
        // Initialise per-item-type buckets
        $receivables = [];
        $collections = [];
        $accounts    = [];
        foreach ($itemTypes as $type) {
            $receivables[$type] = ['count' => 0, 'pnv' => 0, 'remaining_balance' => 0, 'current' => 0, '30' => 0, '60' => 0, '90' => 0, '90+' => 0, 'total' => 0];
            $collections[$type] = ['count' => 0, 'current' => 0, '30' => 0, '60' => 0, '90' => 0, '90+' => 0, 'total' => 0];
            $accounts[$type]    = ['advance' => 0, 'rebate' => 0, 'penalty' => 0];
        }
        // Totals row
        $receivables['total'] = ['count' => 0, 'pnv' => 0, 'remaining_balance' => 0, 'current' => 0, '30' => 0, '60' => 0, '90' => 0, '90+' => 0, 'total' => 0];
        $collections['total'] = ['count' => 0, 'current' => 0, '30' => 0, '60' => 0, '90' => 0, '90+' => 0, 'total' => 0];
        $accounts['total']    = ['advance' => 0, 'rebate' => 0, 'penalty' => 0];
        foreach ($orders as $order) {
            $itemType = $order->installment_order_items->first()?->item?->item_type ?? 'gadgets';
            if (!in_array($itemType, $itemTypes)) $itemType = 'gadgets';
            // PNV
            $pnv = $order->total_pnv;
            // Remaining balance
            $remaining = $order->remaining_balance;
            $receivables[$itemType]['count']++;
            $receivables[$itemType]['pnv'] += $pnv;
            $receivables[$itemType]['remaining_balance'] += $remaining;
            $receivables['total']['count']++;
            $receivables['total']['pnv'] += $pnv;
            $receivables['total']['remaining_balance'] += $remaining;
            // Advance, rebate, penalty
            $accounts[$itemType]['advance'] += $order->total_advanced_payment;
            $accounts[$itemType]['rebate']  += $order->total_rebate_amount;
            $accounts['total']['advance']   += $order->total_advanced_payment;
            $accounts['total']['rebate']    += $order->total_rebate_amount;
            foreach ($order->installment_order_payments as $payment) {
                $dueDate = Carbon::parse($payment->due_date);
                // Days overdue: positive = overdue, negative = future/current
                $daysOverdue = $dueDate->diffInDays($today, false);
                // Penalty
                $penalty = $payment->penalty_amount ?? 0;
                $accounts[$itemType]['penalty'] += $penalty;
                $accounts['total']['penalty']   += $penalty;
                // ── RECEIVABLES: unpaid balance, bucketed by how overdue ──
                $unpaid = max(0, $payment->amount_due - ($payment->rebate_amount ?? 0) - $payment->amount_paid);
                if ($unpaid > 0) {
                    $bucket = $this->agingBucket($daysOverdue);
                    $receivables[$itemType][$bucket] += $unpaid;
                    $receivables[$itemType]['total']  += $unpaid;
                    $receivables['total'][$bucket]    += $unpaid;
                    $receivables['total']['total']    += $unpaid;
                }
                // ── COLLECTIONS: amounts actually paid within the period ──
                foreach ($payment->installment_order_payment_history as $history) {
                    if (!$history->paid_date) continue;
                    $paidDate = Carbon::parse($history->paid_date);
                    if (!$paidDate->between($periodStart, $periodEnd)) continue;
                    $amt    = (float) $history->amount;
                    $bucket = $this->agingBucket($daysOverdue);
                    $collections[$itemType][$bucket] += $amt;
                    $collections[$itemType]['total']  += $amt;
                    $collections[$itemType]['count']++;
                    $collections['total'][$bucket]    += $amt;
                    $collections['total']['total']    += $amt;
                    $collections['total']['count']++;
                }
            }
        }
        return compact('receivables', 'collections', 'accounts');
    }
    /**
     * Map daysOverdue to an aging bucket key.
     * daysOverdue: positive = overdue (past due), 0 = due today, negative = future.
     */
    protected function agingBucket(float $daysOverdue): string
    {
        if ($daysOverdue <= 30)  return 'current';
        if ($daysOverdue <= 60)  return '30';
        if ($daysOverdue <= 90)  return '60';
        if ($daysOverdue <= 120) return '90';
        return '90+';
    }
    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $data  = $this->computeData();
                $receivables = $data['receivables'];
                $collections = $data['collections'];
                $accounts    = $data['accounts'];
                $itemTypes  = ['appliances', 'furniture', 'gadgets'];
                $itemLabels = ['APPLIANCE', 'GADGET', 'FURNITURE'];
                $itemKeys   = ['appliances', 'gadgets', 'furniture']; // display order matching screenshot
                // ── Column widths ─────────────────────────────────────────
                $widths = ['A' => 14, 'B' => 8, 'C' => 12, 'D' => 14, 'E' => 8, 'F' => 12, 'G' => 8, 'H' => 12, 'I' => 8, 'J' => 12, 'K' => 8, 'L' => 12, 'M' => 12];
                foreach ($widths as $col => $w) {
                    $sheet->getColumnDimension($col)->setWidth($w);
                }
                $thin   = ['borderStyle' => Border::BORDER_THIN];
                $medium = ['borderStyle' => Border::BORDER_MEDIUM];
                $styleCenter = ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true]];
                $styleRight  = ['alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT,  'vertical' => Alignment::VERTICAL_CENTER]];
                $numFmt = '#,##0.00';
                // Helper: apply fill + bold + center to a range
                $fillBold = function (string $range, string $color, bool $white = false) use ($sheet) {
                    $sheet->getStyle($range)->applyFromArray([
                        'font'      => ['bold' => true, 'color' => ['rgb' => $white ? 'FFFFFF' : '000000']],
                        'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $color]],
                        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
                        'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    ]);
                };
                $setBorder = function (string $range) use ($sheet, $thin) {
                    $sheet->getStyle($range)->applyFromArray(['borders' => ['allBorders' => $thin]]);
                };
                $setNum = function (string $cell, float $value) use ($sheet, $numFmt, $styleRight) {
                    $sheet->setCellValue($cell, $value ?: '');
                    $sheet->getStyle($cell)->applyFromArray($styleRight);
                    if ($value) $sheet->getStyle($cell)->getNumberFormat()->setFormatCode($numFmt);
                };
                $setInt = function (string $cell, int $value) use ($sheet, $styleCenter) {
                    $sheet->setCellValue($cell, $value ?: '');
                    $sheet->getStyle($cell)->applyFromArray($styleCenter);
                };
                // ── Row 1: Title ──────────────────────────────────────────
                $sheet->mergeCells('A1:M1');
                $sheet->setCellValue('A1', "TOPSHEET - {$this->zone}");
                $fillBold('A1:M1', '1F3864', true);
                $sheet->getRowDimension(1)->setRowHeight(22);
                // ── Row 2: Period ─────────────────────────────────────────
                $sheet->mergeCells('A2:M2');
                $sheet->setCellValue('A2', 'Month: ' . $this->periodStart->format('F Y'));
                $sheet->getStyle('A2')->applyFromArray(['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER], 'font' => ['bold' => true]]);
                $sheet->getRowDimension(2)->setRowHeight(16);
                // ═══════════════════════════════════════════════
                // SECTION 1: RECEIVABLES AS OF {PERIOD}
                // ═══════════════════════════════════════════════
                $r = 4;
                $sheet->mergeCells("A{$r}:M{$r}");
                $sheet->setCellValue("A{$r}", 'RECEIVABLES AS OF ' . strtoupper($this->periodEnd->format('F Y')));
                $fillBold("A{$r}:M{$r}", 'FFFF00');
                $sheet->getRowDimension($r)->setRowHeight(18);
                $r++;
                // Header row 1 (merged groups)
                $sheet->mergeCells("F{$r}:G{$r}");
                $sheet->setCellValue("F{$r}", 'Current');
                $sheet->mergeCells("H{$r}:I{$r}");
                $sheet->setCellValue("H{$r}", '30days');
                $sheet->mergeCells("J{$r}:K{$r}");
                $sheet->setCellValue("J{$r}", '60days');
                $sheet->mergeCells("L{$r}:M{$r}");
                $sheet->setCellValue("L{$r}", '90days+');
                $fillBold("A{$r}:M{$r}", 'BDD7EE');
                $sheet->getRowDimension($r)->setRowHeight(16);
                $r++;
                // Header row 2
                $recvHeaders = ['A' => '', 'B' => 'TOTAL # of Accounts', 'C' => 'PNV', 'D' => 'Remaining Balance', 'E' => 'No. of Accts.', 'F' => 'Amount', 'G' => 'No. of Accts.', 'H' => 'Amount', 'I' => 'No. of Accts.', 'J' => 'Amount', 'K' => 'No. of Accts.', 'L' => 'Amount', 'M' => 'Total'];
                foreach ($recvHeaders as $col => $val) {
                    $sheet->setCellValue("{$col}{$r}", $val);
                }
                $fillBold("A{$r}:M{$r}", 'BDD7EE');
                $sheet->getRowDimension($r)->setRowHeight(28);
                $r++;
                // Data rows (Appliance, Gadget, Furniture)
                foreach ($itemKeys as $typeKey) {
                    $label = strtoupper($typeKey === 'appliances' ? 'APPLIANCE' : ($typeKey === 'gadgets' ? 'GADGET' : 'FURNITURE'));
                    $d     = $receivables[$typeKey];
                    $sheet->setCellValue("A{$r}", $label);
                    $setInt("B{$r}", $d['count']);
                    $setNum("C{$r}", round($d['pnv'], 2));
                    $setNum("D{$r}", round($d['remaining_balance'], 2));
                    $sheet->setCellValue("E{$r}", ''); // No. of accts current (not tracked separately per bucket)
                    $setNum("F{$r}", round($d['current'], 2));
                    $sheet->setCellValue("G{$r}", '');
                    $setNum("H{$r}", round($d['30'], 2));
                    $sheet->setCellValue("I{$r}", '');
                    $setNum("J{$r}", round($d['60'], 2));
                    $sheet->setCellValue("K{$r}", '');
                    $setNum("L{$r}", round(($d['90'] + $d['90+']), 2));
                    $setNum("M{$r}", round($d['total'], 2));
                    $setBorder("A{$r}:M{$r}");
                    $sheet->getStyle("A{$r}")->getFont()->setBold(true);
                    $r++;
                }
                // Total row
                $d = $receivables['total'];
                $sheet->setCellValue("A{$r}", 'TOTAL');
                $setInt("B{$r}", $d['count']);
                $setNum("C{$r}", round($d['pnv'], 2));
                $setNum("D{$r}", round($d['remaining_balance'], 2));
                $sheet->setCellValue("E{$r}", '');
                $setNum("F{$r}", round($d['current'], 2));
                $sheet->setCellValue("G{$r}", '');
                $setNum("H{$r}", round($d['30'], 2));
                $sheet->setCellValue("I{$r}", '');
                $setNum("J{$r}", round($d['60'], 2));
                $sheet->setCellValue("K{$r}", '');
                $setNum("L{$r}", round(($d['90'] + $d['90+']), 2));
                $setNum("M{$r}", round($d['total'], 2));
                $fillBold("A{$r}:M{$r}", 'FF0000', true);
                $r++;
                // Collection rate row (% of remaining collected)
                $totalRecv = $receivables['total']['total'];
                $totalColl = $collections['total']['total'];
                $overallRate = $totalRecv > 0 ? round(($totalColl / $totalRecv) * 100, 0) . '%' : '0%';
                $sheet->mergeCells("A{$r}:D{$r}");
                $sheet->setCellValue("A{$r}", '');
                $currentRate = $receivables['total']['current'] > 0 ? round(($collections['total']['current'] / $receivables['total']['current']) * 100, 0) . '%' : '0%';
                $rate30      = $receivables['total']['30'] > 0 ? round(($collections['total']['30'] / $receivables['total']['30']) * 100, 0) . '%' : '0%';
                $rate60      = $receivables['total']['60'] > 0 ? round(($collections['total']['60'] / $receivables['total']['60']) * 100, 0) . '%' : '0%';
                $rate90plus  = ($receivables['total']['90'] + $receivables['total']['90+']) > 0
                    ? round(($collections['total']['90'] + $collections['total']['90+']) / ($receivables['total']['90'] + $receivables['total']['90+']) * 100, 0) . '%' : '0%';
                $sheet->setCellValue("F{$r}", $currentRate);
                $sheet->setCellValue("H{$r}", $rate30);
                $sheet->setCellValue("J{$r}", $rate60);
                $sheet->setCellValue("L{$r}", $rate90plus);
                $sheet->setCellValue("M{$r}", $overallRate);
                $sheet->getStyle("A{$r}:M{$r}")->applyFromArray(['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER], 'font' => ['bold' => true, 'italic' => true]]);
                $setBorder("A{$r}:M{$r}");
                $r += 2; // blank row
                // ═══════════════════════════════════════════════
                // SECTION 2: ACTUAL COLLECTION
                // ═══════════════════════════════════════════════
                $sheet->mergeCells("A{$r}:M{$r}");
                $sheet->setCellValue("A{$r}", 'ACTUAL COLLECTION - ' . strtoupper($this->periodStart->format('F Y')));
                $fillBold("A{$r}:M{$r}", '92D050');
                $sheet->getRowDimension($r)->setRowHeight(18);
                $r++;
                // Header rows (same structure as receivables)
                $sheet->mergeCells("F{$r}:G{$r}");
                $sheet->setCellValue("F{$r}", 'Current');
                $sheet->mergeCells("H{$r}:I{$r}");
                $sheet->setCellValue("H{$r}", '30days');
                $sheet->mergeCells("J{$r}:K{$r}");
                $sheet->setCellValue("J{$r}", '60days');
                $sheet->mergeCells("L{$r}:M{$r}");
                $sheet->setCellValue("L{$r}", '90days+');
                $fillBold("A{$r}:M{$r}", 'BDD7EE');
                $sheet->getRowDimension($r)->setRowHeight(16);
                $r++;
                $collHeaders = ['A' => '', 'B' => 'TOTAL # of Accounts', 'C' => 'PNV', 'D' => 'Remaining Balance', 'E' => 'No. of Accts.', 'F' => 'Amount', 'G' => 'No. of Accts.', 'H' => 'Amount', 'I' => 'No. of Accts.', 'J' => 'Amount', 'K' => 'No. of Accts.', 'L' => 'Amount', 'M' => 'Total'];
                foreach ($collHeaders as $col => $val) {
                    $sheet->setCellValue("{$col}{$r}", $val);
                }
                $fillBold("A{$r}:M{$r}", 'BDD7EE');
                $sheet->getRowDimension($r)->setRowHeight(28);
                $r++;
                foreach ($itemKeys as $typeKey) {
                    $label = strtoupper($typeKey === 'appliances' ? 'APPLIANCE' : ($typeKey === 'gadgets' ? 'GADGET' : 'FURNITURE'));
                    $rc    = $receivables[$typeKey];
                    $co    = $collections[$typeKey];
                    $sheet->setCellValue("A{$r}", $label);
                    $setInt("B{$r}", $rc['count']);
                    $sheet->setCellValue("C{$r}", '');
                    $sheet->setCellValue("D{$r}", '');
                    $setInt("E{$r}", $co['count'] > 0 ? $co['count'] : 0);
                    $setNum("F{$r}", round($co['current'], 2));
                    $sheet->setCellValue("G{$r}", '');
                    $setNum("H{$r}", round($co['30'], 2));
                    $sheet->setCellValue("I{$r}", '');
                    $setNum("J{$r}", round($co['60'], 2));
                    $sheet->setCellValue("K{$r}", '');
                    $setNum("L{$r}", round(($co['90'] + $co['90+']), 2));
                    $setNum("M{$r}", round($co['total'], 2));
                    $setBorder("A{$r}:M{$r}");
                    $sheet->getStyle("A{$r}")->getFont()->setBold(true);
                    $r++;
                }
                // Total
                $co = $collections['total'];
                $rc = $receivables['total'];
                $sheet->setCellValue("A{$r}", 'TOTAL');
                $setInt("B{$r}", $rc['count']);
                $sheet->setCellValue("C{$r}", '');
                $sheet->setCellValue("D{$r}", '');
                $setInt("E{$r}", $co['count']);
                $setNum("F{$r}", round($co['current'], 2));
                $sheet->setCellValue("G{$r}", '');
                $setNum("H{$r}", round($co['30'], 2));
                $sheet->setCellValue("I{$r}", '');
                $setNum("J{$r}", round($co['60'], 2));
                $sheet->setCellValue("K{$r}", '');
                $setNum("L{$r}", round(($co['90'] + $co['90+']), 2));
                $setNum("M{$r}", round($co['total'], 2));
                $fillBold("A{$r}:M{$r}", 'FF0000', true);
                $r += 2; // blank row
                // ═══════════════════════════════════════════════
                // SECTION 3: COLLECTION PERFORMANCE (%)
                // ═══════════════════════════════════════════════
                $sheet->mergeCells("A{$r}:M{$r}");
                $sheet->setCellValue("A{$r}", 'COLLECTION PERFORMANCE');
                $fillBold("A{$r}:M{$r}", '92D050');
                $sheet->getRowDimension($r)->setRowHeight(18);
                $r++;
                // Headers
                $perfHeaders = ['A' => '', 'B' => 'PNV', 'C' => 'Remaining Balance', 'D' => 'No. of Accts.', 'E' => 'Current %', 'F' => 'No. of Accts.', 'G' => '30days %', 'H' => 'No. of Accts.', 'I' => '60days %', 'J' => 'No. of Accts.', 'K' => '90days+ %', 'L' => 'Total %'];
                foreach ($perfHeaders as $col => $val) {
                    $sheet->setCellValue("{$col}{$r}", $val);
                }
                $fillBold("A{$r}:L{$r}", 'BDD7EE');
                $sheet->getRowDimension($r)->setRowHeight(28);
                $r++;
                $pct = fn($collected, $receivable) => $receivable > 0
                    ? round(($collected / $receivable) * 100) . '%'
                    : ($collected > 0 ? '100%' : '-');
                foreach ($itemKeys as $typeKey) {
                    $label = strtoupper($typeKey === 'appliances' ? 'APPLIANCE' : ($typeKey === 'gadgets' ? 'GADGET' : 'FURNITURE'));
                    $rc    = $receivables[$typeKey];
                    $co    = $collections[$typeKey];
                    $sheet->setCellValue("A{$r}", $label);
                    $setNum("B{$r}", round($rc['pnv'], 2));
                    $setNum("C{$r}", round($rc['remaining_balance'], 2));
                    $sheet->setCellValue("D{$r}", $rc['count']);
                    $sheet->setCellValue("E{$r}", $pct($co['current'], $rc['current']));
                    $sheet->setCellValue("F{$r}", '');
                    $sheet->setCellValue("G{$r}", $pct($co['30'], $rc['30']));
                    $sheet->setCellValue("H{$r}", '');
                    $sheet->setCellValue("I{$r}", $pct($co['60'], $rc['60']));
                    $sheet->setCellValue("J{$r}", '');
                    $sheet->setCellValue("K{$r}", $pct(($co['90'] + $co['90+']), ($rc['90'] + $rc['90+'])));
                    $sheet->setCellValue("L{$r}", $pct($co['total'], $rc['total']));
                    $setBorder("A{$r}:L{$r}");
                    $sheet->getStyle("A{$r}")->getFont()->setBold(true);
                    $r++;
                }
                // Total performance
                $rc = $receivables['total'];
                $co = $collections['total'];
                $sheet->setCellValue("A{$r}", 'TOTAL');
                $setNum("B{$r}", round($rc['pnv'], 2));
                $setNum("C{$r}", round($rc['remaining_balance'], 2));
                $sheet->setCellValue("D{$r}", $rc['count']);
                $sheet->setCellValue("E{$r}", $pct($co['current'], $rc['current']));
                $sheet->setCellValue("F{$r}", '');
                $sheet->setCellValue("G{$r}", $pct($co['30'], $rc['30']));
                $sheet->setCellValue("H{$r}", '');
                $sheet->setCellValue("I{$r}", $pct($co['60'], $rc['60']));
                $sheet->setCellValue("J{$r}", '');
                $sheet->setCellValue("K{$r}", $pct(($co['90'] + $co['90+']), ($rc['90'] + $rc['90+'])));
                $sheet->setCellValue("L{$r}", $pct($co['total'], $rc['total']));
                $fillBold("A{$r}:L{$r}", 'FF0000', true);
                $r += 2;
                // ═══════════════════════════════════════════════
                // SECTION 4: ADVANCE / REBATE / PENALTY summary
                // ═══════════════════════════════════════════════
                $sheet->setCellValue("A{$r}", 'No. of Accts.');
                $sheet->setCellValue("B{$r}", 'ADVANCE');
                $sheet->setCellValue("C{$r}", 'REBATE');
                $fillBold("A{$r}:C{$r}", 'BDD7EE');
                $sheet->mergeCells("E{$r}:F{$r}");
                $sheet->setCellValue("E{$r}", 'COLLECTION REVENUE');
                $sheet->setCellValue("G{$r}", round($co['total'], 2));
                $sheet->getStyle("G{$r}")->getNumberFormat()->setFormatCode($numFmt);
                $fillBold("E{$r}:F{$r}", 'BDD7EE');
                $setBorder("E{$r}:G{$r}");
                $sheet->setCellValue("I{$r}", 'COLLEX');
                $sheet->setCellValue("J{$r}", round($co['total'], 2));
                $sheet->getStyle("J{$r}")->getNumberFormat()->setFormatCode($numFmt);
                $setBorder("I{$r}:J{$r}");
                $r++;
                foreach ($itemKeys as $typeKey) {
                    $label = strtoupper($typeKey === 'appliances' ? 'APPLIANCE' : ($typeKey === 'gadgets' ? 'GADGET' : 'FURNITURE'));
                    $ac    = $accounts[$typeKey];
                    $sheet->setCellValue("A{$r}", $label);
                    $setNum("B{$r}", round($ac['advance'], 2));
                    $setNum("C{$r}", round($ac['rebate'], 2));
                    $setBorder("A{$r}:C{$r}");
                    if ($typeKey === 'appliances') {
                        $sheet->mergeCells("E{$r}:F{$r}");
                        $sheet->setCellValue("E{$r}", 'W/ ADVANCE');
                        $sheet->setCellValue("G{$r}", round($accounts['total']['advance'], 2) > 0 ? round($accounts['total']['advance'], 2) : '-');
                        $sheet->getStyle("G{$r}")->getNumberFormat()->setFormatCode($numFmt);
                        $setBorder("E{$r}:G{$r}");
                        $sheet->setCellValue("I{$r}", 'ADVANCE');
                        $sheet->setCellValue("J{$r}", round($accounts['total']['advance'], 2) ?: '-');
                        $setBorder("I{$r}:J{$r}");
                    }
                    $r++;
                }
                // Total advance/rebate
                $ac = $accounts['total'];
                $sheet->setCellValue("A{$r}", 'TOTAL');
                $setNum("B{$r}", round($ac['advance'], 2));
                $setNum("C{$r}", round($ac['rebate'], 2));
                $fillBold("A{$r}:C{$r}", 'FFFF00');
                $sheet->mergeCells("E{$r}:F{$r}");
                $sheet->setCellValue("E{$r}", 'TOTAL COLLECTIONS');
                $sheet->setCellValue("G{$r}", round($co['total'], 2));
                $sheet->getStyle("G{$r}")->getNumberFormat()->setFormatCode($numFmt);
                $fillBold("E{$r}:F{$r}", 'FFFF00');
                $setBorder("E{$r}:G{$r}");
                $sheet->setCellValue("I{$r}", 'PENALTY');
                $sheet->setCellValue("J{$r}", round($ac['penalty'], 2) ?: '-');
                $setBorder("I{$r}:J{$r}");
                $r++;
                $sheet->setCellValue("I{$r}", 'REBATE');
                $sheet->setCellValue("J{$r}", round($ac['rebate'], 2) ?: '-');
                $setBorder("I{$r}:J{$r}");
                $r++;
                $netCollection = $co['total'] - $ac['rebate'];
                $sheet->setCellValue("J{$r}", round($netCollection, 2));
                $sheet->getStyle("J{$r}")->getNumberFormat()->setFormatCode($numFmt);
                $setBorder("I{$r}:J{$r}");
                // General sheet formatting
                $sheet->getStyle("A1:M{$r}")->getFont()->setName('Arial')->setSize(9);
                $sheet->freezePane('A4');
            },
        ];
    }
}
