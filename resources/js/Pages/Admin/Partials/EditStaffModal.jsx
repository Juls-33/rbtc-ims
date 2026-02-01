// resources/js/Pages/Admin/Partials/EditStaffModal.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteStaffModal from './DeleteStaffModal';
import DeactivateStaffModal from './DeactivateStaffModal';

export default function EditStaffModal({ isOpen, onClose, member }) {
    // 1. STATE FOR SUB-MODALS
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const isDefaultAdmin = member?.email === 'admin@rbtc.com';

    const { data, setData, put, processing, errors, reset } = useForm({
        role: '',
        first_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        gender: '',
    });

    // Sync data when member is passed from the table
    useEffect(() => {
        if (member) {
            setData({
                role: member.role || '',
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                email: member.email || '',
                contact_number: member.phone || '',
                gender: member.gender || 'Male',
            });
        }
    }, [member, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.staff.update', member.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 font-sans">
                <div className="bg-white rounded shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                    {/* Header matches image_5b5c89.png */}
                    <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Edit Staff: {member?.name}</h3>
                        <button onClick={onClose} className="text-2xl hover:text-rose-200">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Select Role</label>
                            <select 
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                            >
                                <option value="Doctor">Doctor</option>
                                <option value="Nurse">Nurse</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                <input 
                                    type="text"
                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                    value={data.first_name}
                                    onChange={e => setData('first_name', e.target.value)}
                                />
                                {errors.first_name && <p className="text-rose-600 text-xs mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                <input 
                                    type="text"
                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                    value={data.last_name}
                                    onChange={e => setData('last_name', e.target.value)}
                                />
                                {errors.last_name && <p className="text-rose-600 text-xs mt-1">{errors.last_name}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                            <input 
                                type="email"
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Contact Number</label>
                            <input 
                                type="text"
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                value={data.contact_number}
                                onChange={e => setData('contact_number', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Gender</label>
                            <select 
                                className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                value={data.gender}
                                onChange={e => setData('gender', e.target.value)}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>

                        {/* Action Buttons match image_5b5c89.png */}
                        <div className="flex justify-center gap-3 mt-8">
                            <Button type="button" variant="secondary" onClick={onClose} className="px-6 py-2">CANCEL</Button>
                            <Button type="submit" variant="success" disabled={processing} className="px-6 py-2">
                                {processing ? 'SAVING...' : 'SAVE'}
                            </Button>
                            {!isDefaultAdmin && (
                                <Button 
                                    type="button" 
                                    variant="danger" 
                                    onClick={() => setIsDeleteOpen(true)} 
                                    className="px-6 py-2"
                                >
                                    DELETE ACCOUNT
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <DeleteStaffModal 
                isOpen={isDeleteOpen} 
                onClose={() => setIsDeleteOpen(false)} 
                member={member} 
            />
        </>
    );
}