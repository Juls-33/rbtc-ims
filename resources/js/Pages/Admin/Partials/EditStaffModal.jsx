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
        address: '', 
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
                    // setToastInfo({ show: true, message: 'Personnel Record Updated!', type: 'success' });
                    // handleModalClose();
                },
                onError: (err) => {
                    const firstErrorMessage = Object.values(err)[0];
                    setToastInfo({ 
                        show: true, 
                        message: `Update Failed: ${firstErrorMessage}`, 
                        type: 'error' 
                    });
                }
            });
        } else {
            setToastInfo({ 
                show: true, 
                message: 'Please correct the highlighted errors.', 
                type: 'error' 
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error 
        ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
        : 'border-slate-300 focus:ring-[#E6AA68] focus:border-[#E6AA68] bg-white'
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
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
                    {/* CONTAINER: Flex Column for Mobile Scroll support */}
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in duration-200">
                        
                        {/* FIXED HEADER */}
                        <div className="bg-[#3D52A0] text-white p-4 md:px-6 md:py-4 flex justify-between items-center shrink-0 shadow-md">
                            <div>
                                <h3 className="font-black text-lg leading-none uppercase tracking-tight">Edit Staff Record</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">
                                    Personnel ID: {member?.staff_id || member?.id_no || '---'}
                                </p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-rose-200 transition-colors leading-none">&times;</button>
                        </div>

                        {/* SCROLLABLE BODY */}
                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden text-slate-800">
                            <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                                
                                {/* 1. Role and Gender - Responsive Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label text="First Name" current={data.first_name.length} max={100} fieldError={errors.first_name} />
                                        <input 
                                            type="text" 
                                            maxLength={100}
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            className={inputClass(errors.first_name)}
                                        />
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
                                    </div>
                                </div>

                                {/* 3. Email and Contact */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label text="Email Address" fieldError={errors.email} />
                                        <input 
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className={inputClass(errors.email)}
                                        />
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
                                </div>
                            </div>

                            {/* FIXED FOOTER */}
                            <div className="bg-slate-50 px-6 md:px-8 py-4 flex flex-col gap-3 border-t shrink-0">
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                    <Button 
                                        type="button" 
                                        variant="gray" 
                                        onClick={handleModalClose} 
                                        className="w-full sm:w-auto px-6 py-2.5 font-black text-[11px] uppercase tracking-widest"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="success" 
                                        disabled={processing} 
                                        className="w-full sm:w-auto px-8 py-2.5 bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest shadow-md active:scale-95"
                                    >
                                        {processing ? 'SAVING...' : 'SAVE CHANGES'}
                                    </Button>
                                </div>

                                {!isDefaultAdmin && (
                                    <button 
                                        type="button" 
                                        onClick={() => setIsDeleteOpen(true)} 
                                        className="w-full py-2.5 text-[10px] font-black text-rose-600 uppercase tracking-[0.15em] border border-rose-100 hover:bg-rose-50 rounded transition-all active:bg-rose-100"
                                    >
                                        Terminate Personnel Account
                                    </button>
                                )}
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