<?php
namespace App\Http\Controllers;

use App\Models\Room;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\StaffLog;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $query = Room::query();

        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('room_location', 'LIKE', "%{$searchTerm}%")
                ->orWhere('room_rate', 'LIKE', "%{$searchTerm}%");
            });
        }

        if ($request->status && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        $sortField = $request->input('sort', 'room_location');
        $sortDirection = $request->input('direction', 'asc');

        $allowedSorts = ['room_location', 'room_rate', 'status'];
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortDirection);
        }
        $statsData = Room::selectRaw("
            count(*) as total,
            count(case when status = 'Available' then 1 end) as available,
            count(case when status = 'Occupied' then 1 end) as occupied,
            count(case when status in ('Maintenance', 'Cleaning') then 1 end) as maintenance
        ")->first();

        $stats = [
            ['label' => 'Total Units', 'value' => $statsData->total, 'color' => 'text-slate-800', 'bg' => 'bg-slate-50'],
            ['label' => 'Available Now', 'value' => $statsData->available, 'color' => 'text-emerald-600', 'bg' => 'bg-emerald-50'],
            ['label' => 'Currently Occupied', 'value' => $statsData->occupied, 'color' => 'text-blue-600', 'bg' => 'bg-blue-50'],
            ['label' => 'Under Maintenance', 'value' => $statsData->maintenance, 'color' => 'text-amber-600', 'bg' => 'bg-amber-50'],
        ];

        $rooms = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Partials/RoomManagement', [
            'rooms' => $rooms,
            'roomStats' => $stats,
            'filters' => $request->only(['search', 'status', 'sort', 'direction'])
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
        // --- 1. QA GUARD: PREVENT MANUAL STATUS OVERRIDE ---
        // If the room is currently Occupied, we prevent changing the status to anything else.
        if ($room->status === 'Occupied' && $request->status !== 'Occupied') {
            return redirect()->back()->with('error', 'Status Lock: This room is occupied. You must discharge the patient through the Patient Management module to release this room.');
        }

        $validated = $request->validate([
            'room_location' => 'required|string|max:255|unique:rooms,room_location,' . $room->id,
            'room_rate'     => 'required|numeric|min:0',
            'status'        => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        $room->update($validated);

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
        $roomName = $room->room_location;

        // --- 2. QA GUARD: PREVENT DELETION OF OCCUPIED ROOM ---
        // Using 'with(error)' ensures your Toast component catches the message.
        if ($room->status === 'Occupied') {
            return redirect()->back()->with('error', "Critical: Cannot delete '{$roomName}' because a patient is currently admitted to this bed.");
        }

        $room->delete();

        \App\Models\StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'DELETED ROOM',
            'description' => "Permanently removed room: {$roomName}.",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Room has been successfully removed.');
    }
}