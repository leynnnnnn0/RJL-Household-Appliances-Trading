<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Aging Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #111827; font-size: 10px; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        h2 { font-size: 13px; margin: 18px 0 8px; }
        .meta { color: #4b5563; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
        th, td { border: 1px solid #d1d5db; padding: 5px; vertical-align: top; }
        th { background: #84cc16; color: #111827; text-align: left; }
        .right { text-align: right; }
        .total-row td { background: #ffedd5; font-weight: bold; }
        .muted { color: #6b7280; }
    </style>
</head>
<body>
    <h1>Sales Aging Report</h1>
    <div class="meta">
        Month: {{ \Carbon\Carbon::createFromFormat('Y-m', $filters['month'])->format('F Y') }}
        &nbsp;|&nbsp; As of: {{ \Carbon\Carbon::parse($filters['as_of_date'])->format('F d, Y') }}
        &nbsp;|&nbsp; Generated: {{ $generatedAt }}
    </div>

    @foreach ($tables as $key => $table)
        <h2>{{ $bucketLabels[$key] }}</h2>
        <table>
            <thead>
                <tr>
                    <th>Name of Customer</th>
                    <th>Address</th>
                    <th>Model</th>
                    <th>Term</th>
                    <th>Date Released</th>
                    <th>Due Date</th>
                    <th class="right">MI</th>
                    <th class="right">PNV</th>
                    <th class="right">Remaining Balance</th>
                    <th class="right">Days Overdue</th>
                </tr>
            </thead>
            <tbody>
                @forelse ($table['rows'] as $row)
                    <tr>
                        <td>{{ $row['customer_name'] }}</td>
                        <td>{{ $row['address'] }}</td>
                        <td>{{ $row['model'] }}</td>
                        <td>{{ $row['term'] }}</td>
                        <td>{{ $row['date_released'] }}</td>
                        <td>{{ $row['due_date'] }}</td>
                        <td class="right">{{ number_format($row['monthly_installment'], 2) }}</td>
                        <td class="right">{{ number_format($row['pnv'], 2) }}</td>
                        <td class="right">{{ number_format($row['remaining_balance'], 2) }}</td>
                        <td class="right">{{ $row['days_overdue'] }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="10" class="muted">No accounts found for this aging bucket.</td>
                    </tr>
                @endforelse
                <tr class="total-row">
                    <td colspan="6">Total</td>
                    <td class="right">{{ number_format($table['total_due'], 2) }}</td>
                    <td></td>
                    <td class="right">{{ number_format($table['total_balance'], 2) }}</td>
                    <td class="right">{{ $table['total_accounts'] }} accounts</td>
                </tr>
            </tbody>
        </table>
    @endforeach
</body>
</html>
