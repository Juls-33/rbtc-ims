// resources/js/Pages/Admin/Partials/ResetStaffPasswordModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function ResetStaffPasswordModal({ isOpen, onClose, member }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.staff.reset-password', member.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/50 p-4 font-sans text-slate-800">
            <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                {/* Header matches image_506c3f.png */}
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-center w-full">
                        Reset Password for {member?.name}
                    </h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200 absolute right-4">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wider text-center">Reset Password</p>
                        
                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-700">New Password</label>
                            <input 
                                type="password"
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                            {errors.password && <p className="text-rose-600 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-bold text-slate-700">Confirm Password</label>
                            <input 
                                type="password"
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} className="px-10 py-2">
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            variant="success" 
                            disabled={processing} 
                            className="px-10 py-2"
                        >
                            {processing ? 'SAVING...' : 'SAVE'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}