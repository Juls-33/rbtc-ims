import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router} from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function DoctorPatientProfile({ auth, patient, admissionHistory, medicines, prescriptions, prescriptionHistory = [] }) {
    const [activeTab, setActiveTab] = useState('admission');
    
    // Modal States
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showVitals, setShowVitals] = useState(false);
    const [isOther, setIsOther] = useState(false);

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
        reason: 'Routine Checkup', // Default value to fix image_cf8438.png
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
        medicine_name: '',
        custom_medicine: '', 
        dosage: '',
        frequency: '',
        time: '',
        date_prescribed: new Date().toISOString().split('T')[0],
    });

    const submitVitals = (e) => {
        e.preventDefault();
        console.log("Submitting to ID:", patient.db_id); // Check your console (F12) for this!
        
        postVitals(route('doctor.patients.vitals.update', patient.db_id), {
            onSuccess: () => {
                setShowVitals(false);
                resetVitals();
            },
            onError: (err) => {
                console.error("Submission failed:", err); // This will tell us exactly what Laravel rejected
            }
        });
    };

    const handleMedicineChange = (e) => {
        const value = e.target.value;
        if (value === 'other') {
            setIsOther(true);
            setPrescriptionData('medicine_name', ''); 
        } else {
            setIsOther(false);
            setPrescriptionData('medicine_name', value);
        }
    };

    const submitPrescription = (e) => {
        e.preventDefault();
        
        const payload = {
            ...prescriptionData,
            medicine_name: isOther ? prescriptionData.custom_medicine : prescriptionData.medicine_name
        };

        postPrescription(route('doctor.prescriptions.store', patient.db_id), {
            onSuccess: () => {
                resetPrescription();
                setIsOther(false);
                setShowPrescriptionModal(false);
            },
            onError: (err) => {
            console.error("Prescription Error:", err);
        }
        });
    };

    const handleDeletePrescription = (id) => {
        if (confirm('Are you sure you want to delete this prescription?')) {
            router.delete(route('doctor.prescriptions.destroy', id), {
                onSuccess: () => alert('Prescription deleted'),
            });
        }
    };

    if (!patient) return <div>Loading...</div>;
    console.log("Prescription List:", prescriptionHistory);
    return (
        <AuthenticatedLayout
            auth={auth.user}
            header="Doctor / Patient Management"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6 text-white">
                    <span className="text-white font-semibold text-lg">
                        Patient Profile: {patient.name} ({patient.id})
                    </span>
                    <Link href={route('doctor.patients')} className="text-xs uppercase hover:underline">
                        &lt; Back to List
                    </Link>
                </div>
            }
        >
            <Head title={`Patient: ${patient.name}`} />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                
                {/* 1. HEADER INFO */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm text-gray-800 border-b border-gray-100">
                    <div className="space-y-3">
                        <p><span className="font-bold text-gray-900 w-32 inline-block">Date of Birth:</span> {patient.dob}</p>
                        <p><span className="font-bold text-gray-900 w-32 inline-block">Gender:</span> {patient.gender}</p>
                        <p><span className="font-bold text-gray-900 w-32 inline-block">Phone:</span> {patient.phone}</p>
                        <p><span className="font-bold text-gray-900 w-32 inline-block">Email:</span> {patient.email}</p>
                    </div>
                    <div className="space-y-3">
                        <p><span className="font-bold text-gray-900 w-36 inline-block">Address:</span> {patient.address}</p>
                        <p className="flex items-start"><span className="font-bold text-gray-900 w-36 inline-block flex-shrink-0">Emergency Contact:</span> <span>{patient.emergencyContact}</span></p>
                        <p><span className="font-bold text-gray-900 w-36 inline-block">Emergency Phone:</span> {patient.emergencyPhone}</p>
                    </div>
                </div>

                {/* 2. TABS (Big Buttons Style) */}
                <div className="flex border-t border-gray-200 bg-gray-50 px-6 pt-4 gap-2">
                    <button
                        onClick={() => setActiveTab('admission')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-wide rounded-t-lg transition-colors ${
                            activeTab === 'admission'
                                ? 'bg-[#30499B] text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        Admission History
                    </button>
                    <button
                        onClick={() => setActiveTab('prescription')}
                        className={`px-6 py-3 text-xs font-bold uppercase tracking-wide rounded-t-lg transition-colors ${
                            activeTab === 'prescription'
                                ? 'bg-[#30499B] text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                    >
                        Prescription History
                    </button>
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
                                <h3 className="text-[#30499B] font-bold text-sm uppercase mb-3 tracking-wider">Medical Notes / Diagnosis</h3>
                                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                    <p className="text-gray-800 font-medium text-sm mb-4">
                                        <span className="text-gray-500 uppercase text-xs font-bold block mb-1">Diagnosis:</span>
                                        {patient.diagnosis}
                                    </p>
                                    
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r text-sm text-yellow-900">
                                        <span className="font-bold text-xs uppercase block mb-1 text-yellow-700">Latest Doctor's Note (Today, 8:00 AM):</span>
                                        "{patient.latestNote}"
                                    </div>
                                    
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={() => setShowNoteModal(true)}
                                            className="bg-[#2E7D32] hover:bg-green-700 text-white text-xs uppercase font-bold px-4 py-2 rounded shadow transition"
                                        >
                                            Add New Consultation Note
                                        </button>
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
                    {activeTab === 'prescription' && (
                        <div className="space-y-10">
                            
                            {/* 1. MEDICATIONS (Top) */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[#30499B] font-bold text-sm uppercase">Current Prescribed Medicines</h3>
                                    <button 
                                        onClick={() => setShowPrescriptionModal(true)}
                                        className="bg-[#2E7D32] hover:bg-green-700 text-white text-xs uppercase font-bold px-4 py-2 rounded shadow transition"
                                    >
                                        Add New Prescription
                                    </button>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Prescription History</h3>
                                    {prescriptionHistory && prescriptionHistory.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="p-2">Date</th>
                                                        <th className="p-2">Medicine</th>
                                                        <th className="p-2">Dosage</th>
                                                        <th className="p-2">Frequency</th>
                                                        <th className="p-2 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {prescriptionHistory.map((pres) => (
                                                        <tr key={pres.id} className="border-b">
                                                            <td className="p-2">{pres.date}</td>
                                                            <td className="p-2 font-semibold">{pres.medicine}</td>
                                                            <td className="p-2">{pres.dosage}</td>
                                                            <td className="p-2">{pres.frequency}</td>
                                                            <td className="p-2 text-right space-x-2">
                                                            <button 
                                                                onClick={() => handleEditPrescription(pres)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-bold uppercase"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeletePrescription(pres.id)}
                                                                className="text-red-600 hover:text-red-800 text-xs font-bold uppercase"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No prescriptions found for this patient.</p>
                                    )}
                                </div>
                            </div>

                            {/* 2. VITALS (Bottom) */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-t border-gray-100 pt-8">
                                    <div className="w-1 h-4 bg-[#30499B] rounded-full"></div>
                                    <h3 className="text-[#30499B] font-bold text-sm uppercase tracking-wider">Current Vital Signs</h3>
                                    <button 
                                        onClick={() => setShowVitals(true)} // Changed from setShowModal
                                        className="bg-[#30499B] text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 transition text-xs uppercase"
                                    >
                                        Update Vitals
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm text-center">
                                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Blood Pressure</div>
                                        <div className="text-xl font-extrabold text-[#30499B]">{patient.bp}</div>
                                        <div className="text-[10px] text-gray-400">mmHg</div>
                                    </div>
                                    <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm text-center">
                                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Heart Rate</div>
                                        <div className="text-xl font-extrabold text-[#30499B]">{patient.hr}</div>
                                        <div className="text-[10px] text-gray-400">bpm</div>
                                    </div>
                                    <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm text-center">
                                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Temperature</div>
                                        <div className="text-xl font-extrabold text-[#30499B]">{patient.temp}</div>
                                        <div className="text-[10px] text-gray-400">Celsius</div>
                                    </div>
                                    <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm text-center">
                                        <div className="text-xs text-gray-400 font-bold uppercase mb-1">Weight</div>
                                        <div className="text-xl font-extrabold text-[#30499B]">{patient.weight}</div>
                                        <div className="text-[10px] text-gray-400">kg</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODALS --- */}
            
            {/* 1. Add Note Modal */}
            <Modal show={showNoteModal} onClose={() => setShowNoteModal(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide">Add New Consultation Note</h3>
                    <button onClick={() => setShowNoteModal(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>
                <div className="p-8 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Doctor's ID</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="D-005" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Doctor's Name</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="Dr. Laura F. Bailey" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Patient's ID</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" value={patient.id} disabled />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Date & Time</label>
                            <input type="datetime-local" className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Note</label>
                        <textarea className="w-full border-gray-300 rounded-md shadow-sm text-sm h-24" placeholder="Enter consultation details..."></textarea>
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={() => setShowNoteModal(false)} className="bg-slate-500 text-white px-8 py-2 rounded font-bold text-xs uppercase shadow hover:bg-slate-600">Cancel</button>
                        <button onClick={() => setShowNoteModal(false)} className="bg-[#4CAF50] text-white px-10 py-2 rounded font-bold text-xs uppercase shadow hover:bg-green-600">Save</button>
                    </div>
                </div>
            </Modal>

            {/* 2. Add Prescription Modal */}
            <Modal show={showPrescriptionModal} onClose={() => setShowPrescriptionModal(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide">Add New Prescription</h3>
                    <button onClick={() => setShowPrescriptionModal(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={submitPrescription} className="p-8 space-y-4">
                    {/* Updated: Added Doctor's ID here */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Auto-filled Doctor Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Doctor's ID</label>
                            <input type="text" disabled value={auth.user.id} className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Doctor's Name</label>
                            <input type="text" disabled value={auth.user.name} className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md" />
                        </div>
                    </div>

                    {/* Medicine Dropdown + Other */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Medicine Name</label>
                        <select 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            value={isOther ? 'other' : prescriptionData.medicine_name}
                            onChange={handleMedicineChange}
                        >
                            <option value="">-- Select Medicine from Catalog --</option>
                            {medicines.map((med) => (
                                <option key={med.id} value={med.name}>{med.name}</option>
                            ))}
                            <option value="other" className="font-bold text-blue-600">Other (Type manually...)</option>
                        </select>

                        {/* This text box appears only if "Other" is selected */}
                        {isOther && (
                            <input
                                type="text"
                                placeholder="Enter medicine name..."
                                className="mt-2 block w-full border-blue-500 rounded-md shadow-sm focus:ring-blue-500"
                                value={prescriptionData.custom_medicine}
                                onChange={(e) => setPrescriptionData('custom_medicine', e.target.value)}
                                required
                            />
                        )}
                        {prescriptionErrors.medicine_name && <p className="text-red-500 text-xs mt-1">{prescriptionErrors.medicine_name}</p>}
                    </div>

                    {/* Dosage, Frequency, Time */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dosage</label>
                            <input type="text" placeholder="e.g. 500mg" value={prescriptionData.dosage} onChange={e => setPrescriptionData('dosage', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Frequency</label>
                            <input type="text" placeholder="e.g. 2x a day" value={prescriptionData.frequency} onChange={e => setPrescriptionData('frequency', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Time</label>
                            <input type="time" value={prescriptionData.time} onChange={e => setPrescriptionData('time', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">Date Prescribed</label>
                        <input type="date" value={prescriptionData.date_prescribed} onChange={e => setPrescriptionData('date_prescribed', e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setShowPrescriptionModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">CANCEL</button>
                        <button type="submit" disabled={processingPrescription} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            {processingPrescription ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </form>    
            </Modal>

            {/* 3. Update Vitals Modal */}
            <Modal show={showVitals} onClose={() => setShowVitals(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide">Update Patient Vitals</h3>
                    <button onClick={() => setShowVitals(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={submitVitals} className="p-8 space-y-4">
                    {/* Debug Info: If you see "Missing ID" here, that's why it won't save */}
                    {!patient.db_id && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                            Warning: Patient Database ID is missing.
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Patient's ID</label>
                        <input 
                            type="text" 
                            className="w-full border-gray-300 rounded-md shadow-sm text-sm bg-gray-50" 
                            value={patient.id} 
                            disabled 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Date of Visit</label>
                            <input 
                                type="date" 
                                className={`w-full border rounded-md shadow-sm text-sm ${vitalsErrors.visit_date ? 'border-red-500' : 'border-gray-300'}`} 
                                value={vitalsData.visit_date}
                                onChange={e => setVitalsData('visit_date', e.target.value)}
                            />
                            {vitalsErrors.visit_date && <div className="text-red-500 text-[10px] mt-1 font-bold">{vitalsErrors.visit_date}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Weight (kg)</label>
                            <input 
                                type="text" 
                                className={`w-full border rounded-md shadow-sm text-sm ${vitalsErrors.weight ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="e.g. 70kg" 
                                value={vitalsData.weight}
                                onChange={e => setVitalsData('weight', e.target.value)}
                            />
                            {vitalsErrors.weight && <div className="text-red-500 text-[10px] mt-1 font-bold">{vitalsErrors.weight}</div>}
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Reason / Nurse's Notes</label>
                        <textarea
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            rows="3"
                            value={vitalsData.reason}
                            onChange={e => setVitalsData('reason', e.target.value)}
                            placeholder="Enter observations or reason for visit..."
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Blood Pressure</label>
                            <input 
                                type="text" 
                                className={`w-full border rounded-md shadow-sm text-sm ${vitalsErrors.blood_pressure ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="120/80" 
                                value={vitalsData.blood_pressure}
                                onChange={e => setVitalsData('blood_pressure', e.target.value)}
                            />
                            {vitalsErrors.blood_pressure && <div className="text-red-500 text-[10px] mt-1 font-bold">{vitalsErrors.blood_pressure}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Heart Rate</label>
                            <input 
                                type="number" 
                                className={`w-full border rounded-md shadow-sm text-sm ${vitalsErrors.heart_rate ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="72" 
                                value={vitalsData.heart_rate}
                                onChange={e => setVitalsData('heart_rate', e.target.value)}
                            />
                            {vitalsErrors.heart_rate && <div className="text-red-500 text-[10px] mt-1 font-bold">{vitalsErrors.heart_rate}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Temp (°C)</label>
                            <input 
                                type="text" 
                                className={`w-full border rounded-md shadow-sm text-sm ${vitalsErrors.temperature ? 'border-red-500' : 'border-gray-300'}`} 
                                placeholder="36.5" 
                                value={vitalsData.temperature}
                                onChange={e => setVitalsData('temperature', e.target.value)}
                            />
                            {vitalsErrors.temperature && <div className="text-red-500 text-[10px] mt-1 font-bold">{vitalsErrors.temperature}</div>}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button 
                            type="button"
                            onClick={() => setShowVitals(false)} 
                            className="bg-slate-500 text-white px-8 py-2 rounded font-bold text-xs uppercase shadow hover:bg-slate-600 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={processingVitals}
                            className="bg-[#4CAF50] text-white px-10 py-2 rounded font-bold text-xs uppercase shadow hover:bg-green-600 transition disabled:opacity-50"
                        >
                            {processingVitals ? 'Saving...' : 'Save Vitals'}
                        </button>
                    </div>
                </form>
            </Modal>

        </AuthenticatedLayout>
    );
}