import React from 'react';
import Button from '@/Components/Button';

export default function ManageStockTable({ items, expandedRow, toggleRow, today, onManage, onEdit, onDelete }) {
    return (
        <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                    <th className="p-3 w-10 text-center"></th>
                    <th className="p-3 border-r border-slate-200">SKU</th>
                    <th className="p-3 border-r border-slate-200">Medicine Name</th>
                    <th className="p-3 border-r border-slate-200">Category</th>
                    <th className="p-3 border-r border-slate-200 text-center">Total Stock</th>
                    <th className="p-3 border-r border-slate-200 text-center">Soonest Expiry</th>
                    <th className="p-3 border-r border-slate-200 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="text-slate-600">
                {items.map((item) => (
                    <React.Fragment key={item.id}>
                        <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-center border-r border-slate-200">
                                <button onClick={() => toggleRow(item.id)} className="font-bold text-lg text-slate-400 hover:text-slate-600">
                                    {expandedRow === item.id ? '-' : '+'}
                                </button>
                            </td>
                            <td className="p-3 font-medium border-r border-slate-200">{item.sku}</td>
                            <td className="p-3 font-bold text-slate-800 border-r border-slate-200">{item.name}</td>
                            <td className="p-3 border-r border-slate-200">{item.category}</td>
                            <td className="p-3 text-center font-bold border-r border-slate-200">{item.calculatedTotal}</td>
                            <td className="p-3 text-center border-r border-slate-200">{item.calculatedSoonest || '-'}</td>
                            <td className="p-3 text-center border-r border-slate-200">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                    item.calculatedStatus === 'OUT OF STOCK' ? 'bg-red-100 text-red-600' :
                                    item.calculatedStatus === 'LOW STOCK' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                    {item.calculatedStatus}
                                </span>
                            </td>
                            <td className="p-3">
                                <div className="flex flex-col gap-1">
                                    <Button onClick={() => onManage(item)}>MANAGE BATCHES</Button>
                                    <Button variant="warning" onClick={() => onEdit(item)}>EDIT</Button>
                                    <Button variant="danger" onClick={() => onDelete(item)}>DELETE</Button>
                                </div>
                            </td>
                        </tr>
                        {expandedRow === item.id && (
                            <tr className="bg-slate-50">
                                <td colSpan="8" className="p-0">
                                    <table className="w-full bg-white border-l-8 border-[#2E4696]">
                                        <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-500">
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
                                                    <td className="p-2 border border-slate-100">{batch.id}</td>
                                                    <td className="p-2 border border-slate-100">{batch.received}</td>
                                                    <td className={`p-2 border border-slate-100 font-bold ${batch.expiry < today ? 'text-red-600' : ''}`}>
                                                        {batch.expiry} {batch.expiry < today && '(EXPIRED)'}
                                                    </td>
                                                    <td className="p-2 border border-slate-100 font-bold">{batch.stock}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
}