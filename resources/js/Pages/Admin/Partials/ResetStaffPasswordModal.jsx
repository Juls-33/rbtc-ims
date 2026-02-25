// resources/js/Pages/Admin/Partials/ResetStaffPasswordModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function ResetStaffPasswordModal({ isOpen, onClose, member }) {
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleModalClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.staff.reset-password', member.id), {
            onSuccess: () => {
                handleModalClose();
                // Note: The global toast in AuthenticatedLayout will handle the success message
            },
        });
    };

    // 🔥 Red Glow Error Handler
    const inputClass = (error) => `w-full border rounded-lg px-4 py-3 md:py-2 text-sm transition-all outline-none ${
        error 
            ? 'bg-red-50 !border-red-500 ring-2 ring-red-200 focus:!border-red-600' 
            : 'bg-white border-slate-300 focus:border-[#3D52A0] focus:ring-2 focus:ring-blue-100'
    }`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shrink-0 shadow-lg relative">
                    <div className="w-full text-center">
                        <h3 className="font-black text-sm md:text-lg uppercase tracking-tighter">Reset Staff Password</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mt-1 opacity-80 truncate px-4">
                            User: {member?.name}
                        </p>
                    </div>
                    <button 
                        onClick={handleModalClose} 
                        className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl leading-none"
                    >&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1">
                    <div className="space-y-5">
                        {/* New Password Input */}
                        <div className="space-y-1.5">
                            <label className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest block ml-1 ${errors.password ? 'text-red-600' : 'text-slate-500'}`}>
                                New Password <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="password"
                                className={inputClass(errors.password)}
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && (
                                <p className="text-red-600 text-[10px] mt-1.5 font-black italic uppercase tracking-tight ml-1">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirmation Input */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] md:text-[11px] font-black uppercase tracking-widest block ml-1 text-slate-500">
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="password"
                                className={inputClass(errors.password_confirmation)}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-blue-700 font-bold uppercase tracking-tighter leading-tight flex gap-2">
                            <span className="text-blue-500">ℹ</span>
                            Staff will be required to use this new password on their next login.
                        </p>
                    </div>
                </form>

                <div className="p-4 md:p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-center gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={handleModalClose} 
                        className="w-full md:w-auto px-10 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black text-[11px] uppercase tracking-widest order-2 md:order-1 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={processing} 
                        className="w-full md:w-auto px-12 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 order-1 md:order-2 transition-all"
                    >
                        {processing ? 'Saving...' : 'Update Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}