import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Patients({ auth, patients, filters }) {
    // 🔥 SAFE ACCESS: Ensure we have a data array even during initial render
    const patientData = patients?.data || [];
    
    const [search, setSearch] = useState(filters?.search || '');
    const [sortConfig, setSortConfig] = useState({
        key: filters?.sort || 'id',
        direction: filters?.direction || 'desc'
    });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('nurse.patients'),
                { search, sort: sortConfig.key, direction: sortConfig.direction },
                { preserveState: true, replace: true, only: ['patients', 'filters'], preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, sortConfig]);

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 font-bold">↑</span> 
            : <span className="ml-1 text-blue-600 font-bold">↓</span>;
    };

    return (
        <AuthenticatedLayout auth={auth} header="Nurse / Patient Management">
            <Head title="Patient Management" />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-[#30499B] px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Inpatient & Clinical Directory</h3>
                    <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full text-white font-bold">
                        Total: {patients?.total || 0}
                    </span>
                </div>
                
                <div className="p-6 flex-1">
                    <div className="mb-6 relative max-w-md">
                        <input 
                            type="text" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by ID or Name..."
                            className="w-full pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30499B] outline-none text-sm transition-all"
                        />
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl relative">
                        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                            <thead className="bg-gray-50 text-slate-600 font-black uppercase tracking-tighter border-b">
                                <tr>
                                    <th className="p-4 border-r cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                                        Patient ID <SortIcon column="id"/>
                                    </th>
                                    <th className="p-4 border-r">Full Name</th>
                                    <th className="p-4 border-r cursor-pointer hover:bg-gray-100" onClick={() => handleSort('dob')}>
                                        Birth Date <SortIcon column="dob"/>
                                    </th>
                                    <th className="p-4 border-r">Contact</th>
                                    <th className="p-4 border-r text-center">Status</th>
                                    <th className="p-4 text-center sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 divide-y divide-gray-100">
                                {patientData.length > 0 ? patientData.map((p) => (
                                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 border-r font-bold text-[#30499B] font-mono whitespace-nowrap">{p.p_id}</td>
                                        <td className="p-4 border-r font-bold text-slate-900 whitespace-nowrap uppercase">{p.name}</td>
                                        <td className="p-4 border-r whitespace-nowrap">{p.dob}</td>
                                        <td className="p-4 border-r whitespace-nowrap">{p.contact}</td>
                                        <td className="p-4 border-r text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                                p.status === 'ADMITTED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>{p.status}</span>
                                        </td>
                                        <td className="p-4 sticky right-0 bg-white group-hover:bg-[#f9faff] z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                                            <Link href={route('nurse.patients.profile', p.id)} className="bg-[#30499B] text-white px-4 py-2 rounded-lg text-[9px] font-black hover:bg-blue-800 transition block text-center uppercase tracking-widest">View Profile</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="p-24 text-center text-slate-400 italic font-medium">No patient records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50/50">
                    <Pagination data={patients} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}