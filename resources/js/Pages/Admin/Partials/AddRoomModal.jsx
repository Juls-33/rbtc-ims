import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function AddRoomModal({ isOpen, onClose, onSuccess }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        room_location: '',
        room_rate: '',
        status: 'Available',
    });

    const submit = (e) => {
    e.preventDefault();
    post(route('admin.rooms.store'), {
        onSuccess: () => {
            reset();
            onClose();
            if (onSuccess) onSuccess(); 
        },
    });
};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-tight">Register New Room</h3>
                    <button onClick={onClose} className="text-xl">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5 text-slate-800">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Room Location / Name</label>
                        <input 
                            type="text" 
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#3D52A0]"
                            placeholder="e.g. Ward B - Room 102"
                            value={data.room_location}
                            onChange={e => setData('room_location', e.target.value)}
                        />
                        {errors.room_location && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.room_location}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Daily Rate (₱)</label>
                        <input 
                            type="number" 
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#3D52A0]"
                            placeholder="0.00"
                            value={data.room_rate}
                            onChange={e => setData('room_rate', e.target.value)}
                        />
                        {errors.room_rate && <p className="text-red-500 text-[10px] mt-1 font-bold italic uppercase">{errors.room_rate}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Initial Status</label>
                        <select 
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#3D52A0]"
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                        >
                            <option value="Available">Available</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Cleaning">Cleaning</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="gray" onClick={onClose} className="px-6 py-2 text-[10px] font-black uppercase">Cancel</Button>
                        <Button type="submit" variant="success" disabled={processing} className="px-8 py-2 text-[10px] font-black uppercase shadow-md">
                            {processing ? 'Processing...' : 'Register Room'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}