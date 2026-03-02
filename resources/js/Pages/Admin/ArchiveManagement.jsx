import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';

export default function ArchiveManagement({ archives, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [isProcessing, setIsProcessing] = useState(false);

    // SERVER SYNC: Debounced Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('admin.archive.index'), 
                { search: searchQuery },
                { preserveState: true, replace: true, preserveScroll: true, only: ['archives', 'filters'] }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const formatPurgeTime = (totalDays) => {
        if (totalDays <= 0) return "PURGE PENDING";
        const years = Math.floor(totalDays / 365);
        const months = Math.floor((totalDays % 365) / 30);
        const days = Math.floor(totalDays % 30);

        const parts = [];
        if (years > 0) parts.push(`${years}Y`);
        if (months > 0) parts.push(`${months}M`);
        if (days > 0 || parts.length === 0) parts.push(`${days}D`);
        return parts.join(' ');
    };

    const handleRestore = (id) => {
        if (confirm('Restore this record to active management?')) {
            router.post(route('admin.archive.restore', id), {}, {
                onStart: () => setIsProcessing(true),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    const handlePermanentDelete = (id) => {
        if (confirm('WARNING: Irreversible action. Wipe data permanently?')) {
            router.delete(route('admin.archive.destroy', id), {
                onStart: () => setIsProcessing(true),
                onFinish: () => setIsProcessing(false),
            });
        }
    };

    return (
        <AuthenticatedLayout header="Admin / Data Archive / Recycle Bin">
            <Head title="Archive Management" />

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-red-700 text-white p-5 flex justify-between items-center border-b-4 border-red-900 shadow-md">
                    <div>
                        <h2 className="font-black text-xl uppercase tracking-tighter flex items-center gap-2">
                            System Archive Bin
                        </h2>
                        <p className="text-[10px] text-red-100 uppercase tracking-[0.2em] mt-1 font-bold opacity-90">
                            Legal Compliance: Records are deleted after 5 years
                        </p>
                    </div>
                    <div className="bg-black/20 px-4 py-2 rounded-lg border border-white/10">
                        <span className="text-xs font-black text-red-50">
                            {archives.total || 0} ITEMS ARCHIVED
                        </span>
                    </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                    <div className="relative w-full md:w-1/3 mb-8">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search archived records..."
                            className="w-full border-slate-300 rounded-xl p-3 text-xs focus:ring-red-500 focus:border-red-500 transition-all pl-10"
                        />
                    </div>

                    <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white">
                        <table className="w-full text-left text-sm min-w-[1000px] border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r w-24 text-center">Type</th>
                                    <th className="p-4 border-r">Subject Name</th>
                                    <th className="p-4 border-r">Reason</th>
                                    <th className="p-4 border-r text-center">Archived By</th>
                                    <th className="p-4 border-r text-center">Date Archived</th>
                                    <th className="p-4 text-center">Purge Countdown</th>
                                    <th className="p-4 text-center sticky right-0 bg-slate-50 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] w-48">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {archives.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 border-r text-center">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                                item.type === 'Patient' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}> {item.type} </span>
                                        </td>
                                        <td className="p-4 border-r font-black text-slate-800 tracking-tight uppercase text-xs whitespace-nowrap">{item.display_name}</td>
                                        <td className="p-4 border-r italic text-slate-500 text-[11px] leading-tight max-w-[250px]">{item.reason || 'N/A'}</td>
                                        <td className="p-4 border-r text-center font-bold text-slate-600 text-[10px] uppercase whitespace-nowrap">{item.archived_by}</td>
                                        <td className="p-4 border-r text-center font-mono text-[11px] text-slate-500 whitespace-nowrap">{item.archived_at}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center min-w-[120px]">
                                                <span className="text-[11px] font-black text-slate-800 tracking-tight whitespace-nowrap">
                                                    {formatPurgeTime(item.days_left)}
                                                </span>
                                                <div className="w-20 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                    <div className="h-full bg-rose-500" style={{ width: `${Math.max(5, (item.days_left / 1825) * 100)}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                                            <div className="flex gap-2 justify-center whitespace-nowrap">
                                                <Button variant="success" className="text-[9px] py-1.5 px-3 font-black" onClick={() => handleRestore(item.id)} disabled={isProcessing}>RESTORE</Button>
                                                <Button variant="danger" className="text-[9px] py-1.5 px-3 font-black" onClick={() => handlePermanentDelete(item.id)} disabled={isProcessing}>DELETE</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {archives.data.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="p-24 text-center text-slate-400 italic font-bold">The archive bin is currently empty.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50/30">
                    <Pagination data={archives} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}