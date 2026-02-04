<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\MedicineCatalog;
use App\Models\Admission;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'notifications' => $request->user() && $request->user()->role === 'Admin' 
            ? $this->getAdminNotifications() 
            : [],
        ];
    }
    private function getAdminNotifications()
    {
        $alerts = [];
        $staff = \App\Models\Staff::find(auth()->id());
        $dismissedData = $staff->dismissed_notifications ?? [];
        $activeDismissedIds = [];

        // Filter: Only keep IDs where the timer is still in the future
        foreach ($dismissedData as $id => $expiry) {
            try {
                // Check if $expiry looks like a date string
                // This prevents the "stock_9" parsing error
                if (is_string($expiry) && strtotime($expiry)) {
                    if (now()->lessThan(\Illuminate\Support\Carbon::parse($expiry))) {
                        $activeDismissedIds[] = $id;
                    }
                } else {
                    // If it's the old format (just an ID), we can treat it as 
                    // "dismissed forever" or just ignore it. 
                    // Let's ignore old data to let the 12-hour logic take over.
                    continue; 
                }
            } catch (\Exception $e) {
                continue; // Skip any malformed data
            }
        }

        // 1. Inventory Alerts
        $criticalMedicines = MedicineCatalog::withSum('batches', 'current_quantity')
            ->get()
            ->filter(fn($m) => $m->batches_sum_current_quantity <= $m->reorder_point);

        foreach ($criticalMedicines as $med) {
            $notifId = "stock_{$med->id}";
            
            // FIX: Check against $activeDismissedIds
            if (!in_array($notifId, $activeDismissedIds)) {
                $alerts[] = [
                    'id' => $notifId,
                    'group' => 'Today',
                    'title' => 'Low Stock Warning',
                    'description' => "{$med->generic_name} is low ({$med->batches_sum_current_quantity}/{$med->reorder_point})",
                    'buttonText' => 'MANAGE',
                    'link' => route('inventory.index'),
                ];
            }
        }

        // 2. Billing Alert Logic
        $unpaidBills = Admission::where('status', 'DISCHARGED')
            ->whereHas('billing', fn($q) => $q->where('payment_status', 'UNPAID'))
            ->with('patient')->get();

        foreach ($unpaidBills as $bill) {
            $notifId = "bill_{$bill->id}";
            
            // FIX: Check against $activeDismissedIds
            if (!in_array($notifId, $activeDismissedIds)) {
                $alerts[] = [
                    'id' => $notifId,
                    'group' => 'Yesterday',
                    'title' => 'Unpaid Bill',
                    'description' => "{$bill->patient->first_name} {$bill->patient->last_name} has an unpaid balance.",
                    'buttonText' => 'VIEW',
                    'link' => route('admin.patients'),
                ];
            }
        }

        return $alerts;
    }
}
