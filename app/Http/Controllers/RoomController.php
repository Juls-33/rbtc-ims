<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\RoomCategory;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\StaffLog;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $searchTerm = $request->search;
        $status = $request->status;

        // 1. Fetch Categories for the Dropdowns (Add/Edit Modals)
        $categories = RoomCategory::orderBy('name', 'asc')->get();

        // 2. Fetch Nested Data (Apply Status filter directly in the DB)
        $groupedCategories = RoomCategory::with(['rooms' => function($q) use ($status) {
            if ($status && $status !== 'All') {
                $q->where('status', $status);
            }
            $q->orderBy('room_location', 'asc');
        }])->orderBy('name', 'asc')->get();

        // --- NEW: ADVANCED DEEP SEARCH FILTERING ---
        if ($searchTerm) {
            $searchTermLower = strtolower($searchTerm); // Make it case-insensitive
            
            $groupedCategories = $groupedCategories->filter(function ($category) use ($searchTermLower) {
                // Does the Category Name match the search?
                $categoryMatches = str_contains(strtolower($category->name), $searchTermLower);

                if ($categoryMatches) {
                    // If the category itself matches (e.g. "Male Ward"), show the category and ALL its rooms
                    return true; 
                } else {
                    // If category doesn't match, check if any of its rooms match the location or price
                    $matchingRooms = $category->rooms->filter(function ($room) use ($searchTermLower) {
                        return str_contains(strtolower($room->room_location), $searchTermLower) || 
                               str_contains((string)$room->room_rate, $searchTermLower);
                    })->values(); // Re-index array

                    // Temporarily replace the category's rooms with ONLY the ones that matched
                    $category->setRelation('rooms', $matchingRooms);

                    // Keep this category visible ONLY if it has at least one matching room inside it
                    return $matchingRooms->isNotEmpty();
                }
            })->values(); // Re-index the outer array for clean React JSON props
        }

        // 3. Fetch "Orphaned" Rooms (Fallback)
        $orphanedRooms = Room::whereNull('room_category_id')
            ->when($searchTerm, function($q) use ($searchTerm) {
                $q->where(function($subQ) use ($searchTerm) {
                    $subQ->where('room_location', 'LIKE', "%{$searchTerm}%")
                         ->orWhere('room_rate', 'LIKE', "%{$searchTerm}%");
                });
            })
            ->when($status && $status !== 'All', function($q) use ($status) {
                $q->where('status', $status);
            })
            ->orderBy('room_location', 'asc')
            ->get();

        // 4. Calculate Dashboard Stats
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

        return Inertia::render('Admin/Partials/RoomManagement', [
            'categories'        => $categories,
            'groupedCategories' => $groupedCategories,
            'orphanedRooms'     => $orphanedRooms,
            'roomStats'         => $stats,
            'filters'           => $request->only(['search', 'status'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_category_id'  => 'nullable', // Can be an existing ID or 'new'
            'new_category_name' => 'nullable|string|max:255',
            'room_location'     => 'required|string|max:255|unique:rooms,room_location',
            'room_rate'         => 'required|numeric|min:0',
            'status'            => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        $categoryId = $validated['room_category_id'];

        // Dynamic Category Creation trapdoor
        if ($categoryId === 'new' && !empty($validated['new_category_name'])) {
            $category = RoomCategory::firstOrCreate(['name' => $validated['new_category_name']]);
            $categoryId = $category->id;
        }

        $room = Room::create([
            'room_category_id' => ($categoryId !== 'new' && $categoryId !== null) ? $categoryId : null,
            'room_location'    => $validated['room_location'],
            'room_rate'        => $validated['room_rate'],
            'status'           => $validated['status'],
        ]);

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
        // QA GUARD: PREVENT MANUAL STATUS OVERRIDE
        if ($room->status === 'Occupied' && $request->status !== 'Occupied') {
            return redirect()->back()->with('error', 'Status Lock: This room is occupied. You must discharge the patient through the Patient Management module to release this room.');
        }

        $validated = $request->validate([
            'room_category_id'  => 'nullable',
            'new_category_name' => 'nullable|string|max:255',
            'room_location'     => 'required|string|max:255|unique:rooms,room_location,' . $room->id,
            'room_rate'         => 'required|numeric|min:0',
            'status'            => 'required|in:Available,Occupied,Maintenance,Cleaning',
        ]);

        $categoryId = $validated['room_category_id'];

        if ($categoryId === 'new' && !empty($validated['new_category_name'])) {
            $category = RoomCategory::firstOrCreate(['name' => $validated['new_category_name']]);
            $categoryId = $category->id;
        }

        $room->update([
            'room_category_id' => ($categoryId !== 'new' && $categoryId !== null) ? $categoryId : null,
            'room_location'    => $validated['room_location'],
            'room_rate'        => $validated['room_rate'],
            'status'           => $validated['status'],
        ]);

        StaffLog::create([
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

        // QA GUARD: PREVENT DELETION OF OCCUPIED ROOM
        if ($room->status === 'Occupied') {
            return redirect()->back()->with('error', "Critical: Cannot delete '{$roomName}' because a patient is currently admitted to this bed.");
        }

        $room->delete();

        StaffLog::create([
            'staff_id'    => auth()->id(),
            'action'      => 'DELETED ROOM',
            'description' => "Permanently removed room: {$roomName}.",
            'ip_address'  => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Room has been successfully removed.');
    }
}