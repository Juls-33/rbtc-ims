import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function DeleteAdmissionModal({ isOpen, onClose, admissionId, onSuccess }) {
    const { data, setData, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        password: '',
        reason: '',
    });

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        // Pointing to your admin.admissions.destroy route
        destroy(route('admin.admissions.destroy', admissionId), {
            onSuccess: () => {
                if (onSuccess) onSuccess('Admission record wiped successfully.');
                handleClose();
            },
            preserveScroll: true,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-rose-100 transform animate-in zoom-in duration-150">
                
                {/* Header */}
                <div className="bg-rose-600 text-white p-5 flex justify-between items-center shadow-lg">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight">Confirm Deletion</h3>
                        <p className="text-[10px] text-rose-100 uppercase font-bold tracking-widest">Security Authorization Required</p>
                    </div>
                    <button onClick={handleClose} className="text-2xl hover:text-rose-200 transition-colors leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5 text-slate-800">
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg">
                        <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                            <strong>Warning:</strong> This will permanently delete the admission record, remove the 6-month billing cycle, and set the room back to "Available".
                        </p>
                    </div>

                    {/* Reason Field */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1.5 px-1">Reason for Deletion</label>
                        <textarea 
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            className="w-full border-slate-300 rounded-lg text-sm h-20 resize-none focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm"
                            placeholder="Why is this record being removed? (e.g., Duplicate entry)"
                        />
                        {errors.reason && <p className="text-rose-600 text-[10px] font-bold mt-1.5 uppercase italic">{errors.reason}</p>}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1.5 px-1">Verify Admin Password</label>
                        <input 
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full border-slate-300 rounded-lg text-sm focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm"
                            placeholder="Enter your password"
                        />
                        {errors.password && <p className="text-rose-600 text-[10px] font-bold mt-1.5 uppercase italic">{errors.password}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-black text-[11px] uppercase tracking-widest transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={processing || !data.reason || !data.password}
                            className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {processing ? 'Processing...' : 'Confirm Delete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}