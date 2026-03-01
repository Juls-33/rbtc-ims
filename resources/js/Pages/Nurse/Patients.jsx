import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Patients({ auth, patients, filters }) {
    
    const [search, setSearch] = useState(filters?.search || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('nurse.patients'),
                { search: search }, 
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    return (
        <AuthenticatedLayout 
            auth={auth} 
            header="Nurse / Patient Management" // CHANGED: Header Label
        >
            <Head title="Patient Management" />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-[#30499B] px-6 py-4">
                    <h3 className="text-white font-semibold text-lg">Patient List</h3>
                </div>
                
                <div className="p-6">
                    {/* Search Input */}
                    <form onSubmit={(e) => e.preventDefault()} className="mb-6">
                        <input 
                            type="text" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by Patient ID or Name"
                            className="w-full max-w-md p-2 border border-gray-300 rounded shadow-inner focus:ring-2 focus:ring-[#30499B] focus:border-transparent outline-none transition-all"
                        />
                    </form>

                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-100 font-bold text-gray-700">
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
                            {patients.length > 0 ? (
                                patients.map((p, i) => (
                                    <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-3 border font-semibold text-[#30499B] font-mono text-xs">{p.p_id}</td>
                                        <td className="p-3 border font-semibold text-gray-900">{p.name}</td>
                                        <td className="p-3 border text-gray-600">{p.dob}</td>
                                        <td className="p-3 border text-gray-600">{p.contact}</td>
                                        <td className="p-3 border text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                p.status === 'ADMITTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="p-3 border">
                                            <Link 
                                                href={route('nurse.patients.profile', p.id)} // CHANGED: Link to nurse profile
                                                className="bg-[#30499B] text-white px-4 py-1.5 rounded text-[11px] font-bold hover:bg-blue-800 transition block text-center uppercase tracking-wide"
                                            >
                                                VIEW PROFILE
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400 italic border">
                                        No patients found matching "{search}"
                                    </td>
                                </tr>
                            )}

                            {/* Placeholder empty rows for visual consistency */}
                            {patients.length < 8 && [...Array(Math.max(0, 8 - patients.length))].map((_, i) => (
                                <tr key={`placeholder-${i}`} className="h-10 border">
                                    <td className="p-3 border text-gray-300">—</td>
                                    <td className="p-3 border text-gray-300">—</td>
                                    <td className="p-3 border text-gray-300">—</td>
                                    <td className="p-3 border text-gray-300">—</td>
                                    <td className="p-3 border text-gray-300">—</td>
                                    <td className="p-3 border">
                                        <button disabled className="bg-gray-100 text-gray-300 px-3 py-1 rounded text-xs w-full cursor-not-allowed">
                                            VIEW PROFILE
                                        </button>
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