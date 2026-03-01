import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router} from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function DoctorPatientProfile({ auth, patient, admissionHistory, medicines, prescriptionHistory, consultationHistory = [] }) {
    const [activeTab, setActiveTab] = useState('admission');
    
    // Modal States
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showVitals, setShowVitals] = useState(false);
    const [isOther, setIsOther] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState(null);
    

    // 1. Vitals Form
    const { 
        data: vitalsData, 
        setData: setVitalsData, 
        post: postVitals, 
        reset: resetVitals, 
        processing: processingVitals,
        errors: vitalsErrors 
    } = useForm({
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        visit_date: new Date().toISOString().split('T')[0],
        reason: 'Routine Checkup',
    });

    // 2. Prescription Form
    const { 
        data: prescriptionData, 
        setData: setPrescriptionData, 
        post: postPrescription, 
        processing: processingPrescription, 
        reset: resetPrescription,
        errors: prescriptionErrors 
    } = useForm({
        patient_id: patient.db_id,
        medicine_id: '',
        medicine_name: '',
        custom_medicine: '', 
        dosage: '',
        frequency: '',
        time: '',
        date_prescribed: new Date().toISOString().split('T')[0],
    });

    const submitVitals = (e) => {
        e.preventDefault();
        console.log("Submitting to ID:", patient.db_id); 
        
        postVitals(route('doctor.patients.vitals.update', patient.db_id), {
            onSuccess: () => {
                setShowVitals(false);
                resetVitals();
            },
            onError: (err) => {
                console.error("Submission failed:", err); 
            }
        });
    };

    const handleMedicineChange = (e) => {
        const selectedId = e.target.value;
        
        if (selectedId === 'other') {
            setIsOther(true);
            setPrescriptionData({
                ...prescriptionData,
                medicine_id: 'other',
                medicine_name: '' 
            });
        } else {
            setIsOther(false);
            const selectedMed = medicines.find(m => m.id == selectedId);
            const name = selectedMed ? selectedMed.name : '';
            
            setPrescriptionData({
                ...prescriptionData,
                medicine_id: selectedId,
                medicine_name: name 
            });
        }
    };

    const submitPrescription = (e) => {
        e.preventDefault();

        const payload = {
            ...prescriptionData,
            // FORCE medicine_id to null if 'Other' is selected
            // This prevents it from defaulting to 1 (Paracetamol)
            medicine_id: isOther ? null : prescriptionData.medicine_id,
            medicine_name: isOther ? prescriptionData.custom_medicine : prescriptionData.medicine_name,
        };

        const config = {
            onSuccess: () => {
                setShowPrescriptionModal(false);
                setEditingPrescription(null);
                setIsOther(false);
                resetPrescription();
            },
        };

        if (editingPrescription) {
            router.put(route('doctor.prescriptions.update', editingPrescription.id), payload, config);
        } else {
            // Make sure patient.db_id is being passed correctly here
            router.post(route('doctor.prescriptions.store', patient.db_id), payload, config);
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
            custom_medicine: wasOther ? (pres.medicine || pres.medicine_name) : '',
            medicine_name: pres.medicine_name,
            dosage: pres.dosage,
            frequency: pres.frequency,
            time: pres.time || '', 
            date_prescribed: pres.date_prescribed || pres.date,
        });
        
        setShowPrescriptionModal(true);
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

    const submitNote = (e) => {
        e.preventDefault();
        post(route('doctor.patients.consultation.store', patient.db_id), {
            onSuccess: () => {
                setShowNoteModal(false);
                reset('note');
            },
        });
    };

    const handleDeleteNote = (id) => {
        if (confirm('Are you sure you want to delete this note?')) {
            router.delete(route('doctor.patients.consultation.destroy', id));
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
                                <div className="w-32 flex-shrink-0 text-gray-500 font-bold uppercase text-[11px]">{item.label}</div>
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
                                <div className="w-36 flex-shrink-0 text-gray-500 font-bold uppercase text-[11px]">{item.label}</div>
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
                                <h3 className="text-[#30499B] font-bold text-sm uppercase mb-4 tracking-wider">Current Admission Details</h3>
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
                                <h3 className="text-[#30499B] font-bold text-sm uppercase mb-3 tracking-wider">Medical Notes</h3>
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
                                <h3 className="text-[#30499B] font-bold text-sm uppercase mb-3 tracking-wider border-t border-gray-100 pt-6">Past Admission History</h3>
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
                    {/* TAB: PRESCRIPTION HISTORY */}
                    {activeTab === 'prescription' && (
                        <div className="space-y-10">
                            
                            {/* 1. MEDICATIONS SECTION (Now at the top) */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[#30499B] font-bold text-sm uppercase tracking-wider">Prescription History</h3>
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
                                    <h3 className="text-[#30499B] font-bold text-sm uppercase tracking-wider">
                                        Current Vital Signs
                                    </h3>
                                    {/* Updated to PrimaryButton */}
                                    <PrimaryButton 
                                        onClick={() => setShowVitals(true)}
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
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">{v.label}</div>
                                            <div className="text-lg font-black text-[#30499B]">{v.value || '--'}</div>
                                            <div className="text-[10px] text-gray-400 font-medium">{v.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* 1. Add Note Modal */}
            <Modal show={showNoteModal} onClose={() => setShowNoteModal(false)} maxWidth="md">
                <form onSubmit={submitNote}>
                    <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="font-bold uppercase tracking-wide text-sm">Add New Consultation Note</h3>
                        <button type="button" onClick={() => setShowNoteModal(false)} className="text-xl hover:text-gray-200">&times;</button>
                    </div>
                    
                    <div className="p-8 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Doctor's Name" />
                                <TextInput className="w-full bg-gray-50" value={data.doctor_name} disabled />
                            </div>
                            <div>
                                <InputLabel value="Patient Name" />
                                <TextInput className="w-full bg-gray-50" value={data.patient_name} disabled />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Patient's ID" />
                                <TextInput className="w-full bg-gray-50" value={data.display_patient_id} disabled />
                            </div>
                            <div>
                                <InputLabel value="Date & Time" />
                                <TextInput 
                                    type="datetime-local"
                                    className="w-full" 
                                    value={data.visit_date}
                                    onChange={e => setData('visit_date', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Consultation Note / Diagnosis" />
                            <textarea 
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm h-32" 
                                value={data.note}
                                onChange={e => setData('note', e.target.value)}
                                required
                            ></textarea>
                            <InputError message={errors.note} className="mt-2" />
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                            <SecondaryButton onClick={() => setShowNoteModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing}>{processing ? 'Saving...' : 'Save Note'}</PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* 2. Add Prescription Modal */}
            <Modal 
                show={showPrescriptionModal} 
                onClose={() => {
                    setShowPrescriptionModal(false);
                    setEditingPrescription(null);
                    setIsOther(false);
                    resetPrescription();
                }} 
                maxWidth="md"
            >
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide text-sm">
                        {editingPrescription ? 'Edit Prescription' : 'Add New Prescription'}
                    </h3>
                    <button onClick={() => setShowPrescriptionModal(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={submitPrescription} className="p-8 space-y-4">
                    {/* Doctor Info (Read Only) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Doctor's ID" />
                            <TextInput value={auth.user.id} disabled className="mt-1 block w-full bg-gray-100" />
                        </div>
                        <div>
                            <InputLabel value="Doctor's Name" />
                            <TextInput value={auth.user.name} disabled className="mt-1 block w-full bg-gray-100" />
                        </div>
                    </div>

                    {/* Medicine Selection */}
                    <div>
                        <InputLabel value="Medicine Name" />
                        {editingPrescription ? (
                            /* EDIT MODE: Medicine name is locked */
                            <div className="mt-1 p-3 bg-gray-100 border border-gray-200 rounded-md text-gray-700 font-semibold text-sm">
                                {prescriptionData.medicine_name}
                            </div>
                        ) : (
                            /* CREATE MODE: Show Dropdown */
                            <>
                                <select 
                                    value={prescriptionData.medicine_id} 
                                    onChange={handleMedicineChange} 
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                >
                                    <option value="">-- Select Medicine --</option>
                                    {medicines.map((med) => (
                                        <option key={med.id} value={med.id}>{med.name}</option>
                                    ))}
                                    <option value="other">OTHER (Manual Entry)</option>
                                </select>

                                {isOther && (
                                    <div className="mt-3">
                                        <InputLabel value="Please specify medicine name" className="text-blue-700 italic" />
                                        <TextInput 
                                            type="text"
                                            className="w-full"
                                            value={prescriptionData.custom_medicine || ''} 
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setPrescriptionData({
                                                    ...prescriptionData, 
                                                    custom_medicine: val,
                                                    medicine_name: val 
                                                });
                                            }}
                                            placeholder="Type medicine name here..."
                                        />
                                    </div>
                                )}
                            </>
                        )}
                        <InputError message={prescriptionErrors.medicine_name} className="mt-1" />
                    </div>

                    {/* Dosage, Frequency, Time */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <InputLabel value="Dosage" />
                            <TextInput 
                                placeholder="e.g. 500mg" 
                                className="w-full"
                                value={prescriptionData.dosage} 
                                onChange={e => setPrescriptionData('dosage', e.target.value)} 
                            />
                        </div>
                        <div>
                            <InputLabel value="Frequency" />
                            <TextInput 
                                placeholder="e.g. 2x a day" 
                                className="w-full"
                                value={prescriptionData.frequency} 
                                onChange={e => setPrescriptionData('frequency', e.target.value)} 
                            />
                        </div>
                        <div>
                            <InputLabel value="Time" />
                            <TextInput 
                                type="time" 
                                className="w-full"
                                value={prescriptionData.time} 
                                onChange={e => setPrescriptionData('time', e.target.value)} 
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Date Prescribed" />
                        <TextInput 
                            type="date" 
                            className="w-full"
                            value={prescriptionData.date_prescribed} 
                            onChange={e => setPrescriptionData('date_prescribed', e.target.value)} 
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => {
                            setShowPrescriptionModal(false);
                            setEditingPrescription(null);
                            resetPrescription();
                        }}>
                            CANCEL
                        </SecondaryButton>
                        <PrimaryButton disabled={processingPrescription}>
                            {processingPrescription ? 'SAVING...' : 'SAVE'}
                        </PrimaryButton>
                    </div>
                </form>    
            </Modal>

            {/* 3. Update Vitals Modal */}
            <Modal show={showVitals} onClose={() => setShowVitals(false)} maxWidth="md">
            <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold uppercase tracking-wide text-sm">Update Patient Vitals</h3>
                <button onClick={() => setShowVitals(false)} className="text-xl hover:text-gray-200">&times;</button>
            </div>

            <form onSubmit={submitVitals} className="p-8 space-y-4">
                <div>
                    <InputLabel value="Patient's ID" />
                    <TextInput className="w-full bg-gray-50" value={patient.id} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel value="Date of Visit" />
                        <TextInput type="date" className="w-full" value={vitalsData.visit_date} onChange={e => setVitalsData('visit_date', e.target.value)} />
                        <InputError message={vitalsErrors.visit_date} />
                    </div>
                    <div>
                        <InputLabel value="Weight (kg)" />
                        <TextInput className="w-full" value={vitalsData.weight} onChange={e => setVitalsData('weight', e.target.value)} />
                        <InputError message={vitalsErrors.weight} />
                    </div>
                </div>
                
                <div>
                    <InputLabel value="Reason / Doctor's Notes" />
                    <textarea
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        rows="3"
                        value={vitalsData.reason}
                        onChange={e => setVitalsData('reason', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <InputLabel value="Blood Pressure" />
                        <TextInput className="w-full" value={vitalsData.blood_pressure} onChange={e => setVitalsData('blood_pressure', e.target.value)} />
                        <InputError message={vitalsErrors.blood_pressure} />
                    </div>
                    <div>
                        <InputLabel value="Heart Rate" />
                        <TextInput type="number" className="w-full" value={vitalsData.heart_rate} onChange={e => setVitalsData('heart_rate', e.target.value)} />
                        <InputError message={vitalsErrors.heart_rate} />
                    </div>
                    <div>
                        <InputLabel value="Temp (°C)" />
                        <TextInput className="w-full" value={vitalsData.temperature} onChange={e => setVitalsData('temperature', e.target.value)} />
                        <InputError message={vitalsErrors.temperature} />
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <SecondaryButton onClick={() => setShowVitals(false)}>Cancel</SecondaryButton>
                    <PrimaryButton disabled={processingVitals}>Save Vitals</PrimaryButton>
                </div>
            </form>
        </Modal>

        </AuthenticatedLayout>
    );
}