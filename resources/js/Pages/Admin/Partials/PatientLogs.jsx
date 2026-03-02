import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function PatientLogs({ logs, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('admin.patient.logs'), 
                { search: searchQuery },
                { 
                    preserveState: true, 
                    replace: true, 
                    preserveScroll: true,
                    only: ['logs', 'filters'] 
                }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const getActionColor = (action) => {
        const act = action.toUpperCase();
        if (act.includes('ARCHIVED') || act.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
        if (act.includes('RESTORE')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (act.includes('UPDATE')) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    return (
        <AuthenticatedLayout header="Admin / Patient Management / Audit Logs">
            <Head title="Patient Audit Logs" />

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#2E4696] text-white p-4 flex justify-between items-center shadow-md">
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-tighter">Patient Management Audit</h2>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Traceability of all clinical and demographic updates</p>
                    </div>
                    <Link 
                        href={route('admin.patients')} 
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded font-black tracking-widest border border-white/20 transition-all"
                    >
                        BACK TO DIRECTORY
                    </Link>
                </div>

                <div className="p-6">
                    <div className="relative w-full md:w-1/2 mb-6">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by action, description, or staff name..."
                            className="w-full border-slate-300 rounded-lg shadow-sm text-xs focus:ring-[#3D52A0] focus:border-[#3D52A0] p-3 pl-10"
                        />
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
                            <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r">Timestamp (PHT)</th>
                                    <th className="p-4 border-r">Performed By</th>
                                    <th className="p-4 border-r">Action</th>
                                    <th className="p-4 border-r">Description</th>
                                    <th className="p-4">IP Source</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-100">
                                {logs.data.length > 0 ? logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 border-r font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                                        <td className="p-4 border-r font-bold text-slate-800 uppercase text-[11px]">{log.performed_by}</td>
                                        <td className="p-4 border-r">
                                            <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-tighter shadow-sm ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r italic text-slate-600 text-xs tracking-tight leading-relaxed">{log.description}</td>
                                        <td className="p-4 font-mono text-[11px] text-slate-400 group-hover:text-slate-600">{log.ip_address}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center text-slate-400 italic font-bold">
                                            No audit records matching your search were found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <Pagination data={logs} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}