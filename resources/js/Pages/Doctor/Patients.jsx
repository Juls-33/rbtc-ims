import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Patients({ auth, patients, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
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
                route('doctor.patients'),
                { search, status, sort: sortConfig.key, direction: sortConfig.direction },
                { preserveState: true, replace: true, only: ['patients', 'filters'], preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, status, sortConfig]);

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 font-bold text-[10px]">↑</span> 
            : <span className="ml-1 text-blue-600 font-bold text-[10px]">↓</span>;
    };

    return (
        <AuthenticatedLayout auth={auth} header="Doctor / Patient Management">
            <Head title="Patient Management" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-[#30499B] px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-semibold text-lg uppercase tracking-tight">Your Assigned Patients</h3>
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-blue-100 font-bold">{patients.total} TOTAL</span>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 max-w-md">
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 tracking-widest ml-1">Search Patient</label>
                            <div className="relative">
                                <input 
                                    type="text" value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Exact Name or ID..."
                                    className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#30499B] outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1 tracking-widest ml-1">Status Filter</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#30499B] outline-none text-sm font-bold text-gray-700"
                            >
                                <option value="">ALL PATIENTS</option>
                                <option value="ADMITTED">ADMITTED</option>
                                <option value="OUTPATIENT">OUTPATIENT</option>
                                <option value="DISCHARGED">DISCHARGED</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg relative bg-white">
                        <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                            <thead className="bg-gray-50 text-slate-600 font-black uppercase tracking-tighter border-b">
                                <tr>
                                    <th className="p-4 border-r cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('id')}>
                                        Patient ID <SortIcon column="id"/>
                                    </th>
                                    <th className="p-4 border-r">Full Name</th>
                                    <th className="p-4 border-r cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('dob')}>
                                        Birth Date <SortIcon column="dob"/>
                                    </th>
                                    <th className="p-4 border-r">Contact</th>
                                    <th className="p-4 border-r text-center">Status</th>
                                    <th className="p-4 text-center sticky right-0 bg-gray-50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 divide-y divide-gray-100">
                                {patients.data.length > 0 ? patients.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 border-r font-bold text-[#30499B] font-mono whitespace-nowrap">{p.p_id}</td>
                                        <td className="p-4 border-r font-bold text-slate-900 whitespace-nowrap uppercase tracking-tight">{p.name}</td>
                                        <td className="p-4 border-r whitespace-nowrap">{p.dob}</td>
                                        <td className="p-4 border-r whitespace-nowrap">{p.contact}</td>
                                        <td className="p-4 border-r text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                                                p.status === 'ADMITTED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>{p.status}</span>
                                        </td>
                                        <td className="p-4 sticky right-0 bg-white group-hover:bg-[#f9faff] z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                                            <Link href={route('doctor.patients.profile', p.id)} className="bg-[#30499B] text-white px-4 py-2 rounded-lg text-[9px] font-black hover:bg-blue-800 transition block text-center uppercase tracking-widest shadow-sm whitespace-nowrap">View Details</Link>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="p-24 text-center text-slate-400 italic font-medium">No records found.</td></tr>
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