import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function PatientManagement({ auth }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'inpatient', 'outpatient'

    // Mock data for demonstration
    const mockPatients = [
        { id: 'P-00123', name: 'Juan Dela Cruz', dob: '1985-04-10', contact: '0917-123-4567', status: 'ADMITTED', bill: '1 UNPAID BILL', type: 'Inpatient' },
        { id: 'P-00124', name: 'Maria Lim', dob: '1992-11-22', contact: '0920-123-4567', status: 'DISCHARGED', bill: '2 UNPAID BILLS', type: 'Inpatient' },
        { id: 'P-00125', name: 'Robert Santos', dob: '1970-1-15', contact: '0918-123-4567', status: 'Check up', bill: 'PAID', type: 'Outpatient' },
    ];

    // Helper to render the correct top action button based on images
    const renderActionButton = () => {
        switch (activeTab) {
            case 'inpatient':
                return <button className="bg-[#5A9167] hover:bg-[#4a7a55] text-white px-6 py-2 rounded font-bold text-sm shadow-sm transition-colors uppercase">ADMIT PATIENT</button>;
            case 'outpatient':
                return <button className="bg-[#5A9167] hover:bg-[#4a7a55] text-white px-6 py-2 rounded font-bold text-sm shadow-sm transition-colors uppercase">ADD PATIENT VISIT</button>;
            default:
                return <button className="bg-[#5A9167] hover:bg-[#4a7a55] text-white px-6 py-2 rounded font-bold text-sm shadow-sm transition-colors uppercase">+ ADD NEW PATIENT</button>;
        }
    };

    return (
        <AuthenticatedLayout 
            header="Admin / Patient Management" 
            sectionTitle={
                <div className="flex w-full">
                    {['all', 'inpatient', 'outpatient'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider uppercase ${
                                activeTab === tab 
                                ? 'bg-slate-400/50 text-slate-100 hover:bg-slate-400' : 'bg-[#2E4696] text-white hover:bg-[#243776]'
                            }`}
                        >
                            {tab === 'all' ? 'All Patients' : tab}
                        </button>
                    ))}
                </div>
            }
        >
            <Head title="Patient Management" />

            {/* Container Box matching your mockup */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#3D52A0] text-white p-3 font-bold text-lg">
                    Patient List
                </div>

                <div className="p-6">
                    {/* Search and Action Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-96">
                            <input 
                                type="text" 
                                placeholder="Search by Patient ID or Name OR Bill Status"
                                className="w-full pl-5 pr-4 py-2 border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        {renderActionButton()}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                                <tr>
                                    <th className="p-3 border-r border-slate-200">Patient ID</th>
                                    <th className="p-3 border-r border-slate-200">Full Name</th>
                                    <th className="p-3 border-r border-slate-200">Date of Birth</th>
                                    <th className="p-3 border-r border-slate-200">Contact Number</th>
                                    <th className="p-3 border-r border-slate-200">Status</th>
                                    <th className="p-3 border-r border-slate-200">Bill Status</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {mockPatients
                                    .filter(p => activeTab === 'all' || p.type.toLowerCase() === activeTab)
                                    .map((patient, idx) => (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 font-bold border-r border-slate-200">{patient.id}</td>
                                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200">{patient.name}</td>
                                        <td className="p-3 border-r border-slate-200">{patient.dob}</td>
                                        <td className="p-3 border-r border-slate-200">{patient.contact}</td>
                                        <td className="p-3 border-r border-slate-200 font-bold">{patient.status}</td>
                                        <td className={`p-3 border-r border-slate-200 font-bold ${patient.bill === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {patient.bill}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button className="bg-[#5A9167] text-white text-[10px] font-bold py-1 px-3 rounded hover:bg-[#4a7a55] uppercase shadow-sm">
                                                VIEW PROFILE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {/* Empty Row Placeholder (as seen in your mockups) */}
                                {[...Array(6)].map((_, i) => (
                                    <tr key={`empty-${i}`} className="border-b border-slate-100">
                                        <td className="p-4 text-center">—</td>
                                        <td className="p-4 text-center">—</td>
                                        <td className="p-4 text-center">—</td>
                                        <td className="p-4 text-center">—</td>
                                        <td className="p-4 text-center">—</td>
                                        <td className="p-4 text-center">—</td>
                                        <td className="p-3 text-center">
                                            <button className="bg-[#5A9167]/50 text-white text-[10px] font-bold py-1 px-3 rounded cursor-not-allowed uppercase">
                                                VIEW PROFILE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex justify-end items-center gap-4 text-sm font-medium text-slate-500">
                        <button className="flex items-center gap-1 hover:text-[#2E4696] transition-colors">← Previous</button>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded bg-[#2E4696] text-white">1</button>
                            <button className="w-8 h-8 rounded hover:bg-slate-200 transition-colors">2</button>
                            <button className="w-8 h-8 rounded hover:bg-slate-200 transition-colors">3</button>
                            <span>...</span>
                            <button className="w-8 h-8 rounded hover:bg-slate-200 transition-colors">67</button>
                            <button className="w-8 h-8 rounded hover:bg-slate-200 transition-colors">68</button>
                        </div>
                        <button className="flex items-center gap-1 hover:text-[#2E4696] transition-colors">Next →</button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}