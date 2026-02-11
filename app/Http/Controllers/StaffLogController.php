<?php

namespace App\Http\Controllers;

use App\Models\StaffLog; // Assuming your model name
use Inertia\Inertia;
use Illuminate\Http\Request;

class StaffLogController extends Controller
{
    public function index()
    {
        // Fetch logs with the staff relationship, ordered by newest first
        $logs = StaffLog::with('staff:id,first_name,last_name,staff_id')
            ->latest()
            ->get()
            ->map(function($log) {
                return [
                    'id'          => $log->id,
                    'performed_by'=> $log->staff 
                                     ? "{$log->staff->first_name} {$log->staff->last_name} ({$log->staff->staff_id})" 
                                     : 'System',
                    'action'      => strtoupper($log->action),
                    'description' => $log->description,
                    'ip_address'  => $log->ip_address,
                    // Respecting your Asia/Manila requirement
                    'created_at'  => $log->created_at->format('M d, Y | h:i A'), 
                ];
            });

        return Inertia::render('Admin/Partials/StaffLogs', [
            'logs' => $logs
        ]);
    }
}