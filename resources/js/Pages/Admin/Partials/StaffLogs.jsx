import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function StaffLogs({ logs, filters }) {
    // 1. State initialized from server props
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // 2. 🔥 SERVER SYNC: Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('admin.staff.logs'), 
                { search: searchQuery },
                { 
                    preserveState: true, 
                    replace: true, 
                    preserveScroll: true 
                }
            );
        }, 300); // Wait 300ms after typing stops before hitting the DB

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const getActionColor = (action) => {
        if (action.includes('DELETE')) return 'bg-red-100 text-red-700 border-red-200';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-amber-100 text-amber-700 border-amber-200';
        if (action.includes('CREATE') || action.includes('ADD')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    return (
        <AuthenticatedLayout header="Admin / Staff Management / Audit Logs">
            <Head title="System Audit Logs" />

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#2E4696] text-white p-4 flex justify-between items-center shadow-md">
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-tighter">System Audit Log</h2>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">History of all personnel updates</p>
                    </div>
                    <Link 
                        href={route('admin.staff')} 
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded font-black tracking-widest border border-white/20 transition-all"
                    >
                        RETURN TO DIRECTORY
                    </Link>
                </div>

                <div className="p-6">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs by staff, action, or details..."
                        className="w-full md:w-1/2 mb-6 border-slate-300 rounded-lg shadow-sm text-xs focus:ring-[#3D52A0] p-3"
                    />

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-slate-600 font-black uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r">Timestamp (PHT)</th>
                                    <th className="p-4 border-r">Performed By</th>
                                    <th className="p-4 border-r">Action</th>
                                    <th className="p-4 border-r">Description</th>
                                    <th className="p-4">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-100">
                                {logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 border-r font-mono text-[11px] text-slate-500">{log.created_at}</td>
                                        <td className="p-4 border-r font-bold text-slate-800 uppercase text-[11px]">{log.performed_by}</td>
                                        <td className="p-4 border-r">
                                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r italic text-slate-600 text-xs tracking-tight">{log.description}</td>
                                        <td className="p-4 font-mono text-[11px] text-slate-400">{log.ip_address}</td>
                                    </tr>
                                ))}
                                {logs.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-slate-400 italic font-bold">No history found.</td>
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