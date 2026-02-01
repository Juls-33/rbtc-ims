// resources/js/Pages/Admin/Partials/ActivateStaffModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function ActivateStaffModal({ isOpen, onClose, member }) {
    const { put, processing } = useForm();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Uses the same toggle route but the UI context is for activation
        put(route('admin.staff.deactivate', member.id), {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4 font-sans">
            <div className="bg-white rounded shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                {/* Green Header for Activation */}
                <div className="bg-[#488D6A] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Activate Account?</h3>
                    <button onClick={onClose} className="text-2xl hover:text-green-200">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4 text-slate-700 text-center">
                        <p className="text-sm">
                            Are you sure you want to reactivate the account for <br/> 
                            <span className="font-bold text-lg text-slate-900">{member?.name}</span>?
                        </p>
                        
                        <div className="text-sm bg-green-50 p-4 rounded border border-green-100 space-y-2 text-left">
                            <p className="font-bold text-green-800 italic">What happens next:</p>
                            <ul className="list-disc ml-5 space-y-1 text-green-700">
                                <li>The user will immediately regain access to the system.</li>
                                <li>Their status will return to <span className="font-bold">ACTIVE</span> in the personnel directory.</li>
                                <li>All previous records and permissions will be restored.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={onClose} 
                            className="px-10 py-2"
                        >
                            CANCEL
                        </Button>
                        <Button 
                            type="submit" 
                            variant="success" 
                            disabled={processing}
                            className="px-10 py-2"
                        >
                            {processing ? 'ACTIVATING...' : 'YES, ACTIVATE ACCOUNT'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}