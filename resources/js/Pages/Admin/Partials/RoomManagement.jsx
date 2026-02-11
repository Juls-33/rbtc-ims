// resources/js/Pages/Admin/RoomManagement.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Button from '@/Components/Button';

// Note: You'll eventually create these partials just like you did for Medicine
// import AddRoomModal from './Partials/AddRoomModal';
// import EditRoomModal from './Partials/EditRoomModal';
// import DeleteRoomModal from './Partials/DeleteRoomModal';

export default function RoomManagement({ auth, rooms = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const filteredRooms = useMemo(() => {
        return rooms.filter(r => 
            r.room_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, rooms]);

    return (
        <AuthenticatedLayout header="Admin / Room Registry">
            <Head title="Room Management" />

            {/* Stats Summary Area */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#3D52A0]">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Rooms</p>
                    <p className="text-2xl font-bold text-slate-700">{rooms.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</p>
                    <p className="text-2xl font-bold text-emerald-600">
                        {rooms.filter(r => r.status === 'Available').length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                {/* Search and Add Action Bar */}
                <div className="p-6 flex flex-col md:flex-row justify-between items-center border-b bg-slate-50/50 gap-4">
                    <input 
                        type="text" 
                        placeholder="Search by location or status..." 
                        className="w-full md:w-96 border-slate-300 rounded shadow-sm text-sm focus:ring-[#3D52A0] focus:border-[#3D52A0]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button 
                        variant="success" 
                        className="px-6 py-2 shadow-md"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + ADD NEW ROOM
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="p-4 border-r">Room Location / Name</th>
                                <th className="p-4 border-r">Daily Rate</th>
                                <th className="p-4 border-r text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 font-bold text-slate-700 border-r">{room.room_location}</td>
                                    <td className="p-4 font-mono text-emerald-700 font-bold border-r">
                                        ₱ {parseFloat(room.room_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="p-4 text-center border-r">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                            room.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : 
                                            room.status === 'Occupied' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button 
                                                variant="warning" 
                                                className="text-[9px] py-1 px-4 font-black uppercase tracking-widest"
                                                onClick={() => { setSelectedRoom(room); setIsEditModalOpen(true); }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                className="text-[9px] py-1 px-4 font-black uppercase tracking-widest"
                                                onClick={() => { setSelectedRoom(room); setIsDeleteModalOpen(true); }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRooms.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-400 italic">No rooms matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Placeholders (You'll build these next) */}
            {/* <AddRoomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} /> */}
            {/* <EditRoomModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} room={selectedRoom} /> */}
            {/* <DeleteRoomModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} room={selectedRoom} /> */}
        </AuthenticatedLayout>
    );
}