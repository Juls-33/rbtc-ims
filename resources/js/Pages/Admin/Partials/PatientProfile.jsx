// resources/js/Pages/Admin/Partials/PatientProfile.jsx

import React, { useState } from 'react';
import Button from '@/Components/Button';
import EditAdmissionModal from './EditAdmissionModal';

export default function PatientProfile({ patient, onBack, doctors, rooms }) {
    const [activeSubTab, setActiveSubTab] = useState('admission');
    const [isEditAdmissionOpen, setIsEditAdmissionOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#3D52A0] text-white p-3 flex justify-between items-center font-bold">
                    <span>Patient Information (Inpatient)</span>
                    <button onClick={onBack} className="text-sm hover:underline">{"< Back"}</button>
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                            <p><span className="font-bold">Date of Birth:</span> {patient.dob}</p>
                            <p><span className="font-bold">Phone:</span> {patient.contact_no}</p>
                            <p><span className="font-bold">Gender:</span> {patient.gender}</p>
                            <p><span className="font-bold">Email:</span> {patient.email || 'N/A'}</p>
                            <p><span className="font-bold">Address:</span> {patient.address}</p>
                            <p><span className="font-bold">Emergency Phone:</span> {patient.emergency_contact_number}</p>
                            <p className="col-span-2"><span className="font-bold">Emergency Contact:</span> {patient.emergency_contact_name}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="danger" className="text-[10px] px-4">DELETE PATIENT RECORD</Button>
                            <Button variant="success" className="text-[10px] px-4">EDIT DETAILS</Button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex w-full border-t">
                        <button 
                            onClick={() => setActiveSubTab('admission')}
                            className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider ${activeSubTab === 'admission' ? 'bg-[#3D52A0] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            ADMISSION HISTORY
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('prescription')}
                            className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider ${activeSubTab === 'prescription' ? 'bg-[#3D52A0] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            PRESCRIPTION HISTORY
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Admission Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Current Admission Status</h4>
                    <Button variant="success" className="text-[9px] px-3" onClick={() => setIsEditAdmissionOpen(true)}>
                        EDIT STATUS
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                        <p><span className="font-bold">Status:</span> <span className="text-emerald-600">ADMITTED</span></p>
                        <p><span className="font-bold">Admission Date:</span> {patient.admission_date || '2025-11-15'}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Assigned Doctor:</span> {patient.attending_physician || 'Dr. Quack Reyes'}</p>
                        <p><span className="font-bold">Room:</span> {patient.current_room || 'Room 204 (Private)'}</p>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-rose-600 font-bold text-sm">1 Unpaid Bill: Click "View Bill" to see more details</p>
                    <div className="flex justify-center gap-4">
                        <Button variant="success" className="px-8 py-2">VIEW BILL</Button>
                        <Button variant="success" className="px-8 py-2">DISCHARGE AND PAY THE REMAINING BALANCE</Button>
                    </div>
                </div>
            </div>

            {/* Historical Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h4 className="font-bold text-slate-700 mb-4">Admission History</h4>
                <table className="w-full text-left text-xs border">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-2 border-r">Admission ID</th>
                            <th className="p-2 border-r">Admitted</th>
                            <th className="p-2 border-r">Discharged</th>
                            <th className="p-2 border-r">Reason For Stay</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Example Row from your mockup */}
                        <tr className="border-b hover:bg-slate-50">
                            <td className="p-2 border-r font-bold text-slate-800">A-00234</td>
                            <td className="p-2 border-r">2025-03-01</td>
                            <td className="p-2 border-r">2025-03-05</td>
                            <td className="p-2 border-r">Dengue Fever</td>
                            <td className="p-2 text-center">
                                <Button variant="success" className="text-[8px] px-2 py-1">VIEW BILL</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <EditAdmissionModal 
                isOpen={isEditAdmissionOpen}
                onClose={() => setIsEditAdmissionOpen(false)}
                admission={patient.active_admission} // Ensure your controller sends this object
                doctors={doctors}
                rooms={rooms}
            />
        </div>
    );
}