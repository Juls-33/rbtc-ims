// resources/js/Pages/Admin/Partials/EditVisitModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Toast from '@/Components/Toast'; 

export default function EditVisitModal({ isOpen, onClose, visit }) {
    const { data, setData, put, processing, reset, errors, setError, clearErrors } = useForm({
        visit_date: '',
        weight: '',
        reason: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    const today = new Date().toISOString().split('T')[0];

    // Pre-fill data when a visit is selected or modal opens
    useEffect(() => {
        if (visit && isOpen) {
            setData({
                visit_date: visit.date || '',
                weight: visit.weight?.toString().replace('KG', '') || '',
                reason: visit.reason || '',
            });
        }
    }, [visit, isOpen]);

    // --- Passive Validation ---
    const validate = () => {
        let isValid = true;
        clearErrors();

        if (!data.visit_date) {
            setError('visit_date', 'Visit date is required.');
            isValid = false;
        } else if (new Date(data.visit_date) > new Date()) {
            setError('visit_date', 'Visit date cannot be in the future.');
            isValid = false;
        }

        if (!data.reason || data.reason.trim() === '') {
            setError('reason', 'Reason for visit is required.');
            isValid = false;
        } else if (data.reason.length > 250) {
            setError('reason', 'Maximum 250 characters only.');
            isValid = false;
        }

        if (data.weight && parseFloat(data.weight) <= 0) {
            setError('weight', 'Weight must be a positive number.');
            isValid = false;
        }

        return isValid;
    };

    const handleModalClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!visit?.id) return;

        if (validate()) {
            put(route('admin.visits.update', visit.id), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Visit record updated!', type: 'success' });
                    handleModalClose();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Update failed. Check errors.', type: 'error' });
                }
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors bg-white ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, current, max, required = false, fieldError }) => (
        <div className="flex justify-between items-center mb-1">
            <label className={`text-[10px] font-black uppercase tracking-tighter ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600 font-bold">*</span>}
            </label>
            {max && current > 0 && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    return (
        <>
            {/* Persistent Toast: Sits outside the modal guard */}
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        
                        {/* Header */}
                        <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Edit Visit Record</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">Consultation ID: {visit?.visit_id || '---'}</p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-slate-200 transition-colors">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label text="Visit Date" required fieldError={errors.visit_date} />
                                    <input 
                                        type="date" 
                                        max={today}
                                        value={data.visit_date} 
                                        onChange={e => setData('visit_date', e.target.value)} 
                                        className={inputClass(errors.visit_date)} 
                                    />
                                    {errors.visit_date && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.visit_date}</p>}
                                </div>
                                <div>
                                    <Label text="Weight (KG)" fieldError={errors.weight} />
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="0.0"
                                        value={data.weight} 
                                        onChange={e => setData('weight', e.target.value)} 
                                        className={inputClass(errors.weight)} 
                                    />
                                    {errors.weight && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.weight}</p>}
                                </div>
                            </div>

                            <div>
                                <Label text="Reason for Visit" current={data.reason.length} max={250} required fieldError={errors.reason} />
                                <textarea 
                                    maxLength={250}
                                    value={data.reason} 
                                    onChange={e => setData('reason', e.target.value)} 
                                    className={`${inputClass(errors.reason)} h-24 resize-none`} 
                                    placeholder="Update findings or reason..."
                                />
                                {errors.reason && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.reason}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={handleModalClose} className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-8 py-2 bg-[#488D6A] hover:bg-[#3B7557] text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Visit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}