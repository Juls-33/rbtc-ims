// resources/js/Pages/Admin/RoomManagement.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import DeleteRoomModal from './DeleteRoomModal';
import Toast from '@/Components/Toast';

export default function RoomManagement({ auth, rooms = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const handleShowToast = (message, type = 'success') => {
        setToastInfo({ show: true, message, type });
    };
    const stats = [
        { label: 'Total Rooms', value: rooms.length },
        { label: 'Available', value: rooms.filter(r => r.status === 'Available').length },
        { label: 'Occupied', value: rooms.filter(r => r.status === 'Occupied').length },
        { label: 'Maintenance', value: rooms.filter(r => r.status === 'Maintenance' || r.status === 'Cleaning').length },
    ];

    const filteredRooms = useMemo(() => {
        return rooms.filter(r => 
            r.room_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, rooms]);

    return (
        <AuthenticatedLayout header="Admin / Room Registry" sectionTitle="Room Management">
            <Head title="Room Management" />

            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}
            {/* --- STAT CARDS SECTION (Center-aligned minimalist style) --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</span>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</span>
                    </div>
                ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                {/* Header/Action Bar */}
                <div className="p-6 border-b bg-slate-50/50">
                
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <input 
                                type="text" 
                                placeholder="Search by location or status..." 
                                className="w-full md:w-80 border-slate-300 rounded shadow-sm text-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button 
                                variant="success" 
                                className="px-6 py-2 shadow-md whitespace-nowrap"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                + REGISTER ROOM
                            </Button>
                        </div>

                        {/* Back Button on Top Right */}
                        <Link 
                            href={route('admin.patients')} 
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-black text-[10px] uppercase tracking-widest transition-all border border-slate-200"
                        >
                            <span>Back to Patients</span>
                            <span className="text-lg">→</span>
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="p-4 border-r">Location / ID</th>
                                <th className="p-4 border-r">Daily Rate</th>
                                <th className="p-4 border-r text-center">Status</th>
                                <th className="p-4 text-center text-[10px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {filteredRooms.map(room => (
                                <tr key={room.id} className="hover:bg-slate-50 transition-colors group text-[13px]">
                                    <td className="p-4 font-bold text-slate-700 border-r">{room.room_location}</td>
                                    <td className="p-4 font-mono text-emerald-700 font-bold border-r">
                                        ₱{parseFloat(room.room_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}
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
                                                className="text-[9px] py-1 px-4 font-black uppercase tracking-tighter"
                                                onClick={() => { 
                                                    setSelectedRoom(room); 
                                                    setIsEditModalOpen(true); 
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                className="text-[9px] py-1 px-4 font-black uppercase tracking-tighter"
                                                onClick={() => {
                                                    setSelectedRoom(room);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRooms.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-10 text-center text-slate-400 italic">No rooms found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddRoomModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => handleShowToast('New room registered successfully!', 'success')}
            />
            
            <EditRoomModal 
                isOpen={isEditModalOpen} 
                onClose={() => { setIsEditModalOpen(false); setSelectedRoom(null); }} 
                room={selectedRoom} 
                onSuccess={() => handleShowToast('Room details updated!', 'success')}
            />

            <DeleteRoomModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => { setIsDeleteModalOpen(false); setSelectedRoom(null); }} 
                room={selectedRoom} 
                onSuccess={() => handleShowToast('Room permanently removed.', 'success')}
            />
        </AuthenticatedLayout>
    );
}