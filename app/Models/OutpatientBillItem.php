<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OutpatientBillItem extends Model
{
    use HasFactory;

    // Define the table name if it's not the plural of the model
    protected $table = 'outpatient_bill_items';

    protected $fillable = [
        'visit_id',
        'medicine_id',
        'batch_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    /**
     * Relationship: The visit this item belongs to.
     */
    public function visit()
    {
        return $this->belongsTo(PatientVisit::class, 'visit_id');
    }

    public function medicine()
    {
        return $this->belongsTo(MedicineCatalog::class, 'medicine_id');
    }

    public function batch()
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id'); // Ensure this matches your batch model name
    }
    protected static function booted()
    {
        // Every time an item is Added, Updated, or Deleted:
        $syncTotals = function ($item) {
            $visit = $item->visit; // Assumes relationship: public function visit() { return $this->belongsTo(PatientVisit::class); }
            if ($visit) {
                // 1. Calculate Sum of Medicines
                $medsTotal = $visit->bill_items()->sum('total_price');
                
                // 2. Grand Total = Fee + Meds
                $grandTotal = (float)$visit->checkup_fee + (float)$medsTotal;
                
                // 3. New Balance = Grand Total - What they already paid
                $newBalance = max(0, $grandTotal - (float)$visit->amount_paid);

                $visit->update([
                    'total_bill' => $grandTotal,
                    'balance'    => $newBalance
                ]);
            }
        };

        static::saved($syncTotals);
        static::deleted($syncTotals);
    }
}