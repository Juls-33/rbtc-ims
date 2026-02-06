// resources/js/Pages/Admin/Partials/EditStaffModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 
import DeleteStaffModal from './DeleteStaffModal';

export default function EditStaffModal({ isOpen, onClose, member }) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    
    const isDefaultAdmin = member?.email === 'admin@rbtc.com';

    const { data, setData, put, processing, errors, reset, setError, clearErrors } = useForm({
        role: '',
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        gender: '',
        address: '', // Ensuring parity with AddStaff
    });

    // --- Data Loading ---
    useEffect(() => {
        if (member && isOpen) {
            setData({
                role: member.role || '',
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                email: member.email || '',
                contact_number: member.phone || member.contact_number || '',
                gender: member.gender || 'Male',
                address: member.address || '',
            });
        }
    }, [member, isOpen]);

    // --- Passive Validation ---
    const validate = () => {
        let isValid = true;
        clearErrors();

        const required = ['role', 'first_name', 'last_name', 'email', 'contact_number', 'gender', 'address'];
        required.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                setError(field, 'Required field.');
                isValid = false;
            }
        });

        if (data.contact_number && data.contact_number.length !== 11) {
            setError('contact_number', 'Must be exactly 11 digits.');
            isValid = false;
        }

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
        if (!member?.id) return;

        if (validate()) {
            put(route('admin.staff.update', member.id), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Personnel Record Updated!', type: 'success' });
                    handleModalClose();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Update failed. Check inputs.', type: 'error' });
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
            {max && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    return (
        <>
            {/* Toast remains visible after modal disappears */}
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all animate-in zoom-in duration-200 max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Edit Staff Record</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">
                                    Personnel ID: {member?.staff_id || member?.id_no || '---'}
                                </p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-rose-200 transition-colors">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden text-slate-800">
                            <div className="p-8 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
                                
                                {/* 1. Role and Gender */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="Assigned Role" fieldError={errors.role} />
                                        <select value={data.role} onChange={e => setData('role', e.target.value)} className={inputClass(errors.role)}>
                                            <option value="Doctor">Doctor</option>
                                            <option value="Nurse">Nurse</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label text="Sex" fieldError={errors.gender} />
                                        <select value={data.gender} onChange={e => setData('gender', e.target.value)} className={inputClass(errors.gender)}>
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
                                        />
                                        {errors.last_name && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.last_name}</p>}
                                    </div>
                                </div>

                                {/* 3. Email and Contact */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label text="Email Address" fieldError={errors.email} />
                                        <input 
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className={inputClass(errors.email)}
                                        />
                                        {errors.email && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <Label text="Contact Number" current={data.contact_number.length} max={11} fieldError={errors.contact_number} />
                                        <input 
                                            type="text"
                                            value={data.contact_number}
                                            onChange={e => setData('contact_number', e.target.value.replace(/\D/g, '').slice(0, 11))}
                                            className={inputClass(errors.contact_number)}
                                        />
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

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 pt-6 border-t">
                                    <div className="flex justify-end gap-3">
                                        <Button type="button" variant="secondary" onClick={handleModalClose} className="px-6 py-2 bg-slate-500 text-white font-bold text-[11px] uppercase tracking-widest">Cancel</Button>
                                        <Button 
                                            type="submit" 
                                            variant="success" 
                                            disabled={processing} 
                                            className="px-8 py-2 bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-widest shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                            {processing ? 'SAVING...' : 'SAVE CHANGES'}
                                        </Button>
                                    </div>

                                    {!isDefaultAdmin && (
                                        <button 
                                            type="button" 
                                            onClick={() => setIsDeleteOpen(true)} 
                                            className="w-full py-2 mt-2 text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-100 hover:bg-red-50 rounded transition-colors"
                                        >
                                            Terminate Personnel Account
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteStaffModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                member={member} 
            />
        </>
    );
}