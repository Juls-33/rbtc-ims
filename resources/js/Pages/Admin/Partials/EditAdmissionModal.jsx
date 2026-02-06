// resources/js/Pages/Admin/Partials/EditAdmissionModal.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Toast from '@/Components/Toast'; 

export default function EditAdmissionModal({ isOpen, onClose, admission, doctors = [], rooms = [] }) {
    const { data, setData, put, processing, errors, reset, setError, clearErrors } = useForm({
        admission_date: '',
        staff_id: '',
        diagnosis: '',
        room_id: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);

    // --- Data Loading Logic ---
    useEffect(() => {
        if (admission && isOpen) {
            setData({
                // Ensure we convert IDs to strings if they are numbers for select consistency
                admission_date: admission.admission_date || '',
                staff_id: admission.staff_id ? String(admission.staff_id) : '',
                diagnosis: admission.diagnosis || '',
                room_id: admission.room_id?.toString() || '',
            });
        }
    }, [admission, isOpen]);

    // --- Passive Validation ---
    const validate = () => {
        let isValid = true;
        clearErrors();

        const requiredFields = ['admission_date', 'staff_id', 'diagnosis', 'room_id'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                setError(field, 'Required field.');
                isValid = false;
            }
        });

        if (data.diagnosis.length > 250) {
            setError('diagnosis', 'Maximum of 250 characters.');
            isValid = false;
        }

        if (data.admission_date) {
            const selectedDate = new Date(data.admission_date);
            if (selectedDate > now) {
                setError('admission_date', 'Admission cannot be in the future.');
                isValid = false;
            }
        }

        return isValid;
    };

    const handleModalClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        if (!admission?.id) return;

        if (validate()) {
            put(route('admin.admissions.update', admission.id), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Admission details updated!', type: 'success' });
                    handleModalClose();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Failed to update. Check errors.', type: 'error' });
                }
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors bg-white ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, current, max, required = true, fieldError }) => (
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
            {/* Render Toast outside the isOpen check so it persists after closing */}
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Edit Admission</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">
                                    Patient: {admission?.patient_name || 'N/A'}
                                </p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-rose-200 transition-colors">&times;</button>
                        </div>

                        <form onSubmit={submit} className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                                    <h4 className="font-black text-slate-700 text-[11px] uppercase tracking-wider">1. Admission Details</h4>
                                    <span className="text-[8px] font-bold text-red-500 uppercase">Required</span>
                                </div>

                                <div>
                                    <Label text="Admission Date/Time" fieldError={errors.admission_date} />
                                    <input 
                                        type="datetime-local" 
                                        max={currentDateTime}
                                        value={data.admission_date} 
                                        onChange={e => setData('admission_date', e.target.value)} 
                                        className={inputClass(errors.admission_date)} 
                                    />
                                    {errors.admission_date && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.admission_date}</p>}
                                </div>

                                <div>
                                    <Label text="Attending Physician" fieldError={errors.staff_id} />
                                    <select 
                                        value={data.staff_id} 
                                        onChange={e => setData('staff_id', e.target.value)} 
                                        className={inputClass(errors.staff_id)}
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id.toString()}>
                                                Dr. {doc.first_name} {doc.last_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.staff_id && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.staff_id}</p>}
                                </div>

                                <div>
                                    <Label text="Diagnosis / Consult Reason" current={data.diagnosis.length} max={250} fieldError={errors.diagnosis} />
                                    <textarea 
                                        maxLength={250}
                                        value={data.diagnosis} 
                                        onChange={e => setData('diagnosis', e.target.value)} 
                                        className={`${inputClass(errors.diagnosis)} h-24 resize-none`} 
                                        placeholder="Reason for stay..."
                                    />
                                    {errors.diagnosis && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.diagnosis}</p>}
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-slate-100">
                                <h4 className="font-black text-slate-700 text-[11px] uppercase tracking-wider">2. Location of Stay</h4>
                                <div>
                                    <Label text="Assign Room" fieldError={errors.room_id} />
                                    <select 
                                        value={data.room_id} 
                                        onChange={e => setData('room_id', e.target.value)} 
                                        className={inputClass(errors.room_id)}
                                    >
                                        <option value="">Select Room</option>
                                        {rooms.map(room => (
                                            <option key={room.id} value={room.id.toString()}>
                                                {room.room_location} ({room.status})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.room_id && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.room_id}</p>}
                                </div>
                            </div>
                        </form>

                        <div className="p-4 bg-slate-100 border-t flex justify-end gap-3">
                            <button type="button" onClick={handleModalClose} className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all">Cancel</button>
                            <button 
                                onClick={submit} 
                                disabled={processing} 
                                className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] uppercase tracking-widest shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {processing ? 'Updating...' : 'Update Admission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}