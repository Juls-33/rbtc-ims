<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StaffController extends Controller
{
    /**
     * Display the personnel directory.
     */
    public function index()
    {
        $staff = Staff::orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($member) => [
                'id'         => $member->id,
                'staff_id'   => $member->staff_id,
                'name'       => "{$member->first_name} {$member->last_name}",
                'first_name' => $member->first_name,
                'last_name'  => $member->last_name,
                'role'       => $member->role,
                'email'      => $member->email,
                'phone'      => $member->contact_no,
                'gender'     => $member->gender,
                'status'     => strtoupper($member->status),
                'reset_requested'  => (bool) $member->reset_requested,
            ]);

        return Inertia::render('Admin/StaffManagement', [
            'staff' => $staff
        ]);
    }

    /**
     * Store a new staff member with auto-generated ID.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role'           => 'required|string|in:Doctor,Nurse,Admin',
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'email'          => 'required|email|unique:staff,email',
            'contact_number' => 'required|string|max:20',
            'gender'         => 'required|string',
            'address'        => 'required|string|max:500',
            'password'       => 'required|string|min:8',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $prefix = strtoupper(substr($validated['role'], 0, 1)); // D, N, or A
                $lastMember = Staff::where('role', $validated['role'])
                    ->orderBy('id', 'desc')
                    ->first();
                
                $nextNumber = $lastMember 
                    ? (int) substr($lastMember->staff_id, 2) + 1 
                    : 1;
                
                $staffId = $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

                Staff::create([
                    'staff_id'   => $staffId,
                    'first_name' => $validated['first_name'],
                    'last_name'  => $validated['last_name'],
                    'email'      => $validated['email'],
                    'role'       => $validated['role'],
                    'contact_no' => $validated['contact_number'],
                    'gender'     => $validated['gender'],
                    'address'    => $validated['address'],
                    'status'     => 'ACTIVE',
                    'password'   => Hash::make($validated['password']),
                    
                ]);
                $newStaff = Staff::create($validated);

                StaffLog::create([
                    'staff_id'    => auth()->id(),
                    'action'      => 'CREATED STAFF',
                    'description' => "Created account for {$newStaff->first_name} {$newStaff->last_name} with role {$newStaff->role}.",
                    'ip_address'  => $request->ip(),
                ]);

                return redirect()->back()->with('success', "New {$validated['role']} added as {$staffId}.");
            });

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to create staff member: ' . $e->getMessage()]);
        }
    }
    public function update(Request $request, Staff $staff)
    {
        $validated = $request->validate([
            'role'           => 'required|string|in:Doctor,Nurse,Admin',
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'email'          => 'required|email|unique:staff,email,' . $staff->id,
            'contact_number' => 'required|string|max:20',
            'gender'         => 'required|string',
        ]);

        $staff->update([
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'role'       => $validated['role'],
            'contact_no' => $validated['contact_number'],
            'gender'     => $validated['gender'],
        ]);
        $staff->update($validated);

        StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'UPDATED STAFF',
            'description' => "Modified details for {$staff->first_name} {$staff->last_name} ({$staff->staff_id}).",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Staff details updated.');
    }

    public function deactivate(Request $request, Staff $staff)
    {
        // Backend Guard: Prevent deactivation of default admin
        if ($staff->email === 'admin@rbtc.com') {
            return redirect()->back()->withErrors(['error' => 'The default admin account cannot be deactivated.']);
        }

        $newStatus = ($staff->status === 'ACTIVE') ? 'INACTIVE' : 'ACTIVE';
        $staff->update(['status' => $newStatus]);

        StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => $newStatus === 'ACTIVE' ? 'REACTIVATED STAFF' : 'DEACTIVATED STAFF',
            'description' => ($newStatus === 'ACTIVE' ? "Reactivated" : "Deactivated") . " account for {$staff->first_name} {$staff->last_name} ({$staff->staff_id}).",
            'ip_address'  => $request->ip(),
        ]); 
        return redirect()->back()->with('success', "Staff account is now {$newStatus}.");
    }
    public function destroy(Request $request, Staff $staff)
    {
        // Backend Guard: Prevent deletion of default admin
        if ($staff->email === 'admin@rbtc.com') {
            return redirect()->back()->withErrors(['error' => 'The default admin account cannot be deleted.']);
        }


        $staffName = "{$staff->first_name} {$staff->last_name}";
        $staffID   = $staff->staff_id;

        StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'DELETED STAFF',
            'description' => "Permanently removed staff record: {$staffName} ({$staffID}).",
            'ip_address'  => $request->ip(),
        ]);

        $staff->delete();

        return redirect()->back()->with('success', 'Staff account has been permanently removed.');
    }
    public function resetPassword(Request $request, Staff $staff)
    {
        $staff = Staff::findOrFail($id);
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $staff->update([
            'password' => Hash::make($validated['password']),
            'reset_requested' => false, // ADDED: Clear the flag once reset is successful
        ]);
        StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'PASSWORD RESET',
            'description' => "Manually reset password to default for {$staff->first_name} {$staff->last_name}.",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', "Password for {$staff->first_name} has been updated.");
    }
}