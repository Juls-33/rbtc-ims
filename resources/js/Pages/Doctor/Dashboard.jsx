import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function DoctorDashboard({ auth }) {
    // Static data for the appointment table as seen in mockup
    const appointments = [
        { time: '9:30 AM', id: 'P-40012', name: 'Robert Robertson', reason: 'High BP' },
        { time: '11:30 AM', id: 'P-40014', name: 'Malevola Gibb', reason: 'Persistent Coughing' },
        { time: '1:00 PM', id: 'P-40018', name: 'Chase Waiters', reason: 'Prescription Refill' },
    ];

    return (
        <AuthenticatedLayout 
            auth={auth}
            header="Doctor / Dashboard"
        >
            <Head title="Doctor Dashboard" />

            {/* Main Content Grid: Appointments (Left) and Search (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                
                {/* Scheduled Patient Appointments Card (8 columns wide) */}
                <div className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#30499B] px-6 py-4">
                        <h3 className="text-white font-semibold text-lg">Scheduled Patient Appointments</h3>
                    </div>
                    
                    <div className="p-6">
                        {/* Static Calendar View Placeholder */}
                        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-inner">
                            <div className="text-center text-[#30499B] font-bold mb-4">November 2025</div>
                            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 gap-2">
                                <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                            </div>
                            <div className="grid grid-cols-7 text-center mt-2 gap-2">
                                {/* Sample days matching mockup pattern */}
                                {[...Array(30)].map((_, i) => (
                                    <div key={i} className={`py-1 text-sm ${i + 1 === 19 ? 'bg-[#4CAF50] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-700'}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Appointment Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#30499B] text-white text-sm">
                                        <th className="p-3 border border-blue-800">Time</th>
                                        <th className="p-3 border border-blue-800">Patient ID</th>
                                        <th className="p-3 border border-blue-800">Patient Name</th>
                                        <th className="p-3 border border-blue-800">Reason for Visit</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {appointments.map((appt, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-blue-600 font-medium">{appt.time}</td>
                                            <td className="p-3 text-blue-800 font-bold">{appt.id}</td>
                                            <td className="p-3">{appt.name}</td>
                                            <td className="p-3">{appt.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Patient Search Card (4 columns wide) */}
                <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#30499B] px-6 py-4">
                        <h3 className="text-white font-semibold text-lg">Patient Search</h3>
                    </div>
                    <div className="p-6">
                        <input 
                            type="text" 
                            placeholder="Search Patient by ID or Name"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="h-64 mt-4 flex items-center justify-center text-gray-400 italic">
                            Search results will appear here...
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Metrics Row (Full Width Bottom) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#30499B] px-6 py-2">
                    <h3 className="text-white font-semibold">Daily Metrics</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    
                    {/* Patients Seen Today Metric */}
                    <div className="flex flex-col border-r border-gray-100 pr-4">
                        <span className="text-sm text-gray-500 mb-1">Patients Seen Today</span>
                        <div className="flex items-end gap-4">
                            <span className="text-4xl font-bold">5/15</span>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden flex">
                                <div className="bg-[#4CAF50] h-full" style={{ width: '33%' }}></div>
                                <div className="bg-[#2196F3] h-full" style={{ width: '67%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Prescriptions Given Today Metric */}
                    <div className="flex items-center justify-between border-r border-gray-100 px-4">
                        <div>
                            <span className="text-sm text-gray-500">Prescriptions Given Today</span>
                            <div className="text-4xl font-bold">8</div>
                        </div>
                        
                        {/* Refined SVG Pie Chart to match mockup segments */}
                        <div className="relative w-16 h-16">
                            <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
                                {/* Background / Segment 1 (Blue - Largest) */}
                                <circle r="16" cx="16" cy="16" fill="#2196F3" />
                                
                                {/* Segment 2 (Green) - roughly 25% */}
                                <circle 
                                    r="16" cx="16" cy="16" 
                                    fill="transparent" 
                                    stroke="#4CAF50" 
                                    strokeWidth="32" 
                                    strokeDasharray="25 100" 
                                />
                                
                                {/* Segment 3 (Pink) - roughly 15% */}
                                <circle 
                                    r="16" cx="16" cy="16" 
                                    fill="transparent" 
                                    stroke="#E91E63" 
                                    strokeWidth="32" 
                                    strokeDasharray="15 100" 
                                    strokeDashoffset="-25" 
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Next Appointment Metric */}
                    <div className="pl-4">
                        <span className="text-sm text-gray-500">Next Appointment - 11:30</span>
                        <div className="text-2xl font-bold text-gray-800">Malevola Gibb</div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}