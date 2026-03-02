<?php

namespace App\Http\Controllers;

use App\Models\StaffLog; // Assuming your model name
use Inertia\Inertia;
use Illuminate\Http\Request;

class StaffLogController extends Controller
{
    public function index(Request $request)
    {
        $query = StaffLog::with('staff:id,first_name,last_name,staff_id');

        // 1. Server-side Search Logic
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('action', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('ip_address', 'LIKE', "%{$searchTerm}%")
                  // Search within the related Staff model
                  ->orWhereHas('staff', function($sq) use ($searchTerm) {
                      $sq->where('first_name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('last_name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('staff_id', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        // 2. Fetch Paginated Results (using Laravel Paginator)
        $logs = $query->latest()
            ->paginate(15)
            ->withQueryString() 
            ->through(function($log) {
    
                return [
                    'id'           => $log->id,
                    'performed_by' => $log->staff 
                                      ? "{$log->staff->first_name} {$log->staff->last_name} ({$log->staff->staff_id})" 
                                      : 'System',
                    'action'       => strtoupper($log->action),
                    'description'  => $log->description,
                    'ip_address'   => $log->ip_address,
                    'created_at'   => $log->created_at->format('M d, Y | h:i A'), 
                ];
            });

        return Inertia::render('Admin/Partials/StaffLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search'])
        ]);
    }
}