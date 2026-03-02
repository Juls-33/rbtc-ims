<?php

namespace App\Http\Controllers;

use App\Models\Archive;
use Illuminate\Http\Request;
use App\Models\PatientLog;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ArchiveController extends Controller
{
    public function index(Request $request)
    {
        $query = Archive::with('archiver');

        // 1. Server-side Search
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                // Search in the JSON 'data' column and 'reason'
                $q->where('data->first_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('data->last_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('data->generic_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('reason', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('archivable_type', 'LIKE', "%{$searchTerm}%");
            });
        }

        // 2. Paginate and Transform
        $archives = $query->latest('archived_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function($item) {
                $data = $item->data;
                $displayName = 'Unknown Record';
                
                if (str_contains($item->archivable_type, 'Patient')) {
                    $displayName = ($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '');
                } elseif (str_contains($item->archivable_type, 'Medicine')) {
                    $displayName = $data['generic_name'] ?? $data['name'] ?? 'Medicine Record';
                }

                return [
                    'id'            => $item->id,
                    'type'          => str_replace('App\\Models\\', '', $item->archivable_type),
                    'display_name'  => $displayName,
                    'original_id'   => $item->archivable_id,
                    'reason'        => $item->reason,
                    'archived_by'   => $item->archiver ? "{$item->archiver->first_name} {$item->archiver->last_name}" : 'System',
                    'archived_at'   => $item->archived_at->format('M d, Y | h:i A'),
                    'days_left'     => (int)now()->diffInDays($item->scheduled_deletion_at, false),
                ];
            });

        return Inertia::render('Admin/ArchiveManagement', [
            'archives' => $archives,
            'filters'  => $request->only(['search'])
        ]);
    }

    public function restore($id)
    {
        return DB::transaction(function () use ($id) {
            $archive = Archive::findOrFail($id);
            $modelClass = $archive->archivable_type;
            
            // Re-instantiate the model from data
            $instance = new $modelClass();
            $instance->fill($archive->data);
            
            if (isset($archive->archivable_id)) {
                $instance->id = $archive->archivable_id;
            }
            
            $instance->save();

            // Log the restoration for accountability
            if (str_contains($modelClass, 'Patient')) {
                PatientLog::create([
                    'staff_id'    => auth()->id(),
                    'patient_id'  => $instance->id, // Link to the newly restored ID
                    'action'      => 'RESTORED',
                    'description' => "Patient record for {$instance->full_name} ({$instance->patient_id}) was restored from the Archive Bin.",
                    'ip_address'  => request()->ip(),
                ]);
            }

            $archive->delete();

            return redirect()->back()->with('success', "Record successfully restored to the system.");
        });
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $archive = Archive::findOrFail($id);
            $modelClass = $archive->archivable_type;
            $data = $archive->data;

            if (str_contains($modelClass, 'Patient')) {
                $displayName = ($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '');
                $patientId = 'P-' . str_pad($archive->archivable_id, 5, '0', STR_PAD_LEFT);

                PatientLog::create([
                    'staff_id'    => auth()->id(),
                    'patient_id'  => null, // Record is gone, FK must be null
                    'action'      => 'PERMANENT_DELETE',
                    'description' => "ARCHIVE PURGE: Patient {$displayName} ({$patientId}) has been permanently wiped from system history.",
                    'ip_address'  => request()->ip(),
                ]);
            }

            // Permanent deletion
            $archive->delete();

            return redirect()->back()->with('success', "Record permanently purged from the database.");
        });
    }
}