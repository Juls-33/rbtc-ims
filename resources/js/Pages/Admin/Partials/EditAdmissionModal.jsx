import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function EditAdmissionModal({ isOpen, onClose, admission, doctors = [], rooms = [], onSuccess }) {
    const { data, setData, put, processing, errors, reset, setError, clearErrors } = useForm({
        admission_date: '',
        staff_id: '',
        diagnosis: '',
        room_id: '',
    });

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);

    useEffect(() => {
        if (admission && isOpen) {
            setData({
                admission_date: admission.admission_date || '',
                staff_id: admission.staff_id ? String(admission.staff_id) : '',
                diagnosis: admission.diagnosis || '',
                room_id: admission.room_id?.toString() || '',
            });
        }
    }, [admission, isOpen]);

    const validate = () => {
        let isValid = true;
        clearErrors();

        if (!data.admission_date) {
            setError('admission_date', 'Admission date is required.');
            isValid = false;
        } else if (new Date(data.admission_date) > now) {
            setError('admission_date', 'Admission cannot be in the future.');
            isValid = false;
        }

        if (!data.staff_id) {
            setError('staff_id', 'Physician is required.');
            isValid = false;
        }

        if (!data.diagnosis || data.diagnosis.trim() === '') {
            setError('diagnosis', 'Diagnosis is required.');
            isValid = false;
        }

        if (!data.room_id) {
            setError('room_id', 'Room assignment is required.');
            isValid = false;
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
                    if (onSuccess) onSuccess('Admission details updated successfully!');
                    handleModalClose();
                },
                onError: (errs) => {
                    if (onError) onError('Failed to update. Please check the red fields.');
                }
            });
        }
    };

    const inputClass = (error) => `w-full border rounded-lg px-4 py-3 md:py-2 text-sm transition-all outline-none ${
        error 
            ? 'bg-red-50 !border-red-500 ring-2 ring-red-500/20 focus:!border-red-600' 
            : 'bg-white border-slate-300 focus:border-[#3D52A0] focus:ring-2 focus:ring-[#3D52A0]/10'
    }`;
    const Label = ({ text, current, max, required = true, fieldError }) => (
        <div className="flex justify-between items-center mb-1.5 px-1">
            <label className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${fieldError ? 'text-red-600' : 'text-slate-500'}`}>
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
                
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shrink-0 shadow-lg">
                    <div className="space-y-0.5">
                        <h3 className="font-black text-sm md:text-lg uppercase tracking-tight">Edit Admission Record</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest">
                            Patient: {admission?.patient_name || 'N/A'}
                        </p>
                    </div>
                    <button onClick={handleModalClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="p-5 md:p-8 overflow-y-auto space-y-6 flex-1 no-scrollbar">
                    
                    <div className="space-y-5">
                        <div>
                            <Label text="Admission Date/Time" fieldError={errors.admission_date} />
                            <input 
                                type="datetime-local" 
                                max={currentDateTime}
                                value={data.admission_date} 
                                onChange={e => setData('admission_date', e.target.value)} 
                                className={inputClass(errors.admission_date)} 
                            />
                            {errors.admission_date && <p className="text-red-600 text-[10px] mt-1.5 font-black italic uppercase">{errors.admission_date}</p>}
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
                            {errors.staff_id && <p className="text-red-600 text-[10px] mt-1.5 font-black italic uppercase">{errors.staff_id}</p>}
                        </div>

                        <div>
                            <Label text="Initial Diagnosis" current={data.diagnosis.length} max={250} fieldError={errors.diagnosis} />
                            <textarea 
                                maxLength={250}
                                value={data.diagnosis} 
                                onChange={e => setData('diagnosis', e.target.value)} 
                                className={`${inputClass(errors.diagnosis)} h-28 resize-none`} 
                                placeholder="Reason for stay..."
                            />
                            {errors.diagnosis && <p className="text-red-600 text-[10px] mt-1.5 font-black italic uppercase">{errors.diagnosis}</p>}
                        </div>

                        <div>
                            <Label text="Assign Room" fieldError={errors.room_id} />
                            <select 
                                value={data.room_id} 
                                onChange={e => setData('room_id', e.target.value)} 
                                className={inputClass(errors.room_id)}
                            >
                                <option value="">Select Location</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id.toString()}>
                                        {room.room_location} ({room.status})
                                    </option>
                                ))}
                            </select>
                            {errors.room_id && <p className="text-red-600 text-[10px] mt-1.5 font-black italic uppercase">{errors.room_id}</p>}
                        </div>
                    </div>
                </form>

                <div className="p-4 md:p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-end gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={handleModalClose} 
                        className="w-full md:w-auto px-8 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-black text-[11px] uppercase tracking-widest order-2 md:order-1"
                    >Cancel</button>
                    <button 
                        onClick={submit} 
                        disabled={processing} 
                        className="w-full md:w-auto px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 order-1 md:order-2"
                    >
                        {processing ? 'Processing...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}