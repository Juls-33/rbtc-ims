// resources/js/Pages/Admin/Partials/ViewBillModal.jsx

import React, { useState } from 'react';
import Button from '@/Components/Button';
import PayBillModal from './PayBillModal';

export default function ViewBillModal({ isOpen, onClose, admissionId, bills = [], patient }) {
    const [selectedBillId, setSelectedBillId] = useState('');

    // Logic to find the specific bill details for the breakdown
    const selectedBill = bills.find(b => b.bill_id === selectedBillId);

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedBillForPayment, setSelectedBillForPayment] = useState(null);

    if (!isOpen) return null;

    const handleOpenPayment = (bill) => {
        setSelectedBillForPayment(bill);
        setIsPayModalOpen(true);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">View Bill: {admissionId}</h3>
                    <button onClick={onClose} className="text-white text-2xl hover:text-rose-200 transition-colors">&times;</button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    {/* 1. Billing History Table */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-2">Billing History</h4>
                        <table className="w-full text-left text-xs border">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="p-2 border-r">Bill ID</th>
                                    <th className="p-2 border-r">Billing Date</th>
                                    <th className="p-2 border-r">Date Paid</th>
                                    <th className="p-2 border-r">Total Amount</th>
                                    <th className="p-2 border-r">Status</th>
                                    <th className="p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.bill_id} className="border-b hover:bg-slate-50">
                                        <td className="p-2 border-r font-bold">{bill.bill_id}</td>
                                        <td className="p-2 border-r">{bill.billing_date}</td>
                                        <td className="p-2 border-r">{bill.date_paid || '—'}</td>
                                        <td className="p-2 border-r">{bill.total_amount}</td>
                                        <td className={`p-2 border-r font-bold ${bill.status === 'UNPAID' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {bill.status}
                                        </td>
                                        <td className="p-2 text-center">
                                            {bill.status === 'UNPAID' ? (
                                                <button 
                                                    onClick={() => handleOpenPayment(bill)}
                                                    className="bg-rose-500 text-white text-[8px] px-2 py-1 rounded font-bold hover:bg-rose-600"
                                                >
                                                    PAY BILL
                                                </button>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 2. Bill Breakdown Selector */}
                    <div>
                        <h4 className="font-bold text-slate-700 mb-2">Bill Breakdown</h4>
                        <select 
                            value={selectedBillId} 
                            onChange={(e) => setSelectedBillId(e.target.value)}
                            className="w-full border rounded px-3 py-2 text-sm bg-white"
                        >
                            <option value="">Select Bill ID</option>
                            {bills.map(bill => (
                                <option key={bill.bill_id} value={bill.bill_id}>{bill.bill_id}</option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Detailed Bill Itemization */}
                    {selectedBill && (
                        <div>
                            <h4 className="font-bold text-slate-700 mb-2">{selectedBill.bill_id} Details</h4>
                            <table className="w-full text-left text-xs border">
                                <thead className="bg-slate-50 border-b font-bold">
                                    <tr>
                                        <th className="p-2 border-r">Item</th>
                                        <th className="p-2 border-r">Details</th>
                                        <th className="p-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-2 border-r font-bold">Room Charges</td>
                                        <td className="p-2 border-r">{selectedBill.room_details}</td>
                                        <td className="p-2">{selectedBill.room_charge}</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-2 border-r font-bold">Medicines</td>
                                        <td className="p-2 border-r">(Sum of all meds taken)</td>
                                        <td className="p-2">{selectedBill.medicine_charge}</td>
                                    </tr>
                                    <tr className="bg-slate-50 font-bold">
                                        <td className="p-2 border-r"></td>
                                        <td className="p-2 border-r text-right uppercase">Total Bill:</td>
                                        <td className="p-2">{selectedBill.total_amount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer Close Button */}
                    <div className="flex justify-center pt-4">
                        <button onClick={onClose} className="px-10 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase shadow hover:bg-slate-600 transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
            <PayBillModal 
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                bill={selectedBillForPayment}
                patient={patient}
            />
        </div>
    );
}