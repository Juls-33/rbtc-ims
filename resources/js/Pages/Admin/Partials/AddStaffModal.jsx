// resources/js/Pages/Admin/Partials/AddStaffModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Toast from '@/Components/Toast'; 

export default function AddStaffModal({ isOpen, onClose, initialRole }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        role: '',
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        gender: '',
        address: '', 
        password: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    // Sync role based on tab source
    useEffect(() => {
        if (isOpen) {
            const roleMap = {
                'doctors': 'Doctor',
                'nurses': 'Nurse',
                'admins': 'Admin'
            };
            setData('role', roleMap[initialRole] || '');
        }
    }, [isOpen, initialRole]);

    // --- Passive Validation ---
    const validate = () => {
        let isValid = true;
        clearErrors();

        const requiredFields = ['role', 'first_name', 'last_name', 'email', 'contact_number', 'gender', 'address', 'password'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                setError(field, 'Required field.');
                isValid = false;
            }
        });

        if (data.contact_number && data.contact_number.length !== 11) {
            setError('contact_number', 'Must be exactly 11 digits.');
            isValid = false;
        }

        // Basic Email Regex
        if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
            setError('email', 'Invalid email format.');
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
        if (validate()) {
            post(route('admin.staff.store'), { 
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Staff Member Created Successfully!', type: 'success' });
                    handleModalClose();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Submission Failed. Check inputs.', type: 'error' });
                },
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, current, max, required = true, fieldError }) => (
        <div className="flex justify-between items-center mb-1">
            <label className={`text-[10px] font-black uppercase tracking-tighter ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600 font-bold">*</span>}
            </label>
            {max && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    return (
        <>
            {/* Toast remains visible after modal close */}
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all animate-in zoom-in duration-200">
                        
                        {/* Fixed Header */}
                        <div className="bg-[#3D52A0] px-6 py-4 flex justify-between items-center text-white shrink-0 shadow-md">
                            <div>
                                <h2 className="font-black text-lg tracking-tight uppercase">Staff Registration</h2>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest">Personnel Credential Setup</p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl font-bold hover:text-gray-200 leading-none">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden text-slate-800">
                            <div className="p-8 space-y-6 overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-slate-300">
                                
                                {/* 1. Role and Gender */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="Assigned Role" fieldError={errors.role} />
                                        <select value={data.role} onChange={e => setData('role', e.target.value)} className={inputClass(errors.role)}>
                                            <option value="">Select Role</option>
                                            <option value="Doctor">Doctor</option>
                                            <option value="Nurse">Nurse</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label text="Sex" fieldError={errors.gender} />
                                        <select value={data.gender} onChange={e => setData('gender', e.target.value)} className={inputClass(errors.gender)}>
                                            <option value="">Select Sex</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 2. Name Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="First Name" current={data.first_name.length} max={100} fieldError={errors.first_name} />
                                        <input 
                                            type="text" 
                                            maxLength={100}
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            className={inputClass(errors.first_name)}
                                            placeholder="Juan"
                                        />
                                        {errors.first_name && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <Label text="Last Name" current={data.last_name.length} max={100} fieldError={errors.last_name} />
                                        <input 
                                            type="text" 
                                            maxLength={100}
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            className={inputClass(errors.last_name)}
                                            placeholder="Dela Cruz"
                                        />
                                        {errors.last_name && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.last_name}</p>}
                                    </div>
                                </div>

                                {/* 3. Contact Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="Contact Number" current={data.contact_number.length} max={11} fieldError={errors.contact_number} />
                                        <input 
                                            type="text" 
                                            value={data.contact_number}
                                            onChange={e => setData('contact_number', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            className={inputClass(errors.contact_number)}
                                            placeholder="09171234567"
                                        />
                                        {errors.contact_number && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.contact_number}</p>}
                                    </div>
                                    <div>
                                        <Label text="Email Address" fieldError={errors.email} />
                                        <input 
                                            type="email" 
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className={inputClass(errors.email)}
                                            placeholder="juan@hospital.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* 4. Address */}
                                <div>
                                    <Label text="Residential Address" current={data.address.length} max={200} fieldError={errors.address} />
                                    <textarea 
                                        maxLength={200}
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        className={`${inputClass(errors.address)} h-20 resize-none`}
                                        placeholder="Street, Brgy, City"
                                    />
                                    {errors.address && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.address}</p>}
                                </div>

                                {/* 5. Password */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <Label text="Security: Temporary Password" fieldError={errors.password} />
                                    <input 
                                        type="password" 
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className={inputClass(errors.password)}
                                        placeholder="Min. 8 characters"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold">Staff must change this upon first login.</p>
                                    {errors.password && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.password}</p>}
                                </div>
                            </div>

                            {/* Fixed Footer Actions */}
                            <div className="bg-slate-100 px-8 py-4 flex justify-end gap-3 border-t shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                                <button type="button" onClick={handleModalClose} className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded font-black text-[11px] uppercase tracking-widest transition-all">Cancel</button>
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'SAVING...' : 'Register Staff'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}