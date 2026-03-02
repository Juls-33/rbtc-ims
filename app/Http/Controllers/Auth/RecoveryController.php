<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class RecoveryController extends Controller
{
    // For the Admin: Uses the .env Master Key
    public function recoverAdmin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'recovery_key' => 'required',
        ]);

        // 1. Verify the Master Recovery Key
        if ($request->recovery_key === env('ADMIN_RECOVERY_KEY')) {
            $admin = Staff::where('email', $request->email)
                ->where('role', 'Admin')
                ->first();

            if ($admin) {
                // 2. Trigger the Security Trap
                $admin->update([
                    'must_change_password' => true,
                    'reset_requested' => false, // Clear any pending requests
                ]);

                // 3. Log them in
                Auth::login($admin);

                // 4. Redirect to dashboard (The middleware will now intercept them)
                return redirect()->route('dashboard')
                    ->with('success', 'Master recovery successful. Security protocol initiated: Please update your password immediately.');
            }
        }

        return back()->withErrors(['recovery_key' => 'Invalid recovery key or unauthorized email. Access denied.']);
    }

    // For the Staff: Triggers the Admin Notification we built earlier
    public function requestReset(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $staff = Staff::where('email', $request->email)->first();
        
        if ($staff) {
            $staff->update(['reset_requested' => true]);
            
            return back()->with('success', 'Security reset request sent to system administrators.');
        }

        return back()->withErrors(['email' => 'Institutional email address not found.']);
    }
}