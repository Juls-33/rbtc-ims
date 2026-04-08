<?php

namespace App\Http\Controllers;

use App\Models\InpatientBillItem;
use App\Models\BillDetail;
use App\Models\Admission;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class InpatientBillController extends Controller
{
    /**
     * 1. ADD MEDICINE TO SPECIFIC MONTH
     * Logic: Targets the specific bill_id selected in the React Modal.
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'bill_id'      => 'required|exists:bill_details,id',
            'medicine_id'  => 'nullable|exists:medicine_catalog,id',
            'batch_id'     => 'nullable|exists:medicine_batches,id',
            'description'  => 'required|string',
            'quantity'     => 'required|integer|min:1',
            'unit_price'   => 'required|numeric|min:0',
            'total_price'  => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            if ($request->filled('batch_id')) {
                $batch = MedicineBatch::lockForUpdate()->findOrFail($request->batch_id);
                if ($batch->current_quantity < $request->quantity) {
                    return redirect()->back()->with('error', 'Insufficient stock for ' . $request->description);
                }
                $batch->decrement('current_quantity', $request->quantity);
            }
            InpatientBillItem::create($validated);

            $bill = BillDetail::findOrFail($request->bill_id);
            $bill->increment('total_amount', $validated['total_price']);

            $admission = Admission::findOrFail($request->admission_id);
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', "Item added to Month #{$bill->month_number} statement.");
        });
    }

    /**
     * 2. UPDATE MEDICINE QUANTITY
     */
    public function updateItem(Request $request, $id)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        return DB::transaction(function () use ($request, $id) {
            $item = InpatientBillItem::findOrFail($id);
            $bill = BillDetail::findOrFail($item->bill_id);
            $batch = MedicineBatch::lockForUpdate()->findOrFail($item->batch_id);
            
            $diff = $request->quantity - $item->quantity;
            $priceDiff = $diff * $item->unit_price;

            if ($diff > 0 && $batch->current_quantity < $diff) {
                return redirect()->back()->with('error', 'Insufficient stock.');
            }

            $batch->decrement('current_quantity', $diff);
            
            $item->update([
                'quantity' => $request->quantity,
                'total_price' => $request->quantity * $item->unit_price
            ]);

            // Adjust the specific monthly total
            $bill->increment('total_amount', $priceDiff);

            $this->syncAdmissionTotals($item->admission_id);
            return redirect()->back()->with('success', 'Monthly statement updated.');
        });
    }

    /**
     * 3. REMOVE MEDICINE
     */
    public function removeItem($id)
    {
        return DB::transaction(function () use ($id) {
            $item = InpatientBillItem::findOrFail($id);
            $admissionId = $item->admission_id;
            $bill = BillDetail::find($item->bill_id);

            if ($bill) {
                $bill->decrement('total_amount', $item->total_price);
            }

            $batch = MedicineBatch::find($item->batch_id);
            if ($batch) {
                $batch->increment('current_quantity', $item->quantity);
            }

            $item->delete();
            $this->syncAdmissionTotals($admissionId);
            return redirect()->back()->with('success', 'Item removed from monthly bill.');
        });
    }

    /**
     * 4. PROCESS PAYMENT FOR SPECIFIC STATEMENT
     */
    public function pay(Request $request)
    {
        $request->validate([
            'bill_id'     => 'required|exists:bill_details,id',
            'amount_paid' => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($request) {
            $bill = BillDetail::findOrFail($request->bill_id);
            $admission = Admission::findOrFail($bill->admission_id);
            
            // 1. Update the specific bill row
            $newPaid = (float)$bill->amount_paid + (float)$request->amount_paid;
            
            $status = 'PARTIAL';
            if ($newPaid >= (float)$bill->total_amount) {
                $status = 'PAID';
            }

            $bill->update([
                'amount_paid' => $newPaid,
                'payment_status' => $status,
            ]);

            // 2. Increment the global paid amount on the Admission record
            $admission->increment('amount_paid', $request->amount_paid);

            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', "Payment of ₱" . number_format($request->amount_paid, 2) . " processed for Month #{$bill->month_number}.");
        });
    }

    private function syncAdmissionTotals($id)
    {
        Admission::findOrFail($id)->syncLiveTotals();
    }
    public function generatePDF($id)
    {
        $admission = Admission::with(['patient', 'room', 'billItems.medicine'])->findOrFail($id);

        $data = [
            'title' => 'Inpatient Discharge Statement',
            'date' => now()->format('M d, Y'),
            'admission' => $admission,
            'patient' => $admission->patient,
            'statements' => $admission->statements,
        ];
        $pdf = Pdf::loadView('inpatient_invoice', $data);

        return $pdf->stream("Discharge_Statement_ADM-{$admission->id}.pdf");
    }
}