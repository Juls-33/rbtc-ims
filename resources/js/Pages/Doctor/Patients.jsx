import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import AddOutpatientModal from './Partials/AddOutpatientModal'; // Imports our new revision modal

export default function Patients({ auth, patients, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [sortConfig, setSortConfig] = useState({
        key: filters?.sort || 'id',
        direction: filters?.direction || 'desc'
    });

    // Control visibility state for the outpatient duplicate feature modal
    const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);

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
            ? <span className="ml-1 text-blue-600 font-black">↑</span> 
            : <span className="ml-1 text-blue-600 font-black">↓</span>;
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Doctor / Patient Registry"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6">
                    <span className="text-white font-semibold text-lg">Patient Master Database</span>
                    <span className="text-xs text-blue-100 uppercase font-bold tracking-widest">Clinical Access Only</span>
                </div>
            }
        >
            <Head title="Doctor - Patient Database" />

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[calc(100vh-230px)]">
                {/* FILTER / ACTION ROW */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by ID, Name or Blind Index..."
                                className="pl-9 pr-4 py-2 w-full text-xs font-medium border border-slate-200 bg-white rounded-lg focus:border-[#30499B] focus:ring-1 focus:ring-[#30499B] text-slate-700 placeholder-slate-400 transition"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="text-xs font-bold border border-slate-200 bg-white rounded-lg px-3 py-2 text-slate-600 focus:border-[#30499B] focus:ring-1 focus:ring-[#30499B]"
                        >
                            <option value="">All Statuses</option>
                            <option value="Inpatient">Inpatient</option>
                            <option value="Outpatient">Outpatient</option>
                        </select>
                    </div>

                    {/* REVISION TRIGGER BUTTON: Mirrored styling layout from the Admin Panel */}
                    <div className="w-full sm:w-auto flex justify-end">
                        <button
                            onClick={() => setIsAddVisitModalOpen(true)}
                            className="bg-[#2E7D32] hover:bg-green-700 active:bg-green-800 text-white font-black text-[10px] tracking-widest uppercase px-5 py-2.5 rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Outpatient Visit
                        </button>
                    </div>
                </div>

                {/* PATIENTS DATA TABLE */}
                <div className="flex-grow overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <table className="min-w-full divide-y divide-slate-100 text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                    <th onClick={() => handleSort('id')} className="p-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">Patient ID <SortIcon column="id" /></th>
                                    <th onClick={() => handleSort('last_name')} className="p-4 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">Full Name <SortIcon column="last_name" /></th>
                                    <th className="p-4 whitespace-nowrap">Contact Number</th>
                                    <th className="p-4 whitespace-nowrap">Latest Visit</th>
                                    <th className="p-4 text-center whitespace-nowrap">Classification</th>
                                    <th className="p-4 sticky right-0 bg-slate-50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] text-center whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white text-xs font-medium text-slate-700">
                                {patients.data && patients.data.length > 0 ? patients.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-[#f9faff]/60 transition-colors group">
                                        <td className="p-4 font-mono font-bold text-[#30499B]">{p.id}</td>
                                        <td className="p-4 font-bold text-slate-900 group-hover:text-[#30499B] transition-colors">{p.name}</td>
                                        <td className="p-4 text-slate-500">{p.phone || 'None Recorded'}</td>
                                        <td className="p-4 text-slate-500 font-mono text-[11px]">{p.latest_visit || 'No visits recorded'}</td>
                                        <td className="p-4 text-center">
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

                {/* PAGINATION FOOTER */}
                <div className="p-6 border-t bg-gray-50/50">
                    <Pagination data={patients} />
                </div>
            </div>

            {/* INSTANTIATE MODAL DIALOG ENTRY ELEMENT */}
            <AddOutpatientModal 
                isOpen={isAddVisitModalOpen} 
                onClose={() => setIsAddVisitModalOpen(false)} 
            />
        </AuthenticatedLayout>
    );
}