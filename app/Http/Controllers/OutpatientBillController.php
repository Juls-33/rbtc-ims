<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MedicineBatch;
use App\Models\OutpatientBillItem;
use App\Models\PatientVisit;
use App\Models\StockLog;
use Illuminate\Support\Facades\DB;

class OutpatientBillController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'visit_id'    => 'required|exists:patient_visits,id',
            'amount_paid' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $staffId = auth()->id();
            $visit = PatientVisit::with('bill_items')->findOrFail($request->visit_id);

            // 1. Process Stock (Graceful Adjustment established previously)
            foreach ($visit->bill_items as $item) {
                $batch = \App\Models\MedicineBatch::lockForUpdate()->findOrFail($item->batch_id);
                $actualToDispense = min((int)$item->quantity, (int)$batch->current_quantity);

                if ($actualToDispense < (int)$item->quantity) {
                    $item->update([
                        'quantity' => $actualToDispense,
                        'total_price' => $actualToDispense * $item->unit_price
                    ]);
                }

                if ($actualToDispense > 0) {
                    $batch->decrement('current_quantity', $actualToDispense);
                    \App\Models\StockLog::create([
                        'medicine_id' => $item->medicine_id,
                        'batch_id'    => $item->batch_id,
                        'staff_id'    => $staffId,
                        'change_amount' => -$actualToDispense,
                        'reason'      => "DISPENSED: Bill #{$visit->id}",
                    ]);
                }
            }

            // 2. FINANCIAL SYNC
            // Recalculate based on potentially adjusted quantities
            $medicineTotal = $visit->bill_items()->sum('total_price');
            $grandTotal = (float)$visit->checkup_fee + (float)$medicineTotal;
            
            // INCREMENT: Current Paid + New Payment
            $newTotalPaid = (float)$visit->amount_paid + (float)$request->amount_paid;
            $finalBalance = max(0, $grandTotal - $newTotalPaid);

            $visit->update([
                'total_bill'  => $grandTotal,
                'amount_paid' => $newTotalPaid,
                'balance'     => $finalBalance,
                'status'      => $finalBalance <= 0 ? 'PAID' : 'PARTIALLY PAID',
            ]);

            return redirect()->back()->with('success', 'Transaction processed. Balance: ₱' . number_format($finalBalance, 2));
        });
    }
    public function addItem(Request $request) 
    {
        $validated = $request->validate([
            'visit_id'    => 'required|exists:patient_visits,id',
            'medicine_id' => 'required|exists:medicine_catalog,id',
            'batch_id'    => 'required|exists:medicine_batches,id',
            'quantity'    => 'required|integer|min:1',
            'unit_price'  => 'required|numeric',
            'total_price' => 'required|numeric',
        ]);

        $batch = \App\Models\MedicineBatch::findOrFail($request->batch_id);
        
        // Calculate how much of this batch is ALREADY on this specific bill
        $alreadyInBill = OutpatientBillItem::where('visit_id', $request->visit_id)
            ->where('batch_id', $request->batch_id)
            ->sum('quantity');

        if (($alreadyInBill + $request->quantity) > $batch->current_quantity) {
            return redirect()->back()->withErrors(['quantity' => 'Insufficient stock in this batch.']);
        }
        OutpatientBillItem::create($validated);
        $this->syncVisitTotals($request->visit_id);
        return redirect()->back();
    }

    public function updateItem(Request $request, $id) 
    {
        $validated = $request->validate([
            'quantity'    => 'required|integer|min:1',
            'total_price' => 'required|numeric',
        ]);

        $item = OutpatientBillItem::findOrFail($id);
        $item->update($validated);
        $this->syncVisitTotals($item->visit_id);
        
        return redirect()->back();
    }

    public function removeItem($id) 
    {
        \App\Models\OutpatientBillItem::findOrFail($id)->delete();
        $this->syncVisitTotals($visitId);
        return redirect()->back();
    }
    private function syncVisitTotals($visitId)
    {
        $visit = PatientVisit::with('bill_items')->findOrFail($visitId);

        $medicineSubtotal = $visit->bill_items->sum('total_price');

        $grandTotal = (float)$medicineSubtotal + (float)$visit->checkup_fee;

        $newBalance = max(0, $grandTotal - (float)$visit->amount_paid);

        $visit->update([
            'total_bill' => $grandTotal,
            'balance'    => $newBalance,
            'status'     => $newBalance <= 0 ? 'PAID' : ($visit->amount_paid > 0 ? 'PARTIALLY PAID' : 'UNPAID')
        ]);
    }
}