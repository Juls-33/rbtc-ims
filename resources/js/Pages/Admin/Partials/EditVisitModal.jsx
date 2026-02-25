// resources/js/Pages/Admin/Partials/EditVisitModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function EditVisitModal({ isOpen, onClose, visit, onSuccess, onError }) {
    const { data, setData, put, processing, reset, errors, setError, clearErrors } = useForm({
        visit_date: '',
        weight: '',
        reason: '',
    });

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (visit && isOpen) {
            setData({
                visit_date: visit.date || '',
                weight: visit.weight?.toString().replace('KG', '') || '',
                reason: visit.reason || '',
            });
        }
    }, [visit, isOpen]);

    const handleModalClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const validate = () => {
        let isValid = true;
        clearErrors();

        if (!data.visit_date) {
            setError('visit_date', 'Visit date is required.');
            isValid = false;
        }

        if (!data.reason || data.reason.trim() === '') {
            setError('reason', 'Reason for visit is required.');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!visit?.id) return;

        if (validate()) {
            put(route('admin.visits.update', visit.id), {
                onSuccess: () => {
                    if (onSuccess) onSuccess('Visit record updated successfully!');
                    handleModalClose();
                },
                onError: () => {
                    if (onError) onError('Update failed. Please check the red fields.');
                }
            });
        }
    };

    // 🔥 Red Glow Error Handler (Standardized)
    const inputClass = (error) => `w-full border rounded-lg px-4 py-3 md:py-2 text-sm transition-all outline-none ${
        error 
            ? 'bg-red-50 !border-red-500 ring-2 ring-red-200 focus:!border-red-600' 
            : 'bg-white border-slate-300 focus:border-[#3D52A0] focus:ring-2 focus:ring-blue-100'
    }`;

    const Label = ({ text, current, max, required = false, fieldError }) => (
        <div className="flex justify-between items-center mb-1.5 px-1">
            <label className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600">*</span>}
            </label>
            {max && current > 0 && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
                
                {/* Responsive Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shadow-lg shrink-0">
                    <div>
                        <h3 className="font-black text-sm md:text-lg uppercase tracking-tight leading-none">Edit Visit Details</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mt-1.5">
                            REF: {visit?.visit_id || 'N/A'}
                        </p>
                    </div>
                    <button 
                        onClick={handleModalClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl leading-none"
                    >&times;</button>
                </div>

                {/* Form Body - Scrollable */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1 text-slate-800">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Visit Date */}
                        <div className="space-y-1">
                            <Label text="Date of Visit" required fieldError={errors.visit_date} />
                            <input 
                                type="date" 
                                max={today}
                                value={data.visit_date} 
                                onChange={e => setData('visit_date', e.target.value)} 
                                className={inputClass(errors.visit_date)} 
                            />
                            {errors.visit_date && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase">{errors.visit_date}</p>}
                        </div>

                        {/* Weight */}
                        <div className="space-y-1">
                            <Label text="Weight (KG)" fieldError={errors.weight} />
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="0.0"
                                value={data.weight} 
                                onChange={e => setData('weight', e.target.value)} 
                                className={inputClass(errors.weight)} 
                            />
                            {errors.weight && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase">{errors.weight}</p>}
                        </div>
                    </div>

                    {/* Reason for Visit */}
                    <div className="space-y-1">
                        <Label text="Reason / Clinical Findings" current={data.reason.length} max={250} required fieldError={errors.reason} />
                        <textarea 
                            maxLength={250}
                            value={data.reason} 
                            onChange={e => setData('reason', e.target.value)} 
                            className={`${inputClass(errors.reason)} h-32 resize-none`} 
                            placeholder="Update consultation notes..."
                        />
                        {errors.reason && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase">{errors.reason}</p>}
                    </div>
                </form>

                {/* 🔥 RESPONSIVE ACTIONS: Stacked on Mobile */}
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
                        className="w-full md:w-auto px-12 py-3 bg-[#488D6A] hover:bg-[#3B7557] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 order-1 md:order-2 transition-all"
                    >
                        {processing ? 'Processing...' : 'Update Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}