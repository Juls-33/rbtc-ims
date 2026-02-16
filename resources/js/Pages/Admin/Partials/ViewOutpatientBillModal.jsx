import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function ViewOutpatientBillModal({ isOpen, onClose, patient, visit: initialVisit, medicines = [] }) {
    const { patients, flash } = usePage().props;
    const [toast, setToast] = useState(null);

    // --- 1. DATA SYNC ---
    const visit = useMemo(() => {
        if (!patients || !initialVisit) return initialVisit;
        const freshPatient = patients.find(p => p.id === patient?.id);
        const freshVisit = freshPatient?.visit_history?.find(v => v.id === initialVisit.id);
        return freshVisit || initialVisit;
    }, [patients, initialVisit, patient]);

    const billItems = visit?.bill_items || [];
    const CHECKUP_FEE = parseFloat(visit?.checkup_fee || 0);

    // --- 2. DYNAMIC STOCK CALCULATION ---
    const localInventory = useMemo(() => {
        let inv = JSON.parse(JSON.stringify(medicines));
        billItems.forEach(item => {
            const med = inv.find(m => m.id === parseInt(item.medicine_id));
            if (med) {
                const batch = med.batches.find(b => b.id === parseInt(item.batch_id));
                if (batch) {
                    batch.stock = Math.max(0, parseInt(batch.stock) - parseInt(item.quantity));
                }
                med.totalStock = med.batches.reduce((sum, b) => sum + parseInt(b.stock), 0);
            }
        });
        return inv;
    }, [medicines, billItems]);

    // --- 3. UI STATES ---
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
    
    // Fee States
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [feeInput, setFeeInput] = useState(CHECKUP_FEE);

    const medDropdownRef = useRef(null); 

    // --- 4. EFFECTS ---
    useEffect(() => {
        if (flash?.success) {
            const isWarning = flash.success.toLowerCase().includes('reduced') || flash.success.toLowerCase().includes('stock');
            setToast({ message: flash.success, type: isWarning ? 'warning' : 'success' });
        }
        if (flash?.error) setToast({ message: flash.error, type: 'error' });
    }, [flash]);

    useEffect(() => {
        if (isOpen) {
            setPaymentInput(0);
            setFeeInput(CHECKUP_FEE);
        }
    }, [isOpen, CHECKUP_FEE]);

    // --- 5. MATH LOGIC & VALIDATION ---
    const totals = useMemo(() => {
        const medsTotal = billItems.reduce((sum, item) => sum + (parseInt(item.quantity) * parseFloat(item.unit_price)), 0);
        const grandTotal = CHECKUP_FEE + medsTotal; 
        const previousPaid = parseFloat(visit?.amount_paid || 0);
        
        // Validation helpers
        const maxPayable = Math.max(0, grandTotal - previousPaid);
        const currentBalance = Math.max(0, maxPayable - parseFloat(paymentInput || 0));
        
        return { grandTotal, medsTotal, currentBalance, previousPaid, maxPayable };
    }, [billItems, paymentInput, CHECKUP_FEE, visit?.amount_paid]);

    // --- 6. HANDLERS ---
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

    const handleSaveFee = () => {
        if (parseFloat(feeInput) < 0) return alert("Fee cannot be negative");
        router.put(route('admin.visits.updateFee', visit.id), {
            checkup_fee: feeInput
        }, {
            onSuccess: () => setIsEditingFee(false),
            preserveScroll: true
        });
    };

    const handleAddMedicine = () => {
        if (!selectedMed || !selectedBatch || medQty <= 0) return;
        setIsSubmittingMed(true);
        router.post(route('admin.billing.addItem'), {
            visit_id: visit.id,
            medicine_id: selectedMed.id,
            batch_id: selectedBatch.id, 
            quantity: medQty,
            unit_price: selectedMed.price,
            total_price: medQty * selectedMed.price,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedMed(null);
                setMedSearchTerm('');
                setMedQty(1);
            },
            onFinish: () => setIsSubmittingMed(false)
        });
    };

    const saveEdit = (item) => {
        const medInCatalog = localInventory.find(m => m.id === item.medicine_id);
        const batchInCatalog = medInCatalog?.batches.find(b => b.id === item.batch_id);
        const maxAvailable = (batchInCatalog?.stock || 0) + item.quantity;

        if (editQty > maxAvailable) return alert(`Insufficient stock.`);

        router.put(route('admin.billing.updateItem', item.id), {
            quantity: editQty,
            total_price: editQty * item.unit_price
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
            onFinish: () => setIsUpdatingMed(false)
        });
    };

    const handleConfirmPayment = () => {
        if (isFinalizing || paymentInput > totals.maxPayable || paymentInput < 0) return;
        setIsFinalizing(true);
        router.post(route('admin.billing.outpatient.store'), {
            visit_id: visit.id,
            amount_paid: paymentInput,
        }, {
            onSuccess: () => { setShowPaymentConfirm(false); onClose(); },
            onFinish: () => setIsFinalizing(false)
        });
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        router.delete(route('admin.billing.removeItem', itemToDelete.id), { 
            preserveScroll: true,
            onSuccess: () => setItemToDelete(null)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col">
                <div className="bg-[#3D52A0] text-white p-5 flex justify-between items-center shadow-md">
                    <div>
                        <h3 className="font-black text-xl uppercase tracking-tight">Billing Invoice</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-mono tracking-widest">Ref ID: #{visit?.visit_id || '---'}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl hover:text-red-300 transition-colors">&times;</button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto max-h-[85vh] scrollbar-thin">
                    <div className="border border-slate-200 rounded-xl overflow-visible shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r">Item Description</th>
                                    <th className="p-4 border-r text-center w-24">Qty</th>
                                    <th className="p-4 border-r text-right">Price</th>
                                    <th className="p-4 text-right">Total</th>
                                    <th className="p-4 text-center w-32">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {/* Consultation Fee Row (Editable) */}
                                <tr className={`border-b ${isEditingFee ? 'bg-amber-50' : 'bg-slate-50/50'}`}>
                                    <td className="p-4 border-r font-bold text-[#3D52A0]">Professional Consultation Fee</td>
                                    <td className="p-4 border-r text-center">1</td>
                                    <td className="p-4 border-r text-right font-mono">
                                        {isEditingFee ? (
                                            <div className="relative inline-block">
                                                <span className="absolute left-2 top-1.5 text-slate-400">₱</span>
                                                <input 
                                                    type="number" 
                                                    className="w-24 pl-5 py-1 border border-amber-300 rounded font-black text-emerald-700 outline-none focus:ring-1 focus:ring-amber-500"
                                                    value={feeInput}
                                                    onChange={e => setFeeInput(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            `₱${CHECKUP_FEE.toLocaleString()}`
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-black">₱{CHECKUP_FEE.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        {isEditingFee ? (
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={handleSaveFee} className="text-emerald-600 font-black uppercase text-[10px] hover:underline">Save</button>
                                                <button onClick={() => {setIsEditingFee(false); setFeeInput(CHECKUP_FEE);}} className="text-slate-400 font-black uppercase text-[10px] hover:underline">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsEditingFee(true)} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Edit Fee</button>
                                        )}
                                    </td>
                                </tr>

                                {billItems.map((item) => (
                                    <tr key={item.id} className={`border-b transition-colors ${editingId === item.id ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                                        <td className="p-4 border-r font-bold">{item.medicine?.generic_name}</td>
                                        <td className="p-4 border-r text-center">
                                            {editingId === item.id ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => editQty > 1 && setEditQty(editQty - 1)} className="w-6 h-6 bg-white border rounded font-bold">-</button>
                                                    <input 
                                                        type="number" 
                                                        className="w-12 text-center p-1 border rounded text-xs font-black focus:ring-0" 
                                                        value={editQty}
                                                        onChange={(e) => {
                                                            const max = (localInventory.find(m => m.id === item.medicine_id)?.batches.find(b => b.id === item.batch_id)?.stock || 0) + item.quantity;
                                                            handleQtyInput(e.target.value, max, setEditQty);
                                                        }}
                                                    />
                                                    <button onClick={() => setEditQty(editQty + 1)} className="w-6 h-6 bg-white border rounded font-bold">+</button>
                                                </div>
                                            ) : (
                                                <span className="font-bold">{item.quantity}</span>
                                            )}
                                        </td>
                                        <td className="p-4 border-r text-right font-mono">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                        <td className="p-4 text-right font-black text-emerald-700">₱{( (editingId === item.id ? (editQty || 0) : item.quantity) * item.unit_price ).toLocaleString()}</td>
                                        <td className="p-4 text-center border-l space-x-3">
                                            {editingId === item.id ? (
                                                <button onClick={() => saveEdit(item)} className="text-emerald-600 font-black uppercase text-[10px] hover:underline">Save</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => {setEditingId(item.id); setEditQty(item.quantity);}} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Edit</button>
                                                    <button onClick={() => setItemToDelete(item)} className="text-rose-600 font-bold uppercase text-[9px] hover:underline">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Add Medicine UI */}
                                <tr className="bg-[#488D6A]/5" ref={medDropdownRef}>
                                    <td className="p-3 border-r relative">
                                        <input 
                                            type="text"
                                            placeholder="Search medicine..."
                                            className="w-full border-slate-200 rounded text-[11px] font-bold py-2"
                                            value={medSearchTerm}
                                            onFocus={() => setIsMedDropdownOpen(true)}
                                            onChange={(e) => {setMedSearchTerm(e.target.value); setSelectedMed(null); setIsMedDropdownOpen(true);}}
                                        />
                                        {isMedDropdownOpen && (
                                            <div className="absolute z-[120] left-0 right-0 top-full mt-1 bg-white border rounded shadow-2xl max-h-56 overflow-y-auto">
                                                {localInventory.filter(m => m.name.toLowerCase().includes(medSearchTerm.toLowerCase())).map(m => (
                                                    <button key={m.id} disabled={m.totalStock <= 0} className={`w-full text-left px-4 py-2 border-b flex justify-between items-center ${m.totalStock > 0 ? 'hover:bg-emerald-50' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`} onClick={() => handlePickMedicine(m)}>
                                                        <div><p className="font-bold">{m.name}</p><p className="text-[9px] uppercase font-black text-slate-400">Stock: {m.totalStock}</p></div>
                                                        <span className="font-bold text-emerald-600 font-mono">₱{m.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {selectedMed && (
                                            <div className="mt-2 p-2 bg-white rounded border border-emerald-200 flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase italic">
                                                <span>Batch: {selectedBatch?.sku_id || selectedBatch?.sku_batch_id}</span>
                                                <span className="text-emerald-600">Avail: {selectedBatch?.stock}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 border-r text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => medQty > 1 && setMedQty(medQty - 1)} className="w-6 h-6 bg-slate-200 rounded font-bold">-</button>
                                            <input 
                                                type="number" 
                                                className="w-12 text-center p-1 border rounded text-xs font-black focus:ring-0" 
                                                value={medQty}
                                                onChange={(e) => handleQtyInput(e.target.value, selectedBatch?.stock || 0, setMedQty)}
                                            />
                                            <button onClick={() => setMedQty(prev => Math.min(prev + 1, selectedBatch?.stock || 1))} className="w-6 h-6 bg-slate-200 rounded font-bold">+</button>
                                        </div>
                                    </td>
                                    <td className="p-3 border-r text-center" colSpan="2">
                                        <button onClick={handleAddMedicine} disabled={!selectedMed || medQty <= 0} className="w-full bg-[#488D6A] text-white py-2 rounded text-[10px] font-black uppercase tracking-widest disabled:opacity-30">Add To Bill</button>
                                    </td>
                                    <td className="p-3"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Dashboard */}
                    <div className="bg-[#2E4696] rounded-2xl p-6 text-white shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <span className="text-sm font-black uppercase tracking-widest text-blue-200">Total Billable Amount:</span>
                            <span className="text-3xl font-black text-white underline decoration-emerald-400 decoration-4 underline-offset-8">₱ {totals.grandTotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-2">
                            <div>
                                <label className="text-[10px] font-black uppercase text-blue-200 block mb-1 tracking-widest font-bold">Pay Amount (₱)</label>
                                <input 
                                    type="number" 
                                    className={`w-full md:w-48 bg-blue-900/50 border-2 rounded-xl px-4 py-3 text-2xl font-black outline-none transition-all ${
                                        paymentInput >= totals.maxPayable && totals.maxPayable > 0 ? 'border-emerald-400 text-emerald-400' : 'border-blue-400/30 text-emerald-400 focus:border-emerald-400 shadow-inner'
                                    }`} 
                                    value={paymentInput} 
                                    onChange={e => {
                                        const val = parseFloat(e.target.value);
                                        if (isNaN(val)) {
                                            setPaymentInput(0);
                                            return;
                                        }
                                        // Clamps the value between 0 and the maximum payable amount
                                        const cappedValue = Math.min(Math.max(0, val), totals.maxPayable);
                                        setPaymentInput(cappedValue);
                                    }} 
                                    onFocus={(e) => e.target.select()}
                                />
                                {paymentInput > totals.maxPayable && (
                                    <p className="text-[9px] text-rose-400 mt-2 font-black uppercase animate-pulse italic">❌ Exceeds current balance (max: ₱{totals.maxPayable.toLocaleString()})</p>
                                )}
                                <p className="text-[9px] text-blue-300 mt-1 uppercase font-black italic">Already Paid: ₱{totals.previousPaid.toLocaleString()}</p>
                            </div>

                            <div className="bg-white/10 p-4 rounded-2xl flex-1 text-center md:text-right shadow-sm border border-white/5">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1 font-bold">New Projected Balance</span>
                                <p className={`text-3xl font-black ${totals.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'} transition-colors`}>
                                    ₱ {totals.currentBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="gray" onClick={onClose} className="px-10 py-2.5 uppercase font-black text-[11px] tracking-widest">Cancel</Button>
                        <Button 
                            type="button" 
                            variant="success" 
                            disabled={paymentInput <= 0 || paymentInput > totals.maxPayable || isFinalizing} 
                            onClick={() => setShowPaymentConfirm(true)} 
                            className="px-12 py-2.5 uppercase font-black text-[11px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            Confirm Payment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overlays */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-600 p-8 text-center text-white">
                            <h4 className="text-2xl font-black uppercase tracking-tight">Finalize Transaction?</h4>
                            <p className="text-emerald-100 text-xs uppercase tracking-widest mt-1 font-bold">Stock will be deducted permanently</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-700 uppercase">Tendering Amount</span>
                                <span className="text-2xl font-black text-emerald-700 font-mono">₱{parseFloat(paymentInput).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-colors">Back</button>
                                <button disabled={isFinalizing} onClick={handleConfirmPayment} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                                    {isFinalizing ? 'Processing...' : 'Complete Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {itemToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600 text-2xl font-black">!</div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Remove Item?</h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">Remove <span className="font-bold text-slate-900">{itemToDelete.medicine?.generic_name}</span> from bill?</p>
                            <div className="flex w-full gap-3">
                                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[11px]">Go Back</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase text-[11px] active:scale-95">Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}