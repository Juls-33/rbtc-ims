import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function StaffLogs({ logs = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const filteredLogs = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return logs.filter(log => 
            log.performed_by.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.description.toLowerCase().includes(query)
        );
    }, [searchQuery, logs]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

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
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                    <div>
                        <h2 className="font-black text-lg uppercase tracking-tighter">System Audit Log</h2>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">History of all personnel updates</p>
                    </div>
                    <Link 
                        href={route('admin.staff')} 
                        className="text-xs bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold transition-all"
                    >
                        RETURN TO DIRECTORY
                    </Link>
                </div>

                <div className="p-6">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Search logs by staff, action, or details..."
                        className="w-full md:w-1/2 mb-6 border-slate-300 rounded shadow-sm text-sm focus:ring-[#3D52A0]"
                    />

                    <div className="border border-slate-200 rounded overflow-hidden">
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
                            <tbody className="text-slate-700">
                                {currentItems.map((log) => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="p-4 border-r font-mono text-[11px] text-slate-500">{log.created_at}</td>
                                        <td className="p-4 border-r font-bold text-slate-800">{log.performed_by}</td>
                                        <td className="p-4 border-r">
                                            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 border-r italic text-slate-600">{log.description}</td>
                                        <td className="p-4 font-mono text-[11px] text-slate-400">{log.ip_address}</td>
                                    </tr>
                                ))}
                                {currentItems.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-slate-400 italic font-bold">No history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            filteredLength={filteredLogs.length}
                            indexOfFirstItem={indexOfFirstItem}
                            indexOfLastItem={Math.min(indexOfLastItem, filteredLogs.length)}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}