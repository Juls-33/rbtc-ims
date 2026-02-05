<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class RecoveryController extends Controller
{
    // For the Admin: Uses the .env Master Key
    public function recoverAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'recovery_key' => 'required',
        ]);

        if ($request->recovery_key === env('ADMIN_RECOVERY_KEY')) {
            $admin = Staff::where('email', $request->email)->where('role', 'Admin')->first();

            if ($admin) {
                auth()->login($admin);
                return redirect()->route('dashboard');
            }
        }

        return back()->withErrors(['recovery_key' => 'Invalid recovery key or email.']);
    }

    // For the Staff: Triggers the Admin Notification we built earlier
    public function requestReset(Request $request)
    {
        $staff = Staff::where('email', $request->email)->first();
        
        if ($staff) {
            $staff->update(['reset_requested' => true]);
            return back()->with('status', 'Request sent. Please contact your Admin for your temporary password.');
        }

        return back()->withErrors(['email' => 'Email not found.']);
    }
}