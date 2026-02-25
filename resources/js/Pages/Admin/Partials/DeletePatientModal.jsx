// resources/js/Pages/Admin/Partials/DeletePatientModal.jsx

import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function DeletePatientModal({ isOpen, onClose, patient, onSuccess }) {
    const [step, setStep] = useState(1); 
    const [modalError, setModalError] = useState({ show: false, message: '' });
    
    const { data, setData, delete: destroy, processing, reset, errors, setError, clearErrors } = useForm({
        reason: '',
        other_reason: '',
        password: '',
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            reset();
            clearErrors();
            setModalError({ show: false, message: '' });
        }
    }, [isOpen]);

    const handleModalClose = () => {
        reset();
        clearErrors();
        setStep(1);
        onClose();
    };

    const handleNextStep = () => {
        if (!data.reason) {
            setError('reason', 'Required.');
            setModalError({ show: true, message: 'Please select a reason for deletion.' });
            return;
        }
        clearErrors();
        setStep(2);
    };

    const handleConfirmDelete = (e) => {
        e.preventDefault();
        const patientId = patient?.id;

        if (!patientId) {
            setModalError({ show: true, message: 'System error: Patient ID missing.' });
            return;
        }

        destroy(route('admin.patients.destroy', patientId), {
            onSuccess: () => {
                // 🔥 THE FIX: Correctly triggering the Parent Toast handler
                if (onSuccess) onSuccess('Patient record permanently deleted.');
                handleModalClose();
            },
            onError: (err) => {
                const msg = Object.values(err)[0] || 'Authorization failed.';
                setModalError({ show: true, message: msg });
            },
            onFinish: () => reset('password'),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-2 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* LOCAL ERROR TOAST (While modal is open) */}
            {modalError.show && (
                <Toast 
                    message={modalError.message} 
                    type="error" 
                    onClose={() => setModalError({ ...modalError, show: false })} 
                />
            )}

            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in duration-150">
                
                {/* Header */}
                <div className="bg-[#C84B4B] text-white p-4 md:px-6 md:py-4 flex justify-between items-center shrink-0 shadow-md">
                    <div>
                        <h3 className="font-black text-base uppercase tracking-tight leading-none">
                            {step === 1 ? 'Delete Patient Record' : 'Authorization Required'}
                        </h3>
                        <p className="text-[10px] text-rose-100 uppercase tracking-widest mt-1 font-bold">Protocol Step {step} of 2</p>
                    </div>
                    <button onClick={handleModalClose} className="text-2xl hover:text-rose-200 transition-colors leading-none">&times;</button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {!patient ? (
                        <div className="py-10 text-center">
                            <div className="inline-block w-6 h-6 border-2 border-t-red-600 border-slate-200 rounded-full animate-spin mb-2"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Record...</p>
                        </div>
                    ) : step === 1 ? (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                                <p className="text-sm text-slate-600 leading-tight">Proceeding to delete record for:</p>
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{patient.name}</h4>
                                <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest bg-rose-50 py-2 rounded border border-rose-100 italic">This will remove all clinical history</p>
                            </div>

                            <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-tighter mb-1 block ${errors.reason ? 'text-red-500' : 'text-slate-500'}`}>
                                    Select Reason <span className="text-red-600">*</span>
                                </label>
                                <select 
                                    value={data.reason}
                                    onChange={e => setData('reason', e.target.value)}
                                    className={`w-full border rounded px-3 py-2.5 text-sm bg-white outline-none ${
                                        errors.reason ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-rose-500 focus:border-rose-500'
                                    }`}
                                >
                                    <option value="">-- Choose one --</option>
                                    <option value="Patient Requested for record deletion">Patient Requested Deletion</option>
                                    <option value="Invalid Record">Accidental Entry / Invalid Data</option>
                                    <option value="Duplicate Data">Duplicate Registry Profile</option>
                                    <option value="Privacy Policy Compliance">Regulatory Compliance</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-xs text-slate-600 leading-relaxed text-center">
                                    Authorizing deletion of <span className="font-bold text-slate-900">{patient.name}</span>.<br/>
                                    Please enter your administrative password.
                                </p>
                            </div>
                            <div>
                                <label className={`text-[10px] font-black uppercase tracking-tighter mb-1 block ${errors.password ? 'text-red-500' : 'text-slate-500'}`}>
                                    Confirm Password <span className="text-red-600">*</span>
                                </label>
                                <input 
                                    type="password" 
                                    placeholder="Enter password..."
                                    className={`w-full border rounded px-3 py-2.5 text-sm outline-none ${
                                        errors.password ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-rose-500 focus:border-rose-500'
                                    }`}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-center gap-3 shrink-0">
                    <Button 
                        type="button" 
                        variant="gray" 
                        onClick={step === 1 ? handleModalClose : () => setStep(1)} 
                        className="w-full sm:flex-1 py-3 font-black text-[10px] uppercase tracking-widest"
                    >
                        {step === 1 ? 'Cancel Deletion' : 'Go Back'}
                    </Button>
                    <Button 
                        type="button" 
                        variant="danger" 
                        onClick={step === 1 ? handleNextStep : handleConfirmDelete}
                        disabled={processing} 
                        className="w-full sm:flex-[1.5] py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50"
                    >
                        {step === 1 ? 'Continue' : (processing ? 'Processing...' : 'Confirm Permanent Deletion')}
                    </Button>
                </div>
            </div>
        </div>
    );
}