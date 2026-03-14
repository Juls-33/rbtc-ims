import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, router, usePage } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function ViewOutpatientBillModal({ isOpen, onClose, patient, visit: initialVisit, medicines = [] }) {
    const { patients, flash } = usePage().props;
    const [toast, setToast] = useState(null);

    // --- 1. DATA SYNC: Safe Patient & Visit lookup ---
    const visit = useMemo(() => {
        if (!patients || !initialVisit) return initialVisit;
        const patientList = patients.data || (Array.isArray(patients) ? patients : []);
        const freshPatient = patientList.find(p => p.id === patient?.id);
        const freshVisit = freshPatient?.visit_history?.find(v => v.id === initialVisit.id);
        return freshVisit || initialVisit;
    }, [patients, initialVisit, patient]);

    const billItems = visit?.bill_items || [];
    const CHECKUP_FEE = parseFloat(visit?.checkup_fee || 0);

    // --- 2. DATA NORMALIZATION: Standardize Medicines and Stock ---
    const localInventory = useMemo(() => {
        const rawInventory = medicines.data || (Array.isArray(medicines) ? medicines : []);
        
        // Map database keys to UI keys safely
        let inv = rawInventory.map(m => ({
            ...m,
            // Standardize Name
            name: m.name || m.generic_name || 'Unnamed Item',
            brand_name: m.brand_name || '',
            // Standardize Price
            price: parseFloat(m.price || m.price_per_unit || 0),
            // Standardize Batches and Stock
            batches: (m.batches || []).map(b => ({
                ...b,
                id: b.id || b.sku_batch_id,
                stock: parseInt(b.stock || b.current_quantity || 0)
            })),
            // Recalculate total stock from standardized batches
        })).map(m => ({
            ...m,
            totalStock: m.batches.reduce((sum, b) => sum + b.stock, 0)
        }));

        // Subtract quantities already added to the bill
        billItems.forEach(item => {
            const med = inv.find(m => m.id === parseInt(item.medicine_id));
            if (med) {
                const batch = med.batches.find(b => b.id === parseInt(item.batch_id));
                if (batch) {
                    batch.stock = Math.max(0, batch.stock - parseInt(item.quantity));
                }
                med.totalStock = med.batches.reduce((sum, b) => sum + b.stock, 0);
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

    const filteredMedicineResults = useMemo(() => {
        if (!medSearchTerm) return localInventory;
        
        const query = medSearchTerm.toLowerCase();
        
        return localInventory.filter(m => {
            const nameMatch = (m.name || "").toLowerCase().includes(query);
            const brandMatch = (m.brand_name || "").toLowerCase().includes(query);
            const skuMatch = (m.sku_id || "").toLowerCase().includes(query);
            
            return nameMatch || brandMatch || skuMatch;
        });
    }, [localInventory, medSearchTerm]);

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
        router.put(route('admin.visits.updateFee', visit.id), { checkup_fee: feeInput }, {
            onSuccess: () => setIsEditingFee(false),
            preserveScroll: true
        });
    };

    const handleAddMedicine = () => {
        if (!selectedMed || !selectedBatch) return;
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

    const handleConfirmPayment = () => {
        setIsFinalizing(true);
        router.post(route('admin.billing.outpatient.store'), {
            visit_id: visit.id,
            amount_paid: paymentInput,
        }, {
            onSuccess: () => { setShowPaymentConfirm(false); onClose(); },
            onFinish: () => setIsFinalizing(false)
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-2 md:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[100dvh] md:h-[95vh]">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight">Outpatient Invoice</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-mono font-bold">Ref: #{visit?.visit_id || '---'}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-3xl">&times;</button>
                </div>

                <div className="p-4 md:p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar pb-64">
                    <div className="overflow-visible border border-slate-200 rounded-xl shadow-sm bg-white">
                        <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b">
                                <tr>
                                    <th className="p-4 border-r">Item Description</th>
                                    <th className="p-4 border-r text-center w-28">Qty</th>
                                    <th className="p-4 border-r text-right w-32">Price</th>
                                    <th className="p-4 text-right w-32">Total</th>
                                    <th className="p-4 text-center w-32 sticky right-0 bg-slate-50">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                <tr className={`border-b ${isEditingFee ? 'bg-amber-50' : 'bg-slate-50/50'}`}>
                                    <td className="p-4 border-r font-bold text-[#3D52A0]">Professional Consultation Fee</td>
                                    <td className="p-4 border-r text-center font-bold">1</td>
                                    <td className="p-4 border-r text-right font-mono font-bold">
                                        {isEditingFee ? 
                                            <input type="number" className="w-full p-1 border rounded" value={feeInput} onChange={e => setFeeInput(e.target.value)} /> : 
                                            `₱${CHECKUP_FEE.toLocaleString()}`
                                        }
                                    </td>
                                    <td className="p-4 text-right font-black">₱{CHECKUP_FEE.toLocaleString()}</td>
                                    <td className="p-4 text-center sticky right-0 bg-white">
                                        <button onClick={() => isEditingFee ? handleSaveFee() : setIsEditingFee(true)} className="text-blue-600 font-black uppercase text-[10px] hover:underline">
                                            {isEditingFee ? 'Save' : 'Adjust'}
                                        </button>
                                    </td>
                                </tr>

                                {billItems.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        <td className="p-4 border-r font-bold text-slate-800">{item.medicine?.generic_name}</td>
                                        <td className="p-4 border-r text-center font-black">{item.quantity}</td>
                                        <td className="p-4 border-r text-right">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                        <td className="p-4 text-right font-black text-emerald-700">₱{parseFloat(item.total_price).toLocaleString()}</td>
                                        <td className="p-4 text-center sticky right-0 bg-white shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">
                                            <button onClick={() => setItemToDelete(item)} className="text-rose-600 font-black uppercase text-[10px] hover:underline">Del</button>
                                        </td>
                                    </tr>
                                ))}

                                <tr className="bg-emerald-50/20 relative overflow-visible" ref={medDropdownRef}>
                                    <td className="p-3 border-r relative overflow-visible">
                                        <input 
                                            type="text"
                                            placeholder="Search medicine name or brand..."
                                            className="w-full border-slate-200 rounded-lg text-xs font-bold py-2.5"
                                            value={medSearchTerm}
                                            onFocus={() => setIsMedDropdownOpen(true)}
                                            onChange={(e) => {setMedSearchTerm(e.target.value); setSelectedMed(null); setIsMedDropdownOpen(true);}}
                                        />
                                        {isMedDropdownOpen && (
                                            <div className="absolute z-[999] left-0 right-0 top-full mt-1 bg-white border rounded-xl shadow-2xl max-h-56 overflow-y-auto border-slate-200">
                                                {filteredMedicineResults.map(m => (
                                                    <button key={m.id} type="button" disabled={m.totalStock <= 0} className="w-full text-left px-4 py-3 border-b flex justify-between items-center hover:bg-emerald-50 disabled:opacity-50" onClick={() => handlePickMedicine(m)}>
                                                        <div><p className="font-bold text-slate-800">{m.name}</p><p className="text-[9px] uppercase font-black text-slate-400">{m.brand_name} • Stock: {m.totalStock}</p></div>
                                                        <span className="font-bold text-emerald-600">₱{m.price.toLocaleString()}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3 border-r text-center">
                                        <input type="number" className="w-12 text-center border rounded" value={medQty} onChange={e => setMedQty(e.target.value)} />
                                    </td>
                                    <td colSpan="3" className="p-3">
                                        <Button variant="success" className="w-full text-[10px] font-black uppercase py-2.5" onClick={handleAddMedicine} disabled={!selectedMed || isSubmittingMed}>
                                            ADD TO BILL
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Section */}
                    <div className="bg-[#2E4696] rounded-2xl p-6 text-white shadow-xl space-y-6">
                        <div className="flex justify-between items-center border-b border-white/20 pb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-200">Total Invoice Amount:</span>
                            <span className="text-3xl font-black">₱ {totals.grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <label className="text-[10px] font-black uppercase text-blue-200 block mb-2 tracking-widest">Pay Amount (₱)</label>
                                <input type="number" className="w-full bg-blue-900/50 border-2 border-blue-400/30 rounded-xl px-4 py-3 text-3xl font-black text-emerald-400 outline-none" value={paymentInput} onChange={e => setPaymentInput(Math.min(parseFloat(e.target.value) || 0, totals.maxPayable))} />
                            </div>
                            <div className="bg-white/10 p-5 rounded-2xl flex-1 text-right border border-white/5">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1">Projected Balance</span>
                                <p className={`text-3xl font-black ${totals.currentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>₱ {totals.currentBalance.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                

                <div className="p-4 md:p-6 bg-slate-50 border-t flex justify-center gap-3">
                    <Button variant="gray" onClick={onClose} className="px-14 py-3.5 uppercase font-black text-[11px]">Close</Button>
                    <a 
                        href={route('admin.billing.outpatient.pdf', visit.id)} 
                        target="_blank"
                        className="inline-flex items-center px-8 md:px-14 py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-[11px] shadow-lg transition-all active:scale-95"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Bill
                    </a>
                    <Button variant="success" disabled={paymentInput <= 0 || isFinalizing} onClick={() => setShowPaymentConfirm(true)} className="px-14 py-3.5 uppercase font-black text-[11px] shadow-lg shadow-emerald-500/20">Confirm Payment</Button>
                </div>
            </div>

            {/* Overlays (Payment Confirm / Delete Item) */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center">
                        <h4 className="text-2xl font-black uppercase tracking-tight mb-6">Finalize Payment?</h4>
                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mb-6 flex justify-between items-center">
                            <span className="text-xs font-bold text-emerald-700 uppercase">Amount</span>
                            <span className="text-2xl font-black text-emerald-700">₱{parseFloat(paymentInput).toLocaleString()}</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px]">Back</button>
                            <button onClick={handleConfirmPayment} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {itemToDelete && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600 text-2xl font-black">!</div>
                        <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Remove Item?</h4>
                        <p className="text-slate-500 text-xs mb-6 px-4">Delete {itemToDelete.medicine?.generic_name} from invoice?</p>
                        <div className="flex w-full gap-2">
                            <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-black uppercase text-[10px]">No</button>
                            <button onClick={() => { router.delete(route('admin.billing.removeItem', itemToDelete.id), { preserveScroll: true, onSuccess: () => setItemToDelete(null) }); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black uppercase text-[10px]">Yes</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}