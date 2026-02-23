<?php

namespace App\Http\Controllers;

use App\Models\InpatientBillItem;
use App\Models\Admission;
use App\Models\MedicineBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InpatientBillController extends Controller
{
    // 1. ADD MEDICINE
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'medicine_id'  => 'required|exists:medicine_catalog,id',
            'batch_id'     => 'required|exists:medicine_batches,id',
            'description'  => 'required|string',
            'quantity'     => 'required|integer|min:1',
            'unit_price'   => 'required|numeric',
            'total_price'  => 'required|numeric',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $batch = MedicineBatch::lockForUpdate()->findOrFail($request->batch_id);
            if ($batch->current_quantity < $request->quantity) {
                return redirect()->back()->with('error', 'Insufficient stock.');
            }

            InpatientBillItem::create($validated);
            $batch->decrement('current_quantity', $request->quantity);
            
            $this->syncAdmissionTotals($request->admission_id);
            return redirect()->back()->with('success', 'Medicine added to inpatient bill.');
        });
    }

    // 2. UPDATE MEDICINE (The Inventory Delta Logic)
    public function updateItem(Request $request, $id)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        return DB::transaction(function () use ($request, $id) {
            $item = InpatientBillItem::findOrFail($id);
            $batch = MedicineBatch::lockForUpdate()->findOrFail($item->batch_id);
            
            $diff = $request->quantity - $item->quantity; // positive = needs more, negative = returning

            if ($diff > 0 && $batch->current_quantity < $diff) {
                return redirect()->back()->with('error', 'Insufficient stock to increase quantity.');
            }

            $batch->decrement('current_quantity', $diff); // Handles both increase/decrease automatically
            
            $item->update([
                'quantity' => $request->quantity,
                'total_price' => $request->quantity * $item->unit_price
            ]);

            $this->syncAdmissionTotals($item->admission_id);
            return redirect()->back()->with('success', 'Bill item updated.');
        });
    }

    // 3. REMOVE MEDICINE (Full Restock)
    public function removeItem($id)
    {
        return DB::transaction(function () use ($id) {
            $item = InpatientBillItem::findOrFail($id);
            $admissionId = $item->admission_id;
            
            $batch = MedicineBatch::find($item->batch_id);
            if ($batch) {
                $batch->increment('current_quantity', $item->quantity);
            }

            $item->delete();
            $this->syncAdmissionTotals($admissionId);
            return redirect()->back()->with('success', 'Item removed and stock returned.');
        });
    }

    private function syncAdmissionTotals($id)
    {
        $admission = Admission::findOrFail($id);
        // This is the ONLY place that should perform the math and save it to the DB columns
        $admission->syncLiveTotals();
    }
    public function pay(Request $request)
    {
        $request->validate([
            'admission_id' => 'required|exists:admissions,id',
            'amount_paid' => 'required|numeric|min:0.01',
            'statement_id' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $admission = Admission::findOrFail($request->admission_id);
            
            // 1. Update the amount_paid column first
            $newPaidTotal = round((float)$admission->amount_paid + (float)$request->amount_paid, 2);
            
            // 2. Update the record
            $admission->update([
                'amount_paid' => $newPaidTotal,
            ]);

            $admission->refresh();
            $admission->syncLiveTotals();

            return redirect()->back()->with('success', 'Payment of ₱' . number_format($request->amount_paid, 2) . ' recorded.');
        });
    }
}