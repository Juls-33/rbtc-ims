<html>
<head>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2E4696; padding-bottom: 10px; margin-bottom: 20px;}
        .section-title { background: #f4f4f4; padding: 8px; font-weight: bold; margin-top: 20px; border-radius: 4px;}
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total-box { margin-top: 30px; text-align: right; border-top: 2px solid #333; padding-top: 15px;}
        .admin-info { margin-top: 40px; font-size: 10px; color: #666; padding-top: 10px; border-top: 1px dashed #ddd; }
        .status-paid { color: #28a745; font-weight: bold; float: right; }
        .status-unpaid { color: #d9534f; font-weight: bold; float: right; }
    </style>
</head>
<body>
    <div class="header">
        <h2 style="margin-bottom: 5px; color: #2E4696;">Reality-Based Therapeutic Community</h2>
        <p style="margin-top: 0; font-size: 14px; font-weight: bold; color: #555;">Inpatient Clinical Statement</p>
    </div>

    <table style="border: none; margin-top: 0;">
        <tr>
            <td style="border: none; padding: 0;">
                <p><strong>Patient:</strong> {{ $admission->patient->full_name }} ({{ $admission->patient->patient_id }})</p>
                <p><strong>Period:</strong> {{ \Carbon\Carbon::parse($admission->admission_date)->format('M d, Y') }} to {{ $admission->discharge_date ? \Carbon\Carbon::parse($admission->discharge_date)->format('M d, Y') : 'Present' }}</p>
            </td>
            <td style="border: none; padding: 0; text-align: right;">
                <p><strong>Admission Status:</strong> <span style="color: {{ $admission->status === 'Admitted' ? '#2E4696' : '#666' }}">{{ strtoupper($admission->status) }}</span></p>
                <p><strong>Account Status:</strong> <span class="{{ $admission->balance > 0 ? 'status-unpaid' : 'status-paid' }}" style="float: none;">{{ $admission->balance > 0 ? 'UNPAID' : 'FULLY SETTLED' }}</span></p>
            </td>
        </tr>
    </table>

    @foreach($statements as $stmt)
    <div class="section-title">
        Statement Period: {{ $stmt['period'] }}
        <span class="{{ $stmt['status'] === 'PAID' ? 'status-paid' : 'status-unpaid' }}">{{ $stmt['status'] }}</span>
    </div>
    
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
           @if($stmt['room_total'] > 0)
                <tr>
                    <td>Room / Facility Fee (Monthly Rate)</td>
                    <td class="text-center">1 Month</td>
                    <td class="text-right">Php {{ number_format($stmt['room_total'], 2) }}</td>
                    <td class="text-right">Php {{ number_format($stmt['room_total'], 2) }}</td>
                </tr>
            @endif

            @foreach($stmt['items'] as $item)
                <tr>
                    <td>{{ $item->description ?? 'Medical Supply' }}</td>
                    <td class="text-center">{{ $item->quantity }}</td>
                    <td class="text-right">Php {{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">Php {{ number_format($item->total_price, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3" class="text-right">Cycle Total:</td>
                <td class="text-right">Php {{ number_format($stmt['grand_total'], 2) }}</td>
            </tr>
            <tr>
                <td colspan="3" class="text-right">Amount Paid:</td>
                <td class="text-right">Php {{ number_format($stmt['amount_paid'], 2) }}</td>
            </tr>
            <tr>
                <td colspan="3" class="text-right"><strong>Cycle Balance Due:</strong></td>
                <td class="text-right"><strong style="color: {{ $stmt['balance'] > 0 ? '#d9534f' : '#333' }};">Php {{ number_format($stmt['balance'], 2) }}</strong></td>
            </tr>
        </tfoot>
    </table>
    @endforeach

    <div class="total-box">
        <h3 style="margin-bottom: 5px;">Grand Total: Php {{  number_format($totalBill, 2) }}</h3>
        <p style="margin-top: 0; color: #555;">Total Amount Paid: Php {{ number_format($totalPaid, 2) }}</p>
        <h2 style="color: {{ $totalBalance > 0 ? '#d9534f' : '#28a745' }}; margin-top: 10px;">
            Final Balance Due: Php {{ number_format($totalBalance, 2) }}
        </h2>
    </div>

    <div class="admin-info">
        <table style="border: none; width: 100%; margin: 0;">
            <tr>
                <td style="border: none; padding: 0;">
                    <strong>Generated By:</strong> {{ $admin_name }}
                </td>
                <td style="border: none; paddinfg: 0; text-align: right;">
                    <strong>Date & Time:</strong> {{ $date }}
                </td>
            </tr>
        </table>
        <p style="text-align: center; margin-top: 15px; font-size: 9px; opacity: 0.7;">
            This is a system-generated document. Reality-Based Therapeutic Community Inc.
        </p>
    </div>
</body>
</html>