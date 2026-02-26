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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in duration-150">
                
                {/* HEADER */}
                <div className="bg-rose-600 text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-md">
                    <h3 className="font-black uppercase tracking-widest text-[11px]">System Confirmation</h3>
                    <button onClick={onClose} className="text-2xl font-bold leading-none hover:text-rose-200 transition-colors">&times;</button>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="p-6 md:p-8 text-center overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="mb-6 text-rose-500 shrink-0">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-rose-50 mb-2">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">
                        Remove {room.room_location}?
                    </h4>
                    
                    <div className="mt-4 space-y-3">
                        <p className="text-sm text-slate-600 leading-relaxed">
                            Are you sure you want to delete this facility record? This will permanently remove the unit from the registry.
                        </p>
                        
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 py-2 rounded border border-rose-100 italic">
                            Action cannot be reversed
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <form onSubmit={submit} className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-center gap-3 shrink-0">
                    <Button 
                        type="button" 
                        variant="gray" 
                        onClick={onClose} 
                        className="w-full sm:flex-1 py-3 text-[10px] font-black uppercase tracking-widest"
                    >
                        Keep Record
                    </Button>
                    <Button 
                        type="submit" 
                        variant="danger" 
                        disabled={processing} 
                        className="w-full sm:flex-1 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95"
                    >
                        {processing ? 'Processing...' : 'Confirm Deletion'}
                    </Button>
                </form>
            </div>
        </div>
    );
}