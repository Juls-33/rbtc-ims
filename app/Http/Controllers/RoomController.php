<?php
namespace App\Http\Controllers;

use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Partials/RoomManagement', [
            'rooms' => Room::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_location' => 'required|string|max:255',
            'room_rate' => 'required|numeric|min:0',
            'status' => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        Room::create($validated);
        return redirect()->back()->with('success', 'New room added to registry.');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'room_location' => 'required|string|max:255',
            'room_rate' => 'required|numeric|min:0',
            'status' => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        $room->update($validated);
        return redirect()->back()->with('success', 'Room details updated.');
    }
}