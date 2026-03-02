<?php
namespace App\Http\Controllers;

use App\Models\PatientLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientLogController extends Controller
{
    public function index(Request $request)
    {
        $query = PatientLog::with(['staff', 'patient']);

        // 1. Server-side Search
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('action', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('ip_address', 'LIKE', "%{$searchTerm}%")
                  ->orWhereHas('staff', function($sq) use ($searchTerm) {
                      $sq->where('first_name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        // 2. Fetch Paginated Results
        $logs = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($log) => [
                'id'           => $log->id,
                'timestamp'    => $log->created_at->format('M d, Y | h:i A'),
                'performed_by' => $log->staff ? "{$log->staff->first_name} {$log->staff->last_name}" : 'System',
                'action'       => strtoupper($log->action),
                'description'  => $log->description,
                'ip_address'   => $log->ip_address ?? 'N/A',
            ]);

        return Inertia::render('Admin/Partials/PatientLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search'])
        ]);
    }
}