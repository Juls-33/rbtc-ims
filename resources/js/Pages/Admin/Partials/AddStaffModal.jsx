// resources/js/Pages/Admin/Partials/AddStaffModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function AddStaffModal({ isOpen, onClose, initialRole }) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        role: '',
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        gender: '',
        address: '', // Captured from your previous error log
        password: '',
    });

    useEffect(() => {
        transform((data) => ({
            ...data,
            gender: data.gender === 'Prefer not to say' ? 'Other' : data.gender,
        }));
    }, [data.gender]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.staff.store'), { 
            onSuccess: () => {
                reset();
                onClose();
            },
            onError: (err) => console.log("Submission Failed:", err),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
                
                {/* Fixed Header */}
                <div className="bg-[#3D52A0] px-6 py-4 flex justify-between items-center text-white shrink-0">
                    <h2 className="font-semibold text-xl tracking-tight uppercase">Create New Staff Member</h2>
                    <button onClick={onClose} className="text-2xl font-bold hover:text-gray-200 leading-none">&times;</button>
                </div>

                {/* SCROLLABLE FORM BODY */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                    <div className="p-8 space-y-4 overflow-y-auto max-h-[65vh] scrollbar-thin scrollbar-thumb-slate-300">
                        {errors.error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                <p className="text-red-700 text-xs font-bold uppercase">{errors.error}</p>
                            </div>
                        )}

                        {/* Role Dropdown */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Role</label>
                            <select 
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="Doctor">Doctor</option>
                                <option value="Nurse">Nurse</option>
                                <option value="Admin">Admin</option>
                            </select>
                            {errors.role && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.role}</p>}
                        </div>

                        {/* Name Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                <input 
                                    type="text" 
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm"
                                    required
                                />
                                {errors.first_name && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                <input 
                                    type="text" 
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm"
                                    required
                                />
                                {errors.last_name && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.last_name}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                            <input 
                                type="email" 
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className="w-full border-slate-300 rounded-md text-sm"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.email}</p>}
                        </div>

                        {/* Contact and Gender */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                                <input 
                                    type="text" 
                                    value={data.contact_number}
                                    onChange={e => setData('contact_number', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm"
                                    required
                                />
                                {errors.contact_number && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.contact_number}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                                <select 
                                    value={data.gender}
                                    onChange={e => setData('gender', e.target.value)}
                                    className="w-full border-slate-300 rounded-md text-sm"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.gender}</p>}
                            </div>
                        </div>

                        {/* Address - Added from your previous fix */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Residential Address</label>
                            <textarea 
                                value={data.address}
                                onChange={e => setData('address', e.target.value)}
                                placeholder="House No., Street, Brgy, City"
                                className="w-full border-slate-300 rounded-md text-sm"
                                rows="2"
                                required
                            />
                            {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.address}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Temporary Password</label>
                            <input 
                                type="password" 
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                className="w-full border-slate-300 rounded-md text-sm"
                                required
                            />
                            {errors.password && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.password}</p>}
                        </div>
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="bg-slate-50 px-8 py-6 flex justify-center gap-4 border-t border-slate-100 shrink-0">
                        <Button type="button" variant="gray" onClick={onClose} className="w-32 py-3 bg-[#6B7A99] hover:bg-[#586681]">
                            CANCEL
                        </Button>
                        <Button 
                            type="submit"
                            variant="success" 
                            disabled={processing}
                            className="w-32 py-3 bg-[#5A9167] hover:bg-[#4a7a55]"
                        >
                            {processing ? 'SAVING...' : 'SAVE'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}