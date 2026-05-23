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
        // Capture the state flags coming from the frontend form payload
        $isOutside = !empty($request->is_outside_purchase) && $request->is_outside_purchase == true;
        
        // An entry is miscellaneous if medicine_id is null/blank, meaning it's a custom text entry
        $isMisc = empty($request->medicine_id);

        $validated = $request->validate([   
            'admission_id'        => 'required|exists:admissions,id',
            'bill_id'             => 'required|exists:bill_details,id',
            
            // FIXED: Conditional validation setup. Only require exist checks if they are filled!
            'medicine_id'         => 'nullable|exists:medicine_catalog,id',
            'batch_id'            => 'nullable|exists:medicine_batches,id',
            
            'description'         => 'required|string|max:255',
            'quantity'            => 'required|integer|min:1',
            'unit_price'          => 'required|numeric|min:0',
            'total_price'         => 'required|numeric|min:0',
            'is_outside_purchase' => 'nullable|boolean',
        ]);

        // Format properties if flagged as a custom free-form text item or bought offsite
        if ($isOutside) {
            $validated['unit_price'] = 0;
            $validated['total_price'] = 0;
            $validated['medicine_id'] = null;
            $validated['batch_id'] = null;

            if (!str_contains($validated['description'], '(Outside Purchase)')) {
                $validated['description'] .= ' (Outside Purchase)';
            }
        } elseif ($isMisc) {
            // If it's a pure misc item (like "hello"), explicitly enforce null for structural keys
            $validated['medicine_id'] = null;
            $validated['batch_id'] = null;
            $validated['total_price'] = $validated['unit_price'] * $validated['quantity'];
        } else {
            $validated['total_price'] = $validated['unit_price'] * $validated['quantity'];
        }

        try {
            return DB::transaction(function () use ($validated, $isOutside, $isMisc) {
                // Deduct stock ONLY if it is a real medicine and NOT a misc text entry/outside purchase
                if (!$isOutside && !$isMisc && !empty($validated['batch_id'])) {
                    $batch = MedicineBatch::lockForUpdate()->findOrFail($validated['batch_id']);
                    
                    if ($batch->current_quantity < $validated['quantity']) {
                        throw new \Exception('Insufficient stock available for ' . $validated['description']);
                    }
                    
                    $batch->decrement('current_quantity', $validated['quantity']);
                }

                // Save the row smoothly
                InpatientBillItem::create($validated);

                // Synchronize accounting ledger values
                $bill = BillDetail::findOrFail($validated['bill_id']);
                $bill->increment('total_amount', $validated['total_price']);

                $admission = Admission::findOrFail($validated['admission_id']);
                $admission->syncLiveTotals();

                return redirect()->back()->with('success', "Item registered successfully.");
            });

        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
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
            'payment_source' => 'required|string|max:50',
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
                'payment_source' => $request->payment_source,
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

        // Filter statements to only show PAST and CURRENT months (ignores future placeholders)
        $statements = collect($admission->statements)
            ->filter(function ($stmt) {
                $periodStart = \Carbon\Carbon::parse($stmt['period_start']);

                // Include if past/current
                if ($periodStart->isPast() || $periodStart->isCurrentMonth()) {
                    return true;
                }

                // Include future ONLY if paid
                return $stmt['status'] === 'PAID';
            })
            ->values();


        $totalBill = $statements->sum('grand_total');
        $totalPaid = $statements->sum('amount_paid');
        $totalBalance = $statements->sum('balance');
        // Get the current logged-in user generating the receipt
        $adminName = auth()->check() ? auth()->user()->first_name . ' ' . auth()->user()->last_name : 'System Admin';

        $data = [
            'title'        => 'Inpatient Discharge Statement',
            'date'         => now()->format('F d, Y h:i A'),
            'admin_name'   => $adminName,
            'admission'    => $admission,
            'patient'      => $admission->patient,
            'statements'   => $statements,
            'totalBill'    => $totalBill,
            'totalPaid'    => $totalPaid,
            'totalBalance' => $totalBalance,
        ];
        
        $pdf = Pdf::loadView('inpatient_invoice', $data);

        return $pdf->stream("Discharge_Statement_ADM-{$admission->id}.pdf");
    }
}