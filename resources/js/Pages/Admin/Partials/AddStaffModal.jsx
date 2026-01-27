import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function AddStaffModal({ isOpen, onClose, initialRole }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        role: '',
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        gender: '',
        password: '',
    });

    // Auto-select role based on the active tab when modal opens
    useEffect(() => {
        if (isOpen) {
            const roleMap = {
                'doctors': 'Doctor',
                'nurses': 'Nurse',
                'admins': 'Admin'
            };
            // Set to the mapped role if it exists, otherwise leave empty for "All Staff" tab
            setData('role', roleMap[initialRole] || '');
        }
    }, [isOpen, initialRole]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Updated to use the correct route name verified in previous steps
        post(route('admin.staff.store'), { 
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                
                {/* Header */}
                <div className="bg-[#3D52A0] px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white font-semibold text-xl tracking-tight">Create New Staff Member</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    {/* Role Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Role</label>
                        <select 
                            value={data.role}
                            onChange={e => setData('role', e.target.value)}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] text-sm"
                            required
                        >
                            <option value="">Doctor | Nurse | Admin</option>
                            <option value="Doctor">Doctor</option>
                            <option value="Nurse">Nurse</option>
                            <option value="Admin">Admin</option>
                        </select>
                        {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                    </div>

                    {/* Name Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                            <input 
                                type="text" 
                                value={data.first_name}
                                onChange={e => setData('first_name', e.target.value)}
                                placeholder="Enter first name"
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                            <input 
                                type="text" 
                                value={data.last_name}
                                onChange={e => setData('last_name', e.target.value)}
                                placeholder="Enter last name"
                                className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <input 
                            type="email" 
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="staff@example.com"
                            className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                            required
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Contact Number */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                        <input 
                            type="text" 
                            value={data.contact_number}
                            onChange={e => setData('contact_number', e.target.value)}
                            placeholder="09XX-XXX-XXXX"
                            className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                            required
                        />
                    </div>

                    {/* Gender Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender</label>
                        <select 
                            value={data.gender}
                            onChange={e => setData('gender', e.target.value)}
                            className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] text-sm"
                            required
                        >
                            <option value="">Male | Female | Prefer not to say</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>

                    {/* Temporary Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Temporary Password</label>
                        <input 
                            type="text" 
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            placeholder="Set initial password"
                            className="w-full border-slate-300 rounded-md shadow-sm text-sm"
                            required
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-center gap-4 pt-6">
                        <Button 
                            variant="gray" 
                            onClick={onClose}
                            className="w-32 py-3 bg-[#6B7A99] hover:bg-[#586681]"
                        >
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