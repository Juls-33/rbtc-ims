import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function NurseDashboard({ auth }) {
    // Mock Data for Pending Administrations
    const administrations = [
        { 
            time: '9:30 AM', 
            isOverdue: true, 
            id: 'P-40012', 
            name: 'Robert Robertson', 
            room: '305', 
            medication: 'Penicillin V', 
            dosage: '500 mg' 
        },
        { 
            time: '11:30 AM', 
            isOverdue: true, 
            id: 'P-40014', 
            name: 'Malevola Gibb', 
            room: '303', 
            medication: 'Insulin (Rapid)', 
            dosage: '5 units' 
        },
        { 
            time: '1:00 PM', 
            isOverdue: true, 
            id: 'P-40018', 
            name: 'Chase Walters', 
            room: '301', 
            medication: 'Acetaminophen', 
            dosage: '650 mg' 
        },
        { 
            time: '9:30 PM', 
            isOverdue: false, 
            id: 'P-40021', 
            name: 'David J. Lee', 
            room: '302', 
            medication: 'IV Fluids (Saline)', 
            dosage: '100 mL/hr' 
        },
        { 
            time: '9:45 PM', 
            isOverdue: false, 
            id: 'P-40022', 
            name: 'Maria C. Reyes', 
            room: '304', 
            medication: 'Furosemide', 
            dosage: '20 mg' 
        },
        { 
            time: '10:00 PM', 
            isOverdue: false, 
            id: 'P-40023', 
            name: 'Alan B. Johnson', 
            room: '312', 
            medication: 'Amlodipine', 
            dosage: '5 mg' 
        },
        { 
            time: '11:30 PM', 
            isOverdue: false, 
            id: 'P-40034', 
            name: 'Chloe S. Green', 
            room: '315', 
            medication: 'Morphine Sulfate', 
            dosage: '4 mg (PRN)' 
        },
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Nurse / Dashboard"
        >
            <Head title="Nurse Dashboard" />

            <div className="space-y-6">
                {/* Top Section: Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT COLUMN: Pending Administrations Table (Takes up 3/4 space) */}
                    <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
                        <div className="bg-[#30499B] px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                            Pending Administrations
                        </div>
                        
                        <div className="p-0 overflow-auto flex-grow">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#30499B] text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 border-r border-blue-400">Time Due</th>
                                        <th className="p-3 border-r border-blue-400">Patient ID</th>
                                        <th className="p-3 border-r border-blue-400">Patient Name</th>
                                        <th className="p-3 border-r border-blue-400">Room Number</th>
                                        <th className="p-3 border-r border-blue-400">Medications Due</th>
                                        <th className="p-3 border-r border-blue-400">Dosage</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {administrations.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {/* Time Column with Overdue Logic */}
                                            <td className={`p-3 font-bold ${item.isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                                {item.time}
                                                {item.isOverdue && <div className="text-[10px] text-red-500 font-extrabold">OVERDUE</div>}
                                            </td>
                                            <td className="p-3 text-blue-600 font-bold">{item.id}</td>
                                            <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="p-3 text-gray-700">{item.room}</td>
                                            <td className="p-3 font-bold text-blue-800">{item.medication}</td>
                                            <td className="p-3 text-gray-700">{item.dosage}</td>
                                            <td className="p-3 text-center">
                                                <button className="bg-[#2E7D32] hover:bg-green-700 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase transition shadow-sm">
                                                    Administer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Patient Search (Takes up 1/4 space) */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[500px] flex flex-col">
                        <div className="bg-[#30499B] px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                            Patient Search
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            {/* Search Input */}
                            <div className="mb-4">
                                <input 
                                    type="text" 
                                    placeholder="Search Patient by ID or Name" 
                                    className="w-full border-gray-300 rounded shadow-sm text-xs py-2 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            
                            {/* Placeholder for Search Results */}
                            <div className="flex-grow flex items-center justify-center text-gray-400 text-xs italic border-2 border-dashed border-gray-100 rounded bg-gray-50">
                                Search results will appear here...
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Daily Metrics */}
                <div className="bg-[#30499B] rounded-xl overflow-hidden shadow-sm">
                     {/* UPDATED: Header to match Doctor style (Standard font, not xs uppercase) */}
                    <div className="px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                        Daily Metrics
                    </div>
                    <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Metric 1: Meds Overdue (Red/Warning Style) */}
                        <div className="border border-gray-200 rounded p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <span className="text-sm font-bold text-red-500 uppercase flex items-center gap-1">
                                Meds Overdue 
                            </span>
                            <div className="flex items-end gap-2 mt-1">
                                <span className="text-3xl font-bold text-red-600">3</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                
                                {/* Progress Bar */}
                                <div className="w-full h-4 bg-blue-100 rounded-full mb-2 ml-2 overflow-hidden">
                                    <div className="h-full bg-green-500 w-1/5"></div>
                                    <div className="h-full bg-blue-600 w-4/5 ml-auto -mt-4"></div>
                                </div>
                            </div>
                        </div>

                        {/* Metric 2: Administered Today */}
                        <div className="border border-gray-200 rounded p-4 shadow-sm flex justify-between items-center">
                            <div>
                                <span className="text-sm font-bold text-gray-500">Administered Today</span>
                                <div className="text-3xl font-bold text-gray-800 mt-1">45</div>
                            </div>
                             {/* Pie Chart Icon */}
                            <div className="h-10 w-10 rounded-full border-4 border-t-purple-400 border-r-blue-500 border-b-green-400 border-l-orange-400"></div>
                        </div>

                        {/* Metric 3: Next to Administer */}
                        <div className="border border-gray-200 rounded p-4 shadow-sm">
                            <span className="text-sm font-bold text-gray-500">Next to Administer - 11:30 AM</span>
                            <div className="text-xl font-bold text-gray-800 mt-1">Malevola Gibb</div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}