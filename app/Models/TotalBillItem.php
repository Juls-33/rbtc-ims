<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TotalBillItem extends Model
{
    protected $fillable = ['admission_id', 'description', 'quantity', 'unit_price', 'total_price', 'medicine_id', 'batch_id'];

}
