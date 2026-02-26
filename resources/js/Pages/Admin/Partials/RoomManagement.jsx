import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import DeleteRoomModal from './DeleteRoomModal';
import Pagination from '@/Components/Pagination';
import InventoryStats from '@/Components/InventoryStats';

export default function RoomManagement({ auth, rooms = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); 
    const [sortConfig, setSortConfig] = useState({ key: 'room_location', direction: 'asc' });
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 font-bold">↑</span> 
            : <span className="ml-1 text-blue-600 font-bold">↓</span>;
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredRooms = useMemo(() => {
        return rooms.filter(r => {
            const matchesSearch = r.room_location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, statusFilter, rooms]);

    const sortedRooms = useMemo(() => {
        const items = [...filteredRooms];
        items.sort((a, b) => {
            let valA = a[sortConfig.key];
            let valB = b[sortConfig.key];

            if (sortConfig.key === 'room_rate') {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return items;
    }, [filteredRooms, sortConfig]);

    const paginatedRooms = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return sortedRooms.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, sortedRooms]);

    useMemo(() => setCurrentPage(1), [searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

    const stats = useMemo(() => [
        { label: 'Total Units', value: rooms.length, color: 'text-slate-800', bg: 'bg-slate-50' },
        { label: 'Available', value: rooms.filter(r => r.status === 'Available').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Occupied', value: rooms.filter(r => r.status === 'Occupied').length, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Warning/Maint', value: rooms.filter(r => r.status !== 'Available' && r.status !== 'Occupied').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    ], [rooms]);

    const roomStats = useMemo(() => [
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

    return (
        <AuthenticatedLayout header="Admin / Room Registry" sectionTitle="Room Management">
            <Head title="Room Management" />

            <InventoryStats stats={roomStats} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                
                <div className="p-6 border-b bg-slate-50/30">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-72">
                                <input 
                                    type="text" 
                                    placeholder="Search location..." 
                                    className="w-full border-slate-300 rounded-lg shadow-sm text-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] pl-4 py-2.5"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <select 
                                className="w-full sm:w-44 border-slate-300 rounded-lg text-sm focus:ring-[#3D52A0] py-2.5 font-bold text-slate-600"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Occupied">Occupied</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Cleaning">Cleaning</option>
                            </select>

                            <Button 
                                variant="success" 
                                className="w-full sm:w-auto px-6 py-3 shadow-lg font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                + REGISTER ROOM
                            </Button>
                        </div>

                        <Link 
                            href={route('admin.patients')} 
                            className="w-full lg:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 flex items-center justify-center gap-2"
                        >
                            Patient Directory →
                        </Link>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="overflow-x-auto border border-slate-200 rounded-xl relative">
                        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('room_location')}>
                                        Room Location / ID <SortIcon column="room_location" />
                                    </th>
                                    <th className="p-4 border-r text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('room_rate')}>
                                        Daily Rate <SortIcon column="room_rate" />
                                    </th>
                                    <th className="p-4 border-r text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                                        Status <SortIcon column="status" />
                                    </th>
                                    <th className="p-4 text-center sticky right-0 bg-slate-50 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] w-48">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                {paginatedRooms.map(room => (
                                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group text-[13px]">
                                        <td className="p-4 font-black text-slate-800 border-r uppercase tracking-tight">{room.room_location}</td>
                                        <td className="p-4 font-mono text-emerald-700 font-black border-r text-center">
                                            ₱{parseFloat(room.room_rate).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="p-4 text-center border-r">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                                room.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                room.status === 'Occupied' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                            }`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                                            <div className="flex justify-center gap-2">
                                                <Button 
                                                    variant="warning"
                                                    onClick={() => { setSelectedRoom(room); setIsEditModalOpen(true); }}
                                                    className="px-4 py-2 font-black text-[9px] uppercase tracking-widest shadow-sm"
                                                >
                                                    Edit
                                                </Button>
                                                
                                                <Button 
                                                    variant="danger"
                                                    onClick={() => { setSelectedRoom(room); setIsDeleteModalOpen(true); }}
                                                    className="px-4 py-2 font-black text-[9px] uppercase tracking-widest shadow-sm"
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {sortedRooms.length === 0 && (
                            <div className="p-20 text-center text-slate-400 italic text-sm">No units found matching your current filters.</div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50/30 mt-auto">
                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            </div>
            <AddRoomModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditRoomModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} room={selectedRoom} />
            <DeleteRoomModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} room={selectedRoom} />
        </AuthenticatedLayout>
    );
}