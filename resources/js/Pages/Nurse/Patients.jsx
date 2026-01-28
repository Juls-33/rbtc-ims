import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function NursePatients({ auth }) {
    // Mock Data based on your screenshot
    const patients = [
        { 
            id: 'P-00123', 
            name: 'Juan Dela Cruz', 
            dob: '1985-04-10', 
            contact: '0917-123-4567', 
            status: 'ADMITTED' 
        },
        { 
            id: 'P-00124', 
            name: 'Maria Lim', 
            dob: '1992-11-22', 
            contact: '0920-123-4567', 
            status: 'DISCHARGED' 
        },
        { 
            id: 'P-00125', 
            name: 'Robert Santos', 
            dob: '1970-1-15', 
            contact: '0918-123-14567', 
            status: 'DISCHARGED' 
        },
        // Empty rows to match the visual style of the mockup
        { id: '—', name: '—', dob: '—', contact: '—', status: '—' },
        { id: '—', name: '—', dob: '—', contact: '—', status: '—' },
        { id: '—', name: '—', dob: '—', contact: '—', status: '—' },
        { id: '—', name: '—', dob: '—', contact: '—', status: '—' },
        { id: '—', name: '—', dob: '—', contact: '—', status: '—' },
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Nurse / Patient Management"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6 text-white">
                    <span className="text-white font-semibold text-lg">
                        Nurse / Patient Management
                    </span>
                </div>
            }
        >
            <Head title="Patient Management" />

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-full min-h-[600px] flex flex-col">
                {/* Header Section */}
                <div className="bg-[#30499B] px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                    Patient List
                </div>
                
                <div className="p-6">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <input 
                            type="text" 
                            placeholder="Search by Patient ID or Name" 
                            className="w-full md:w-1/2 border-gray-300 rounded shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-sm">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100 text-gray-700 font-bold uppercase border-b border-gray-200">
                                <tr>
                                    <th className="p-3 border-r border-gray-200 w-1/6">Patient ID</th>
                                    <th className="p-3 border-r border-gray-200 w-1/4">Full Name</th>
                                    <th className="p-3 border-r border-gray-200 w-1/6">Date of Birth</th>
                                    <th className="p-3 border-r border-gray-200 w-1/6">Contact Number</th>
                                    <th className="p-3 border-r border-gray-200 w-1/6">Status</th>
                                    <th className="p-3 text-center w-1/6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {patients.map((patient, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="p-3 border-r border-gray-100 font-medium text-gray-900">
                                            {patient.id}
                                        </td>
                                        <td className="p-3 border-r border-gray-100 font-bold text-gray-800">
                                            {patient.name}
                                        </td>
                                        <td className="p-3 border-r border-gray-100 text-gray-600">
                                            {patient.dob}
                                        </td>
                                        <td className="p-3 border-r border-gray-100 text-gray-600">
                                            {patient.contact}
                                        </td>
                                        <td className="p-3 border-r border-gray-100 font-bold">
                                            {patient.status === 'ADMITTED' ? (
                                                <span className="text-green-700">ADMITTED</span>
                                            ) : patient.status === 'DISCHARGED' ? (
                                                <span className="text-gray-500">DISCHARGED</span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="p-2 text-center">
                                            {/* Only show button if it's a real patient row */}
                                            {patient.id !== '—' ? (
                                                <Link 
                                                    href={route('nurse.patients.profile', { id: patient.id })}
                                                    className="bg-[#2E7D32] hover:bg-green-700 text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded transition shadow-sm inline-block"
                                                >
                                                    View Profile
                                                </Link>
                                            ) : (
                                                <span className="bg-[#2E7D32] opacity-50 text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded cursor-not-allowed">
                                                    View Profile
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}