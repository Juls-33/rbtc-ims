import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function ViewBillModal({ isOpen, onClose, admissionId, patient, medicines = [] }) {
    const { patients, flash } = usePage().props;
    const [toast, setToast] = useState(null);

    // --- 1. DATA SYNC ---
    const activePatient = useMemo(() => patients?.find(p => p.id === patient?.id), [patients, patient]);
    const admission = activePatient?.active_admission; 

    const billItems = admission?.bill_items || [];
    const statements = admission?.statements || [];

    // --- 2. UI STATES ---
    const [selectedStatementIdx, setSelectedStatementIdx] = useState(0);
    const [paymentInput, setPaymentInput] = useState(0);
    const [medSearchTerm, setMedSearchTerm] = useState('');
    const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState(null); 
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [medQty, setMedQty] = useState(1);
    const [editingId, setEditingId] = useState(null);
    const [editQty, setEditQty] = useState(1);
    
    // Status states
    const [isSubmittingMed, setIsSubmittingMed] = useState(false);
    const [isUpdatingMed, setIsUpdatingMed] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    
    const medDropdownRef = useRef(null);

    // --- 3. CLICK OUTSIDE HANDLER (The "Nothing Happened" Fix) ---
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

    // --- 4. DYNAMIC TOTALS ---
    const totals = useMemo(() => {
        const statementTotal = parseFloat(currentStatement?.grand_total || 0);
        const overallBalance = parseFloat(admission?.balance || 0);
        const overallPaid = parseFloat(admission?.amount_paid || 0);
        const maxPayable = Number(statementTotal.toFixed(2));
        const newBalanceAfterInput = Math.max(0, overallBalance - parseFloat(paymentInput || 0));

        return { statementTotal, overallBalance, overallPaid, maxPayable, newBalanceAfterInput };
    }, [currentStatement, admission, paymentInput]);

    // --- 5. LOCAL INVENTORY (Stock Logic) ---
    const localInventory = useMemo(() => {
        let inv = JSON.parse(JSON.stringify(medicines));
        billItems.forEach(item => {
            if (item.medicine_id) {
                const med = inv.find(m => m.id === parseInt(item.medicine_id));
                if (med) {
                    const batch = med.batches.find(b => b.id === parseInt(item.batch_id));
                    if (batch) {
                        batch.stock = Math.max(0, parseInt(batch.stock) - parseInt(item.quantity));
                    }
                    med.totalStock = med.batches.reduce((sum, b) => sum + parseInt(b.stock), 0);
                }
            }
        });
        return inv;
    }, [medicines, billItems]);

    // --- 6. EFFECTS ---
    useEffect(() => {
        if (flash?.success) setToast({ message: flash.success, type: 'success' });
        if (flash?.error) setToast({ message: flash.error, type: 'error' });
    }, [flash]);

    useEffect(() => {
        if (isOpen) {
            setPaymentInput(0);
            if (statements.length > 0) setSelectedStatementIdx(statements.length - 1);
        }
    }, [isOpen, statements.length]);

    // --- 7. HANDLERS (Same as Outpatient) ---
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[95vh] animate-in zoom-in-95 duration-200">
                <div className="bg-[#3D52A0] text-white p-5 flex justify-between items-center shadow-md">
                    <div>
                        <h3 className="font-black text-xl uppercase tracking-tight">Inpatient Billing System</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-mono tracking-widest font-bold">Admission ID: #{admission.id}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl hover:text-red-300 transition-colors">&times;</button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-thin">
                    {/* PERIOD SELECTOR */}
                    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Select Billing Period</label>
                            <select 
                                className="bg-white border-slate-300 rounded font-bold text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedStatementIdx}
                                onChange={(e) => setSelectedStatementIdx(parseInt(e.target.value))}
                            >
                                {statements.map((stmt, idx) => (
                                    <option key={idx} value={idx}>Statement #{stmt.index} ({stmt.period})</option>
                                ))}
                            </select>
                        </div>
                        <div className="text-right">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${currentStatement?.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {currentStatement?.status}
                            </span>
                        </div>
                    </div>

                    {/* ROOM CHARGES */}
                    <div className="space-y-2">
                        <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Statement Room Charges
                        </h4>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm font-black flex justify-between items-center">
                            <span className="text-slate-600">Calculated for this period:</span>
                            <span className="text-lg">₱ {parseFloat(currentStatement?.room_total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>

                    {/* MEDICINE TABLE (Identical to Outpatient style) */}
                    <div className="space-y-2">
                        <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Medication & Supplies
                        </h4>
                        <div className="border border-slate-200 rounded-xl overflow-visible shadow-sm bg-white">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b">
                                    <tr>
                                        <th className="p-4 border-r">Item Description</th>
                                        <th className="p-4 border-r text-center w-28">Qty</th>
                                        <th className="p-4 border-r text-right">Price</th>
                                        <th className="p-4 text-right">Total</th>
                                        <th className="p-4 text-center w-32">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((item) => (
                                        <tr key={item.id} className={`border-b transition-colors ${editingId === item.id ? 'bg-amber-50' : 'hover:bg-slate-50/50'}`}>
                                            <td className="p-4 border-r font-bold text-slate-800">{item.description}</td>
                                            <td className="p-4 border-r text-center">
                                                {editingId === item.id ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button onClick={() => editQty > 1 && setEditQty(editQty - 1)} className="w-6 h-6 bg-white border rounded font-bold">-</button>
                                                        <input type="number" className="w-12 text-center p-1 border rounded text-xs font-black" value={editQty} onChange={(e) => setEditQty(parseInt(e.target.value) || 1)} />
                                                        <button onClick={() => setEditQty(editQty + 1)} className="w-6 h-6 bg-white border rounded font-bold">+</button>
                                                    </div>
                                                ) : <span className="font-black">{item.quantity}</span>}
                                            </td>
                                            <td className="p-4 border-r text-right font-mono">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="p-4 text-right font-black text-emerald-700">₱{parseFloat(item.total_price).toLocaleString()}</td>
                                            <td className="p-4 text-center space-x-2">
                                                {editingId === item.id ? (
                                                    <button onClick={() => saveEdit(item)} className="text-emerald-600 font-black uppercase text-[10px] hover:underline">Save</button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => {setEditingId(item.id); setEditQty(item.quantity);}} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Edit</button>
                                                        <button onClick={() => setItemToDelete(item)} className="text-rose-600 font-black uppercase text-[10px] hover:underline">Delete</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {/* SEARCH ROW (Ported from Outpatient) */}
                                    <tr className="bg-emerald-50/30" ref={medDropdownRef}>
                                        <td className="p-3 border-r relative">
                                            <input 
                                                type="text" 
                                                placeholder="Search medicine..." 
                                                className="w-full border-slate-200 rounded text-[11px] font-bold py-2 focus:ring-emerald-500 shadow-sm"
                                                value={medSearchTerm}
                                                onChange={(e) => {setMedSearchTerm(e.target.value); setIsMedDropdownOpen(true);}}
                                                onFocus={() => setIsMedDropdownOpen(true)}
                                            />
                                            {isMedDropdownOpen && (
                                                <div className="absolute z-[200] left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                                                    {localInventory.filter(m => m.name.toLowerCase().includes(medSearchTerm.toLowerCase())).map(m => (
                                                        <button key={m.id} disabled={m.totalStock <= 0} className={`w-full text-left px-4 py-3 border-b flex justify-between items-center transition-colors ${m.totalStock > 0 ? 'hover:bg-emerald-50' : 'opacity-50 cursor-not-allowed bg-slate-50'}`} onClick={() => handlePickMedicine(m)}>
                                                            <div><p className="font-bold text-slate-800">{m.name}</p><p className="text-[9px] uppercase font-black text-slate-400">In Stock: {m.totalStock}</p></div>
                                                            <span className="font-bold text-emerald-600 font-mono">₱{m.price}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3 border-r text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => setMedQty(q => Math.max(1, q - 1))} className="w-6 h-6 bg-white border rounded font-bold hover:bg-slate-100">-</button>
                                                <input type="number" className="w-10 text-center p-0 border-none bg-transparent font-black text-xs" value={medQty} onChange={(e) => handleQtyInput(e.target.value, selectedBatch?.stock || 99, setMedQty)} />
                                                <button onClick={() => setMedQty(q => q + 1)} className="w-6 h-6 bg-white border rounded font-bold hover:bg-slate-100">+</button>
                                            </div>
                                        </td>
                                        <td colSpan="3" className="p-3">
                                            <Button variant="success" className="w-full text-[10px] font-black tracking-widest py-2" onClick={handleAddMedicine} disabled={!selectedMed || isSubmittingMed}>
                                                {isSubmittingMed ? 'ADDING...' : 'ADD TO BILL'}
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FINANCIAL SUMMARY BOX */}
                    <div className="bg-[#2E4696] rounded-2xl p-7 text-white shadow-xl space-y-5 border border-white/10">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <span className="text-sm font-black uppercase tracking-widest text-blue-200">Current Period Total:</span>
                            <span className="text-4xl font-black text-white underline decoration-emerald-400 decoration-4 underline-offset-8">
                                ₱ {totals.statementTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-2">
                            <div className="flex-1 w-full">
                                <label className="text-[10px] font-black uppercase text-blue-200 block mb-2 tracking-widest">Amount to Pay (₱)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" step="0.01"
                                        className="w-full bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-4 text-3xl font-black text-emerald-400 outline-none focus:border-emerald-400 shadow-inner"
                                        value={paymentInput} 
                                        onChange={e => setPaymentInput(parseFloat(e.target.value) || 0)} 
                                    />
                                    <Button variant="danger" className="px-6" onClick={() => setPaymentInput(0)}>CLEAR</Button>
                                    <Button variant="success" className="px-6" onClick={() => setPaymentInput(totals.maxPayable)}>FULL</Button>
                                </div>
                                <p className="text-[9px] text-blue-300 mt-2 uppercase font-black italic tracking-tighter">Total Paid (Overall): ₱ {totals.overallPaid.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/10 p-5 rounded-2xl flex-1 w-full text-center md:text-right border border-white/5 shadow-inner">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1">Total Remaining Balance</span>
                                <p className={`text-3xl font-black ${totals.newBalanceAfterInput > 0 ? 'text-rose-400' : 'text-emerald-400'} transition-colors`}>
                                    ₱ {totals.newBalanceAfterInput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t flex justify-center gap-4">
                    <Button variant="gray" onClick={onClose} className="px-14 uppercase font-black text-[11px] tracking-widest">Close</Button>
                    <Button 
                        variant="success" 
                        className="px-14 uppercase font-black text-[11px] tracking-widest shadow-lg shadow-emerald-500/20"
                        disabled={paymentInput <= 0 || isFinalizing}
                        onClick={() => setShowPaymentConfirm(true)}
                    >
                        Process Payment
                    </Button>
                </div>
            </div>

            {/* DELETE CONFIRMATION OVERLAY */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-in slide-in-from-bottom-8">
                        <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600 text-2xl font-black">!</div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Remove Item?</h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">Remove <span className="font-bold text-slate-900">{itemToDelete.description}</span> from bill?</p>
                            <div className="flex w-full gap-3">
                                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[11px]">Go Back</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase text-[11px] active:scale-95">Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* PAYMENT CONFIRMATION OVERLAY */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95">
                        <div className="bg-emerald-600 p-8 text-center text-white">
                            <h4 className="text-2xl font-black uppercase tracking-tight">Finalize Payment?</h4>
                            <p className="text-emerald-100 text-[10px] uppercase font-bold mt-1 tracking-widest">Statement: {currentStatement?.bill_id}</p>
                        </div>
                        <div className="p-8 space-y-6 text-center">
                            <div className="flex justify-between items-center bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-700 uppercase">Tendering</span>
                                <span className="text-3xl font-black text-emerald-700 font-mono">₱{parseFloat(paymentInput).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">Back</button>
                                <button disabled={isFinalizing} onClick={handleConfirmPayment} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-lg shadow-emerald-200">
                                    {isFinalizing ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}