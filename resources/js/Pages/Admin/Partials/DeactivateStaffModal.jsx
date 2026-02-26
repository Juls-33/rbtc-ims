// resources/js/Pages/Admin/Partials/DeactivateStaffModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function DeactivateStaffModal({ isOpen, onClose, member }) {
    const { data, setData, put, processing, reset } = useForm({
        reason: 'Resigned',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.staff.deactivate', member.id), {
            data: { reason: data.reason },
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 font-sans backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                <div className="bg-[#C84B4B] text-white p-4 flex justify-between items-center shrink-0">
                    <h3 className="font-black text-sm md:text-lg uppercase tracking-widest">Deactivate Account?</h3>
                    <button 
                        onClick={onClose} 
                        className="text-2xl hover:text-rose-200 transition-colors leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4 text-slate-700">
                        <p className="text-sm md:text-base text-center md:text-left leading-relaxed">
                            Are you sure you want to deactivate <br className="hidden md:block"/>
                            <span className="font-black text-slate-900 text-lg">{member?.name}</span>?
                        </p>
                        
                        <div className="text-xs md:text-sm bg-rose-50 p-4 rounded-lg border border-rose-100 space-y-2 shadow-inner">
                            <p className="font-bold text-rose-800 uppercase tracking-tighter italic">Consequences:</p>
                            <ul className="space-y-2 text-rose-700">
                                <li className="flex gap-2">
                                    <span className="text-rose-400">●</span>
                                    <span>User will no longer be able to log in to the system.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-400">●</span>
                                    <span>Historical records (prescriptions, admissions) will remain saved.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[11px] md:text-xs font-black uppercase tracking-widest text-slate-500">
                                Reason for Deactivation
                            </label>
                            <select 
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#C84B4B]/20 focus:border-[#C84B4B] outline-none bg-slate-50 transition-all"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                            >
                                <option value="Resigned">Resigned</option>
                                <option value="Terminated">Terminated</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
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
                            variant="danger" 
                            disabled={processing}
                            className="w-full md:w-auto md:px-8 py-3 font-black shadow-md active:scale-95 order-1 md:order-2"
                        >
                            {processing ? 'DEACTIVATING...' : 'YES, DEACTIVATE'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}