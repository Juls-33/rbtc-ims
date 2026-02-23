<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InpatientBillItem extends Model
{
    use HasFactory;

    protected $table = 'inpatient_bill_items';

    protected $fillable = [
        'admission_id',
        'medicine_id',
        'batch_id',
        'description',
        'quantity',
        'unit_price',
        'total_price',
    ];

    public function admission()
    {
        return $this->belongsTo(Admission::class);
    }

    public function medicine()
    {
        return $this->belongsTo(MedicineCatalog::class, 'medicine_id');
    }

    public function batch()
    {
        return $this->belongsTo(MedicineBatch::class, 'batch_id');
    }
}