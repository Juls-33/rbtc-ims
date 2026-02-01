import React from 'react';

export default function ViewOutpatientBillModal({ isOpen, onClose, patient, visit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Hospital Bill Invoice #{visit?.visit_id || 'N/A'}</h3>
                    <button onClick={onClose} className="text-white text-2xl hover:text-rose-200">&times;</button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="text-sm">
                            <p className="font-bold text-lg">Patient: {patient?.name}</p>
                            <p className="text-slate-500">Date Issued: {visit?.date}</p>
                            <p className="text-slate-500">Status: <span className="font-bold text-rose-600 uppercase">Unpaid</span></p>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Patient ID: {patient?.patient_id}</p>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 border-r w-1/3">Description</th>
                                <th className="p-3 border-r">Quantity</th>
                                <th className="p-3 border-r">Unit Price</th>
                                <th className="p-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3 border-r font-bold">Check-up Fee</td>
                                <td className="p-3 border-r">1</td>
                                <td className="p-3 border-r">2,500</td>
                                <td className="p-3 font-bold">2,500</td>
                            </tr>
                            {/* Medicine Add Row */}
                            <tr className="border-b bg-slate-50/50">
                                <td className="p-3 border-r font-bold italic">Add Medicine</td>
                                <td className="p-3 border-r text-slate-400">Name</td>
                                <td className="p-3 border-r text-slate-400">Quantity</td>
                                <td className="p-3"><button className="bg-[#488D6A] text-white px-3 py-1 rounded text-[10px] font-bold uppercase">ADD</button></td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 border-r">Antibiotics IV</td>
                                <td className="p-3 border-r">2</td>
                                <td className="p-3 border-r">500</td>
                                <td className="p-3 font-bold">1000</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="text-right space-y-1 pr-4">
                        <h4 className="text-xl font-bold">GRAND TOTAL: Php 2,050</h4>
                        <p className="font-bold text-slate-600">Balance: Php 2,050</p>
                        <div className="flex justify-end items-center gap-3 mt-4">
                            <label className="font-bold text-sm italic underline">Amount to pay:</label>
                            <input type="number" className="w-32 border-b border-slate-800 outline-none text-right font-bold" />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 border-t pt-6">
                        <button onClick={onClose} className="px-10 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase">CANCEL</button>
                        <button className="px-10 py-2 bg-[#488D6A] text-white rounded font-bold text-xs uppercase">PAY</button>
                        <button className="px-10 py-2 bg-[#488D6A] text-white rounded font-bold text-xs uppercase">PRINT PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
}