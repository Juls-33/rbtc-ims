import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function DoctorDashboard({ auth, appointments, stats }) {
    // Keep the search state for the right-hand card
    const [searchQuery, setSearchQuery] = useState('');

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
                        {/* Calendar View Placeholder (Keeping your layout) */}
                        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-white shadow-inner">
                            <div className="text-center text-[#30499B] font-bold mb-4">
                                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 gap-2">
                                <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                            </div>
                            <div className="grid grid-cols-7 text-center mt-2 gap-2">
                                {[...Array(31)].map((_, i) => (
                                    <div key={i} className={`py-1 text-sm ${i + 1 === new Date().getDate() ? 'bg-[#4CAF50] text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-700'}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Appointment Table - Now Dynamic */}
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
                                    {appointments.length > 0 ? appointments.map((appt, index) => (
                                        <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-blue-600 font-medium">{appt.time}</td>
                                            <td className="p-3 text-blue-800 font-bold font-mono">
                                                <Link href={route('doctor.patients.profile', appt.db_id)} className="hover:underline">
                                                    {appt.id}
                                                </Link>
                                            </td>
                                            <td className="p-3 font-semibold">{appt.name}</td>
                                            <td className="p-3 text-gray-600">{appt.reason}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="p-6 text-center text-gray-400 italic">No appointments recorded for today.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Patient Search Card (Functional redirect to list) */}
                <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-[#30499B] px-6 py-4">
                        <h3 className="text-white font-semibold text-lg">Quick Access</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-xs text-gray-500 mb-2 font-bold uppercase">Search Patient Database</p>
                        <Link 
                            href={route('doctor.patients')}
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded flex items-center justify-between text-gray-400 hover:border-[#30499B] transition"
                        >
                            <span>Search by ID or Name...</span>
                            <i className="fas fa-search text-[#30499B]"></i>
                        </Link>
                        
                        <div className="mt-8">
                            <h4 className="text-xs font-bold text-[#30499B] uppercase mb-4">Doctor Shortcuts</h4>
                            <div className="space-y-2">
                                <Link href={route('doctor.patients')} className="block p-3 bg-blue-50 text-[#30499B] rounded font-bold text-xs hover:bg-blue-100 transition">
                                    VIEW FULL PATIENT LIST
                                </Link>
                                <div className="p-3 border border-dashed border-gray-300 rounded text-center text-xs text-gray-400">
                                    Additional tools coming soon
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Updated BOTTOM SECTION: Medical Insights */}
<div className="bg-[#30499B] rounded-xl shadow-sm p-6 text-white">
    <h3 className="font-bold text-sm uppercase mb-4 border-b border-blue-400/30 pb-2">Medical Insights & Workload</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
        
        {/* Metric 1: Inpatient vs Outpatient Load */}
        <div className="bg-white rounded-lg p-5 shadow-lg border-l-4 border-blue-500 flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-blue-600 mb-1">Active Patient Load</div>
            <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-extrabold text-blue-600">{stats.inpatient_count}</span>
                <span className="text-gray-400 text-sm font-bold uppercase">Inpatients</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">Currently assigned to wards</div>
        </div>

        {/* Metric 2: Prescriptions Issued (Your existing good metric) */}
        <div className="bg-white rounded-lg p-5 shadow-lg flex items-center justify-between border-l-4 border-purple-500">
            <div>
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Prescriptions Issued</div>
                <div className="text-4xl font-extrabold text-gray-800">{stats.prescriptions_count}</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <i className="fas fa-file-prescription text-xl"></i>
            </div>
        </div>

        {/* Metric 3: Consultation Summary */}
        <div className="bg-white rounded-lg p-5 shadow-lg border-l-4 border-emerald-500 flex flex-col justify-center">
            <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Today's Outpatient Visits</div>
            <div className="text-4xl font-extrabold text-emerald-600">{stats.seen_count}</div>
            <div className="text-[10px] text-emerald-700 font-bold mt-1">Completed Consultations</div>
        </div>
    </div>
</div>
        </AuthenticatedLayout>
    );
}