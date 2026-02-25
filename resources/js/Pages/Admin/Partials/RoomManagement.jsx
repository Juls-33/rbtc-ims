// resources/js/Pages/Admin/RoomManagement.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import DeleteRoomModal from './DeleteRoomModal';
import Toast from '@/Components/Toast';
import Pagination from '@/Components/Pagination';

export default function RoomManagement({ auth, rooms = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const handleShowToast = (message, type = 'success') => {
        setToastInfo({ show: true, message, type });
    };
   const stats = useMemo(() => [
        { 
            label: 'Total Units', 
            value: rooms.length, 
            color: 'text-slate-800',
            bg: 'bg-slate-50' 
        },
        { 
            label: 'Available Now', 
            value: rooms.filter(r => r.status === 'Available').length, 
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
        { 
            label: 'Currently Occupied', 
            value: rooms.filter(r => r.status === 'Occupied').length, 
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        { 
            label: 'Under Maintenance', 
            value: rooms.filter(r => r.status === 'Maintenance' || r.status === 'Cleaning').length, 
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ], [rooms]);


    const filteredRooms = useMemo(() => {
        return rooms.filter(r => 
            r.room_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.status.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, rooms]);

    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    
    const paginatedRooms = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredRooms.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, filteredRooms]);

    return (
        <AuthenticatedLayout header="Admin / Room Registry" sectionTitle="Room Management">
            <Head title="Room Management" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all hover:shadow-md ${stat.bg}`}>
                        <span className={`text-4xl font-black mb-1 ${stat.color}`}>{stat.value}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">{stat.label}</span>
                    </div>
                ))}
            </div>
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}
            {/* --- STAT CARDS SECTION (Center-aligned minimalist style) --- */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</span>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</span>
                    </div>
                ))}
            </div> */}
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                {/* Header/Action Bar */}
                <div className="p-4 md:p-6 border-b bg-slate-50/50">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <input 
                                type="text" 
                                placeholder="Search location or status..." 
                                className="w-full sm:w-72 border-slate-300 rounded shadow-sm text-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button 
                                variant="success" 
                                className="w-full sm:w-auto px-6 py-2.5 shadow-md whitespace-nowrap font-black text-[10px] uppercase tracking-widest"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                + REGISTER ROOM
                            </Button>
                        </div>

                        <Link 
                            href={route('admin.patients')} 
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-black text-[10px] uppercase tracking-widest transition-all border border-slate-200"
                        >
                            <span>Back to Patients</span>
                            <span className="text-lg">→</span>
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                            <tr>
                                <th className="p-4 border-r">Location / ID</th>
                                <th className="p-4 border-r text-center">Daily Rate</th>
                                <th className="p-4 border-r text-center">Status</th>
                                <th className="p-4 text-center sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {paginatedRooms.map(room => (
                                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group text-[13px]">
                                    <td className="p-4 font-bold text-slate-700 border-r uppercase tracking-tight">{room.room_location}</td>
                                    <td className="p-4 font-mono text-emerald-700 font-black border-r text-center">
                                        ₱{parseFloat(room.room_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="p-4 text-center border-r">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                                            room.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                            room.status === 'Occupied' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                                        <div className="flex justify-center gap-2">
                                            <Button 
                                                variant="warning" 
                                                className="text-[9px] py-1.5 px-4 font-black uppercase tracking-tighter shadow-sm"
                                                onClick={() => { setSelectedRoom(room); setIsEditModalOpen(true); }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                className="text-[9px] py-1.5 px-4 font-black uppercase tracking-tighter shadow-sm"
                                                onClick={() => { setSelectedRoom(room); setIsDeleteModalOpen(true); }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredRooms.length === 0 && (
                        <div className="p-20 text-center text-slate-400 italic text-sm">No unit records match your search.</div>
                    )}
                </div>
                <div className="p-6 border-t bg-slate-50/30">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
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