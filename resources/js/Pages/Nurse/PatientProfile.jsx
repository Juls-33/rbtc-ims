import React, { useState, useMemo, useEffect, useCallback } from 'react'; 
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; 
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Toast from '@/Components/Toast';


export default function NursePatientProfile({ auth , patient, prescriptionHistory, vitalsHistory, availableBatches, medicalNotes = [] }) {
    const [activeTab, setActiveTab] = useState('prescription'); 
    const [showVitals, setShowVitals] = useState(false);
    const [showAdministerModal, setShowAdministerModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });    

    const filteredBatches = useMemo(() => {
        // 1. Check if batches exists AND if selectedPrescription exists
        console.log("Prescription Med ID:", typeof selectedPrescription?.medicine_id, selectedPrescription?.medicine_id);
        console.log("Available Batches:", availableBatches);

        // 2. YOUR EXISTING FILTER LOGIC
        const matches = availableBatches.filter(b => 
            Number(b.medicine_id) === Number(selectedPrescription?.medicine_id)
        );

        // 3. LOG THE RESULT
        console.log("Matches found:", matches);

        return matches;
    }, [selectedPrescription, availableBatches]);
    
    const { 
        data: vitalsData, 
        setData: setVitalsData, 
        post: postVitals, 
        processing: processingVitals, 
        errors: vitalsErrors, 
        reset: resetVitals 
    } = useForm({
        visit_date: new Date().toISOString().split('T')[0],
        weight: patient.latest_vitals?.weight || '', // Use real data from prop
        blood_pressure: patient.latest_vitals?.blood_pressure || '',
        heart_rate: patient.latest_vitals?.heart_rate || '',
        temperature: patient.latest_vitals?.temperature || '',
        reason: '',
    });

    const submitVitals = (e) => {
        e.preventDefault();
        postVitals(route('nurse.vitals.update', patient.id), {
            onSuccess: () => {
                setToastInfo({ show: true, message: 'Vitals Recorded Successfully!', type: 'success' });
                setShowVitals(false);
                resetVitals();
            },
            onError: () => {
                setToastInfo({ show: true, message: 'Check clinical requirements.', type: 'error' });
            }
        });
    };

    const admissionHistory = [
        { id: 'A-00234', admitted: '2025-03-01', discharged: '2025-03-05', reason: 'Dengue Fever' },
    ];

    const { 
        data: administerData, 
        setData: setAdministerData, 
        post: postAdminister, 
        processing: processingAdminister, 
        errors: administerErrors, 
        reset: resetAdminister 
    } = useForm({
        prescription_id: '',
        sku_batch_id: '',
        nurse_id: auth.user.id,
        nurse_name: auth.user.name,
    });

    const openAdministerModal = (prescription) => {
        console.log("Prescription selected:", prescription);
        setSelectedPrescription(prescription);
        setAdministerData({
            ...administerData,
            prescription_id: prescription.id,
            batch_number: '', // Reset batch for new entry
        });
        setShowAdministerModal(true);
    };

    const submitAdminister = (e) => {
        e.preventDefault();
        postAdminister(route('nurse.prescriptions.administer', selectedPrescription.id), {
            onSuccess: () => {
                setShowAdministerModal(false);
                resetAdminister();
            },
        });
    };

    const handleAdministerOutside = (pres) => {
        if (confirm("Administer outside medication? This will be logged but not tracked in inventory.")) {
            router.post(route('administer.outside', pres.id), {}, {
                onSuccess: () => {
                    setToastInfo({ 
                        show: true, 
                        message: 'Outside medication logged successfully!', 
                        type: 'success' 
                    });
                }
            });
        }
    };

    const nursingNoteForm = useForm({
        patient_id: patient.id, // Ensure this matches your prop structure
        nurse_id: auth.user.id,
        nurse_name: auth.user.name,
        visit_date: new Date().toISOString().slice(0, 16),
        note: '',
    });

    const submitNursingNote = (e) => {
        e.preventDefault();
        nursingNoteForm.post(route('nurse.patients.notes.store', patient.id), {
            onSuccess: () => {
                setShowNoteModal(false);
                nursingNoteForm.reset('note');
            },
        });
    };

    const handleDeleteNote = (id) => {
        if (confirm("Are you sure you want to delete this note?")) {
            router.delete(route('nurse.vitals.destroy', id), {
                onSuccess: () => {
                    // Optional: show a toast notification here
                },
                onError: (errors) => {
                    console.error(errors);
                    alert("Failed to delete note.");
                }
            });
        }
    };

    const handleCloseToast = useCallback(() => {
        setToastInfo(prev => ({ ...prev, show: false }));
    }, []); 

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Nurse / Patient Management"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6 text-white">
                    <span className="text-white font-semibold text-lg">
                        Patient Profile: {patient.name} ({patient.id})
                    </span>
                    <Link href={route('nurse.patients')} className="text-xs uppercase hover:underline">
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
                
                {/* 1. HEADER INFO - Mirroring your Doctor Layout */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm text-gray-800 border-b border-gray-100 bg-gray-50/30">
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

                {/* 2. TABS - Mirroring your Doctor Layout */}
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
                    
                    {activeTab === 'admission' && (
                        <div className="space-y-8">
                            <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-6">
                                <h3 className="text-[#30499B] font-bold text-[15px] uppercase mb-4 tracking-wider">Current Admission Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <div className="mb-2">
                                            <span className="font-bold text-gray-500 text-xs uppercase block mb-1">Status</span>
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200">{patient.status}</span>
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
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {medicalNotes.length > 0 ? (
                                            medicalNotes.map((entry, index) => (
                                                <div key={entry.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition hover:border-[#30499B]">
                                                    {/* Header: Staff Name & Date */}
                                                    <div className={`${index === 0 ? 'bg-blue-50' : 'bg-gray-50'} px-4 py-2 border-b border-gray-100 flex justify-between items-center`}>
                                                        <span className="font-bold text-[#30499B] text-sm">
                                                            {entry.doctor}
                                                            {index === 0 && <span className="ml-2 bg-[#30499B] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">LATEST</span>}
                                                        </span>
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-500 text-xs font-medium">
                                                                {new Date(entry.date).toLocaleString()}
                                                            </span>
                                                            
                                                            {/* Only show delete button if the nurse owns this record */}
                                                            {entry.staff_id === auth.user.id && (
                                                                <button 
                                                                    onClick={() => handleDeleteNote(entry.id)}
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* The Note from Vitals Modal */}
                                                    <div className="p-4">
                                                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                                            {entry.note}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic text-center py-10">No nursing notes recorded.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

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
                    )}

                    {activeTab === 'prescription' && (
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-[#30499B] font-bold text-[15px] uppercase mb-4 tracking-wider">Active Prescriptions</h3>
                                <div className="flex items-center gap-4 mb-4 text-sm bg-gray-100 p-2 rounded">
                                    <div className="flex items-center gap-1">
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                        <span className="text-gray-600 font-medium">Outside Medication</span>
                                    </div>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-xs text-gray-500">Not billed to facility; no inventory tracking.</span>
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
                                            {prescriptionHistory?.map((pres) => {
                                                const isOutside = !pres.medicine_id; 

                                                return (
                                                    <tr key={pres.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-4 text-gray-500 font-medium">{pres.date}</td>
                                                        <td className="px-4 py-4 font-bold text-[#30499B] flex items-center gap-2">
                                                            {pres.medicine_name}
                                                            {isOutside && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-yellow-500 rounded-full">
                                                                    OFF-SITE
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-4 text-gray-700">
                                                            <span className="font-semibold">{pres.dosage}</span>
                                                            <span className="mx-2 text-gray-300">|</span>
                                                            <span className="text-xs italic">{pres.frequency}</span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right">
                                                            <PrimaryButton 
                                                                onClick={() => isOutside ? handleAdministerOutside(pres) : openAdministerModal(pres)}
                                                                className={`px-3 py-1 rounded text-white ${
                                                                    isOutside ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-700 hover:bg-green-500'
                                                                }`}
                                                            >
                                                                Administer
                                                            </PrimaryButton>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Vitals Section mirroring Doctor layout */}
                            <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[#30499B] font-bold text-[15px] uppercase tracking-wider">
                                        Current Vital Signs
                                    </h3>
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
                                        <div key={v.label} className="bg-white/80 border border-blue-100 rounded-xl p-3 text-center shadow-sm">
                                            <div className="text-[13px] text-black-400 font-bold uppercase mb-1 tracking-widest">{v.label}</div>
                                            <div className="text-lg font-black text-[#30499B]">{v.value}</div>
                                            <div className="text-[13px] text-black-400 font-medium">{v.unit}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Administer Medication Modal */}
            <Modal show={showAdministerModal} onClose={() => setShowAdministerModal(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide text-sm">Administer Medication</h3>
                    <button onClick={() => setShowAdministerModal(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={submitAdminister} className="p-8 space-y-4">
                    {/* Nurse Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Nurse's ID" />
                            <TextInput value={auth.user.id} disabled className="mt-1 block w-full bg-gray-100" />
                        </div>
                        <div>
                            <InputLabel value="Nurse's Name" />
                            <TextInput value={auth.user.name} disabled className="mt-1 block w-full bg-gray-100" />
                        </div>
                    </div>

                    {/* Prescription Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Medicine Name" />
                            <TextInput 
                                value={selectedPrescription?.medicine_name || ''} 
                                disabled 
                                className="mt-1 block w-full bg-gray-100 font-semibold text-[#30499B]" 
                            />
                        </div>
                        <div>
                            <InputLabel value="Prescribed Dosage" />
                            <TextInput 
                                value={selectedPrescription?.dosage || ''} 
                                disabled 
                                className="mt-1 block w-full bg-gray-100 font-semibold text-[#30499B]" 
                            />
                        </div>
                    </div>

                    {/* Batch Selection */}
                    <div>
                        <InputLabel value="Select Available Batch" />
                        <select 
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#30499B] focus:ring-[#30499B] text-sm"
                            value={administerData.sku_batch_id} 
                            onChange={e => setAdministerData('sku_batch_id', e.target.value)} 
                        >
                            <option value="">-- Select Batch Number --</option>
                            {filteredBatches.map(batch => (
                                <option key={batch.sku_batch_id} value={batch.sku_batch_id}>
                                    Batch: {batch.sku_batch_id} | Stock: {batch.current_quantity} | Exp: {batch.expiry_date}
                                </option>
                            ))}
                        </select>
                        <InputError message={administerErrors.batch_number} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => setShowAdministerModal(false)}>
                            CANCEL
                        </SecondaryButton>
                        <PrimaryButton 
                            className="bg-green-600 hover:bg-green-700" 
                            disabled={processingAdminister}
                        >
                            {processingAdminister ? 'PROCESSING...' : 'CONFIRM ADMINISTRATION'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Update Vitals Modal */}
            <Modal show={showVitals} onClose={() => setShowVitals(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide text-sm">Update Patient Vitals</h3>
                    <button onClick={() => setShowVitals(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={submitVitals} className="p-8 space-y-4">
                    <div>
                        <InputLabel value="Patient's ID" />
                        <TextInput className="w-full bg-gray-50 mt-1" value={patient.id} disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Date of Visit" />
                            <TextInput 
                                type="date" 
                                className="w-full mt-1" 
                                value={vitalsData.visit_date} 
                                onChange={e => setVitalsData('visit_date', e.target.value)} 
                            />
                            <InputError message={vitalsErrors.visit_date} />
                        </div>
                        <div>
                            <InputLabel value="Weight (kg)" />
                            <TextInput 
                                className="w-full mt-1" 
                                value={vitalsData.weight} 
                                onChange={e => setVitalsData('weight', e.target.value)} 
                            />
                            <InputError message={vitalsErrors.weight} />
                        </div>
                    </div>
                    
                    <div>
                        <InputLabel value="Reason / Nursing Notes" />
                        <textarea
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#30499B] focus:ring-[#30499B] text-sm"
                            rows="3"
                            placeholder="Initial assessment or reason for vitals check..."
                            value={vitalsData.reason}
                            onChange={e => setVitalsData('reason', e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <InputLabel value="Blood Pressure" />
                            <TextInput 
                                className="w-full mt-1" 
                                placeholder="120/80"
                                value={vitalsData.blood_pressure} 
                                onChange={e => setVitalsData('blood_pressure', e.target.value)} 
                            />
                            <InputError message={vitalsErrors.blood_pressure} />
                        </div>
                        <div>
                            <InputLabel value="Heart Rate" />
                            <TextInput 
                                type="number" 
                                className="w-full mt-1" 
                                placeholder="BPM"
                                value={vitalsData.heart_rate} 
                                onChange={e => setVitalsData('heart_rate', e.target.value)} 
                            />
                            <InputError message={vitalsErrors.heart_rate} />
                        </div>
                        <div>
                            <InputLabel value="Temp (°C)" />
                            <TextInput 
                                className="w-full mt-1" 
                                placeholder="36.5"
                                value={vitalsData.temperature} 
                                onChange={e => setVitalsData('temperature', e.target.value)} 
                            />
                            <InputError message={vitalsErrors.temperature} />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <SecondaryButton onClick={() => setShowVitals(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            className="bg-[#30499B] hover:bg-blue-800" 
                            disabled={processingVitals}
                        >
                            Save Vitals
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {toastInfo.show && (
                <Toast 
                    key="global-toast-instance" 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={handleCloseToast} 
                />
            )}
        </AuthenticatedLayout>
    );
}