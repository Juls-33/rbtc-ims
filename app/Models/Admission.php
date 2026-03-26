<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Admission extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id', 'staff_id', 'room_id', 'diagnosis', 'status', 'admission_date', 'discharge_date', 'amount_paid'
    ];

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

    /**
     * Relationship used for outpatient/general billing
     */
    public function billing(): HasOne
    {
        return $this->hasOne(BillDetail::class, 'admission_id');
    }

    public function roomStays()
    {
        return $this->hasMany(RoomStay::class);
    }

    public function billItems()
    {
        return $this->hasMany(InpatientBillItem::class);
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
        $baseDate = Carbon::parse($this->admission_date);
        $anchorDay = $baseDate->day; // e.g., 30
        $endPoint = $this->discharge_date ? Carbon::parse($this->discharge_date) : now();
        
        $statements = [];
        $i = 0;

        while (true) {
            // 1. Calculate THIS period's start
            $targetStart = $baseDate->copy()->addMonthsNoOverflow($i);
            $periodStart = ($anchorDay > $targetStart->daysInMonth) 
                ? $targetStart->endOfMonth()->startOfDay() 
                : $targetStart->day($anchorDay)->startOfDay();

            // Break if the calculated start is past our discharge/current date
            if ($i > 0 && $periodStart->gte($endPoint)) break;

            // 2. Calculate NEXT period's start to define current period's end
            // This is the "Anchor" logic: Feb 28 becomes the start so Jan ends on the 27th
            $targetNext = $baseDate->copy()->addMonthsNoOverflow($i + 1);
            $nextCycleStart = ($anchorDay > $targetNext->daysInMonth) 
                ? $targetNext->endOfMonth()->startOfDay() 
                : $targetNext->day($anchorDay)->startOfDay();

            // Period ends 1 second before the next cycle starts
            $periodEnd = $nextCycleStart->copy()->subSecond();
            $clampedEnd = $periodEnd->gt($endPoint) ? $endPoint : $periodEnd;

            $roomTotal = 0;
            $roomDetails = [];

            // --- Room Stay Calculation ---
            foreach ($this->roomStays as $stay) {
                $stayStart = Carbon::parse($stay->start_date);
                $stayEnd = $stay->end_date ? Carbon::parse($stay->end_date) : now();

                $overlapStart = $stayStart->max($periodStart);
                $overlapEnd = $stayEnd->min($periodEnd);

                if ($overlapStart->lt($overlapEnd)) {
                    $days = (int) ceil($overlapStart->floatDiffInDays($overlapEnd));
                    $days = max(1, $days); 
                    $subtotal = ($days * $stay->daily_rate);
                    $roomTotal += $subtotal;

                    $roomDetails[] = [
                        'description' => "Room: " . ($stay->room->room_location ?? 'N/A'),
                        'days' => $days,
                        'unit_price' => (float)$stay->daily_rate,
                        'subtotal' => (float)$subtotal
                    ];
                }
            }

            // --- Billing Items Filtering ---
            $items = $this->billItems->filter(function($item) use ($periodStart, $periodEnd) {
                return $item->created_at >= $periodStart && $item->created_at <= $periodEnd;
            })->values();

            $itemsTotal = (float)$items->sum('total_price');
            $grandTotal = round($roomTotal + $itemsTotal, 2);

            $statements[] = [
                'index' => $i + 1,
                'bill_id' => "STMT-" . $this->id . "-" . ($i + 1),
                'period' => $periodStart->format('M d, Y') . ' - ' . $clampedEnd->format('M d, Y'),
                'room_total' => (float)$roomTotal,
                'room_details' => $roomDetails,
                'items_total' => $itemsTotal,
                'grand_total' => (float)$grandTotal,
                'items' => $items,
                'status' => $this->amount_paid >= $grandTotal ? 'PAID' : 'UNPAID',
            ];

            $i++;
            
            // Safety break to prevent infinite loops in development
            if ($i > 100) break; 
        }

        return $statements;
    }

    public function getStatementsAttribute()
    {
        return $this->getStatements();
    }

    public function getLiveTotalAttribute()
    {
        return $this->calculateRoomCharges() + $this->billItems->sum('total_price');
    }

    public function getLiveBalanceAttribute()
    {
        return max(0, $this->live_total - $this->amount_paid);
    }

    public function syncLiveTotals()
    {
        $roomTotal = $this->calculateRoomCharges();
        $itemsTotal = (int) $this->billItems()->sum('total_price');
        $grandTotal = $roomTotal + $itemsTotal;
        $newBalance = max(0, $grandTotal - (float)$this->amount_paid);

        // 1. Physically update the database
        // $this->updateQuietly([
        //     'total_bill' => $grandTotal,
        //     'balance'    => $newBalance
        // ]);
        \Illuminate\Support\Facades\DB::table('admissions')
        ->where('id', $this->id)
        ->update([
            'total_bill' => $grandTotal,
            'balance'    => $newBalance,
            'updated_at' => now(),
        ]);

        $this->total_bill = $grandTotal;
        $this->balance = $newBalance;
    }
}