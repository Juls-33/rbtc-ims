<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Outpatient Bill - {{ $visit->visit_id }}</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; line-height: 1.5; font-size: 12px; }
        .header { text-align: center; border-bottom: 2px solid #3D52A0; padding-bottom: 10px; margin-bottom: 20px; }
        .org-name { font-size: 18px; font-weight: bold; color: #3D52A0; text-transform: uppercase; margin: 0; }
        .doc-type { font-size: 14px; color: #666; margin: 5px 0; }
        
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { padding: 3px 0; }
        
        .bill-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .bill-table th { background: #f8fafc; border-bottom: 2px solid #e2e8f0; padding: 10px; text-align: left; text-transform: uppercase; font-size: 10px; color: #64748b; }
        .bill-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
        
        .totals { width: 40%; margin-left: 60%; }
        .totals-table { width: 100%; border-collapse: collapse; }
        .totals-table td { padding: 5px; text-align: right; }
        .grand-total { border-top: 2px solid #3D52A0; font-weight: bold; font-size: 14px; color: #3D52A0; }
        
        .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="org-name">Reality-Based Therapeutic Community</h1>
        <p class="doc-type">Outpatient Billing Statement</p>
    </div>

    <table class="info-table">
        <tr>
            <td width="15%"><strong>Patient:</strong></td>
            <td width="35%">{{ $visit->patient->full_name }}</td>
            <td width="15%"><strong>Ref No:</strong></td>
            <td width="35%">{{ $visit->visit_id }}</td>
        </tr>
        <tr>
            <td><strong>Date:</strong></td>
            <td>{{ \Carbon\Carbon::parse($visit->visit_date)->format('M d, Y') }}</td>
            <td><strong>Doctor:</strong></td>
            <td>Dr. {{ $visit->staff->last_name ?? 'N/A' }}</td>
        </tr>
    </table>

    <table class="bill-table">
        <thead>
            <tr>
                <th>Description</th>
                <th width="10%">Qty</th>
                <th width="20%" style="text-align: right;">Unit Price</th>
                <th width="20%" style="text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Professional Consultation Fee</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">Php {{ number_format($visit->checkup_fee, 2) }}</td>
                <td style="text-align: right;">Php {{ number_format($visit->checkup_fee, 2) }}</td>
            </tr>
            @foreach($visit->bill_items as $item)
            <tr>
                <td>{{ $item->medicine->generic_name }} ({{ $item->medicine->brand_name }})</td>
                <td style="text-align: center;">{{ $item->quantity }}</td>
                <td style="text-align: right;">Php {{ number_format($item->unit_price, 2) }}</td>
                <td style="text-align: right;">Php {{ number_format($item->total_price, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="totals">
        <table class="totals-table">
            <tr>
                <td>Total Invoice:</td>
                <td>Php {{ number_format($visit->total_bill, 2) }}</td>
            </tr>
            <tr>
                <td>Amount Paid:</td>
                <td>Php {{ number_format($visit->amount_paid, 2) }}</td>
            </tr>
            <tr class="grand-total">
                <td>Balance Due:</td>
                <td>Php {{ number_format($visit->balance, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>This is a computer-generated document. Signature is not required.</p>
        <p>Generated on {{ date('M d, Y h:i A') }}</p>
    </div>
</body>
</html>