import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';


export default function Patients({ auth, patients }) {
    
    return (
        <AuthenticatedLayout 
            auth={auth} 
            header="Doctor / Patient Management"
        >
        
            <Head title="Patient Management" />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#30499B] px-6 py-4">
                    <h3 className="text-white font-semibold text-lg">Patient List</h3>
                </div>
                
                <div className="p-6">
                    {/* Search Input matching mockup */}
                    <div className="mb-6">
                        <input 
                            type="text" 
                            placeholder="Search by Patient ID or Name"
                            className="w-full max-w-md p-2 border border-gray-300 rounded shadow-inner"
                        />
                    </div>

                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-100 font-bold">
                            <tr>
                                <th className="p-3 border">Patient ID</th>
                                <th className="p-3 border">Full Name</th>
                                <th className="p-3 border">Date of Birth</th>
                                <th className="p-3 border">Contact Number</th>
                                <th className="p-3 border">Status</th>
                                <th className="p-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3 border font-semibold">{p.p_id}</td>
                                    <td className="p-3 border font-semibold">{p.name}</td>
                                    <td className="p-3 border">{p.dob}</td>
                                    <td className="p-3 border">{p.contact}</td>
                                    <td className="p-3 border font-bold text-xs">{p.status}</td>
                                    <td className="p-3 border">
                                        <Link 
                                            href={route('doctor.patients.profile', p.id)} // Change 'patient.id' to 'p.id'
                                            className="bg-[#4CAF50] text-white px-4 py-1 rounded text-xs hover:bg-green-700 transition"
                                        >
                                            VIEW PROFILE
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {/* Placeholder empty rows to match mockup style */}
                            {[...Array(8)].map((_, i) => (
                                <tr key={i + 10} className="h-10 border">
                                    <td className="p-3 border">—</td><td className="p-3 border">—</td><td className="p-3 border">—</td>
                                    <td className="p-3 border">—</td><td className="p-3 border">—</td>
                                    <td className="p-3 border">
                                        <button className="bg-[#4CAF50] text-white px-3 py-1 rounded text-xs opacity-80">VIEW PROFILE</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
        
    );
    
}