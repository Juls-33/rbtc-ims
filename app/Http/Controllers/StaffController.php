<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'role'           => 'required|string|in:Doctor,Nurse,Admin',
            'first_name'     => 'required|string|max:255',
            'last_name'      => 'required|string|max:255',
            'email'          => 'required|email|unique:staff,email',
            'contact_number' => 'required|string|max:20',
            'gender'         => 'required|string',
            'password'       => 'required|string|min:8',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                Staff::create([
                    'first_name' => $validated['first_name'],
                    'last_name'  => $validated['last_name'],
                    'email'      => $validated['email'],
                    'role'       => $validated['role'],
                    'contact_no' => $validated['contact_number'], // Mapping key
                    'gender'     => $validated['gender'],
                    'status'     => 'ACTIVE',
                    'password'   => Hash::make($validated['password']),
                ]);
            });

            return redirect()->back()->with('success', 'New staff member added successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Failed to create staff member: ' . $e->getMessage()]);
        }
    }
}