import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function EditRoomModal({ isOpen, onClose, onSuccess, room, categories = [] }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        room_category_id: '',
        new_category_name: '',
        room_location: '',
        room_rate: '',
        status: 'Available',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    // Pre-fill the form whenever a new room is selected
    useEffect(() => {
        if (room && isOpen) {
            setData({
                room_category_id: room.room_category_id || '', // Automatically selects current category
                new_category_name: '',
                room_location: room.room_location || '',
                room_rate: room.room_rate || '',
                status: room.status || 'Available',
            });
        }
    }, [room, isOpen]);

    const handleModalClose = () => { 
        reset(); 
        clearErrors(); 
        onClose(); 
    };

    const submit = (e) => {
        e.preventDefault();
        clearErrors();
        
        put(route('admin.rooms.update', room.id), {
            preserveScroll: true,
            onSuccess: () => {
                setToastInfo({ show: true, message: 'Room details updated successfully!', type: 'success' });
                if (onSuccess) onSuccess(); 
                handleModalClose();
            }
        });
    };

    if (!isOpen || !room) return null;

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0]'}`;
    const Label = ({ text, required = true }) => <label className="block text-[10px] font-black uppercase tracking-tighter mb-1 text-slate-500">{text} {required && <span className="text-red-600">*</span>}</label>;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm animate-in fade-in duration-200">
            {toastInfo.show && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, show: false })} />}

            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden">
                <div className="bg-amber-500 text-white px-6 py-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight leading-none">Edit Room Details</h3>
                        <p className="text-[10px] font-bold text-amber-100 uppercase tracking-widest mt-1">{room.room_location}</p>
                    </div>
                    <button onClick={handleModalClose} className="text-2xl font-bold leading-none hover:text-amber-200">&times;</button>
                </div>

                <form onSubmit={submit} className="flex flex-col overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                        
                        {/* DYNAMIC CATEGORY DROPDOWN */}
                        <div>
                            <Label text="Ward / Room Category" />
                            <select 
                                className={inputClass(errors.room_category_id)}
                                value={data.room_category_id}
                                onChange={e => {
                                    setData('room_category_id', e.target.value);
                                    if (e.target.value !== 'new') setData('new_category_name', '');
                                }}
                            >
                                <option value="">-- Uncategorized --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                <option value="new" className="font-bold text-amber-600">+ Add New Category (Others)</option>
                            </select>
                            {errors.room_category_id && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase">{errors.room_category_id}</p>}
                        </div>

                        {/* TRAPDOOR: ONLY SHOW IF 'OTHERS' IS SELECTED */}
                        {data.room_category_id === 'new' && (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg animate-in slide-in-from-top-2">
                                <Label text="New Category Name" />
                                <input 
                                    type="text" placeholder="e.g., Male Ward 1, ICU, Private..."
                                    className={inputClass(errors.new_category_name)}
                                    value={data.new_category_name}
                                    onChange={e => setData('new_category_name', e.target.value)}
                                />
                                {errors.new_category_name && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase">{errors.new_category_name}</p>}
                            </div>
                        )}

                        <div>
                            <Label text="Bed / Room Identifier" />
                            <input 
                                type="text" className={inputClass(errors.room_location)}
                                value={data.room_location} onChange={e => setData('room_location', e.target.value)}
                            />
                            {errors.room_location && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase">{errors.room_location}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label text="Monthly Rate" />
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 font-bold">₱</span>
                                    <input 
                                        type="number" 
                                        step="0.01" 
                                        min="0" // HTML5 Validation
                                        onKeyDown={(e) => {
                                            // Actively block minus, plus, and 'e' characters
                                            if (['-', '+', 'e', 'E'].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className={`${inputClass(errors.room_rate)} pl-7 font-mono`}
                                        value={data.room_rate} 
                                        onChange={e => setData('room_rate', e.target.value)}
                                    />
                                </div>
                                {errors.room_rate && <p className="text-[9px] text-red-500 mt-1 font-bold uppercase">{errors.room_rate}</p>}
                            </div>
                            <div>
                                <Label text="Status" required={false} />
                                <select 
                                    className={inputClass()} 
                                    value={data.status} 
                                    onChange={e => setData('status', e.target.value)}
                                    disabled={room.status === 'Occupied'} // Prevent manual override of occupied rooms
                                >
                                    <option value="Available">Available</option>
                                    {/* <option value="Occupied">Occupied</option> */}
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Cleaning">Cleaning</option>
                                </select>
                                {room.status === 'Occupied' && (
                                    <p className="text-[8px] text-amber-600 mt-1 font-bold uppercase leading-tight">Must discharge patient to change status.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="gray" onClick={handleModalClose} className="px-6 py-2.5 text-[10px] font-black uppercase">Cancel</Button>
                        <Button type="submit" variant="warning" disabled={processing} className="px-8 py-2.5 text-[10px] font-black uppercase shadow-md active:scale-95 text-white">{processing ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}