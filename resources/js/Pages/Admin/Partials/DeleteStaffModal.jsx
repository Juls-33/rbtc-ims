// resources/js/Pages/Admin/Partials/DeleteStaffModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function DeleteStaffModal({ isOpen, onClose, member }) {
    const { data, setData, delete: destroy, processing, reset } = useForm({
        reason: 'Duplicate', // Matches mockup default
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        destroy(route('admin.staff.destroy', member.id), {
            data: { reason: data.reason },
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 font-sans text-slate-800">
            <div className="bg-white rounded shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                {/* Red Header */}
                <div className="bg-[#C84B4B] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Permanently Delete Account?</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm">Are you sure you want to permanently delete the account of: <br/> 
                           <span className="font-bold">{member?.name}?</span>
                        </p>
                        
                        <div className="text-sm space-y-2">
                            <p className="font-bold">Consequences:</p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>This user will no longer be able to log in to the system.</li>
                                <li>Their historical records (prescriptions, admissions) will be <span className="font-bold">deleted from the system</span></li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Reason for Deletion</label>
                            <select 
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#C84B4B] outline-none"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                            >
                                <option value="Duplicate">Duplicate</option>
                                <option value="Test">Test</option>
                                <option value="Data Retention Policy">Data Retention Policy</option>
                                <option value="Privacy Request">Privacy Request</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} className="px-10 py-2">
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            variant="danger" 
                            disabled={processing} 
                            className="px-6 py-2"
                        >
                            {processing ? 'DELETING...' : 'YES, PERMANENTLY DELETE ACCOUNT'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}