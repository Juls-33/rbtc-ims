<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2E4696; padding-bottom: 10px; }
        .section-title { background: #f4f4f4; padding: 5px; font-weight: bold; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .total-box { margin-top: 20px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Reality-Based Therapeutic Community</h2>
        <p>Inpatient Clinical Statement</p>
    </div>

    <p><strong>Patient:</strong> {{ $admission->patient->full_name }} ({{ $admission->patient->patient_id }})</p>
    <p><strong>Period:</strong> {{ $admission->admission_date }} to {{ $admission->discharge_date ?? 'Present' }}</p>

    @foreach($statements as $stmt)
    <div class="section-title">Statement Period: {{ $stmt['period'] }}</div>
        <table class="items-table">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-center">Quantity / Days</th>
                <th class="text-right">Unit Price</th> 
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($stmt['room_details'] as $room)
                <tr>
                    <td>{{ $room['description'] }}</td>
                    <td class="text-center">{{ $room['days'] }} Day(s)</td>
                    <td class="text-right">Php {{ number_format($room['unit_price'], 2) }}</td>
                    <td class="text-right">Php {{ number_format($room['subtotal'], 2) }}</td>
                </tr>
            @endforeach

            @foreach($stmt['items'] as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">Php {{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">Php {{ number_format($item->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" class="text-right"><strong>Cycle Total:</strong></td>
                <td class="text-right"><strong>Php {{ number_format($stmt['grand_total'], 2) }}</strong></td>
            </tr>
        </tfoot>
    </table>
    @endforeach

    <div class="total-box">
        <h3>Grand Total: Php {{ number_format($admission->live_total, 2) }}</h3>
        <p>Amount Paid: Php {{ number_format($admission->amount_paid, 2) }}</p>
        <h2 style="color: #d9534f;">Balance Due: Php {{ number_format($admission->live_balance, 2) }}</h2>
    </div>
</body>
</html>