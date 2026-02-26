import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function ViewOutpatientBillModal({ isOpen, onClose, patient, visit: initialVisit, medicines = [] }) {
    const { patients, flash } = usePage().props;
    const [toast, setToast] = useState(null);

    // DATA SYNC
    const visit = useMemo(() => {
        if (!patients || !initialVisit) return initialVisit;
        const freshPatient = patients.find(p => p.id === patient?.id);
        const freshVisit = freshPatient?.visit_history?.find(v => v.id === initialVisit.id);
        return freshVisit || initialVisit;
    }, [patients, initialVisit, patient]);

    const billItems = visit?.bill_items || [];
    const CHECKUP_FEE = parseFloat(visit?.checkup_fee || 0);

    //STOCK CALCULATION
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
    const [isEditingFee, setIsEditingFee] = useState(false);
    const [feeInput, setFeeInput] = useState(CHECKUP_FEE);

    const medDropdownRef = useRef(null); 

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

    const totals = useMemo(() => {
        const medsTotal = billItems.reduce((sum, item) => sum + (parseInt(item.quantity) * parseFloat(item.unit_price)), 0);
        const grandTotal = CHECKUP_FEE + medsTotal; 
        const previousPaid = parseFloat(visit?.amount_paid || 0);
        const maxPayable = Math.max(0, grandTotal - previousPaid);
        const currentBalance = Math.max(0, maxPayable - parseFloat(paymentInput || 0));
        
        return { grandTotal, medsTotal, currentBalance, previousPaid, maxPayable };
    }, [billItems, paymentInput, CHECKUP_FEE, visit?.amount_paid]);

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
            onSuccess: () => { setSelectedMed(null); setMedSearchTerm(''); setMedQty(1); },
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-2 md:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[100dvh] md:h-[95vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shadow-md shrink-0">
                    <div>
                        <h3 className="font-black text-lg md:text-xl uppercase tracking-tight">Outpatient Invoice</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-mono tracking-widest font-bold">Ref: #{visit?.visit_id || '---'}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-3xl leading-none">&times;</button>
                </div>

                <div className="p-4 md:p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar">
                    
                    {/* Itemized Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white">
                        <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r">Item Description</th>
                                    <th className="p-4 border-r text-center w-28">Qty</th>
                                    <th className="p-4 border-r text-right w-32">Price</th>
                                    <th className="p-4 text-right w-32">Total</th>
                                    <th className="p-4 text-center w-32 sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                {/* Consultation Fee Row */}
                                <tr className={`border-b ${isEditingFee ? 'bg-amber-50' : 'bg-slate-50/50'}`}>
                                    <td className="p-4 border-r font-bold text-[#3D52A0]">Professional Consultation Fee</td>
                                    <td className="p-4 border-r text-center font-bold">1</td>
                                    <td className="p-4 border-r text-right font-mono font-bold">
                                        {isEditingFee ? (
                                            <div className="relative inline-block w-full">
                                                <input 
                                                    type="number" 
                                                    className="w-full pl-2 py-1.5 border border-amber-300 rounded font-black text-emerald-700 outline-none focus:ring-2 focus:ring-amber-500"
                                                    value={feeInput}
                                                    onChange={e => setFeeInput(e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            `₱${CHECKUP_FEE.toLocaleString()}`
                                        )}
                                    </td>
                                    <td className="p-4 text-right font-black">₱{CHECKUP_FEE.toLocaleString()}</td>
                                    <td className="p-4 text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10">
                                        {isEditingFee ? (
                                            <div className="flex gap-3 justify-center">
                                                <button onClick={handleSaveFee} className="text-emerald-600 font-black uppercase text-[10px] hover:underline">Save</button>
                                                <button onClick={() => {setIsEditingFee(false); setFeeInput(CHECKUP_FEE);}} className="text-slate-400 font-black uppercase text-[10px] hover:underline">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsEditingFee(true)} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Adjust Fee</button>
                                        )}
                                    </td>
                                </tr>

                                {billItems.map((item) => (
                                    <tr key={item.id} className={`border-b transition-colors ${editingId === item.id ? 'bg-amber-50' : 'hover:bg-slate-50/50'}`}>
                                        <td className="p-4 border-r font-bold text-slate-800">{item.medicine?.generic_name}</td>
                                        <td className="p-4 border-r text-center">
                                            {editingId === item.id ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => editQty > 1 && setEditQty(editQty - 1)} className="w-7 h-7 bg-white border rounded shadow-sm font-bold">-</button>
                                                    <input type="number" className="w-12 text-center p-1 border rounded text-xs font-black" value={editQty} onChange={(e) => setEditQty(parseInt(e.target.value) || 1)} />
                                                    <button onClick={() => setEditQty(editQty + 1)} className="w-7 h-7 bg-white border rounded shadow-sm font-bold">+</button>
                                                </div>
                                            ) : <span className="font-black">{item.quantity}</span>}
                                        </td>
                                        <td className="p-4 border-r text-right font-mono">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                        <td className="p-4 text-right font-black text-emerald-700">₱{( (editingId === item.id ? (editQty || 0) : item.quantity) * item.unit_price ).toLocaleString()}</td>
                                        <td className="p-4 text-center space-x-3 sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-10">
                                            {editingId === item.id ? (
                                                <button onClick={() => saveEdit(item)} className="text-emerald-600 font-black uppercase text-[10px] hover:underline">Save</button>
                                            ) : (
                                                <>
                                                    <button onClick={() => {setEditingId(item.id); setEditQty(item.quantity);}} className="text-blue-600 font-black uppercase text-[10px] hover:underline">Edit</button>
                                                    <button onClick={() => setItemToDelete(item)} className="text-rose-600 font-black uppercase text-[10px] hover:underline">Del</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-emerald-50/20" ref={medDropdownRef}>
                                    <td className="p-3 border-r relative">
                                        <input 
                                            type="text"
                                            placeholder="Search medicine..."
                                            className="w-full border-slate-200 rounded-lg text-xs font-bold py-2.5 px-4 focus:ring-emerald-500 shadow-sm"
                                            value={medSearchTerm}
                                            onFocus={() => setIsMedDropdownOpen(true)}
                                            onChange={(e) => {setMedSearchTerm(e.target.value); setSelectedMed(null); setIsMedDropdownOpen(true);}}
                                        />
                                        {isMedDropdownOpen && (
                                            <div className="absolute z-[120] left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                                                {localInventory.filter(m => m.name.toLowerCase().includes(medSearchTerm.toLowerCase())).map(m => (
                                                    <button key={m.id} disabled={m.totalStock <= 0} className={`w-full text-left px-4 py-3 border-b flex justify-between items-center ${m.totalStock > 0 ? 'hover:bg-emerald-50' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`} onClick={() => handlePickMedicine(m)}>
                                                        <div><p className="font-bold text-slate-800">{m.name}</p><p className="text-[9px] uppercase font-black text-slate-400">In Stock: {m.totalStock}</p></div>
                                                        <span className="font-bold text-emerald-600 font-mono text-sm">₱{m.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 border-r text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => medQty > 1 && setMedQty(medQty - 1)} className="w-7 h-7 bg-white border rounded-lg shadow-sm font-bold hover:bg-slate-100 transition-colors">-</button>
                                            <input type="number" className="w-10 text-center p-0 border-none bg-transparent font-black text-xs" value={medQty} readOnly />
                                            <button onClick={() => setMedQty(prev => Math.min(prev + 1, selectedBatch?.stock || 99))} className="w-7 h-7 bg-white border rounded-lg shadow-sm font-bold hover:bg-slate-100 transition-colors">+</button>
                                        </div>
                                    </td>
                                    <td colSpan="3" className="p-3">
                                        <Button variant="success" className="w-full text-[10px] font-black uppercase tracking-widest py-2.5 rounded-lg" onClick={handleAddMedicine} disabled={!selectedMed || isSubmittingMed}>
                                            {isSubmittingMed ? 'ADDING...' : 'ADD TO BILL'}
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-[#2E4696] rounded-2xl p-5 md:p-7 text-white shadow-xl space-y-6 border border-white/10 shrink-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/20 pb-4 gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-200">Total Invoice Amount:</span>
                            <span className="text-3xl md:text-4xl font-black text-white underline decoration-emerald-400 decoration-4 underline-offset-8">₱ {totals.grandTotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6">
                            <div className="flex-1">
                                <label className="text-[10px] font-black uppercase text-blue-200 block mb-2 tracking-widest font-bold">Pay Amount (₱)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-3xl font-black text-emerald-400 outline-none focus:border-emerald-400 shadow-inner transition-all"
                                    value={paymentInput} 
                                    onChange={e => setPaymentInput(Math.min(parseFloat(e.target.value) || 0, totals.maxPayable))} 
                                    onFocus={(e) => e.target.select()}
                                />
                                <p className="text-[9px] text-blue-300 mt-2 uppercase font-black italic">Previous Payments: ₱{totals.previousPaid.toLocaleString()}</p>
                            </div>

                            <div className="bg-white/10 p-5 rounded-2xl flex-1 text-center md:text-right shadow-inner border border-white/5">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1 font-bold">Projected Remaining Balance</span>
                                <p className={`text-3xl font-black ${totals.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'} transition-colors`}>
                                    ₱ {totals.currentBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 md:p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-center gap-3 shrink-0">
                    <Button variant="gray" onClick={onClose} className="w-full md:w-auto md:px-14 py-3.5 uppercase font-black text-[11px] tracking-widest order-2 md:order-1">Close</Button>
                    <Button 
                        variant="success" 
                        disabled={paymentInput <= 0 || isFinalizing} 
                        onClick={() => setShowPaymentConfirm(true)} 
                        className="w-full md:w-auto md:px-14 py-3.5 uppercase font-black text-[11px] tracking-widest shadow-lg shadow-emerald-500/20 order-1 md:order-2"
                    >
                        Confirm Payment
                    </Button>
                </div>
            </div>

            {/* Confirmation Overlays */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-600 p-8 text-center text-white">
                            <h4 className="text-2xl font-black uppercase tracking-tight">Finalize?</h4>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex justify-between items-center bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                                <span className="text-xs font-bold text-emerald-700 uppercase">Amount</span>
                                <span className="text-2xl font-black text-emerald-700 font-mono">₱{parseFloat(paymentInput).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Back</button>
                                <button disabled={isFinalizing} onClick={handleConfirmPayment} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-200">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {itemToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden transform animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600 text-2xl font-black">!</div>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Remove Item?</h4>
                            <p className="text-slate-500 text-xs mb-6 px-4">Delete {itemToDelete.medicine?.generic_name} from invoice?</p>
                            <div className="flex w-full gap-2">
                                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px]">No</button>
                                <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px]">Yes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}