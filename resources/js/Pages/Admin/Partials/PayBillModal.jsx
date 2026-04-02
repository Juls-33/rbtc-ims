import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function PayBillModal({ isOpen, onClose, bill, patient }) {
    // --- Form State ---
    const { data, setData, post, processing, errors, reset } = useForm({
        bill_id: '',
        amount_to_pay: '',
    });

    // --- Sync Data when Bill opens ---
    useEffect(() => {
        if (bill) {
            setData({
                bill_id: bill.id || bill.bill_id,
                amount_to_pay: bill.balance || bill.total_amount || 0
            });
        }
    }, [bill, isOpen]);

    const handleMarkAsPaid = (e) => {
        e.preventDefault();
        post(route('admin.billing.pay'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    // Calculate remaining balance for the UI
    const totalAmount = parseFloat(bill?.total_amount || 0);
    const balanceRemaining = Math.max(0, totalAmount - (parseFloat(data.amount_to_pay) || 0));

    if (!isOpen || !bill) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 text-slate-800">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                
                {/* Custom Header - Matching your Admin Style */}
                <div className="bg-[#3D52A0] text-white p-5 flex justify-between items-center shadow-sm">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight">Payment Processing</h3>
                        <p className="text-[10px] text-blue-100 font-mono font-bold uppercase tracking-widest">Invoice #{bill.bill_id || bill.id}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-2xl transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Invoice Info Section */}
                    <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 shadow-inner">
                                <span className="text-[10px] text-center font-black text-slate-400 leading-tight uppercase">RBTC<br/>Logo</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bill For</p>
                                <p className="font-black text-xl text-slate-800 leading-none">{patient.name}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Patient ID: <span className="font-bold">{patient.patient_id || patient.id}</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date Issued</p>
                            <p className="font-bold text-sm text-slate-700">{bill.billing_date || new Date().toLocaleDateString()}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-[10px] font-black uppercase">
                                {bill.status || 'Unpaid'}
                            </span>
                        </div>
                    </div>

                    {/* Simple Breakdown Table */}
                    <div className="overflow-hidden border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-black uppercase text-slate-500 tracking-wider">Description</th>
                                    <th className="p-4 font-black uppercase text-slate-500 text-center">Qty</th>
                                    <th className="p-4 font-black uppercase text-slate-500 text-right">Price</th>
                                    <th className="p-4 font-black uppercase text-slate-500 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-700">{bill.room_details || 'Room Charges'}</td>
                                    <td className="p-4 text-center font-bold text-slate-600">{bill.nights_stayed || 1}</td>
                                    <td className="p-4 text-right font-mono text-slate-500">₱{(bill.room_rate || 0).toLocaleString()}</td>
                                    <td className="p-4 text-right font-black text-slate-800">₱{(bill.room_charge || 0).toLocaleString()}</td>
                                </tr>
                                {/* Additional rows can be mapped here */}
                            </tbody>
                        </table>
                    </div>

                    {/* Calculation Area */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="w-full md:w-auto space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Amount to Pay (PHP)</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 group-focus-within:text-emerald-500">₱</span>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={data.amount_to_pay}
                                        onChange={e => setData('amount_to_pay', e.target.value)}
                                        className="w-full md:w-56 bg-white border-2 border-slate-200 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-emerald-500 font-black text-xl text-emerald-600 shadow-sm transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.amount_to_pay && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.amount_to_pay}</p>}
                            </div>
                        </div>

                        <div className="w-full md:w-auto text-right space-y-1">
                            <div className="flex justify-between md:justify-end items-center gap-8 border-b border-slate-200 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Grand Total:</span>
                                <span className="text-xl font-black text-slate-800">₱{totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="flex justify-between md:justify-end items-center gap-8 pt-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">Balance Remaining:</span>
                                <span className={`text-xl font-black ${balanceRemaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    ₱{balanceRemaining.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                        <button 
                            onClick={onClose} 
                            className="order-3 sm:order-1 px-4 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <a 
                            href={route('admin.billing.inpatient.pdf', bill.id || bill.bill_id)}
                            target="_blank"
                            className="order-2 sm:order-2 px-4 py-3 bg-slate-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest text-center hover:bg-slate-900 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print PDF
                        </a>
                        <button 
                            onClick={handleMarkAsPaid}
                            disabled={processing || !data.amount_to_pay}
                            className="order-1 sm:order-3 px-4 py-3 bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {processing ? 'Processing...' : 'Mark as Paid'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}