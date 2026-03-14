import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function ViewBillModal({ isOpen, onClose, admissionId, patient, medicines = [] }) {
    const { patients, flash } = usePage().props;
    const [toast, setToast] = useState(null);

    const activePatient = useMemo(() => {
        const patientList = patients?.data || (Array.isArray(patients) ? patients : []);
        return patientList.find(p => p.id === patient?.id) || patient;
    }, [patients, patient]);
    const admission = useMemo(() => {
        if (!activePatient || !admissionId) return null;
        if (activePatient.active_admission?.id === admissionId) return activePatient.active_admission;
        return activePatient.admission_history?.find(adm => adm.id === admissionId);
    }, [activePatient, admissionId]);

    const billItems = admission?.bill_items || [];
    const statements = admission?.statements || [];

    const [selectedStatementIdx, setSelectedStatementIdx] = useState(0);
    const [paymentInput, setPaymentInput] = useState(0);
    const [medSearchTerm, setMedSearchTerm] = useState('');
    const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState(null); 
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [medQty, setMedQty] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editQty, setEditQty] = useState(1);
    
    const [isSubmittingMed, setIsSubmittingMed] = useState(false);
    const [isUpdatingMed, setIsUpdatingMed] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    
    const medDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (medDropdownRef.current && !medDropdownRef.current.contains(event.target)) {
                setIsMedDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentStatement = statements[selectedStatementIdx];
    const displayItems = currentStatement?.items || [];

    const totals = useMemo(() => {
        const statementTotal = parseFloat(currentStatement?.grand_total || 0);
        const overallBalance = parseFloat(admission?.balance || 0);
        const overallPaid = parseFloat(admission?.amount_paid || 0);
        const maxPayable = Number(overallBalance.toFixed(2));
        const safePaymentInput = Math.min(Math.max(0, parseFloat(paymentInput || 0)), maxPayable);
        const newBalanceAfterInput = Math.max(0, overallBalance - safePaymentInput);

        return { statementTotal, overallBalance, overallPaid, maxPayable, newBalanceAfterInput, safePaymentInput };
    }, [currentStatement, admission, paymentInput]);

    const localInventory = useMemo(() => {
        let inv = JSON.parse(JSON.stringify(medicines));
        billItems.forEach(item => {
            if (item.medicine_id) {
                const med = inv.find(m => m.id === parseInt(item.medicine_id));
                if (med) {
                    const batch = med.batches.find(b => b.id === parseInt(item.batch_id));
                    if (batch) batch.stock = Math.max(0, parseInt(batch.stock) - parseInt(item.quantity));
                    med.totalStock = med.batches.reduce((sum, b) => sum + parseInt(b.stock), 0);
                }
            }
        });
        return inv;
    }, [medicines, billItems]);
    const filteredMedicineResults = useMemo(() => {
        if (!medSearchTerm) return localInventory;
        const query = medSearchTerm.toLowerCase();
        return localInventory.filter(m => 
            m.name.toLowerCase().includes(query) || 
            m.brand_name.toLowerCase().includes(query)
        );
    }, [localInventory, medSearchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (medDropdownRef.current && !medDropdownRef.current.contains(event.target)) {
                setIsMedDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    useEffect(() => {
        //if (flash?.success) setToast({ message: flash.success, type: 'success' });
        if (flash?.error) setToast({ message: flash.error, type: 'error' });
    }, [flash]);

    useEffect(() => {
        if (isOpen) {
            setPaymentInput(0);
            if (statements.length > 0) setSelectedStatementIdx(statements.length - 1);
        }
    }, [isOpen, statements.length]);

    const handleQtyInput = (val, max, setter) => {
        if (val === "") { setter(""); return; }
        const num = parseInt(val);
        if (isNaN(num)) return;
        setter(Math.min(Math.max(0, num), max));
    };

    const handlePickMedicine = (med) => {
        if (med.totalStock <= 0) return;
        setSelectedMed(med);
        const availableBatch = med.batches?.find(b => b.stock > 0);
        setSelectedBatch(availableBatch || null);
        setMedSearchTerm(`${med.name} (${med.brand_name})`);
        setIsMedDropdownOpen(false);
        setMedQty(1);
    };

    const handleAddMedicine = () => {
        if (!selectedMed || !selectedBatch || medQty <= 0) return;
        setIsSubmittingMed(true);
        router.post(route('admin.billing.inpatient.addItem'), {
            admission_id: admission.id,
            medicine_id: selectedMed.id,
            batch_id: selectedBatch.id,
            description: `${selectedMed.name} (${selectedMed.brand_name})`,
            quantity: medQty,
            unit_price: selectedMed.price,
            total_price: medQty * selectedMed.price,
        }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedMed(null); setMedSearchTerm(''); setMedQty(1); },
            onFinish: () => setIsSubmittingMed(false)
        });
    };

    const saveEdit = (item) => {
        setIsUpdatingMed(true);
        router.put(route('admin.billing.inpatient.updateItem', item.id), {
            quantity: editQty,
            total_price: editQty * item.unit_price
        }, {
            onSuccess: () => setEditingId(null),
            onFinish: () => setIsUpdatingMed(false)
        });
    };

    const handleConfirmPayment = () => {
        if (isFinalizing || paymentInput <= 0) return;
        setIsFinalizing(true);
        router.post(route('admin.billing.inpatient.pay'), { 
            admission_id: admission.id,
            amount_paid: paymentInput,
        }, {
            onSuccess: () => { setShowPaymentConfirm(false); setPaymentInput(0); },
            onFinish: () => setIsFinalizing(false)
        });
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        router.delete(route('admin.billing.inpatient.removeItem', itemToDelete.id), { 
            onSuccess: () => setItemToDelete(null)
        });
    };

    if (!isOpen || !admission) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-2 md:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[100dvh] md:h-[95vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shadow-md shrink-0">
                    <div>
                        <h3 className="font-black text-lg md:text-xl uppercase tracking-tight">Billing System</h3>
                        <p className="text-[9px] text-blue-100 uppercase font-mono tracking-widest font-bold">Admission: #{admission.id}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-3xl leading-none">&times;</button>
                </div>

                <div className="p-4 md:p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar pb-64">
                    {/* PERIOD SELECTOR */}
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div className="w-full md:w-auto">
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Billing Period</label>
                            <select 
                                className="w-full md:w-auto bg-white border-slate-300 rounded-lg font-bold text-sm px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={selectedStatementIdx}
                                onChange={(e) => setSelectedStatementIdx(parseInt(e.target.value))}
                            >
                                {statements.map((stmt, idx) => (
                                    <option key={idx} value={idx}>Stmt #{stmt.index} ({stmt.period})</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-auto text-left md:text-right">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${currentStatement?.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                Status: {currentStatement?.status}
                            </span>
                        </div>
                    </div>

                    {/* ROOM CHARGES */}
                    <div className="space-y-2">
                        <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Statement Room Charges
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black flex justify-between items-center">
                            <span className="text-slate-500 text-xs">Total for this period:</span>
                            <span className="text-lg md:text-xl text-[#2E4696]">₱ {parseFloat(currentStatement?.room_total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>

                    {/* MEDICINE TABLE */}
                    <div className="space-y-2">
                        <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Medication & Supplies
                        </h4>
                        <div className="overflow-visible border border-slate-200 rounded-xl shadow-sm bg-white">
                            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                                <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b">
                                    <tr>
                                        <th className="p-4 border-r">Item Description</th>
                                        <th className="p-4 border-r text-center w-28">Qty</th>
                                        <th className="p-4 border-r text-right w-32">Price</th>
                                        <th className="p-4 text-right w-32">Total</th>
                                        <th className="p-4 text-center sticky right-0 bg-slate-50 z-20 w-32 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4 border-r font-bold text-slate-800">{item.description}</td>
                                            <td className="p-4 border-r text-center font-black text-sm">{item.quantity}</td>
                                            <td className="p-4 border-r text-right font-mono">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="p-4 text-right font-black text-emerald-700">₱{parseFloat(item.total_price).toLocaleString()}</td>
                                            <td className="p-4 text-center sticky right-0 bg-white z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                                                <button onClick={() => setItemToDelete(item)} className="text-rose-600 font-black uppercase text-[10px] hover:underline">Del</button>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {/* SEARCH ROW - 🔥 FIXED: Same overflow-visible logic as outpatient */}
                                    <tr className="bg-emerald-50/30 relative overflow-visible" ref={medDropdownRef}>
                                        <td className="p-3 border-r relative overflow-visible">
                                            <input 
                                                type="text" 
                                                placeholder="Search medicine..." 
                                                className="w-full border-slate-200 rounded-lg text-xs font-bold py-2.5 px-4 focus:ring-emerald-500 shadow-sm"
                                                value={medSearchTerm}
                                                onChange={(e) => {setMedSearchTerm(e.target.value); setIsMedDropdownOpen(true);}}
                                                onFocus={() => setIsMedDropdownOpen(true)}
                                            />
                                            {isMedDropdownOpen && (
                                                <div className="absolute z-[999] left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                                                    {filteredMedicineResults.map(m => (
                                                        <button 
                                                            key={m.id} 
                                                            type="button"
                                                            disabled={m.totalStock <= 0} 
                                                            className={`w-full text-left px-4 py-3 border-b flex justify-between items-center transition-colors ${m.totalStock > 0 ? 'hover:bg-emerald-50' : 'opacity-50 cursor-not-allowed bg-slate-50'}`} 
                                                            onClick={() => handlePickMedicine(m)}
                                                        >
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                                                                <p className="text-[9px] uppercase font-black text-slate-400">{m.brand_name} • Stock: {m.totalStock}</p>
                                                            </div>
                                                            <span className="font-bold text-emerald-600 font-mono">₱{m.price.toLocaleString()}</span>
                                                        </button>
                                                    ))}
                                                    {filteredMedicineResults.length === 0 && (
                                                        <div className="p-4 text-center text-slate-400 text-xs italic">No results found.</div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 border-r text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setMedQty(q => Math.max(1, q - 1))} className="w-7 h-7 bg-white border rounded-lg font-bold hover:bg-slate-100 shadow-sm">-</button>
                                                <input type="number" className="w-10 text-center p-0 border-none bg-transparent font-black text-xs" value={medQty} readOnly />
                                                <button onClick={() => setMedQty(q => q + 1)} className="w-7 h-7 bg-white border rounded-lg font-bold hover:bg-slate-100 shadow-sm">+</button>
                                            </div>
                                        </td>
                                        <td colSpan="3" className="p-3">
                                            <Button variant="success" className="w-full text-[10px] font-black tracking-widest py-2.5 rounded-lg shadow-sm" onClick={handleAddMedicine} disabled={!selectedMed || isSubmittingMed}>
                                                {isSubmittingMed ? 'ADDING...' : '+ ADD TO STATEMENT'}
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FINANCIAL SUMMARY BOX */}
                    <div className="bg-[#2E4696] rounded-2xl p-5 md:p-7 text-white shadow-xl space-y-6 border border-white/10 shrink-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/20 pb-4 gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-200">Period Total:</span>
                            <span className="text-3xl md:text-4xl font-black text-white decoration-emerald-400 decoration-4 underline-offset-8">
                                ₱ {totals.statementTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black uppercase text-blue-200 block tracking-widest">Amount to Pay (₱)</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-2xl font-black text-emerald-400 outline-none focus:border-emerald-400 shadow-inner"
                                        value={paymentInput} 
                                        onChange={e => setPaymentInput(Math.min(parseFloat(e.target.value) || 0, totals.maxPayable))}
                                    />
                                    <div className="flex gap-2 shrink-0">
                                        <Button variant="danger" className="flex-1 px-4 text-[10px]" onClick={() => setPaymentInput(0)}>CLEAR</Button>
                                        <Button variant="success" className="flex-1 px-4 text-[10px]" onClick={() => setPaymentInput(totals.maxPayable)}>FULL</Button>
                                    </div>
                                </div>
                                <p className="text-[9px] text-blue-300 uppercase font-black italic tracking-tighter">Overall Paid: ₱ {totals.overallPaid.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 p-5 rounded-2xl flex-1 text-center md:text-right border border-white/5 shadow-inner">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1">Balance Remaining</span>
                                <p className={`text-2xl md:text-3xl font-black ${totals.newBalanceAfterInput > 0 ? 'text-rose-400' : 'text-emerald-400'} transition-colors`}>
                                    ₱ {totals.newBalanceAfterInput.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 md:p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-center gap-3 shrink-0">
                    <Button variant="gray" onClick={onClose} className="w-full md:w-auto md:px-14 py-3 uppercase font-black text-[11px] tracking-widest order-2 md:order-1">Close</Button>
                    <a 
                        href={route('admin.billing.inpatient.pdf', admission.id)} 
                        target="_blank"
                        className="w-full md:w-auto inline-flex items-center justify-center px-8 md:px-14 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-black uppercase text-[11px] tracking-widest shadow-lg transition-all active:scale-95 order-1 md:order-2"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Bill
                    </a>
                    <Button 
                        variant="success" 
                        className="w-full md:w-auto md:px-14 py-3 uppercase font-black text-[11px] tracking-widest shadow-lg shadow-emerald-500/20 order-1 md:order-2"
                        disabled={paymentInput <= 0 || isFinalizing}
                        onClick={() => setShowPaymentConfirm(true)}
                    >
                        Process Payment
                    </Button>
                </div>
            </div>

            {/* CONFIRMATION OVERLAYS */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
                        <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600 text-2xl font-black">!</div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Remove Item?</h4>
                            <p className="text-slate-500 text-xs mb-6 px-4">Remove {itemToDelete.description} from bill?</p>
                            <div className="flex w-full gap-2">
                                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px]">No</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px]">Yes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ... (PaymentConfirmOverlay similar tweaks) ... */}
            {showPaymentConfirm && (
                 <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-emerald-600 p-6 text-center text-white">
                            <h4 className="text-xl font-black uppercase tracking-tight">Finalize?</h4>
                        </div>
                        <div className="p-6 space-y-6 text-center">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Paying</span>
                                <span className="text-2xl font-black text-emerald-700">₱{parseFloat(paymentInput).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px]">Back</button>
                                <button disabled={isFinalizing} onClick={handleConfirmPayment} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px]">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}