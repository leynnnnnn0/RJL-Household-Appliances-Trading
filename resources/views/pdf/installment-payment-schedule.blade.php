<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Payment Schedule — {{ $order->order_number }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #1a1a1a;
            background: #fff;
        }

        /* ── Header ── */
        .header {
            background: #ffbf75;
            color: #fff;
            padding: 18px 24px 14px;
            margin-bottom: 16px;
        }
        .header h1  { font-size: 15pt; font-weight: 700; letter-spacing: .5px; }
        .header p   { font-size: 8.5pt; opacity: .85; margin-top: 2px; }
        .header-meta {
            float: right;
            text-align: right;
            font-size: 8pt;
            opacity: .9;
            line-height: 1.6;
        }

        /* ── Section titles ── */
        .section-title {
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .6px;
            color: #ffbf75;
            border-bottom: 2px solid #ffbf75;
            padding-bottom: 3px;
            margin: 14px 0 8px;
        }

        /* ── Info grids ── */
        .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }
        .info-grid td {
            padding: 3px 6px;
            vertical-align: top;
            font-size: 8.5pt;
        }
        .info-grid .label {
            color: #6b7280;
            width: 120px;
            white-space: nowrap;
        }
        .info-grid .value { font-weight: 600; }

        /* ── Financial summary boxes ── */
        .fin-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 5px;
            margin-bottom: 4px;
        }
        .fin-grid td {
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 7px 10px;
            width: 25%;
            vertical-align: top;
        }
        .fin-label { font-size: 7.5pt; color: #6b7280; margin-bottom: 2px; }
        .fin-value { font-size: 11pt; font-weight: 700; color: #1a1a1a; }
        .fin-sub   { font-size: 7pt; color: #9ca3af; margin-top: 1px; }
        .orange { color: #ea580c; }
        .green  { color: #16a34a; }

        /* ── Progress bar ── */
        .progress-wrap {
            background: #f3f4f6;
            border-radius: 4px;
            height: 8px;
            width: 100%;
            margin: 6px 0 2px;
        }
        .progress-bar {
            background: #ffbf75;
            height: 8px;
            border-radius: 4px;
        }
        .progress-label {
            font-size: 7.5pt;
            color: #6b7280;
            text-align: right;
        }

        /* ── Schedule table ── */
        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 8pt;
        }
        .schedule-table thead tr {
            background: #ffbf75;
            color: #fff;
        }
        .schedule-table thead th {
            padding: 7px 8px;
            text-align: left;
            font-size: 7.5pt;
            font-weight: 600;
        }
        .schedule-table tbody tr:nth-child(even) { background: #f9fafb; }
        .schedule-table tbody tr.next-row        { background: #eff6ff; }
        .schedule-table tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }

        /* status badges */
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 10px;
            font-size: 7pt;
            font-weight: 700;
        }
        .badge-paid    { background:#dcfce7; color:#15803d; }
        .badge-partial { background:#dbeafe; color:#1d4ed8; }
        .badge-overdue { background:#fee2e2; color:#dc2626; }
        .badge-pending { background:#f3f4f6; color:#374151; }

        /* ── History sub-table ── */
        .history-wrap {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 5px 8px;
            margin-top: 4px;
        }
        .history-title {
            font-size: 7pt;
            font-weight: 700;
            color: #ffbf75;
            margin-bottom: 3px;
            text-transform: uppercase;
            letter-spacing: .4px;
        }
        .history-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5pt;
        }
        .history-table th {
            text-align: left;
            color: #6b7280;
            font-weight: 600;
            padding: 2px 4px;
            border-bottom: 1px solid #e5e7eb;
        }
        .history-table td {
            padding: 2px 4px;
            color: #374151;
            border-bottom: 1px dashed #f0f0f0;
        }
        .history-table tr:last-child td { border-bottom: none; }

        /* ── Footer ── */
        .footer {
            margin-top: 20px;
            border-top: 1px solid #e5e7eb;
            padding-top: 8px;
            font-size: 7.5pt;
            color: #9ca3af;
            text-align: center;
        }

        /* status-aware row tint */
        tr.row-overdue > td { border-left: 3px solid #dc2626; }
        tr.row-partial  > td { border-left: 3px solid #2563eb; }
        tr.row-paid     > td { border-left: 3px solid #16a34a; }
    </style>
</head>
<body>

{{-- ══════════════════════════ HEADER ══════════════════════════ --}}
<div class="header">
    <div class="header-meta">
        Generated: {{ $generatedAt }}<br>
        Order #{{ $order->order_number }}
    </div>
    <h1>Payment Schedule</h1>
    <p>{{ $order->branch->name ?? 'N/A' }} &mdash; Installment Order</p>
    <div style="clear:both"></div>
</div>

{{-- ══════════════════════════ ORDER INFO ══════════════════════════ --}}
<div style="padding: 0 16px;">

<div class="section-title">Order Information</div>
<table class="info-grid">
    <tr>
        <td class="label">Customer</td>
        <td class="value">{{ $order->customer->first_name }} {{ $order->customer->last_name }}</td>
        <td class="label">Transaction Date</td>
        <td class="value">{{ \Carbon\Carbon::parse($order->transaction_date)->format('F d, Y') }}</td>
    </tr>
    <tr>
        <td class="label">Address</td>
        <td class="value">{{ $order->customer->address ?? '—' }}</td>
        <td class="label">Branch</td>
        <td class="value">{{ $order->branch->name ?? '—' }}</td>
    </tr>
    <tr>
        <td class="label">Phone</td>
        <td class="value">{{ $order->customer->phone_number ?? '—' }}</td>
        <td class="label">Processed By</td>
        <td class="value">{{ $order->user->full_name ?? '—' }}</td>
    </tr>
    <tr>
        <td class="label">Terms</td>
        <td class="value">{{ $order->number_of_terms }} months</td>
        <td class="label">Status</td>
        <td class="value">
            @if($order->is_voided)    <span style="color:#dc2626;font-weight:700;">VOIDED</span>
            @elseif($order->is_defaulted) <span style="color:#ea580c;font-weight:700;">DEFAULTED</span>
            @elseif($order->is_completed) <span style="color:#16a34a;font-weight:700;">COMPLETED</span>
            @elseif($order->is_accelerated) <span style="color:#16a34a;font-weight:700;">ACCELERATED</span>
            @else <span style="color:#2563eb;font-weight:700;">ACTIVE</span>
            @endif
        </td>
    </tr>
</table>

{{-- ══════════════════════════ ITEMS ══════════════════════════ --}}
<div class="section-title">Items</div>
<table class="schedule-table" style="margin-bottom:4px;">
    <thead>
        <tr>
            <th>#</th>
            <th>Description</th>
            <th>Model</th>
            <th>Serial</th>
            <th style="text-align:right;">Sale Amount</th>
        </tr>
    </thead>
    <tbody>
        @foreach($order->installment_order_items as $idx => $item)
        <tr>
            <td>{{ $idx + 1 }}</td>
            <td>{{ $item->item->description }}</td>
            <td>{{ $item->item->model }}</td>
            <td>{{ $item->item->serial ?? $item->serial }}</td>
            <td style="text-align:right;">₱{{ number_format($item->sale_amount, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- ══════════════════════════ FINANCIAL SUMMARY ══════════════════════════ --}}
<div class="section-title">Financial Summary</div>
<table class="fin-grid">
    <tr>
        <td>
            <div class="fin-label">Loan Contract Price</div>
            <div class="fin-value">₱{{ number_format($order->loan_contract_price, 2) }}</div>
            <div class="fin-sub">+{{ $order->lcp_markup_rate }}% markup</div>
        </td>
        <td>
            <div class="fin-label">Down Payment</div>
            <div class="fin-value">₱{{ number_format($order->down_payment, 2) }}</div>
            @if($order->payment_method)
            <div class="fin-sub">via {{ $order->payment_method }}</div>
            @endif
        </td>
        <td>
            <div class="fin-label">Total PNV</div>
            <div class="fin-value">₱{{ number_format($finalPnv, 2) }}</div>
            <div class="fin-sub">+{{ $order->promisory_note_value_interest }}% markup</div>
        </td>
        <td>
            <div class="fin-label">Remaining Balance</div>
            <div class="fin-value orange">₱{{ number_format($remainingBalance, 2) }}</div>
            <div class="fin-sub">{{ $progress }}% paid</div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="fin-label">Total Paid</div>
            <div class="fin-value green">₱{{ number_format($totalPaid, 2) }}</div>
        </td>
        <td>
            <div class="fin-label">Total Rebate</div>
            <div class="fin-value">₱{{ number_format($order->total_rebate_amount, 2) }}</div>
        </td>
        <td>
            <div class="fin-label">Advanced Payment</div>
            <div class="fin-value">₱{{ number_format($order->total_advanced_payment, 2) }}</div>
        </td>
        @if($order->is_accelerated)
        <td>
            <div class="fin-label">Acceleration Discount</div>
            <div class="fin-value">₱{{ number_format($order->acceleration_discount, 2) }}</div>
        </td>
        @else
        <td></td>
        @endif
    </tr>
</table>

{{-- Progress bar --}}
<div class="progress-wrap">
    <div class="progress-bar" style="width: {{ min($progress, 100) }}%;"></div>
</div>
<div class="progress-label">
    ₱{{ number_format($totalPaid, 2) }} of ₱{{ number_format($finalPnv, 2) }} paid ({{ $progress }}%)
</div>

{{-- ══════════════════════════ PAYMENT SCHEDULE ══════════════════════════ --}}
<div class="section-title" style="margin-top:14px;">Payment Schedule &amp; History</div>

@php
    $today = now();
    $nextPayment = $order->installment_order_payments
        ->sortBy('installment_number')
        ->first(fn($p) => !in_array($p->status, ['paid','completed']));
@endphp

<table class="schedule-table">
    <thead>
        <tr>
            <th>#</th>
            <th>Due Date</th>
            <th>Amount Due</th>
            <th>Paid</th>
            <th>Remaining</th>
            <th>Rebate</th>
            <th>Payment Date</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
    @foreach($order->installment_order_payments->sortBy('installment_number') as $payment)
        @php
            $isPaid      = in_array($payment->status, ['paid','completed']);
            $isNext      = $nextPayment && $nextPayment->id === $payment->id;
            $amountPaid  = (float)($payment->amount_paid ?? 0);
            $amountDue   = (float)$payment->amount_due - (float)$payment->rebate_amount;
            $remaining   = $order->is_accelerated ? 0 : max(0, $amountDue - $amountPaid);
            $isOverdue   = !$isPaid && $today->gt($payment->due_date);

            $rowClass = $isPaid ? 'row-paid'
                      : ($payment->status === 'partial' ? 'row-partial'
                      : ($isOverdue ? 'row-overdue' : ''));

            $histories = $payment->installment_order_payment_history ?? collect();
        @endphp

        {{-- Main payment row --}}
        <tr class="{{ $rowClass }}{{ $isNext ? ' next-row' : '' }}">
            <td><strong>#{{ $payment->installment_number }}</strong></td>
            <td>{{ \Carbon\Carbon::parse($payment->due_date)->format('M d, Y') }}</td>
            <td>₱{{ number_format($amountDue, 2) }}</td>
            <td class="green">{{ $amountPaid > 0 ? '₱'.number_format($amountPaid, 2) : '—' }}</td>
            <td class="orange">{{ $remaining > 0 ? '₱'.number_format($remaining, 2) : '—' }}</td>
            <td style="color:#2563eb;">
                {{ $payment->rebate_amount > 0 ? '₱'.number_format($payment->rebate_amount, 2) : '—' }}
            </td>
            <td>{{ $payment->paid_date ? \Carbon\Carbon::parse($payment->paid_date)->format('M d, Y') : '—' }}</td>
            <td>
                @if($isPaid)
                    <span class="badge badge-paid">Paid</span>
                @elseif($payment->status === 'partial')
                    <span class="badge badge-partial">Partial</span>
                @elseif($isOverdue)
                    <span class="badge badge-overdue">Overdue</span>
                @else
                    <span class="badge badge-pending">Pending</span>
                @endif
            </td>
        </tr>

        {{-- Payment history sub-rows --}}
        @if($histories->count() > 0)
        <tr>
            <td colspan="8" style="padding: 0 8px 8px 24px; background:#fafafa;">
                <div class="history-wrap">
                    <div class="history-title">&#9679; Payment Transactions ({{ $histories->count() }})</div>
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>CR No.</th>
                                <th>Reference</th>
                                <th>Recorded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($histories->sortBy('paid_date') as $h)
                            <tr>
                                <td>{{ \Carbon\Carbon::parse($h->paid_date)->format('M d, Y') }}</td>
                                <td style="color:#16a34a;font-weight:600;">₱{{ number_format($h->amount, 2) }}</td>
                                <td style="text-transform:capitalize;">{{ str_replace('_',' ',$h->payment_method) }}</td>
                                <td>{{ $h->collection_receipt_number ?: '—' }}</td>
                                <td>{{ $h->reference_number ?: '—' }}</td>
                                <td>{{ $h->user->full_name ?? '—' }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
        @endif

    @endforeach
    </tbody>
</table>

{{-- ══════════════════════════ TOTALS ROW ══════════════════════════ --}}
@php
    $totalDue  = $order->installment_order_payments->sum(fn($p) => (float)$p->amount_due - (float)$p->rebate_amount);
    $grandPaid = $order->installment_order_payments->sum(fn($p) => (float)($p->amount_paid ?? 0));
    $grandRem  = max(0, $totalDue - $grandPaid);
@endphp
<table class="schedule-table" style="margin-top:0;">
    <tbody>
        <tr style="background:#ffbf75;color:#fff;font-weight:700;font-size:8.5pt;">
            <td colspan="2" style="padding:7px 8px;">TOTALS</td>
            <td style="padding:7px 8px;">₱{{ number_format($totalDue, 2) }}</td>
            <td style="padding:7px 8px;">₱{{ number_format($grandPaid, 2) }}</td>
            <td style="padding:7px 8px;">₱{{ number_format($grandRem, 2) }}</td>
            <td colspan="3" style="padding:7px 8px;"></td>
        </tr>
    </tbody>
</table>

</div>{{-- /padding --}}

<div class="footer">
    This document was generated on {{ $generatedAt }} &mdash; {{ $order->branch->name ?? '' }} &mdash; Order #{{ $order->order_number }}<br>
    This is a system-generated document and does not require a signature.
</div>

</body>
</html>