<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Staff; // Ensure this matches your staff model name

class NotificationController extends Controller
{
    public function dismiss(Request $request)
    {
        $staff = Staff::find(auth()->id());
        $dismissed = $staff->dismissed_notifications ?? [];
        
        // Set the snooze timer (Key = ID, Value = Expiry)
        $dismissed[$request->id] = now()->addHours(12)->toDateTimeString();

        $staff->update(['dismissed_notifications' => $dismissed]);

        return back();
    }

    public function dismissAll(Request $request)
    {
        $request->validate(['ids' => 'required|array']);

        $staff = Staff::find(auth()->id());
        $dismissed = $staff->dismissed_notifications ?? [];
        
        // Loop through all IDs and set them to snooze
        foreach ($request->ids as $id) {
            $dismissed[$id] = now()->addHours(12)->toDateTimeString();
        }

        $staff->update(['dismissed_notifications' => $dismissed]);
        
        return back();
    }
}
?>