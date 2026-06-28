<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transaction Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.6;
            padding: 30px;
            background-color: #ffffff;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #333;
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .header p {
            font-size: 12px;
            color: #666;
        }
        
        .info-section {
            margin-bottom: 25px;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        .info-row {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            font-size: 11px;
            display: inline-block;
            width: 150px;
        }
        
        .info-value {
            font-size: 11px;
            display: inline-block;
        }
        
        .summary-section {
            margin-bottom: 30px;
            background-color: #f0f4f8;
            padding: 10px;
            border-radius: 8px;
            border: 2px solid #e1e8ed;
        }
        
        .summary-row {
            margin-bottom: 5px;
            overflow: hidden;
        }
        
        .summary-cell {
            float: left;
            width: 33.33%;
            padding: 5px;
        }
        
        .summary-label {
            font-weight: bold;
            font-size: 10px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .summary-value {
            font-size: 16px;
            font-weight: bold;
            color: #333;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            background-color: white;
        }
        
        table thead {
            background-color: #2c3e50;
            color: white;
        }
        
        table th {
            padding: 12px 10px;
            text-align: left;
            font-size: 10px;
            font-weight: bold;
            border: 1px solid #34495e;
        }
        
        table td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 9px;
        }
        
        table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .voided {
            color: #dc3545;
            font-weight: bold;
        }
        
        .mop-section {
            margin-top: 30px;
            page-break-inside: avoid;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
        }
        
        .mop-table {
            width: 50%;
            margin-left: auto;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #d1ecf1 !important;
            font-size: 11px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            font-size: 9px;
            color: #666;
        }
        
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>TRANSACTION REPORT</h1>
        <p>Comprehensive Transaction Summary</p>
    </div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Date Range:</span>
            <span class="info-value">{{ $fromDate }} to {{ $toDate }}</span>
        </div>
        @if($employeeName)
        <div class="info-row">
            <span class="info-label">Employee:</span>
            <span class="info-value">{{ $employeeName }}</span>
        </div>
        @endif
        <div class="info-row">
            <span class="info-label">Generated:</span>
            <span class="info-value">{{ $generatedAt }}</span>
        </div>
    </div>

    <div class="summary-section">
        <h3 style="margin-bottom: 15px; font-size: 14px; color: #2c3e50;">Collection Summary</h3>
        <div class="summary-row clearfix">
            <div class="summary-cell">
                <div class="summary-label">Monthly Installment</div>
                <div class="summary-value">PHP {{ number_format($miCollection, 2) }}</div>
            </div>
            <div class="summary-cell">
                <div class="summary-label">Down Payment</div>
                <div class="summary-value">PHP {{ number_format($dpCollection, 2) }}</div>
            </div>
            <div class="summary-cell">
                <div class="summary-label">Cash Orders</div>
                <div class="summary-value">PHP {{ number_format($cashCollection, 2) }}</div>
            </div>
        </div>
        <div class="summary-row clearfix">
            <div class="summary-cell">
                <div class="summary-label">Total Cash on Hand</div>
                <div class="summary-value">PHP {{ number_format($totalCashOnHand, 2) }}</div>
            </div>
            <div class="summary-cell">
                <div class="summary-label">Other Payment Methods</div>
                <div class="summary-value">PHP {{ number_format($totalOtherMop, 2) }}</div>
            </div>
            <div class="summary-cell">
                <div class="summary-label">Expenses</div>
                <div class="summary-value" style="color: #dc3545;">PHP {{ number_format($expenses, 2) }}</div>
            </div>
        </div>
        <div class="summary-row clearfix">
            <div class="summary-cell">
                <div class="summary-label">Gross Collection</div>
                <div class="summary-value" style="color: #28a745; font-size: 18px;">PHP {{ number_format($netCollection, 2) }}</div>
            </div>
            <div class="summary-cell">
                <div class="summary-label">Net After Expenses</div>
                <div class="summary-value" style="color: #111827; font-size: 18px;">PHP {{ number_format($netAfterExpenses, 2) }}</div>
            </div>
        </div>
    </div>

    <h3 style="margin-bottom: 15px; font-size: 14px; color: #2c3e50;">Transaction Details</h3>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Receipt #</th>
                <th>Customer</th>
                <th class="text-right">M.I.</th>
                <th class="text-right">D.P.</th>
                <th class="text-right">Amount</th>
                <th>Payment Method</th>
                <th>Reference #</th>
                <th>Employee</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse($allTransactions as $transaction)
            <tr>
                <td>{{ $transaction['date'] }}</td>
                <td>
                    {{ $transaction['receipt_number'] }}
                    @if($transaction['is_voided'])
                        <span class="voided">(VOIDED)</span>
                    @endif
                </td>
                <td>{{ $transaction['customer'] }}</td>
                <td class="text-right">
                    {{ $transaction['m_i'] ? 'PHP ' . number_format($transaction['m_i'], 2) : '-' }}
                </td>
                <td class="text-right">
                    {{ $transaction['d_p'] ? 'PHP ' . number_format($transaction['d_p'], 2) : '-' }}
                </td>
                <td class="text-right">
                    {{ $transaction['amount_paid'] ? 'PHP ' . number_format($transaction['amount_paid'], 2) : '-' }}
                </td>
                <td style="text-transform: capitalize;">{{ $transaction['payment_method'] }}</td>
                <td>{{ $transaction['reference_number'] ?? '-' }}</td>
                <td>{{ $transaction['employee_name'] }}</td>
                <td style="font-size: 8px;">{{ Str::limit($transaction['remarks'], 40) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" class="text-center">No transactions found</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="mop-section">
        <h3 style="margin-bottom: 15px; font-size: 14px; color: #2c3e50;">Payment Method Breakdown</h3>
        <table class="mop-table">
            <thead>
                <tr>
                    <th>Payment Method</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($mops as $method => $amount)
                <tr>
                    <td style="text-transform: capitalize;">{{ $method }}</td>
                    <td class="text-right">PHP {{ number_format($amount, 2) }}</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td>TOTAL</td>
                    <td class="text-right">PHP {{ number_format($mops->sum(), 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>This is a RJL System generated document. No signature required.</p>
        <p>Page generated on {{ $generatedAt }}</p>
    </div>
</body>
</html>
