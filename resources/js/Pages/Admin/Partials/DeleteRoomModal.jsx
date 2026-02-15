// resources/js/Pages/Admin/Partials/DeleteRoomModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function DeleteRoomModal({ isOpen, onClose, room, onSuccess }) {
    const { delete: destroy, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        destroy(route('admin.rooms.destroy', room.id), {
            onSuccess: () => {
                onClose();
                if (onSuccess) onSuccess();
            },
        });
    };

    if (!isOpen || !room) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-red-600 text-white p-4 flex justify-between items-center shadow-md">
                    <h3 className="font-black uppercase tracking-tight text-sm">Confirm Deletion</h3>
                    <button onClick={onClose} className="text-xl font-bold">&times;</button>
                </div>

                <div className="p-6 text-center">
                    <div className="mb-4 text-red-500">
                        {/* Simple warning icon */}
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="text-slate-600 text-sm">
                        Are you sure you want to delete <span className="font-bold text-slate-800">{room.room_location}</span>?
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest leading-relaxed">
                        This action is permanent and will be logged in the system history.
                    </p>
                </div>

                <form onSubmit={submit} className="p-4 bg-slate-50 border-t flex justify-center gap-3">
                    <Button 
                        type="button" 
                        variant="gray" 
                        onClick={onClose} 
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                    >
                        Keep Room
                    </Button>
                    <Button 
                        type="submit" 
                        variant="danger" 
                        disabled={processing} 
                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
                    >
                        {processing ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                </form>
            </div>
        </div>
    );
}