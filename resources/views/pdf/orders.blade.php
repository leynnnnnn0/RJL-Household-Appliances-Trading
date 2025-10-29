<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orders Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 8px;
            color: #1a1a1a;
            padding: 15px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #000000;
        }
        
        .header h1 {
            font-size: 16px;
            color: #000000;
            margin-bottom: 3px;
        }
        
        .header p {
            font-size: 8px;
            color: #4a4a4a;
        }
        
        .info-bar {
            background: #f1f1f1;
            padding: 6px 10px;
            margin-bottom: 10px;
            font-size: 8px;
            border-left: 3px solid #000000;
        }
        
        .info-bar strong {
            color: #000000;
        }
        
        .summary {
            background: #f1f1f1;
            padding: 8px 10px;
            margin-bottom: 12px;
            border-left: 3px solid #000000;
            overflow: hidden;
        }
        
        .summary-item {
            display: inline-block;
            width: 48%;
            vertical-align: top;
        }
        
        .summary-label {
            font-size: 7px;
            color: #000000;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .summary-value {
            font-size: 14px;
            font-weight: bold;
            color: #000000;
            margin-top: 2px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 7px;
        }
        
        thead {
            background: #000000;
            color: white;
        }
        
        th {
            padding: 5px 4px;
            text-align: left;
            font-weight: 600;
            font-size: 7px;
            text-transform: uppercase;
            border: 1px solid #1c1c1c;
        }
        
        td {
            padding: 4px;
            border: 1px solid #1f1f1f;
            vertical-align: top;
            background: white;
        }
        
        tbody tr:nth-child(even) {
            background: #cccccc;
        }
        
        .order-header-row {
            background: #cccccc !important;
            font-weight: 600;
            color: #000000;
        }
        
        .order-header-row td {
            padding: 5px 4px;
            border: 1px solid #000000;
            font-size: 8px;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .font-bold {
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .text-muted {
            color: #000000;
            font-size: 6.5px;
            display: block;
            margin-top: 1px;
        }
        
        .footer {
            margin-top: 15px;
            padding-top: 8px;
            border-top: 1px solid #1f1f1f;
            text-align: center;
            color: #000000;
            font-size: 7px;
        }
        
        .no-orders {
            text-align: center;
            padding: 30px;
            color: #000000;
            font-size: 10px;
        }
        
        .currency {
            font-family: 'DejaVu Sans', sans-serif;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Orders Report</h1>
        <p>Generated on {{ $generatedAt }}</p>
    </div>

    <div class="info-bar">
        <strong>Report Period:</strong> 
        {{ \Carbon\Carbon::parse($dateFrom)->format('M d, Y') }} - 
        {{ \Carbon\Carbon::parse($dateTo)->format('M d, Y') }}
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="summary-label">Total Orders</div>
            <div class="summary-value">{{ $totalOrders }}</div>
        </div>
        <div class="summary-item" style="text-align: right;">
            <div class="summary-label">Total Amount</div>
            <div class="summary-value currency">₱{{ number_format($totalAmount, 2) }}</div>
        </div>
    </div>

    @if($orders->count() > 0)
    <table>
        <thead>
            <tr>
                <th style="width: 10%;">Order #</th>
                <th style="width: 9%;">Date</th>
                <th style="width: 12%;">Employee</th>
                <th style="width: 10%;">Location</th>
                <th style="width: 16%;">Item</th>
                <th style="width: 9%;">Model</th>
                <th style="width: 10%;">Serial</th>
                <th style="width: 6%;">SRP</th>
                <th style="width: 10%;">Supplier</th>
                <th style="width: 8%;" class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($orders as $order)
                @foreach($order->order_items as $index => $orderItem)
                    @if($index === 0)
                    <tr class="order-header-row">
                        <td rowspan="{{ $order->order_items->count() }}">
                            <strong>{{ $order->order_number }}</strong>
                        </td>
                        <td rowspan="{{ $order->order_items->count() }}">
                            {{ \Carbon\Carbon::parse($order->transaction_date)->format('M d, Y') }}
                            <span class="text-muted">{{ \Carbon\Carbon::parse($order->transaction_date)->format('h:i A') }}</span>
                        </td>
                        <td rowspan="{{ $order->order_items->count() }}">
                            {{ $order->employee->full_name ?? ($order->employee->first_name . ' ' . $order->employee->last_name) ?? 'N/A' }}
                        </td>
                        <td rowspan="{{ $order->order_items->count() }}">
                            {{ $order->location->name ?? 'N/A' }}
                        </td>
                        <td>
                            <span class="font-bold">{{ $orderItem->item->description ?? 'N/A' }}</span>
                            <span class="text-muted">{{ $orderItem->item->item_type ?? '' }}</span>
                        </td>
                        <td>{{ $orderItem->item->model ?? '-' }}</td>
                        <td>{{ $orderItem->serial ?? '-' }}</td>
                        <td class="text-center">{{ $orderItem->item->srp }}</td>
                        <td>{{ $orderItem->item->supplier ?? 'N/A' }}</td>
                        <td class="text-right font-bold currency">{{ number_format($orderItem->sale_amount, 2) }}</td>
                    </tr>
                    @else
                    <tr>
                        <td>
                            <span class="font-bold">{{ $orderItem->item->description ?? 'N/A' }}</span>
                            <span class="text-muted">{{ $orderItem->item->item_type ?? '' }}</span>
                        </td>
                        <td>{{ $orderItem->item->model ?? '-' }}</td>
                        <td>{{ $orderItem->serial ?? '-' }}</td>
                        <td class="text-center">{{ $orderItem->item->srp }}</td>
                        <td>{{ $orderItem->item->supplier ?? 'N/A' }}</td>
                        <td class="text-right font-bold currency">{{ number_format($orderItem->sale_amount, 2) }}</td>
                    </tr>
                    @endif
                @endforeach
                <tr style="background: white;">
                    <td colspan="9" class="text-right font-bold" style="background: #ffffff; border-top: 2px solid #cccccc;">Order Total:</td>
                    <td class="text-right font-bold currency" style="background: #ffffff; border-top: 2px solid #cccccc; font-size: 8px;">{{ number_format($order->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <div class="no-orders">
        <p>No orders found for the selected filters.</p>
    </div>
    @endif

    <div class="footer">
        <p>This report is generated by RJL Household Appliances Trading System. No signature required.</p>
    </div>
</body>
</html>