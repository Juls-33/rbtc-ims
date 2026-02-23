import { useForm, router } from '@inertiajs/react';
import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/Components/Button';
import DischargeWarningModal from './DischargeWarningModal';

export default function DischargeModal({ isOpen, onClose, patient }) {
    const [showWarning, setShowWarning] = useState(false);
    
    // --- 1. DATA PREP ---
    const admission = patient?.active_admission;
    const totalBalance = parseFloat(admission?.balance || 0);

    const { data, setData, post, processing } = useForm({ 
        admission_id: admission?.id || '',
        amount_to_pay: 0,
        payment_type: 'full', // Default action
    });

    // Sync data when modal opens
    useEffect(() => {
        if (admission?.id) {
            setData({
                admission_id: admission.id,
                amount_to_pay: parseFloat(admission.balance || 0),
                payment_type: 'full'
            });
        }
    }, [admission, isOpen]);

    // --- 2. HANDLERS ---
    const handleDischargeAndPay = (e) => {
        e.preventDefault();
        
        if (data.amount_to_pay > totalBalance) {
            alert(`Payment (₱${data.amount_to_pay}) cannot exceed balance (₱${totalBalance})`);
            return;
        }

        router.post(route('admin.admissions.discharge'), {
            ...data,
            payment_type: 'full'
        }, {
            onSuccess: () => onClose(),
        });
    };

    const confirmDischargeOnly = () => {
        router.post(route('admin.admissions.discharge'), {
            admission_id: admission.id,
            payment_type: 'none',
            amount_to_pay: 0
        }, { 
            onSuccess: () => {
                setShowWarning(false);
                onClose();
            }
        });
    };

    if (!isOpen || !admission) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 text-slate-800">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                
                {/* PREMIUM HEADER */}
                <div className="bg-[#3D52A0] text-white p-6 flex justify-between items-center shadow-lg">
                    <div>
                        <h3 className="font-black text-xl uppercase tracking-tighter">Final Discharge Settlement</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mt-1">Admission ID: ADM-{String(admission.id).padStart(5, '0')}</p>
                    </div>
                    <button onClick={onClose} className="text-white text-3xl hover:text-rose-300 transition-colors">&times;</button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto scrollbar-thin">
                    {/* PATIENT SUMMARY CARD */}
                    <div className="flex justify-between items-start bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</p>
                            <h4 className="text-2xl font-black text-[#3D52A0] uppercase tracking-tight">{patient?.name}</h4>
                            <div className="flex gap-4 pt-2">
                                <p className="text-xs font-bold text-slate-500">Inbound: <span className="text-slate-800">{admission.admission_date}</span></p>
                                <p className="text-xs font-bold text-slate-500">Outbound: <span className="text-emerald-600 uppercase font-black">{new Date().toLocaleDateString()} (Today)</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Room</p>
                            <p className="font-black text-slate-800 uppercase">{patient?.current_room}</p>
                        </div>
                    </div>

                    {/* ITEMIZED SUMMARY TABLE */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-100 text-slate-500 font-black uppercase tracking-widest border-b">
                                <tr>
                                    <th className="p-4">Billing Category</th>
                                    <th className="p-4 text-right">Subtotal Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-4 font-bold text-slate-600 uppercase">Room Accommodation Charges</td>
                                    <td className="p-4 text-right font-mono font-black text-slate-800">₱ {parseFloat(admission.total_bill - admission.bill_items.reduce((s,i) => s + parseFloat(i.total_price), 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                                <tr className="border-b bg-slate-50/50">
                                    <td className="p-4 font-bold text-slate-600 uppercase">Medicine & Supply Items</td>
                                    <td className="p-4 text-right font-mono font-black text-slate-800">₱ {parseFloat(admission.bill_items.reduce((s,i) => s + parseFloat(i.total_price), 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-black text-[#3D52A0] uppercase">Accumulated Total Bill</td>
                                    <td className="p-4 text-right font-black text-xl text-[#3D52A0]">₱ {parseFloat(admission.total_bill).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* FINANCIAL ACTION CARD */}
                    <div className="bg-[#2E4696] rounded-2xl p-7 text-white shadow-xl space-y-6 border border-white/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 block mb-1">Total Outstanding Balance</span>
                                <h2 className="text-4xl font-black text-white italic underline decoration-emerald-400 decoration-4 underline-offset-8">
                                    ₱ {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="text-right">
                                <label className="text-[10px] font-black uppercase text-blue-200 block mb-2 tracking-widest">Amount Tendering (₱)</label>
                                <input 
                                    type="number" 
                                    value={data.amount_to_pay}
                                    onChange={e => setData('amount_to_pay', e.target.value)}
                                    className="w-48 bg-blue-900/50 border-2 border-emerald-400/50 rounded-xl px-4 py-3 text-2xl font-black text-emerald-400 outline-none text-right focus:border-emerald-400 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleDischargeAndPay}
                                disabled={processing || data.amount_to_pay <= 0}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-30 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
                            >
                                Discharge & Finalize Payment
                            </button>
                            <button 
                                onClick={() => setShowWarning(true)}
                                className="bg-[#C84B4B] hover:bg-[#A63E3E] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
                            >
                                Discharge Only (Unpaid)
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-2">
                        <button onClick={onClose} className="px-10 py-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors">Cancel Process</button>
                        <button className="px-10 py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                            Generate Receipt PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* NESTED WARNING MODAL */}
            <DischargeWarningModal 
                isOpen={showWarning} 
                onClose={() => setShowWarning(false)} 
                onConfirm={confirmDischargeOnly} 
                patientName={patient?.name}
                balance={totalBalance}
            />
        </div>
    );
}