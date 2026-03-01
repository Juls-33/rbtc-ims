<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\MedicineCatalog;
use App\Models\Admission;
use App\Models\Staff; // Ensure Staff model is imported

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'role' => $request->user()->role, // Added role for unified profile logic
                    'must_change_password' => $request->user()->must_change_password,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
            ],
            'notifications' => $request->user() && $request->user()->role === 'Admin' 
                ? $this->getAdminNotifications() 
                : [],
        ];
    }

    private function getAdminNotifications()
    {
        $alerts = [];
        $staffUser = Staff::find(auth()->id());
        
        if (!$staffUser) return [];

        $dismissedData = $staffUser->dismissed_notifications ?? [];
        $activeDismissedIds = [];

        foreach ($dismissedData as $id => $expiry) {
            try {
                if (is_string($expiry) && strtotime($expiry)) {
                    if (now()->lessThan(\Illuminate\Support\Carbon::parse($expiry))) {
                        $activeDismissedIds[] = $id;
                    }
                }
            } catch (\Exception $e) {
                continue; 
            }
        }

        // 1. Inventory Alerts
        $criticalMedicines = MedicineCatalog::withSum('batches', 'current_quantity')
            ->get()
            ->filter(fn($m) => $m->batches_sum_current_quantity <= $m->reorder_point);

        foreach ($criticalMedicines as $med) {
            $notifId = "stock_{$med->id}";
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

        // 3. Password Reset Requests (The "Quick Reset" Logic)
        $requests = Staff::where('reset_requested', true)->get();

        foreach ($requests as $req) {
            $alerts[] = [
                'id' => "reset_{$req->id}",
                'group' => 'Security',
                'title' => 'Password Reset Request',
                'description' => "{$req->first_name} {$req->last_name} needs a password reset.",
                
                // 🔥 Added for the Reset Modal to know who it is dealing with
                'staff_db_id' => $req->id, 
                'staff_name' => "{$req->first_name} {$req->last_name}",
                'actionType' => 'QUICK_RESET', 
                
                'buttonText' => 'RESET NOW', // Prompt the admin to act immediately
                'link' => route('admin.staff'), 
            ];
        }

        return $alerts;
    }
}