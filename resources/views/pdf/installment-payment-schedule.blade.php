<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Payment Schedule — {{ $order->order_number }}</title>
    <style>
        @page {
            margin: 40px 80px;
        }
   

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #000;
            background: #fff;
        }

        /* ── Header ── */
        .header {
            border-bottom: 3px solid #000;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }
        .header h1 {
            font-size: 16pt;
            font-weight: 700;
            letter-spacing: .5px;
            color: #000;
        }
        .header .sub {
            font-size: 9pt;
            color: #333;
            margin-top: 2px;
        }
        .header-meta {
            float: right;
            text-align: right;
            font-size: 8pt;
            color: #333;
            line-height: 1.7;
        }

        /* ── Section titles ── */
        .section-title {
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .7px;
            color: #000;
            border-bottom: 1.5px solid #000;
            padding-bottom: 3px;
            margin: 14px 0 8px;
        }

        /* ── Info grids ── */
        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }
        .info-grid td {
            padding: 3px 6px;
            vertical-align: top;
            font-size: 8.5pt;
        }
        .info-grid .label {
            color: #555;
            width: 120px;
            white-space: nowrap;
        }
        .info-grid .value {
            font-weight: 600;
            color: #000;
        }

        /* ── Financial summary boxes ── */
        .fin-grid {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
        }
        .fin-grid td {
            border: 1px solid #000;
            padding: 7px 10px;
            width: 25%;
            vertical-align: top;
        }
        .fin-label {
            font-size: 7.5pt;
            color: #555;
            margin-bottom: 2px;
        }
        .fin-value {
            font-size: 11pt;
            font-weight: 700;
            color: #000;
        }
        .fin-sub {
            font-size: 7pt;
            color: #666;
            margin-top: 1px;
        }

        /* ── Progress bar ── */
        .progress-wrap {
            border: 1px solid #000;
            height: 8px;
            width: 100%;
            margin: 6px 0 2px;
            background: #fff;
        }
        .progress-bar {
            background: #000;
            height: 8px;
        }
        .progress-label {
            font-size: 7.5pt;
            color: #444;
            text-align: right;
            margin-top: 2px;
        }

        /* ── Schedule table ── */
        .schedule-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
            font-size: 8pt;
        }
        .schedule-table thead tr {
            background: #000;
            color: #fff;
        }
        .schedule-table thead th {
            padding: 7px 8px;
            text-align: left;
            font-size: 7.5pt;
            font-weight: 700;
            border: 1px solid #000;
        }
        .schedule-table tbody tr:nth-child(even) {
            background: #f5f5f5;
        }
        .schedule-table tbody td {
            padding: 6px 8px;
            border: 1px solid #ccc;
            vertical-align: top;
        }

        /* ── Status badges ── */
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 2px;
            font-size: 7pt;
            font-weight: 700;
            border: 1px solid #000;
            background: #fff;
            color: #000;
        }
        .badge-paid {
            background: #000;
            color: #fff;
            border: 1px solid #000;
        }
        .badge-partial {
            background: #666;
            color: #fff;
            border: 1px solid #666;
        }
        .badge-overdue {
            background: #fff;
            color: #000;
            border: 1.5px solid #000;
            font-style: italic;
        }
        .badge-pending {
            background: #fff;
            color: #555;
            border: 1px solid #999;
        }

        /* ── Left border indicators ── */
        tr.row-paid    > td:first-child { border-left: 4px solid #000; }
        tr.row-partial > td:first-child { border-left: 4px solid #555; }
        tr.row-overdue > td:first-child { border-left: 4px solid #000; font-style: italic; }
        tr.next-row > td { background: #ebebeb !important; }

        /* ── History sub-table ── */
        .history-wrap {
            background: #fafafa;
            border: 1px solid #ccc;
            padding: 5px 8px;
            margin-top: 0;
        }
        .history-title {
            font-size: 7pt;
            font-weight: 700;
            color: #000;
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
            color: #444;
            font-weight: 700;
            padding: 2px 5px;
            border-bottom: 1px solid #bbb;
            background: #eee;
        }
        .history-table td {
            padding: 3px 5px;
            color: #000;
            border-bottom: 1px dashed #ddd;
        }
        .history-table tr:last-child td {
            border-bottom: none;
        }
        .history-amount {
            font-weight: 700;
        }

        /* ── Totals row ── */
        .totals-row td {
            background: #000 !important;
            color: #fff !important;
            font-weight: 700;
            font-size: 8.5pt;
            padding: 7px 8px;
            border: 1px solid #000;
        }

        /* ── Footer ── */
        .footer {
            margin-top: 20px;
            border-top: 1px solid #000;
            padding-top: 8px;
            font-size: 7.5pt;
            color: #555;
            text-align: center;
        }

        /* ── Signature area ── */
        .signature-grid {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }
        .signature-grid td {
            width: 33%;
            padding: 0 16px;
            text-align: center;
            vertical-align: bottom;
            font-size: 8pt;
        }
        .signature-line {
            border-top: 1px solid #000;
            padding-top: 4px;
            margin-top: 30px;
        }
        .signature-label {
            font-size: 7.5pt;
            color: #444;
        }
    </style>
</head>
<body>

{{-- ══════════ HEADER ══════════ --}}
<div class="header">
    <div class="header-meta">
        Generated: {{ $generatedAt }}<br>
        Order #<strong>{{ $order->order_number }}</strong>
    </div>
    <h1>Payment Schedule</h1>
    <div class="sub">{{ $order->branch->name ?? 'N/A' }} &mdash; Installment Order</div>
    <div style="clear:both;"></div>
</div>

<div style="padding: 0 2px;">

{{-- ══════════ ORDER INFO ══════════ --}}
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
            @if($order->is_voided)         VOIDED
            @elseif($order->is_defaulted)  DEFAULTED
            @elseif($order->is_completed)  COMPLETED
            @elseif($order->is_accelerated) ACCELERATED
            @else                          ACTIVE
            @endif
        </td>
    </tr>
</table>

{{-- ══════════ ITEMS ══════════ --}}
<div class="section-title">Items</div>
<table class="schedule-table">
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
            <td style="text-align:right;">&#8369;{{ number_format($item->sale_amount, 2) }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- ══════════ FINANCIAL SUMMARY ══════════ --}}
<div class="section-title">Financial Summary</div>
<table class="fin-grid">
    <tr>
        <td>
            <div class="fin-label">Loan Contract Price</div>
            <div class="fin-value">&#8369;{{ number_format($order->loan_contract_price, 2) }}</div>
            <div class="fin-sub">+{{ $order->lcp_markup_rate }}% markup</div>
        </td>
        <td>
            <div class="fin-label">Down Payment</div>
            <div class="fin-value">&#8369;{{ number_format($order->down_payment, 2) }}</div>
            @if($order->payment_method)
            <div class="fin-sub">via {{ $order->payment_method }}</div>
            @endif
        </td>
        <td>
            <div class="fin-label">Total PNV</div>
            <div class="fin-value">&#8369;{{ number_format($finalPnv, 2) }}</div>
            <div class="fin-sub">+{{ $order->promisory_note_value_interest }}% markup</div>
        </td>
        <td>
            <div class="fin-label">Remaining Balance</div>
            <div class="fin-value">&#8369;{{ number_format($remainingBalance, 2) }}</div>
            <div class="fin-sub">{{ $progress }}% paid</div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="fin-label">Total Paid</div>
            <div class="fin-value">&#8369;{{ number_format($totalPaid, 2) }}</div>
        </td>
        <td>
            <div class="fin-label">Total Rebate</div>
            <div class="fin-value">&#8369;{{ number_format($order->total_rebate_amount, 2) }}</div>
        </td>
        <td>
            <div class="fin-label">Advanced Payment</div>
            <div class="fin-value">&#8369;{{ number_format($order->total_advanced_payment, 2) }}</div>
        </td>
        @if($order->is_accelerated)
        <td>
            <div class="fin-label">Acceleration Discount</div>
            <div class="fin-value">&#8369;{{ number_format($order->acceleration_discount, 2) }}</div>
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
    &#8369;{{ number_format($totalPaid, 2) }} of &#8369;{{ number_format($finalPnv, 2) }} paid
    &mdash; {{ $progress }}% complete
</div>

{{-- ══════════ PAYMENT SCHEDULE ══════════ --}}
<div class="section-title" style="margin-top: 14px;">Payment Schedule &amp; History</div>

@php
    $today = now();
    $nextPayment = $order->installment_order_payments
        ->sortBy('installment_number')
        ->first(fn($p) => !in_array($p->status, ['paid', 'completed']));
@endphp

<table class="schedule-table">
    <thead>
        <tr>
            <th style="width:4%;">#</th>
            <th style="width:13%;">Due Date</th>
            <th style="width:13%;">Amount Due</th>
            <th style="width:13%;">Paid</th>
            <th style="width:13%;">Remaining</th>
            <th style="width:10%;">Rebate</th>
            <th style="width:13%;">Payment Date</th>
            <th style="width:10%;">Status</th>
        </tr>
    </thead>
    <tbody>
    @foreach($order->installment_order_payments->sortBy('installment_number') as $payment)
        @php
            $isPaid     = in_array($payment->status, ['paid', 'completed']);
            $isNext     = $nextPayment && $nextPayment->id === $payment->id;
            $amountPaid = (float)($payment->amount_paid ?? 0);
            $amountDue  = (float)$payment->amount_due - (float)$payment->rebate_amount;
            $remaining  = $order->is_accelerated ? 0 : max(0, $amountDue - $amountPaid);
            $isOverdue  = !$isPaid && $today->gt($payment->due_date);
            $histories  = $payment->installment_order_payment_history ?? collect();

            $rowClass = $isPaid ? 'row-paid'
                      : ($payment->status === 'partial' ? 'row-partial'
                      : ($isOverdue ? 'row-overdue' : ''));
        @endphp

        {{-- Main installment row --}}
        <tr class="{{ $rowClass }}{{ $isNext ? ' next-row' : '' }}">
            <td><strong>#{{ $payment->installment_number }}</strong></td>
            <td>{{ \Carbon\Carbon::parse($payment->due_date)->format('M d, Y') }}</td>
            <td>&#8369;{{ number_format($amountDue, 2) }}</td>
            <td>{{ $amountPaid > 0 ? '₱'.number_format($amountPaid, 2) : '—' }}</td>
            <td>{{ $remaining > 0 ? '₱'.number_format($remaining, 2) : '—' }}</td>
            <td>{{ $payment->rebate_amount > 0 ? '₱'.number_format($payment->rebate_amount, 2) : '—' }}</td>
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
            <td colspan="8" style="padding: 0 8px 8px 20px; background: #fafafa; border: 1px solid #ccc;">
                <div class="history-wrap">
                    <div class="history-title">
                        Payment Transactions ({{ $histories->count() }})
                    </div>
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
                                <td class="history-amount">&#8369;{{ number_format($h->amount, 2) }}</td>
                                <td style="text-transform: capitalize;">
                                    {{ str_replace('_', ' ', $h->payment_method) }}
                                </td>
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

</div>{{-- /padding --}}

{{-- ══════════ FOOTER ══════════ --}}
<div class="footer">
    Generated on {{ $generatedAt }} &mdash; {{ $order->branch->name ?? '' }}
    &mdash; Order #{{ $order->order_number }}<br>
    This is a system-generated document and does not require a signature.
</div>

</body>
</html>