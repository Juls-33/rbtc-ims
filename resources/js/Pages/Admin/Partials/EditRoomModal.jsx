// resources/js/Pages/Admin/Partials/EditRoomModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function EditRoomModal({ isOpen, onClose, room, onSuccess }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        room_location: '',
        room_rate: '',
        status: '',
    });

    // Load room data when the modal opens or the room changes
    useEffect(() => {
        if (room && isOpen) {
            setData({
                room_location: room.room_location || '',
                room_rate: room.room_rate || '',
                status: room.status || 'Available',
            });
        }
    }, [room, isOpen]);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.rooms.update', room.id), {
            onSuccess: () => {
                onClose();
                if (onSuccess) onSuccess();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-[#E6AA68] text-[#5c3a00] p-4 flex justify-between items-center shadow-sm">
                    <h3 className="font-bold uppercase tracking-tight">Edit Room Details</h3>
                    <button onClick={onClose} className="text-xl font-bold">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5 text-slate-800">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 tracking-tighter">Room Location / Name</label>
                        <input 
                            type="text" 
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#E6AA68] focus:border-[#E6AA68]"
                            value={data.room_location}
                            onChange={e => setData('room_location', e.target.value)}
                        />
                        {errors.room_location && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.room_location}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 tracking-tighter">Daily Rate (₱)</label>
                        <input 
                            type="number" 
                            step="0.01"
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#E6AA68] focus:border-[#E6AA68]"
                            value={data.room_rate}
                            onChange={e => setData('room_rate', e.target.value)}
                        />
                        {errors.room_rate && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.room_rate}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 tracking-tighter">Room Status</label>
                        <select 
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#E6AA68] focus:border-[#E6AA68]"
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                        >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Cleaning">Cleaning</option>
                        </select>
                        {errors.status && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.status}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="gray" onClick={onClose} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                        <Button type="submit" variant="warning" disabled={processing} className="px-8 py-2 text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95">
                            {processing ? 'Saving...' : 'Update Room'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}