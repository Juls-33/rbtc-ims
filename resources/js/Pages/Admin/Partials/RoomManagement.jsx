import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import DeleteRoomModal from './DeleteRoomModal';
import InventoryStats from '@/Components/InventoryStats';

export default function RoomManagement({ auth, categories, groupedCategories, orphanedRooms, roomStats, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All'); 
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.rooms'), 
                { search: searchQuery, status: statusFilter }, 
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, statusFilter]);

    // Helper to render a room card inside the grid
    const renderRoomCard = (room) => (
        <div key={room.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow group flex flex-col justify-between">
            <div>
               <div className="flex flex-col items-start gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        room.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        room.status === 'Occupied' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                        {room.status}
                    </span>

                    {/* Patient name will now safely print right here, below the tag */}
                    {room.status?.toLowerCase() === 'occupied' && room.assigned_patient ? (
                        <div className="text-[10px] text-slate-500 font-bold max-w-[140px] truncate pl-1 mt-0.5" title={room.assigned_patient}>
                            👤 {room.assigned_patient}
                        </div>
                    ) : room.status?.toLowerCase() === 'occupied' && (
                        <span className="text-[9px] text-slate-400 italic pl-1 mt-0.5">Patient info loading...</span>
                    )}
                </div>
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight line-clamp-1">{room.room_location}</h4>
                <p className="font-mono text-emerald-600 font-bold text-xs mt-1 mb-4">₱{parseFloat(room.room_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}/mo</p>
            </div>
            
            <div className="flex justify-between gap-2 border-t border-slate-100 pt-3 mt-auto">
                <button onClick={() => { setSelectedRoom(room); setIsEditModalOpen(true); }} className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">Edit</button>
                <button onClick={() => { setSelectedRoom(room); setIsDeleteModalOpen(true); }} className="flex-1 bg-rose-50 text-rose-700 hover:bg-rose-100 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">Delete</button>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout header="Admin / Room Registry" sectionTitle="Facility Management">
            <Head title="Room Management" />

            <InventoryStats stats={roomStats} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                {/* FILTER HEADER */}
                <div className="p-6 border-b bg-slate-50/30">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-72">
                                <input 
                                    type="text" placeholder="Search beds/locations..." 
                                    className="w-full border-slate-300 rounded-lg shadow-sm text-sm focus:ring-[#3D52A0] pl-4 py-2.5"
                                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select 
                                className="w-full sm:w-44 border-slate-300 rounded-lg text-sm focus:ring-[#3D52A0] py-2.5 font-bold text-slate-600"
                                value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                            <Button variant="success" onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto px-6 py-3 shadow-lg font-black text-[10px] uppercase whitespace-nowrap tracking-widest">
                                + Add Bed / Room
                            </Button>
                        </div>
                    </div>
                </div>

                {/* DYNAMIC CATEGORY GRID LAYOUT */}
                <div className="p-6 bg-slate-50">
                    
                    {/* Wrap the mapped categories in a 2-column grid for Desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {groupedCategories.map(category => {
                            if (category.rooms.length === 0) return null; // Hide empty categories
                            
                            return (
                                /* Wraps each category in its own neat container box */
                                <div key={category.id} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-black text-lg text-[#3D52A0] uppercase tracking-tighter border-b-2 border-slate-100 pb-2">
                                        {category.name} <span className="text-[10px] text-slate-400 font-bold ml-2">({category.rooms.length} Beds)</span>
                                    </h3>
                                    
                                    {/* The individual beds inside this specific category */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {category.rooms.map(renderRoomCard)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ORPHANED ROOMS (Legacy fallback) */}
                    {orphanedRooms.length > 0 && (
                        <div className="space-y-4 pt-8 mt-8 border-t-4 border-dashed border-rose-200">
                            <h3 className="font-black text-lg text-rose-600 uppercase tracking-tighter border-b-2 border-rose-200 pb-2 inline-block pr-8">
                                Uncategorized / Legacy Rooms <span className="text-[10px] text-rose-400 font-bold ml-2">({orphanedRooms.length} Beds)</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {orphanedRooms.map(renderRoomCard)}
                            </div>
                        </div>
                    )}

                    {groupedCategories.every(c => c.rooms.length === 0) && orphanedRooms.length === 0 && (
                        <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No rooms match your filters.
                        </div>
                    )}
                </div>
            </div>

            {/* Modals: Notice we pass the 'categories' list down to them */}
            <AddRoomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} categories={categories} />
            <EditRoomModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} room={selectedRoom} categories={categories} />
            <DeleteRoomModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} room={selectedRoom} />
        </AuthenticatedLayout>
    );
}