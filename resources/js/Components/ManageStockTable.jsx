import React from 'react';
import Button from '@/Components/Button';

export default function ManageStockTable({ items, expandedRow, toggleRow, today, onManage, onEdit, onDelete, sortConfig, onSort }) {
    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 font-bold">↑</span> 
            : <span className="ml-1 text-blue-600 font-bold">↓</span>;
    };
    return (
        <div className="overflow-x-auto relative border border-slate-200 rounded">
            <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                    <tr>
                        <th className="p-3 w-10 text-center"></th>
                        <th className="p-3 border-r border-slate-200 min-w-[120px]">SKU</th>
                        <th 
                            className="p-3 border-r cursor-pointer hover:bg-slate-100 transition-colors" 
                            onClick={() => onSort('name')}
                        >
                            Medicine Name <SortIcon column="name" />
                        </th>
                        <th className="p-3 border-r border-slate-200 min-w-[150px]">Category</th>
                        <th 
                            className="p-3 border-r text-center cursor-pointer hover:bg-slate-100 transition-colors" 
                            onClick={() => onSort('calculatedTotal')}
                        >
                            Total Stock <SortIcon column="calculatedTotal" />
                        </th>
                        <th className="p-3 border-r text-center cursor-pointer hover:bg-slate-100" onClick={() => onSort('calculatedSoonest')}>
                            Expiry <SortIcon column="calculatedSoonest" />
                        </th>
                        <th className="p-3 border-r text-center cursor-pointer hover:bg-slate-100" onClick={() => onSort('calculatedStatus')}>
                            Status <SortIcon column="calculatedStatus" />
                        </th>
                        
                        {/* --- FIXED ACTIONS HEADER --- */}
                        <th className="p-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-20 w-[160px]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="text-slate-600">
                    {items.map((item) => (
                        <React.Fragment key={item.id}>
                            <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors group">
                                <td className="p-3 text-center border-r border-slate-200">
                                    <button onClick={() => toggleRow(item.id)} className="font-bold text-lg text-slate-400 hover:text-slate-600">
                                        {expandedRow === item.id ? '-' : '+'}
                                    </button>
                                </td>
                                <td className="p-3 font-medium border-r border-slate-200 font-mono text-xs">{item.sku}</td>
                                <td className="p-3 font-bold text-slate-800 border-r border-slate-200">{item.name}</td>
                                <td className="p-3 border-r border-slate-200">{item.category}</td>
                                <td className="p-3 text-center font-bold border-r border-slate-200">{item.calculatedTotal}</td>
                                <td className="p-3 text-center border-r border-slate-200 font-medium">{item.calculatedSoonest || '-'}</td>
                                <td className="p-3 text-center border-r border-slate-200">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                                        item.calculatedStatus === 'OUT OF STOCK' ? 'bg-red-100 text-red-600' :
                                        item.calculatedStatus === 'LOW STOCK' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                    }`}>
                                        {item.calculatedStatus}
                                    </span>
                                </td>

                                {/* --- FIXED ACTIONS CELL --- */}
                                <td className="p-3 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <Button 
                                            onClick={() => onManage(item)} 
                                            className="text-[9px] py-1 font-black uppercase tracking-widest"
                                        >
                                            Manage Batches
                                        </Button>
                                        <div className="flex gap-1">
                                            <Button 
                                                variant="warning" 
                                                onClick={() => onEdit(item)} 
                                                className="text-[9px] py-1 flex-1 font-black uppercase"
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => onDelete(item)} 
                                                className="text-[9px] py-1 flex-1 font-black uppercase"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            {expandedRow === item.id && (
                                <tr className="bg-slate-50">
                                    {/* colSpan updated to include the new sticky column */}
                                    <td colSpan="8" className="p-0 border-b border-slate-200">
                                        <div className="p-4 bg-slate-50 flex justify-center">
                                            <table className="w-full max-w-4xl bg-white border-l-8 border-[#2E4696] shadow-sm rounded-r overflow-hidden">
                                                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                                    <tr>
                                                        <th className="p-2 border border-slate-200">Batch ID</th>
                                                        <th className="p-2 border border-slate-200">Date Received</th>
                                                        <th className="p-2 border border-slate-200">Expiry Date</th>
                                                        <th className="p-2 border border-slate-200">Batch Stock</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {item.batches?.map((batch, idx) => (
                                                        <tr key={idx} className={`text-xs ${batch.expiry < today ? 'bg-red-50 text-red-400' : 'text-slate-600'}`}>
                                                            <td className="p-2 border border-slate-100 text-center font-mono">{batch.id}</td>
                                                            <td className="p-2 border border-slate-100 text-center">{batch.received}</td>
                                                            <td className={`p-2 border border-slate-100 text-center font-bold ${batch.expiry < today ? 'text-red-600' : ''}`}>
                                                                {batch.expiry} {batch.expiry < today && '(EXPIRED)'}
                                                            </td>
                                                            <td className="p-2 border border-slate-100 text-center font-black text-slate-800">{batch.stock}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}