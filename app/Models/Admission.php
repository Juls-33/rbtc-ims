<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;


class Admission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'staff_id',
        'room_id',
        'diagnosis',
        'admission_date',
        'discharge_date',
        'monthly_rate', 
        'status',
        'amount_paid',
        'total_bill',
        'balance',
    ];

    protected $appends = ['is_billing_locked'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function bills(): HasMany
    {
        return $this->hasMany(BillDetail::class, 'admission_id')->orderBy('month_number', 'asc');
    }

    /**
     * Requirement: Link to the "active" or latest bill.
     */
    public function billing(): HasOne
    {
        return $this->hasOne(BillDetail::class, 'admission_id')->latestOfMany();
    }
    

    public function roomStays()
    {
        return $this->hasMany(RoomStay::class);
    }

    public function billItems()
    {
        return $this->hasMany(InpatientBillItem::class);
    }

    public function generateMonthlyBills()
    {
        $start = Carbon::parse($this->admission_date);
        $now = now();
        $monthsPassed = (int) ceil($start->floatDiffInMonths($now));
        $totalMonthsToManage = max(6, $monthsPassed);

        for ($i = 1; $i <= $totalMonthsToManage; $i++) {
            $periodStart = $start->copy()->addMonths($i - 1);
            $periodEnd = $start->copy()->addMonths($i)->subSecond();

            $bill = $this->bills()->where('month_number', $i)->first();

            if ($bill) {
                // ONLY update if UNPAID
                if ($bill->payment_status === 'UNPAID') {
                    // Calculate current medicines for this specific month
                    $itemsSum = $this->billItems()->where('bill_id', $bill->id)->sum('total_price');
                    
                    $bill->update([
                        'facility_fee' => (float)$this->monthly_rate,
                        // IMPORTANT: total_amount MUST be fee + medicines
                        'total_amount' => (float)$this->monthly_rate + (float)$itemsSum,
                    ]);
                }
            } else {
                // Create new bill
                $this->bills()->create([
                    'month_number'   => $i,
                    'facility_fee'   => $this->monthly_rate,
                    'total_amount'   => $this->monthly_rate,
                    'payment_status' => 'UNPAID',
                    'date_issued'    => $periodStart,
                    'period_start'   => $periodStart,
                    'period_end'     => $periodEnd,
                ]);
            }
        }
    }

    public function getActiveBill()
    {
        $this->syncLiveTotals(); // This will trigger generateMonthlyBills if needed
        
        return $this->bills()
            ->where('period_start', '<=', now())
            ->where('period_end', '>=', now())
            ->first() ?? $this->bills()->latest('month_number')->first();
    }

    protected static function booted()
    {
        static::saved(function ($admission) {
            $admission->syncLiveTotals();
        });
    }

    public function calculateRoomCharges()
    {
        $total = 0;
        $stays = $this->roomStays()->get(); 

        foreach ($stays as $stay) {
            $start = Carbon::parse($stay->start_date);
            $end = $stay->end_date 
                ? Carbon::parse($stay->end_date) 
                : ($this->discharge_date ? Carbon::parse($this->discharge_date) : now());

            // Use floatDiffInDays to get exact duration, then ceil to charge the full next day
            $days = (int) ceil($start->floatDiffInDays($end));
            
            // Minimum 1 day charge
            $days = max(1, $days); 
            
            // Force math to stay within whole numbers to prevent decimal creep
            $total += ($days * (int)$stay->daily_rate);
        }
        return (int) $total; 
    }

    /**
     * Version used by the ViewBillModal and Accessor
     */
    // app/Models/Admission.php

    public function getStatements()
    {
        return $this->bills()
            ->orderBy('month_number', 'asc')
            ->get()
            ->map(function($bill) {
                // Now we can actually find meds for THIS specific month
                $items = $this->billItems()->where('bill_id', $bill->id)->get();
                $itemsTotal = $items->sum('total_price');

                return [
                    'id'           => $bill->id,
                    'index'        => $bill->month_number,
                    'period'       => \Carbon\Carbon::parse($bill->period_start)->format('M d, Y') . 
                                    ' - ' . 
                                    \Carbon\Carbon::parse($bill->period_end)->format('M d, Y'),
                    'period_start' => $bill->period_start,
                    'room_total'   => (float)$bill->facility_fee,
                    'items_total'  => (float)$itemsTotal,
                    'grand_total'  => (float)($bill->facility_fee + $itemsTotal),
                    'amount_paid'  => (float)$bill->amount_paid,
                    'balance'      => (float)($bill->total_amount - $bill->amount_paid),
                    'status'       => $bill->payment_status,
                    'items'        => $items,
                ];
            });
    }
    public function getStatementsAttribute()
    {
        return $this->bills()
            ->orderBy('month_number', 'asc')
            ->get()
            ->map(function($bill) {
                // Load medicines for this specific statement
                $items = $this->billItems()->where('bill_id', $bill->id)->get();
                $itemsTotal = $items->sum('total_price');

                // The "Truth" of the totals
                $grandTotal = (float)($bill->facility_fee + $itemsTotal);
                $paid = (float)$bill->amount_paid;
                $balance = max(0, $grandTotal - $paid);

                return [
                    'id'           => $bill->id,
                    'index'        => $bill->month_number,
                    'period'       => Carbon::parse($bill->period_start)->format('M d, Y') . 
                                    ' - ' . 
                                    Carbon::parse($bill->period_end)->format('M d, Y'),
                    'period_start' => $bill->period_start,
                    'room_total'   => (float)$bill->facility_fee,
                    'items_total'  => (float)$itemsTotal,
                    'grand_total'  => $grandTotal,
                    'amount_paid'  => $paid,
                    'balance'      => $balance,
                    'status'       => $bill->payment_status,
                    'items'        => $items,
                ];
            });
    }
    public function getLiveTotalAttribute()
    {
        return $this->calculateRoomCharges() + $this->billItems->sum('total_price');
    }

    public function getLiveBalanceAttribute()
    {
        return max(0, $this->live_total - $this->amount_paid);
    }

    public function getIsBillingLockedAttribute()
    {
        $hasItems = $this->billItems()->exists();
        $hasPayments = $this->bills()->where('amount_paid', '>', 0)->exists();

        return $hasItems || $hasPayments;
    }

    public function syncLiveTotals()
    {
        $facilityTotal = (float) $this->bills()->sum('facility_fee');
        $itemsTotal = (float) $this->billItems()->sum('total_price');

        $grandTotal = $facilityTotal + $itemsTotal;
        $newBalance = max(0, $grandTotal - (float)$this->amount_paid);
        DB::table('admissions')
            ->where('id', $this->id)
            ->update([
                'total_bill' => $grandTotal,
                'balance'    => $newBalance,
                'updated_at' => now(),
            ]);

        $this->total_bill = $grandTotal;
        $this->balance = $newBalance;
    }
    public function archive($reason, $staffId)
    {
        $data = $this->toArray();
        $data['subject_name'] = $this->patient?->full_name ?? 'Unknown Patient';
        $data['patient_id_display'] = $this->patient?->patient_id;

        return \DB::table('archives')->insert([
            'archivable_type' => get_class($this),
            'archivable_id'   => $this->id,
            'data'            => json_encode($data),
            'reason'          => $reason,
            'archived_by'     => $staffId,
            'archived_at'     => now(),
            'scheduled_deletion_at' => now()->addYears(5), 
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);
    }
    
}