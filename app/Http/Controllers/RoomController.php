<?php
namespace App\Http\Controllers;

use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\StaffLog;

class RoomController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Partials/RoomManagement', [
            'rooms' => Room::orderBy('room_location', 'asc')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_location' => 'required|string|max:255|unique:rooms,room_location',
            'room_rate'     => 'required|numeric|min:0',
            'status'        => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        $room = Room::create($validated);

        StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'ADD ROOM',
            'description' => "Added new room: {$room->room_location} with rate ₱{$room->room_rate}.",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Room successfully registered.');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_location' => 'required|string|max:255|unique:rooms,room_location,' . $room->id,
            'room_rate'     => 'required|numeric|min:0',
            'status'        => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        $room->update($validated);

        // Log the change
        \App\Models\StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'UPDATED ROOM',
            'description' => "Updated room {$room->room_location}. Status: {$room->status}, Rate: ₱{$room->room_rate}.",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Room details updated successfully.');
    }
    public function destroy(Request $request, Room $room)
    {
        // Capture details for logging before the record is gone
        $roomName = $room->room_location;

        // Optional: Check if the room is currently occupied before allowing deletion
        if ($room->status === 'Occupied') {
            return redirect()->back()->withErrors(['error' => 'Cannot delete an occupied room. Discharge the patient first.']);
        }

        $room->delete();

        // Log the deletion
        \App\Models\StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'DELETED ROOM',
            'description' => "Permanently removed room: {$roomName}.",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Room has been successfully removed.');
    }
}