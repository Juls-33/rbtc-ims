import React, { useState, useMemo } from 'react';

export default function StockLedgerTable({ logs }) {
    const [sortConfig, setSortConfig] = useState({ key: 'dateTime', direction: 'desc' });
    const sortedLogs = useMemo(() => {
        let sortableItems = [...logs];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [logs, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <span className="ml-1 opacity-20">↕</span>;
        return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    };

    const Header = ({ label, sortKey, className = "" }) => (
        <th 
            className={`p-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors ${className}`}
            onClick={() => requestSort(sortKey)}
        >
            <div className="flex items-center">
                {label} <SortIcon columnKey={sortKey} />
            </div>
        </th>
    );

    return (
        <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[9px] tracking-widest border-b border-slate-200 sticky top-0 z-10">
                <tr>
                    <Header label="Date & Time" sortKey="dateTime" />
                    <Header label="Batch/Target" sortKey="id" />
                    <Header label="Medicine" sortKey="medicine_name" />
                    <Header label="Action" sortKey="action" />
                    <Header label="Amount" sortKey="amount" className="text-center" />
                    <Header label="Reason" sortKey="reason" />
                    <Header label="Processed By" sortKey="admin" />
                </tr>
            </thead>

            <tbody className="text-slate-600">
                {sortedLogs.length > 0 ? sortedLogs.map((log, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold border-r border-slate-200">{log.dateTime}</td>
                        <td className="p-3 border-r border-slate-200 text-xs font-mono">
                            {log.id !== 'N/A' ? log.id : <span className="text-blue-500 font-bold">CATALOG</span>}
                        </td>
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{log.medicine_name}</td>
                        <td className="p-3 border-r border-slate-200">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                log.action === 'STOCK IN' ? 'bg-emerald-100 text-emerald-700' : 
                                log.action === 'DISPENSE' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                             }`}>
                                {log.action}
                             </span>
                        </td>
                        <td className={`p-3 border-r border-slate-200 text-center font-bold ${
                            log.amount === "0" ? 'text-slate-300' : (parseInt(log.amount) > 0 ? 'text-emerald-600' : 'text-rose-600')
                        }`}>
                            {log.amount === "0" ? "—" : (parseInt(log.amount) > 0 ? `${log.amount}` : log.amount)}
                        </td>
                        <td className="p-3 border-r border-slate-200 italic text-slate-500">{log.reason}</td>
                        <td className="p-3 font-bold text-slate-800">{log.admin}</td>
                    </tr>
                )) : (
                    <tr>
                        <td colSpan="7" className="p-10 text-center text-slate-400 italic">No logs found matching your criteria.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}