// resources/js/Pages/Admin/Partials/DischargeWarningModal.jsx

import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Toast from '@/Components/Toast';

export default function DischargeWarningModal({ isOpen, onClose, onConfirm, patientName, balance }) {
    const { flash } = usePage().props;
    
    const [localToast, setLocalToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setLocalToast({ message: flash.success, type: 'success' });
        }
        if (flash?.error) {
            setLocalToast({ message: flash.error, type: 'danger' });
        }
    }, [flash]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">

            {localToast && (
                <Toast 
                    message={localToast.message} 
                    type={localToast.type} 
                    onClose={() => setLocalToast(null)} 
                />
            )}

            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                
                {/* DANGER HEADER */}
                <div className="bg-[#C84B4B] p-6 md:p-8 text-center text-white shrink-0 shadow-md">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner border border-white/10">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight">Unpaid Balance!</h4>
                    <p className="text-rose-100 text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">Security Confirmation</p>
                </div>

                {/* MODAL BODY */}
                <div className="p-6 md:p-8 space-y-6 text-center overflow-y-auto no-scrollbar flex-1">
                    <div className="space-y-2">
                        <p className="text-sm text-slate-600 leading-relaxed px-2">
                            Confirming discharge for <span className="font-black text-slate-900">{patientName || 'this patient'}</span> with a remaining balance of:
                        </p>
                        <p className="text-3xl font-black text-rose-600 font-mono tracking-tighter">
                            ₱ {parseFloat(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                        <p className="text-[10px] text-rose-700 font-bold uppercase tracking-tighter italic leading-tight">
                            Strict Policy: This action marks the bill as "UNPAID" and releases the room.
                        </p>
                    </div>

                    {/* RESPONSIVE BUTTON STACK */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button 
                            onClick={onConfirm}
                            className="w-full py-4 bg-[#C84B4B] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest active:scale-95 shadow-lg shadow-rose-200 transition-all order-1"
                        >
                            Yes, Confirm Discharge
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-colors order-2"
                        >
                            Cancel & Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}