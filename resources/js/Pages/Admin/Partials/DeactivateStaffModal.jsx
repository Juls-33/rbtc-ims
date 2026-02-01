// resources/js/Pages/Admin/Partials/DeactivateStaffModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function DeactivateStaffModal({ isOpen, onClose, member }) {
    const { data, setData, put, processing, reset } = useForm({
        reason: 'Resigned', // Default based on mockup
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pointing to the toggle logic in the controller
        put(route('admin.staff.deactivate', member.id), {
            data: { reason: data.reason },
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 font-sans">
            <div className="bg-white rounded shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                {/* Red Danger Header */}
                <div className="bg-[#C84B4B] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Deactivate Account?</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4 text-slate-700">
                        <p className="text-sm">Are you sure you want to deactivate <span className="font-bold">{member?.name}</span>?</p>
                        
                        <div className="text-sm space-y-2">
                            <p className="font-bold">Consequences:</p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>This user will no longer be able to log in to the system.</li>
                                <li>Their historical records (prescriptions, admissions) will remain saved</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold">Reason for Deactivation</label>
                            <select 
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#C84B4B] outline-none bg-slate-50"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                            >
                                <option value="Resigned">Resigned</option>
                                <option value="Terminated">Terminated</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button 
                            type="button" 
                            variant="secondary" // Assuming secondary is your slate-style button
                            onClick={onClose} 
                            className="px-10 py-2"
                        >
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            variant="danger" // Red style for deactivation
                            disabled={processing}
                            className="px-6 py-2"
                        >
                            {processing ? 'DEACTIVATING...' : 'YES, DEACTIVATE ACCOUNT'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}