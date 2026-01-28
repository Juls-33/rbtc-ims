import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function DoctorPatientProfile({ auth }) {
    const [activeTab, setActiveTab] = useState('admission');
    
    // Modal States
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

    // Mock Data
    const patient = {
        id: 'P-00123',
        name: 'Juan Dela Cruz',
        dob: '1985-04-10',
        gender: 'Male',
        phone: '0917-123-4567',
        email: 'juan.cruz@gmail.com',
        address: '123 Sampaguita St., Quezon City',
        emergencyContact: 'Maria Dela Cruz',
        emergencyPhone: '0920-123-4567',
        status: 'ADMITTED',
        admissionDate: '2025-11-15',
        doctor: 'Dr. Quack Reyes',
        room: 'Room 204 (Private)',
        diagnosis: 'Persistent Migraine (ICD-10 G43) & Chronic Lower Back Pain.',
        latestNote: 'Patient reported dizziness upon standing. BP checked immediately, found normal. Advised to stand slowly.',
        bp: '128/82',
        hr: '72 bpm',
        temp: '37.0°',
        weight: '85 kg'
    };

    const admissionHistory = [
        { id: 'A-00234', admitted: '2025-03-01', discharged: '2025-03-05', reason: 'Dengue Fever' },
        { id: 'A-00109', admitted: '2022-10-10', discharged: '2022-10-11', reason: 'Minor Observation' },
    ];

    const prescriptions = [
        { name: 'Lisinopril', dose: '10mg QD', status: 'Active' },
        { name: 'Ibuprofen', dose: '800mg PRN', status: 'Active' }
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Doctor / Patient Management"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6 text-white">
                    <span className="text-white font-semibold text-lg">
                        Patient Profile: {patient.name} ({patient.id})
                    </span>
                    <Link href={route('doctor.dashboard')} className="text-xs uppercase hover:underline">
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

                                <div className="grid gap-4">
                                    {prescriptions.map((med, i) => (
                                        <div key={i} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                            <div>
                                                <div className="text-lg font-bold text-gray-800">{med.name}</div>
                                                <div className="text-sm text-gray-500 font-medium">{med.dose}</div>
                                            </div>
                                            <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                                {med.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. VITALS (Bottom) */}
                            <div>
                                <div className="flex items-center gap-2 mb-4 border-t border-gray-100 pt-8">
                                    <div className="w-1 h-4 bg-[#30499B] rounded-full"></div>
                                    <h3 className="text-[#30499B] font-bold text-sm uppercase tracking-wider">Current Vital Signs</h3>
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
                <div className="p-8 space-y-4">
                    {/* Updated: Added Doctor's ID here */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Doctor's ID</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="e.g. D-005" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Doctor's Name</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Medicine Name</label>
                        <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Dosage</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="e.g. 500mg" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Frequency</label>
                            <input type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="e.g. 2x a day" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Time</label>
                            <input type="time" className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-600 block mb-1">Date Prescribed</label>
                        <input type="date" className="w-full border-gray-300 rounded-md shadow-sm text-sm" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="flex justify-center gap-4 mt-6">
                        <button onClick={() => setShowPrescriptionModal(false)} className="bg-slate-500 text-white px-8 py-2 rounded font-bold text-xs uppercase shadow hover:bg-slate-600">Cancel</button>
                        <button onClick={() => setShowPrescriptionModal(false)} className="bg-[#4CAF50] text-white px-10 py-2 rounded font-bold text-xs uppercase shadow hover:bg-green-600">Save</button>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}