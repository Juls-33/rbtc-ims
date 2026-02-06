// resources/js/Pages/Admin/Partials/DeletePatientModal.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Toast from '@/Components/Toast'; 

export default function DeletePatientModal({ isOpen, onClose, patient }) {
    const [step, setStep] = useState(1); 
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    
    const { data, setData, delete: destroy, processing, reset, errors, setError, clearErrors } = useForm({
        reason: '',
        other_reason: '',
        password: '',
    });

    // --- DATA LOADING & RESET LOGIC ---
    // Watch for 'patient' and 'isOpen' to ensure the modal state is fresh
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            reset();
            clearErrors();
        }
    }, [isOpen, patient]);

    const handleNextStep = () => {
        if (!data.reason) {
            // Using setError instead of alert for professional UI
            setError('reason', 'Please select a reason for deletion.');
            return;
        }
        clearErrors();
        setStep(2);
    };

    const handleConfirmDelete = (e) => {
        e.preventDefault();

        // --- THE CRITICAL FIX ---
        // We only need ONE valid ID to perform the delete. 
        const patientId = patient?.id || patient?.patient_id || patient?.id_no;

        if (!patientId) {
            setToastInfo({ show: true, message: 'System error: Patient ID not found.', type: 'error' });
            return;
        }

        destroy(route('admin.patients.destroy', patientId), {
            onSuccess: () => {
                setToastInfo({ show: true, message: 'Record deleted successfully.', type: 'success' });
                handleModalClose();
            },
            onError: () => {
                setToastInfo({ show: true, message: 'Authorization failed. Incorrect password.', type: 'error' });
            },
            onFinish: () => reset('password'),
        });
    };

    const handleModalClose = () => {
        reset();
        clearErrors();
        setStep(1); // Ensure it resets to step 1 for the next time it opens
        onClose();
    };

    return (
        <>
            {/* Toast stays visible after modal close */}
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 text-slate-800 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                        
                        {/* Header (Retained Original Design) */}
                        <div className="bg-[#C84B4B] text-white p-3 flex justify-between items-center">
                            <h3 className="font-bold text-sm">
                                {step === 1 ? 'Are you sure you want to delete?' : 'Enter Password to Confirm'}
                            </h3>
                            <button onClick={handleModalClose} className="text-xl hover:rotate-90 transition-transform leading-none">&times;</button>
                        </div>

                        <div className="p-8">
                            {/* DATA FETCH CHECK: Design retained, logic added to prevent 'undefined' crash */}
                            {!patient ? (
                                <div className="py-10 text-center">
                                    <div className="inline-block w-6 h-6 border-2 border-t-red-600 border-slate-200 rounded-full animate-spin mb-2"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Patient Record...</p>
                                </div>
                            ) : step === 1 ? (
                                /* Step 1: Reason for Deletion */
                                <div className="space-y-4">
                                    <p className="text-sm font-medium">Are you sure you want to delete patient: <span className="font-bold underline">{patient.name || 'this record'}</span>?</p>
                                    <p className="text-xs text-[#C84B4B] italic font-bold">This action cannot be undone and will remove Patient List</p>
                                    
                                    <div className="space-y-2 pt-2">
                                        <p className="text-sm font-bold text-slate-700">Reason for deletion</p>
                                        <label className="flex items-center gap-3 text-sm cursor-pointer p-1">
                                            <input type="radio" name="reason" value="Patient Requested for record deletion" onChange={e => setData('reason', e.target.value)} className="text-red-600 focus:ring-red-500" />
                                            Patient Requested for record deletion
                                        </label>
                                        <label className="flex items-center gap-3 text-sm cursor-pointer p-1">
                                            <input type="radio" name="reason" value="Invalid Record" onChange={e => setData('reason', e.target.value)} className="text-red-600 focus:ring-red-500" />
                                            Invalid Record
                                        </label>
                                        <label className="flex items-center gap-3 text-sm cursor-pointer p-1">
                                            <input type="radio" name="reason" value="Others" onChange={e => setData('reason', e.target.value)} className="text-red-600 focus:ring-red-500" />
                                            Others
                                        </label>
                                        {errors.reason && <p className="text-red-500 text-[10px] font-bold italic mt-1">{errors.reason}</p>}
                                    </div>

                                    <div className="flex justify-center gap-4 mt-8">
                                        <button onClick={handleModalClose} className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase shadow hover:bg-slate-600 transition-all">CANCEL</button>
                                        <button onClick={handleNextStep} className="px-6 py-2 bg-[#C84B4B] text-white rounded font-bold text-xs uppercase shadow hover:bg-[#A63E3E] active:scale-95 transition-all">REMOVE RECORD</button>
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
                                            className={`w-full border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-rose-500 outline-none transition-all ${
                                                errors.password ? 'border-red-500 bg-red-50' : 'border-slate-300'
                                            }`}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            autoFocus
                                        />
                                        {errors.password && <p className="text-red-600 text-[10px] mt-1 font-bold">{errors.password}</p>}
                                    </div>

                                    <div className="flex justify-center gap-4 mt-8">
                                        <button type="button" onClick={() => setStep(1)} className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase shadow hover:bg-slate-600 transition-all">CANCEL</button>
                                        <button 
                                            type="submit" 
                                            disabled={processing} 
                                            className="px-6 py-2 bg-[#C84B4B] text-white rounded font-bold text-xs uppercase shadow hover:bg-[#A63E3E] disabled:opacity-50 active:scale-95 transition-all"
                                        >
                                            {processing ? 'DELETING...' : 'REMOVE RECORD'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}