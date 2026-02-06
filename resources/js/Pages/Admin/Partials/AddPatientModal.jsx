import React, { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function AddPatientModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        civil_status: '',
        contact_no: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_relation: '',
        emergency_contact_number: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const today = new Date().toISOString().split('T')[0];

    const validate = () => {
        let isValid = true;
        clearErrors();

        const requiredFields = ['first_name', 'last_name', 'birth_date', 'gender', 'civil_status', 'contact_no', 'address'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                setError(field, 'This field is required.');
                isValid = false;
            }
        });

        if (data.contact_no && data.contact_no.length !== 11) {
            setError('contact_no', 'Must be exactly 11 digits.');
            isValid = false;
        }

        if (data.birth_date) {
            const birth = new Date(data.birth_date);
            const now = new Date();
            const minDate = new Date();
            minDate.setFullYear(now.getFullYear() - 120);

            if (birth > now) {
                setError('birth_date', 'Date cannot be in the future.');
                isValid = false;
            } else if (birth < minDate) {
                setError('birth_date', 'Limit: 120 years old.');
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
        if (validate()) {
            post(route('admin.patients.store'), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Patient Successfully Registered!', type: 'success' });
                    handleModalClose(); 
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Registration Failed. Please check errors.', type: 'error' });
                }
            });
        }
    };

    const agePreview = useMemo(() => {
        if (!data.birth_date || isNaN(new Date(data.birth_date))) return null;
        const birth = new Date(data.birth_date);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
        if (age < 0 || age > 150) return null;
        return `${age} yrs old`;
    }, [data.birth_date]);

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
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
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Register New Patient</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">Clinical Personnel Entry</p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-slate-200  transition-colors">&times;</button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={submit} className="p-6 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                                    <h4 className="font-black text-slate-700 text-[11px] uppercase tracking-wider text-opacity-80">1. Required Information</h4>
                                    <span className="text-[8px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">Mandatory</span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="First Name" current={data.first_name.length} max={100} required fieldError={errors.first_name} />
                                        <input type="text" value={data.first_name} maxLength={100}onChange={e => setData('first_name', e.target.value)} className={inputClass(errors.first_name)} placeholder="Juan" />
                                        {errors.first_name && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <Label text="Last Name" current={data.last_name.length} max={50} required fieldError={errors.last_name} />
                                        <input type="text" value={data.last_name} maxLength={50} onChange={e => setData('last_name', e.target.value)} className={inputClass(errors.last_name)} placeholder="Dela Cruz" />
                                        {errors.last_name && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.last_name}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className={`text-[10px] font-black uppercase tracking-tighter ${errors.birth_date ? 'text-red-500' : 'text-slate-500'}`}>
                                                Date of Birth <span className="text-red-600 font-bold">*</span>
                                            </label>
                                            {agePreview && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 rounded-full">{agePreview}</span>}
                                        </div>
                                        <input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className={inputClass(errors.birth_date)} />
                                        {errors.birth_date && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.birth_date}</p>}
                                    </div>
                                    <div>
                                        <Label text="Sex" required fieldError={errors.gender} />
                                        <select value={data.gender} onChange={e => setData('gender', e.target.value)} className={inputClass(errors.gender)}>
                                            <option value="">Select Sex</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="Civil Status" required fieldError={errors.civil_status} />
                                        <select value={data.civil_status} onChange={e => setData('civil_status', e.target.value)} className={inputClass(errors.civil_status)}>
                                            <option value="">Select Status</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label text="Phone Number" current={data.contact_no.length} max={11} required fieldError={errors.contact_no} />
                                        <input type="text" value={data.contact_no} onChange={e => setData('contact_no', e.target.value.replace(/\D/g, '').slice(0, 11))} className={inputClass(errors.contact_no)} placeholder="09171234567" />
                                        {errors.contact_no && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.contact_no}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label text="Home Address"  current={data.address.length} max={200} required fieldError={errors.address} />
                                    <input type="text" value={data.address} maxLength={200} onChange={e => setData('address', e.target.value)} className={inputClass(errors.address)} placeholder="Street, Brgy, City" />
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                    <h4 className="font-black text-slate-700 text-[11px] uppercase tracking-wider text-opacity-80">2. Emergency Contact</h4>
                                    <span className="text-[8px] font-bold text-slate-400 border border-slate-200 bg-white px-2 py-0.5 rounded uppercase tracking-tighter">Optional</span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <Label text="Contact Person" current={data.emergency_contact_name.length} max={150} />
                                        <input type="text" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} className={inputClass()} placeholder="Maria Clara" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label text="Relationship" current={data.emergency_contact_relation.length} max={50} />
                                            <input type="text" value={data.emergency_contact_relation} onChange={e => setData('emergency_contact_relation', e.target.value)} className={inputClass()} placeholder="Spouse" />
                                        </div>
                                        <div>
                                            <Label text="Contact Number" current={data.emergency_contact_number.length} max={11} />
                                            <input type="text" value={data.emergency_contact_number} onChange={e => setData('emergency_contact_number', e.target.value.replace(/\D/g, '').slice(0, 11))} className={inputClass()} placeholder="09177654321" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {/* Footer Actions */}
                        <div className="p-4 bg-slate-100 border-t flex justify-end gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                            <button onClick={handleModalClose} className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all">Cancel</button>
                            <button onClick={submit} disabled={processing} className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50">
                                {processing ? 'Registering...' : 'Register Patient'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}