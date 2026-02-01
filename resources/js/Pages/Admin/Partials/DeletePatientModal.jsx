// resources/js/Pages/Admin/Partials/DeletePatientModal.jsx

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function DeletePatientModal({ isOpen, onClose, patient }) {
    const [step, setStep] = useState(1); // 1: Reason, 2: Password
    
    const { data, setData, delete: destroy, processing, reset, errors } = useForm({
        reason: '',
        other_reason: '',
        password: '',
    });

    const handleNextStep = () => {
        if (!data.reason) {
            alert("Please select a reason for deletion.");
            return;
        }
        setStep(2);
    };

    const handleConfirmDelete = (e) => {
        e.preventDefault();
        destroy(route('admin.patients.destroy', patient.id), {
            onSuccess: () => {
                onClose();
                reset();
                setStep(1);
            },
            onFinish: () => reset('password'),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#C84B4B] text-white p-3 flex justify-between items-center">
                    <h3 className="font-bold text-sm">
                        {step === 1 ? 'Are you sure you want to delete?' : 'Enter Password to Confirm'}
                    </h3>
                    <button onClick={onClose} className="text-xl">&times;</button>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        /* Step 1: Reason for Deletion */
                        <div className="space-y-4">
                            <p className="text-sm font-medium">Are you sure you want to delete patient: <span className="font-bold">{patient?.name}</span>?</p>
                            <p className="text-xs text-[#C84B4B] italic">This action cannot be undone and will remove Patient List</p>
                            
                            <div className="space-y-2 pt-2">
                                <p className="text-sm font-bold text-slate-700">Reason for deletion</p>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="reason" value="Patient Requested for record deletion" onChange={e => setData('reason', e.target.value)} />
                                    Patient Requested for record deletion
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="reason" value="Invalid Record" onChange={e => setData('reason', e.target.value)} />
                                    Invalid Record
                                </label>
                                <label className="flex items-center gap-3 text-sm cursor-pointer">
                                    <input type="radio" name="reason" value="Others" onChange={e => setData('reason', e.target.value)} />
                                    Others
                                </label>
                            </div>

                            <div className="flex justify-center gap-4 mt-8">
                                <button onClick={onClose} className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase shadow hover:bg-slate-600">CANCEL</button>
                                <button onClick={handleNextStep} className="px-6 py-2 bg-[#C84B4B] text-white rounded font-bold text-xs uppercase shadow hover:bg-[#A63E3E]">REMOVE RECORD</button>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Password Verification */
                        <form onSubmit={handleConfirmDelete} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Value"
                                    className="w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoFocus
                                />
                                {errors.password && <p className="text-rose-600 text-[10px] mt-1 font-bold">{errors.password}</p>}
                            </div>

                            <div className="flex justify-center gap-4 mt-8">
                                <button type="button" onClick={() => setStep(1)} className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase shadow hover:bg-slate-600">CANCEL</button>
                                <button type="submit" disabled={processing} className="px-6 py-2 bg-[#C84B4B] text-white rounded font-bold text-xs uppercase shadow hover:bg-[#A63E3E]">
                                    {processing ? 'DELETING...' : 'REMOVE RECORD'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}