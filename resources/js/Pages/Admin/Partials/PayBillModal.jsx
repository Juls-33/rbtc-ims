// resources/js/Pages/Admin/Partials/PayBillModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function PayBillModal({ isOpen, onClose, bill, patient }) {
    const { data, setData, post, processing } = useForm({
        amount_to_pay: '',
        bill_id: bill?.bill_id || '',
    });

    const handleMarkAsPaid = (e) => {
        e.preventDefault();
        post(route('admin.billing.pay'), {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen || !bill) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Invoice Header */}
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Hospital Bill Invoice #{bill.bill_id}</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200">&times;</button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            {/* Logo Placeholder */}
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border">
                                <span className="text-[8px] text-center font-bold text-slate-400">RBTC LOGO</span>
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-lg">Patient: {patient.name}</p>
                                <p className="text-slate-500">Date Issued: {bill.billing_date}</p>
                                <p className="text-slate-500">Status: <span className="font-bold text-rose-600">{bill.status}</span></p>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Patient ID: {patient.patient_id}</p>
                    </div>

                    {/* Itemized Table */}
                    <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 border-r">Description</th>
                                <th className="p-3 border-r">Quantity</th>
                                <th className="p-3 border-r">Unit Price</th>
                                <th className="p-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3 border-r font-bold">{bill.room_details || 'Room 204 (Ward)'}</td>
                                <td className="p-3 border-r text-center">{bill.nights_stayed || 4}</td>
                                <td className="p-3 border-r">{bill.room_rate || 1500}</td>
                                <td className="p-3 font-bold">{bill.room_charge || 6000}</td>
                            </tr>
                            {/* Example Medication Rows */}
                            <tr className="border-b">
                                <td className="p-3 border-r">Paracetamol 500mg</td>
                                <td className="p-3 border-r text-center">10</td>
                                <td className="p-3 border-r">5</td>
                                <td className="p-3 font-bold">50</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 border-r">Antibiotics IV</td>
                                <td className="p-3 border-r text-center">2</td>
                                <td className="p-3 border-r">500</td>
                                <td className="p-3 font-bold">1000</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Financial Summary */}
                    <div className="space-y-2 text-right pr-4">
                        <h4 className="text-lg font-bold">GRAND TOTAL: Php {bill.total_amount}</h4>
                        <p className="text-md font-bold text-slate-600">Balance: Php {bill.total_amount}</p>
                        <div className="flex justify-end items-center gap-3 mt-4">
                            <label className="font-bold text-sm">Amount to Pay:</label>
                            <input 
                                type="number" 
                                value={data.amount_to_pay}
                                onChange={e => setData('amount_to_pay', e.target.value)}
                                className="w-40 border-b border-slate-800 outline-none text-right font-bold"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4 pt-6 border-t">
                        <button onClick={onClose} className="px-10 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase shadow hover:bg-slate-600 transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={handleMarkAsPaid}
                            disabled={processing}
                            className="px-8 py-2 bg-emerald-600 text-white rounded font-bold text-sm uppercase shadow hover:bg-emerald-700 transition-colors"
                        >
                            Mark as Paid
                        </button>
                        <button className="px-8 py-2 bg-[#3D52A0] text-white rounded font-bold text-sm uppercase shadow hover:bg-[#2E4696] transition-colors">
                            Print PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}