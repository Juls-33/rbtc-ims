// resources/js/Pages/Admin/Partials/ActivateStaffModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function ActivateStaffModal({ isOpen, onClose, member }) {
    const { put, processing } = useForm();

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.staff.deactivate', member.id), {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 font-sans backdrop-blur-sm">
            {/* 🔥 Max-w-lg for desktop, full width for mobile with better margins */}
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                
                {/* Responsive Header */}
                <div className="bg-[#488D6A] text-white p-4 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-sm md:text-lg uppercase tracking-widest">Activate Account?</h3>
                    <button 
                        onClick={onClose} 
                        className="text-2xl hover:text-green-200 transition-colors leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* 🔥 Scrollable body for very small phones */}
                <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4 text-slate-700 text-center">
                        <p className="text-sm md:text-base leading-relaxed">
                            Are you sure you want to reactivate the account for <br className="hidden md:block"/> 
                            <span className="font-black text-lg md:text-xl text-slate-900 block mt-1">{member?.name}</span>
                        </p>
                        
                        <div className="text-xs md:text-sm bg-green-50 p-4 rounded-lg border border-green-100 space-y-3 text-left shadow-inner">
                            <p className="font-bold text-green-800 italic uppercase tracking-tighter">What happens next:</p>
                            <ul className="space-y-2 text-green-700">
                                <li className="flex gap-2">
                                    <span className="text-green-500">✔</span>
                                    <span>User immediately regains access to the system.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-500">✔</span>
                                    <span>Status returns to <span className="font-black">ACTIVE</span> in directory.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-500">✔</span>
                                    <span>All previous records and permissions restored.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 🔥 RESPONSIVE ACTION BUTTONS: Column on mobile, Row on desktop */}
                    <div className="flex flex-col md:flex-row justify-center gap-3 pt-2">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={onClose} 
                            className="w-full md:w-auto md:px-10 py-3 font-bold order-2 md:order-1"
                        >
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            variant="success" 
                            disabled={processing}
                            className="w-full md:w-auto md:px-10 py-3 font-black shadow-md active:scale-95 transition-transform order-1 md:order-2"
                        >
                            {processing ? 'ACTIVATING...' : 'YES, ACTIVATE'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}