import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router} from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function DoctorPatientProfile({ auth, patient, admissionHistory, medicines, prescriptionHistory, consultationHistory = [] }) {
    const [activeTab, setActiveTab] = useState('admission');
    
    // Modal States
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showVitals, setShowVitals] = useState(false);
    const [isOther, setIsOther] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState(null);
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    
    const vitals = useForm({
        blood_pressure: '', heart_rate: '', temperature: '', weight: '',
        visit_date: new Date().toISOString().split('T')[0], reason: 'Routine Checkup',
    });

    const prescription = useForm({
        patient_id: patient.db_id, medicine_id: '', medicine_name: '',
        custom_medicine: '', dosage: '', frequency: '', time: '',
        date_prescribed: new Date().toISOString().split('T')[0],
    });

    const noteForm = useForm({
        patient_id: patient.db_id, display_patient_id: patient.id,
        patient_name: patient.name, doctor_id: auth.user.id, doctor_name: auth.user.name,
        visit_date: new Date().toISOString().slice(0, 16),
        note: '',
    });

    // Principles: Blueprint Helpers (Styles and Labels)
    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, current, max, required = true, fieldError }) => (
        <div className="flex justify-between items-center mb-1">
            <label className={`text-[10px] font-black uppercase tracking-tighter ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600 font-bold">*</span>}
            </label>
            {max !== undefined && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    // 2. Prescription Form
    const { 
    data: prescriptionData, 
    setData: setPrescriptionData, 
    post: postPrescription, 
    processing: processingPrescription, 
    reset: resetPrescription,
    errors: prescriptionErrors,
    setError: setPrescriptionError, 
    clearErrors: clearPrescriptionErrors
    } = prescription;

    // 3. Note Form
    const { 
        data: noteData, setData: setNoteData, post: postNote, reset: resetNote, 
        processing: processingNote, errors: noteErrors, setError: setNoteError, clearErrors: clearNoteErrors 
    } = useForm({
        patient_id: patient.db_id, display_patient_id: patient.id,
        patient_name: patient.name, doctor_id: auth.user.id, doctor_name: auth.user.name,
        visit_date: new Date().toISOString().slice(0, 16), note: '',
    });

    const submitVitals = (e) => {
        e.preventDefault();

        if (validateVitals()) {
            vitals.post(route('doctor.patients.vitals.update', patient.db_id), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Vitals Recorded Successfully!', type: 'success' });
                    closeVitalsModal();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Check clinical requirements.', type: 'error' });
                }
            });
        } else {
            setToastInfo({ show: true, message: 'Mandatory vital signs are missing.', type: 'error' });
        }
    };

    const handleMedicineChange = (e) => {
        const selectedId = e.target.value;
        prescription.clearErrors('medicine_id', 'custom_medicine'); // Clear errors on change

        if (selectedId === 'other') {
            setIsOther(true);
            prescription.setData({ ...prescription.data, medicine_id: 'other', medicine_name: '' });
        } else {
            setIsOther(false);
            const selectedMed = medicines.find(m => m.id == selectedId);
            prescription.setData({ 
                ...prescription.data, 
                medicine_id: selectedId, 
                medicine_name: selectedMed ? selectedMed.name : '' 
            });
        }
    };

    const submitPrescription = (e) => {
        e.preventDefault();
        if (validatePrescription()) {
            const payload = {
                ...prescription.data,
                medicine_id: isOther ? null : prescription.data.medicine_id,
                medicine_name: isOther ? prescription.data.custom_medicine : prescription.data.medicine_name,
            };
            const config = {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Prescription Saved!', type: 'success' });
                    closePrescriptionModal();
                },
                onError: () => setToastInfo({ show: true, message: 'Submission error.', type: 'error' })
            };
            if (editingPrescription) {
                router.put(route('doctor.prescriptions.update', editingPrescription.id), payload, config);
            } else {
                router.post(route('doctor.prescriptions.store', patient.db_id), payload, config);
            }
        } else {
            setToastInfo({ show: true, message: 'Highlighted fields are mandatory.', type: 'error' });
        }
    };

    const handleDeletePrescription = (id) => {
        if (confirm('Are you sure you want to delete this prescription?')) {
            router.delete(route('doctor.prescriptions.destroy', id), {
                onSuccess: () => alert('Prescription deleted'),
            });
        }
    };


    const handleEditPrescription = (pres) => {
        setEditingPrescription(pres);
        const wasOther = !pres.medicine_id || pres.medicine_id === 'other';
        setIsOther(wasOther);
        
        setPrescriptionData({
            ...prescriptionData,
            id: pres.id, 
            medicine_id: wasOther ? 'other' : pres.medicine_id,
            medicine_name: pres.medicine_name || '',
            custom_medicine: wasOther ? (pres.medicine_name || pres.medicine || '') : '',
            dosage: pres.dosage,
            frequency: pres.frequency,
            time: pres.time || '', 
            date_prescribed: pres.date_prescribed || pres.date,
        });
        
        setShowPrescriptionModal(true);
    };

    const closeNoteModal = () => {
        noteForm.reset();
        noteForm.clearErrors();
        setShowNoteModal(false);
    };

    const closeVitalsModal = () => {
        vitals.reset();
        vitals.clearErrors();
        setShowVitals(false);
    };

    const closePrescriptionModal = () => {
        prescription.reset();
        prescription.clearErrors();
        setEditingPrescription(null);
        setIsOther(false);
        setShowPrescriptionModal(false);
    };

    const { data, setData, post, reset, processing, errors } = useForm({
        patient_id: patient.db_id, // The numeric ID for the DB
        display_patient_id: patient.id, // The "P-00001" for display
        patient_name: patient.name,
        doctor_id: auth.user.id,
        doctor_name: auth.user.name,
        visit_date: new Date().toISOString().slice(0, 16), // Pre-fills current time
        note: '',
    });

    const validateNote = () => {
        let isValid = true;
        clearNoteErrors();
        let newErrors = {};

        if (!noteData.note || noteData.note.trim() === '') {
            newErrors.note = 'Clinical note is required.';
            isValid = false;
        }

        if (!isValid) setNoteError(newErrors);
        return isValid;
    };

    const validatePrescription = () => {
        let isValid = true;
        clearPrescriptionErrors();
        let newErrors = {};

        // Check if it's a custom (manual) entry
        if (isOther) {
            if (!prescriptionData.custom_medicine || prescriptionData.custom_medicine.trim() === '') {
                newErrors.custom_medicine = 'Name required.';
                isValid = false;
            }
        } else {
            // Validation: Allow if ID OR Name is present
            if (!prescriptionData.medicine_id && !prescriptionData.medicine_name) {
                newErrors.medicine_id = 'Selection required.';
                isValid = false;
            }
        }

        ['dosage', 'frequency', 'date_prescribed', 'time'].forEach(field => {
            if (!prescriptionData[field] || prescriptionData[field].toString().trim() === '') {
                newErrors[field] = 'Required field.';
                isValid = false;
            }
        });

        if (!isValid) setPrescriptionError(newErrors);
        return isValid;
    };

    const validateVitals = () => {
        let isValid = true;
        vitals.clearErrors();
        let newErrors = {};

        const requiredFields = ['visit_date', 'weight', 'blood_pressure', 'heart_rate', 'temperature'];
        
        requiredFields.forEach(field => {
            if (!vitals.data[field] || vitals.data[field].toString().trim() === '') {
                newErrors[field] = 'Required.';
                isValid = false;
            }
        });

        if (!isValid) vitals.setError(newErrors);
        return isValid;
    };

    const openVitalsModal = () => {
        vitals.clearErrors();
        vitals.setData({
            ...vitals.data,
            blood_pressure: patient.bp || '',
            heart_rate: patient.hr || '',
            temperature: patient.temp || '',
            weight: patient.weight || '',
            visit_date: new Date().toISOString().split('T')[0], // Default to today
            reason: 'Routine Update'
        });
        setShowVitals(true);
    };

    const submitNote = (e) => {
        e.preventDefault();
        if (validateNote()) {
            postNote(route('doctor.patients.consultation.store', patient.db_id), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Consultation Note Saved!', type: 'success' });
                    setShowNoteModal(false);
                    resetNote('note');
                },
                onError: () => setToastInfo({ show: true, message: 'Please fix highlighted errors.', type: 'error' })
            });
        } else {
            setToastInfo({ show: true, message: 'Required fields are missing.', type: 'error' });
        }
    };

    const handleDeleteNote = (id) => {
        if (confirm('Are you sure you want to delete this note?')) {
        router.delete(route('doctor.patients.consultation.destroy', id), {
            onSuccess: () => {
                setToastInfo({ 
                    show: true, 
                    message: 'Consultation note has been permanently removed.', 
                    type: 'success' 
                });
            },
            onError: () => {
                setToastInfo({ 
                    show: true, 
                    message: 'Failed to delete note. Internal security error.', 
                    type: 'error' 
                });
            },
        });
    }
    };
    return (
        <AuthenticatedLayout
            auth={auth}
            header="Doctor / Patient Management"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6 text-white">
                    <span className="text-white font-semibold text-lg">
                        {patient ? `Patient Profile: ${patient.name} (${patient.id})` : 'Loading Patient...'}
                    </span>
                    <Link href={route('doctor.patients')} className="text-xs uppercase hover:underline">
                        &lt; Back to List
                    </Link>
                </div>
            }
        >
            <Head title={patient ? `Patient: ${patient.name}` : 'Loading...'} />
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {!patient ? (
                <div className="p-8 text-center text-gray-500">Loading patient data...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {/* ... Rest of your existing profile code ... */}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                
                {/* 1. HEADER INFO */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm text-gray-800 border-b border-gray-100 bg-gray-50/30">
                    {/* Column 1 */}
                    <div className="space-y-4">
                        {[
                            { label: "Date of Birth", value: patient.dob },
                            { label: "Gender", value: patient.gender },
                            { label: "Phone", value: patient.phone },
                            { label: "Email", value: patient.email },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center">
                                <div className="w-32 flex-shrink-0 text-gray-500 font-bold uppercase text-[12px]">{item.label}</div>
                                <div className="font-medium lowercase">{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-4">
                        {[
                            { label: "Address", value: patient.address },
                            { label: "Emergency Contact", value: patient.emergencyContact },
                            { label: "Emergency Phone", value: patient.emergencyPhone },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start">
                                <div className="w-36 flex-shrink-0 text-gray-500 font-bold uppercase text-[12px]">{item.label}</div>
                                <div className="font-medium">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. TABS (Big Buttons Style) */}
                <div className="flex border-t border-gray-200 bg-gray-50 px-6 pt-4 gap-2">
                    {[
                        { id: 'admission', label: 'Admission History' },
                        { id: 'prescription', label: 'Prescription History' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-xs font-bold uppercase tracking-wide rounded-t-lg transition-colors ${
                                activeTab === tab.id ? 'bg-[#30499B] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 3. TAB CONTENT */}
                <div className="p-8 bg-white min-h-[400px]">
                    
                    {/* TAB: ADMISSION HISTORY */}
                    {activeTab === 'admission' && (
                        <div className="space-y-8">
                            
                            {/* Admission Details */}
                            <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-6">
                                <h3 className="text-[#30499B] font-bold text-[15px] uppercase mb-4 tracking-wider">Current Admission Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Status</span>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                                                {patient.status}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Date Admitted</span>
                                            <span className="text-gray-900 font-medium">{patient.admissionDate}</span>
                                        </div>
                                    </div>
                                    <div className="text-right md:text-left">
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Attending Doctor</span>
                                            <span className="text-gray-900 font-medium">{patient.doctor}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Room Assignment</span>
                                            <span className="text-gray-900 font-medium">{patient.room}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Notes */}
                            <div>
                                <h3 className="text-[#30499B] font-bold text-[15px] uppercase mb-3 tracking-wider">Medical Notes</h3>
                                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
                                    
                                    
                                    {/* Consultation History Timeline */}
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {consultationHistory.length > 0 ? (
                                            consultationHistory.map((entry, index) => (
                                                <div key={entry.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition hover:border-[#30499B]">
                                                    {/* Header: Doctor & Date */}
                                                    <div className={`${index === 0 ? 'bg-blue-50' : 'bg-gray-50'} px-4 py-2 border-b border-gray-100 flex justify-between items-center`}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[#30499B] text-sm">
                                                                {entry.doctor}
                                                            </span>
                                                            {index === 0 && (
                                                                <span className="bg-[#30499B] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">LATEST</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-500 text-xs font-medium">
                                                                {new Date(entry.date).toLocaleString('en-US', { 
                                                                    month: 'short', day: 'numeric', year: 'numeric', 
                                                                    hour: 'numeric', minute: '2-digit', hour12: true 
                                                                })}
                                                            </span>
                                                            {/* DELETE BUTTON */}
                                                            <button 
                                                                onClick={() => handleDeleteNote(entry.id)}
                                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                                title="Delete Note"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* The Note */}
                                                    <div className="p-4">
                                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                                            {entry.note}
                                                        </p>
                                                    </div>

                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                                                <p className="text-gray-400 text-sm italic">No consultation records found for this patient.</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-4 flex justify-end">
                                        <PrimaryButton 
                                            onClick={() => setShowNoteModal(true)}
                                            className="bg-[#2E7D32] hover:bg-green-700 active:bg-green-800 focus:ring-green-500"
                                        >
                                            Add New Consultation Note
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>

                            {/* Past Admission History */}
                            <div>
                                <h3 className="text-[#30499B] font-bold text-[15px] uppercase mb-3 tracking-wider border-t border-gray-100 pt-6">Past Admission History</h3>
                                <div className="overflow-hidden border border-gray-200 rounded-lg">
                                    <table className="w-full text-left text-sm bg-white">
                                        <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
                                            <tr>
                                                <th className="px-4 py-3">Admission ID</th>
                                                <th className="px-4 py-3">Admitted</th>
                                                <th className="px-4 py-3">Discharged</th>
                                                <th className="px-4 py-3">Reason for Stay</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {admissionHistory.map((history, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 font-mono text-blue-600 font-bold text-xs">{history.id}</td>
                                                    <td className="px-4 py-3">{history.admitted}</td>
                                                    <td className="px-4 py-3">{history.discharged}</td>
                                                    <td className="px-4 py-3 text-gray-600">{history.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: PRESCRIPTION HISTORY */}
                    {activeTab === 'prescription' && (
                        <div className="space-y-10">
                            
                            {/* 1. MEDICATIONS SECTION (Now at the top) */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[#30499B] font-bold text-[15px] uppercase tracking-wider">Prescription History</h3>
                                    <PrimaryButton 
                                        onClick={() => setShowPrescriptionModal(true)}
                                        className="bg-[#2E7D32] hover:bg-green-700 text-[11px] py-2"
                                    >
                                        + Add New Prescription
                                    </PrimaryButton>
                                </div>

                                <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                                    <table className="w-full text-left text-sm bg-white">
                                        <thead className="bg-gray-100 text-gray-600 uppercase font-bold text-xs">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Medicine</th>
                                                <th className="px-4 py-3">Dosage & Frequency</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {prescriptionHistory && prescriptionHistory.length > 0 ? (
                                                prescriptionHistory.map((pres, index) => (
                                                    <tr key={pres.id} className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50/30' : ''}`}>
                                                        <td className="px-4 py-4 text-gray-500 font-medium">{pres.date}</td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-bold text-[#30499B]">{pres.medicine_name || 'Unknown Medicine'}</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-700">
                                                            <span className="font-semibold">{pres.dosage}</span>
                                                            <span className="mx-2 text-gray-300">|</span>
                                                            <span className="text-xs italic">{pres.frequency}</span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <div className="flex justify-end gap-3">
                                                                <button 
                                                                    onClick={() => handleEditPrescription(pres)}
                                                                    className="text-gray-400 hover:text-blue-600 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeletePrescription(pres.id)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-10 text-center text-gray-400 italic">
                                                        No prescriptions found for this patient.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 2. CURRENT VITALS (Bottom) */}
                            <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[#30499B] font-bold text-[15px] uppercase tracking-wider">
                                        Current Vital Signs
                                    </h3>
                                    <PrimaryButton 
                                        onClick={openVitalsModal}
                                        className="bg-[#30499B] hover:bg-blue-800 text-[11px] py-2 px-4"
                                    >
                                        Update Vitals
                                    </PrimaryButton>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Blood Pressure', value: patient.bp, unit: 'mmHg' },
                                        { label: 'Heart Rate', value: patient.hr, unit: 'bpm' },
                                        { label: 'Temperature', value: patient.temp, unit: '°C' },
                                        { label: 'Weight', value: patient.weight, unit: 'kg' },
                                    ].map((v) => (
                                        <div key={v.label} className="bg-white/80 border border-blue-100 rounded-xl p-3 text-center shadow-sm hover:border-[#30499B] transition-colors">
                                            <div className="text-[13px] text-black-400 font-bold uppercase mb-1 tracking-widest">{v.label}</div>
                                            <div className="text-lg font-black text-[#30499B]">{v.value || '--'}</div>
                                            <div className="text-[13px] text-black-400 font-medium">{v.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            {/* 1. Consultation Note */}
            <Modal show={showNoteModal} onClose={() => setShowNoteModal(false)} maxWidth="md">
                <form onSubmit={submitNote} noValidate>
                    {/* HEADER: Responsive padding and tracking */}
                    <div className="bg-[#3D52A0] text-white px-5 md:px-6 py-4 flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-sm leading-none">Add Consultation Note</h3>
                            <p className="text-[10px] text-blue-100 uppercase mt-1 tracking-widest italic">Clinical Observation Entry</p>
                        </div>
                        <button type="button" onClick={() => setShowNoteModal(false)} className="text-2xl font-light hover:text-red-300 transition-colors">&times;</button>
                    </div>
                    
                    {/* BODY: Responsive padding (p-5 on mobile, p-8 on desktop) */}
                    <div className="p-5 md:p-8 space-y-6 bg-white">
                        
                        {/* GRID: grid-cols-1 for mobile stacking, md:grid-cols-2 for desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label text="Doctor's Name" required={false} />
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded italic text-slate-400 cursor-not-allowed" 
                                    value={noteForm.data.doctor_name} 
                                    disabled 
                                />
                            </div>
                            <div>
                                <Label text="Patient Name" required={false} />
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded italic text-slate-400 cursor-not-allowed" 
                                    value={noteForm.data.patient_name} 
                                    disabled 
                                />
                            </div>
                        </div>

                        <div>
                            <Label 
                                text="Consultation Note / Diagnosis" 
                                current={noteData.note.length} 
                                max={1000} 
                                fieldError={noteErrors.note} 
                            />
                            <textarea 
                                className={`${inputClass(noteErrors.note)} h-40 resize-none`}
                                value={noteData.note}
                                onChange={e => {
                                    setNoteData('note', e.target.value);
                                    if (noteErrors.note) clearNoteErrors('note'); 
                                }}
                                placeholder="Enter clinical findings and diagnostic summary..."
                                required
                            />
                            <InputError message={noteErrors.note} className="mt-1" />
                        </div>

                        {/* FOOTER: flex-col-reverse for mobile (Cancel on bottom), sm:flex-row for desktop */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                            <SecondaryButton 
                                onClick={closeNoteModal}
                                className="w-full sm:w-auto px-6 py-2.5 text-[10px] font-black uppercase tracking-widest"
                            >
                                Cancel
                            </SecondaryButton>
                            <Button 
                                type="submit" 
                                disabled={noteForm.processing} 
                                className="w-full sm:w-auto bg-[#3D52A0] text-white font-black uppercase text-[10px] tracking-widest px-8 shadow-lg active:scale-95 transition-transform"
                            >
                                {noteForm.processing ? 'PROCESSING...' : 'Save Record'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* 2. Add Prescription Modal */}
            <Modal show={showPrescriptionModal} onClose={closePrescriptionModal} maxWidth="md">
                <form onSubmit={submitPrescription} noValidate>
                    {/* Responsive Header */}
                    <div className="bg-[#30499B] text-white px-5 md:px-6 py-4 flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-sm leading-none">
                                {editingPrescription ? 'Update Prescription' : 'New Medication Entry'}
                            </h3>
                            <p className="text-[10px] text-blue-100 uppercase mt-1 tracking-widest italic leading-none">Clinical Pharmacy Protocol</p>
                        </div>
                        <button type="button" onClick={closePrescriptionModal} className="text-2xl font-light hover:text-red-300">&times;</button>
                    </div>

                    <div className="p-5 md:p-8 space-y-6 bg-white text-slate-800">
                        {/* Identity Grid: Stacks on mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label text="Doctor's ID" required={false} />
                                <input className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded italic text-slate-400 cursor-not-allowed" value={auth.user.id} disabled />
                            </div>
                            <div>
                                <Label text="Prescribing Doctor" required={false} />
                                <input className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded italic text-slate-400 cursor-not-allowed" value={auth.user.name} disabled />
                            </div>
                        </div>

                        {/* Medicine Selection with Red Mark Logic */}
                        <div>
                            <Label text="Medicine Name" fieldError={prescription.errors.medicine_id || prescription.errors.custom_medicine} />
                            {editingPrescription ? (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-bold text-sm italic">
                                    {prescription.data.medicine_name}
                                </div>
                            ) : (
                                <>
                                    <select 
                                        value={prescription.data.medicine_id} 
                                        onChange={handleMedicineChange} 
                                        className={inputClass(prescription.errors.medicine_id)}
                                    >
                                        <option value="">-- Choose Medication --</option>
                                        {medicines.map((med) => <option key={med.id} value={med.id}>{med.name}</option>)}
                                        <option value="other">MANUAL ENTRY</option>
                                    </select>
                                    {isOther && (
                                        <div className="mt-3 animate-in slide-in-from-top-2 duration-200">
                                            <Label text="Specify Medicine" fieldError={prescription.errors.custom_medicine} />
                                            <input 
                                                type="text"
                                                className={inputClass(prescription.errors.custom_medicine)}
                                                value={prescription.data.custom_medicine}
                                                onChange={e => {
                                                    prescription.setData('custom_medicine', e.target.value);
                                                    if(prescription.errors.custom_medicine) prescription.clearErrors('custom_medicine');
                                                }}
                                                placeholder="Enter full name..."
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                            <InputError message={prescription.errors.medicine_id || prescription.errors.custom_medicine} className="mt-1" />
                        </div>

                        {/* Dosage Grid: 3 columns on desktop, 1 on mobile */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label text="Dosage" fieldError={prescription.errors.dosage} />
                                <input 
                                    className={inputClass(prescription.errors.dosage)} 
                                    value={prescription.data.dosage} 
                                    onChange={e => {
                                        prescription.setData('dosage', e.target.value);
                                        if(prescription.errors.dosage) prescription.clearErrors('dosage');
                                    }} 
                                    placeholder="e.g. 500mg" 
                                />
                            </div>
                            <div>
                                <Label text="Frequency" fieldError={prescription.errors.frequency} />
                                <input 
                                    className={inputClass(prescription.errors.frequency)} 
                                    value={prescription.data.frequency} 
                                    onChange={e => {
                                        prescription.setData('frequency', e.target.value);
                                        if(prescription.errors.frequency) prescription.clearErrors('frequency');
                                    }} 
                                    placeholder="e.g. 2x Daily" 
                                />
                            </div>
                            <div>
                                <Label text="Admin. Time" fieldError={prescription.errors.time} />
                                <input 
                                    type="time" 
                                    className={inputClass(prescription.errors.time)} 
                                    value={prescription.data.time} 
                                    onChange={e => {
                                        prescription.setData('time', e.target.value);
                                        if(prescription.errors.time) prescription.clearErrors('time');
                                    }} 
                                />
                                <InputError message={prescription.errors.time} className="mt-1" />
                            </div>
                        </div>

                        {/* Date Prescribed */}
                        <div>
                            <Label text="Date Prescribed" fieldError={prescription.errors.date_prescribed} />
                            <input 
                                type="date" 
                                className={inputClass(prescription.errors.date_prescribed)} 
                                value={prescription.data.date_prescribed} 
                                onChange={e => {
                                    prescription.setData('date_prescribed', e.target.value);
                                    if(prescription.errors.date_prescribed) prescription.clearErrors('date_prescribed');
                                }} 
                            />
                        </div>

                        {/* Responsive Footer */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2 border-t border-slate-100">
                            <SecondaryButton onClick={closePrescriptionModal} className="w-full sm:w-auto">DISCARD</SecondaryButton>
                            <Button 
                                type="submit" 
                                disabled={prescription.processing} 
                                className="w-full sm:w-auto bg-[#30499B] text-white font-black uppercase text-[10px] tracking-widest px-10 shadow-lg"
                            >
                                {prescription.processing ? 'SAVING...' : 'Save Medication'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* 3. Update Vitals Modal */}
            <Modal show={showVitals} onClose={closeVitalsModal} maxWidth="md">
                <form onSubmit={submitVitals} noValidate>
                    {/* HEADER: Institutional Branding */}
                    <div className="bg-[#3D52A0] text-white px-5 md:px-6 py-4 flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="font-black uppercase tracking-tight text-sm leading-none">Update Patient Vitals</h3>
                            <p className="text-[10px] text-blue-100 uppercase mt-1 tracking-widest italic leading-none">Clinical Observation Protocol</p>
                        </div>
                        <button type="button" onClick={closeVitalsModal} className="text-2xl font-light hover:text-red-300 transition-colors">&times;</button>
                    </div>

                    <div className="p-5 md:p-8 space-y-6 bg-white">
                        {/* Identity & Date Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label text="Patient's ID" required={false} />
                                <input 
                                    className="w-full bg-slate-50 border border-slate-200 p-2 text-sm rounded italic text-slate-400 cursor-not-allowed" 
                                    value={patient.id} 
                                    disabled 
                                />
                            </div>
                            <div>
                                <Label text="Date of Visit" fieldError={vitals.errors.visit_date} />
                                <input 
                                    type="date" 
                                    className={inputClass(vitals.errors.visit_date)} 
                                    value={vitals.data.visit_date} 
                                    onChange={e => {
                                        vitals.setData('visit_date', e.target.value);
                                        if(vitals.errors.visit_date) vitals.clearErrors('visit_date');
                                    }} 
                                />
                                <InputError message={vitals.errors.visit_date} className="mt-1" />
                            </div>
                        </div>

                        {/* Note/Reason Section with Character Counter */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label text="Reason / Clinical Notes" required={false} />
                                <span className={`text-[9px] font-bold ${vitals.data.reason.length > 225 ? 'text-red-500' : 'text-slate-400'}`}>
                                    {vitals.data.reason.length}/255
                                </span>
                            </div>
                            <textarea
                                className="w-full border-slate-200 focus:ring-[#3D52A0] focus:border-[#3D52A0] rounded-lg p-3 text-sm resize-none"
                                rows="3"
                                maxLength={255}
                                value={vitals.data.reason}
                                onChange={e => {
                                    vitals.setData('reason', e.target.value);
                                    if(vitals.errors.reason) vitals.clearErrors('reason');
                                }}
                                placeholder="Enter routine checkup details or specific symptoms..."
                            />
                        </div>

                        {/* Vitals Grid: Responsive Stacking */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label text="Blood Pressure" fieldError={vitals.errors.blood_pressure} />
                                <input 
                                    className={inputClass(vitals.errors.blood_pressure)} 
                                    value={vitals.data.blood_pressure} 
                                    onChange={e => {
                                        vitals.setData('blood_pressure', e.target.value);
                                        if(vitals.errors.blood_pressure) vitals.clearErrors('blood_pressure');
                                    }} 
                                    placeholder="120/80" 
                                />
                                <InputError message={vitals.errors.blood_pressure} className="mt-1" />
                            </div>
                            <div>
                                <Label text="Heart Rate" fieldError={vitals.errors.heart_rate} />
                                <input 
                                    type="number" 
                                    className={inputClass(vitals.errors.heart_rate)} 
                                    value={vitals.data.heart_rate} 
                                    onChange={e => {
                                        vitals.setData('heart_rate', e.target.value);
                                        if(vitals.errors.heart_rate) vitals.clearErrors('heart_rate');
                                    }} 
                                    placeholder="72" 
                                />
                                <InputError message={vitals.errors.heart_rate} className="mt-1" />
                            </div>
                            <div>
                                <Label text="Temp (°C)" fieldError={vitals.errors.temperature} />
                                <input 
                                    className={inputClass(vitals.errors.temperature)} 
                                    value={vitals.data.temperature} 
                                    onChange={e => {
                                        vitals.setData('temperature', e.target.value);
                                        if(vitals.errors.temperature) vitals.clearErrors('temperature');
                                    }} 
                                    placeholder="36.5" 
                                />
                                <InputError message={vitals.errors.temperature} className="mt-1" />
                            </div>
                        </div>

                        {/* Weight and Calibration Note */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div>
                                <Label text="Weight (kg)" fieldError={vitals.errors.weight} />
                                <input 
                                    className={inputClass(vitals.errors.weight)} 
                                    value={vitals.data.weight} 
                                    onChange={e => {
                                        vitals.setData('weight', e.target.value);
                                        if(vitals.errors.weight) vitals.clearErrors('weight');
                                    }} 
                                    placeholder="70.5"
                                />
                                <InputError message={vitals.errors.weight} className="mt-1" />
                            </div>
                            <div className="flex items-end italic text-[11px] text-slate-400 pb-3">
                                * Confirm patient stability before recording data.
                            </div>
                        </div>

                        {/* FOOTER: Mobile Responsive Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
                            <SecondaryButton 
                                onClick={closeVitalsModal} 
                                className="w-full sm:w-auto px-8 py-2.5 text-[10px] font-black uppercase tracking-widest"
                            >
                                Cancel
                            </SecondaryButton>
                            <Button 
                                type="submit" 
                                disabled={vitals.processing} 
                                className="w-full sm:w-auto bg-[#3D52A0] text-white font-black uppercase text-[10px] tracking-widest px-10 shadow-lg active:scale-95 transition-transform"
                            >
                                {vitals.processing ? 'SAVING...' : 'Update Vitals'}
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}