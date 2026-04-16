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
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('data->>first_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('data->>last_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('data->>name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('data->>generic_name', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('reason', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('archivable_type', 'LIKE', "%{$searchTerm}%")
                  ->orWhere('archived_at', 'LIKE', "%{$searchTerm}%") // Search Date
                  ->orWhereHas('archiver', function($archiverQuery) use ($searchTerm) { // Search Staff Name
                      $archiverQuery->where('first_name', 'LIKE', "%{$searchTerm}%")
                                    ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('archivable_type', 'App\\Models\\' . $request->type);
        }
        

        // 2. Paginate and Transform
       $archives = $query->latest('archived_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function($item) {
                $data = $item->data;
                $exactType = str_replace('App\\Models\\', '', $item->archivable_type);
                $displayName = ' ';
                
                // --- NEW: DYNAMIC PATIENT LOOKUP ---
                // If the archived JSON data contains a patient_id, fetch the patient (even if soft-deleted)
                $patientName = null;
                if (isset($data['patient_id'])) {
                    $patient = \App\Models\Patient::withTrashed()->find($data['patient_id']);
                    if ($patient) {
                        $patientName = trim("{$patient->first_name} {$patient->last_name}");
                    }
                }
                
                // Apply the display name based on the type
                if ($exactType === 'Patient') {
                    // For patients, their name is directly in the root of the data
                    $displayName = ($data['first_name'] ?? '') . ' ' . ($data['last_name'] ?? '');
                } 
                elseif ($exactType === 'PatientVisit') {
                    // Use the dynamically found name, fallback to JSON name (if injected), fallback to ID
                    $name = $patientName ?: trim(($data['patient_first_name'] ?? '') . ' ' . ($data['patient_last_name'] ?? ''));
                    $displayName = $name ? "{$name} (Visit)" : "Visit #{$item->archivable_id}";
                } 
                elseif ($exactType === 'Admission') {
                    // Use the dynamically found name, fallback to ID
                    $displayName = $patientName ? "{$patientName} (Admission)" : "Admission #{$item->archivable_id}";
                } 
                elseif (str_contains($exactType, 'Medicine')) {
                    $displayName = $data['name'] ?? $data['generic_name'] ?? 'Medicine Record';
                } 
                else {
                    // Fallback for any other random types (like Rooms)
                    $displayName = isset($data['id']) ? "{$exactType} #{$data['id']}" : 'System Record';
                }

                return [
                    'id'            => $item->id,
                    'type'          => $exactType,
                    'display_name'  => trim($displayName) ?: 'Unknown Record',
                    'original_id'   => $item->archivable_id,
                    'reason'        => $item->reason,
                    'archived_by'   => $item->archiver ? "{$item->archiver->first_name} {$item->archiver->last_name}" : 'System',
                    'archived_at'   => $item->archived_at ? $item->archived_at->format('M d, Y | h:i A') : 'N/A',
                    'days_left'     => $item->scheduled_deletion_at ? (int)now()->diffInDays($item->scheduled_deletion_at, false) : 0,
                ];
            });

        return Inertia::render('Admin/ArchiveManagement', [
            'archives' => $archives,
            'filters'  => $request->only(['search', 'type'])
        ]);
    }

    public function restore($id)
    {
        return DB::transaction(function () use ($id) {
            $archive = Archive::findOrFail($id);
            $modelClass = $archive->archivable_type;
            $originalId = $archive->archivable_id;

            // 1. FIND OR RECREATE THE RECORD
            // We use withTrashed() to find the soft-deleted row in the medicine_catalog
            $instance = $modelClass::withTrashed()->find($originalId);

            if (!$instance) {
                $instance = new $modelClass();
                $instance->fill($archive->data);
                $instance->id = $originalId;
                // We save it first if it was somehow hard-deleted/missing
                $instance->save(); 
            }

            // 2. TRIGGER THE RESTORE (Clears the deleted_at timestamp)
            $instance->restore(); 

            // 3. LOGGING FOR PATIENTS (Your existing logic)
            if (str_contains($modelClass, 'Patient')) {
                PatientLog::create([
                    'staff_id'    => auth()->id(),
                    'patient_id'  => $instance->id,
                    'action'      => 'RESTORED',
                    'description' => "Patient record for {$instance->first_name} {$instance->last_name} ({$instance->patient_id}) was restored from the Archive Bin.",
                    'ip_address'  => request()->ip(),
                ]);
            }
            
            // 4. LOGGING FOR MEDICINES (New explicit logic)
            if (str_contains($modelClass, 'Medicine')) {
                \App\Models\StaffLog::create([
                    'staff_id'    => auth()->id(),
                    'action'      => 'RESTORED MEDICINE',
                    'description' => "Medicine '{$instance->name}' was restored to the active inventory catalog.",
                    'ip_address'  => request()->ip(),
                ]);
            }

            // 5. CLEANUP
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