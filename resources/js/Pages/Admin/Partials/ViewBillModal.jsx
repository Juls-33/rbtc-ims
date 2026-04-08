import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';
import ClientPagination from '@/Components/ClientPagination';

export default function ViewBillModal({ isOpen, onClose, admissionId, patient, medicines = [] }) {
    const { patients } = usePage().props;
    const [toast, setToast] = useState(null);
    const medDropdownRef = useRef(null);

    // --- State Management ---
    const [selectedStatementIdx, setSelectedStatementIdx] = useState(0);
    const [paymentInput, setPaymentInput] = useState(0);
    const [medSearchTerm, setMedSearchTerm] = useState('');
    const [isMedDropdownOpen, setIsMedDropdownOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState(null); 
    const [editingId, setEditingId] = useState(null);
    const [editQty, setEditQty] = useState(1);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isMiscMode, setIsMiscMode] = useState(false);

    // Pagination State for Billing Cycles Table
    const [cyclePage, setCyclePage] = useState(1);
    const itemsPerPage = 5;

    // --- Inertia Forms ---
    const medForm = useForm({
        admission_id: '',
        bill_id: '',
        medicine_id: '',
        batch_id: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
    });

    const paymentForm = useForm({
        admission_id: '',
        bill_id: '',
        amount_paid: 0,
    });

    // --- Memoized Data ---
    const activePatient = useMemo(() => {
        const patientList = patients?.data || (Array.isArray(patients) ? patients : []);
        return patientList.find(p => p.id === patient?.id) || patient;
    }, [patients, patient]);

    const admission = useMemo(() => {
        if (!activePatient || !admissionId) return null;
        return activePatient.active_admission?.id === admissionId 
            ? activePatient.active_admission 
            : activePatient.admission_history?.find(adm => adm.id === admissionId);
    }, [activePatient, admissionId]);

    const statements = admission?.statements || [];
    
    // Pagination for cycles table
    const paginatedCycles = useMemo(() => {
        const start = (cyclePage - 1) * itemsPerPage;
        return statements.slice(start, start + itemsPerPage);
    }, [statements, cyclePage]);

    const totalPages = Math.ceil(statements.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCyclePage(page);
    };

    const currentStatement = statements[selectedStatementIdx];
    const displayItems = currentStatement?.items || [];

    const totals = useMemo(() => {
        const periodBalance = parseFloat(currentStatement?.balance || 0);
        return {
            periodTotal: parseFloat(currentStatement?.grand_total || 0),
            periodBalance,
            maxPayable: Number(periodBalance.toFixed(2)),
            newBalance: Math.max(0, periodBalance - paymentInput)
        };
    }, [currentStatement, paymentInput]);

    // Filter Inventory logic
    const localInventory = useMemo(() => {
        return medicines.map(med => ({
            ...med,
            totalStock: med.batches?.reduce((sum, b) => sum + parseInt(b.stock || 0), 0) || 0
        }));
    }, [medicines]);

    const filteredMedicineResults = useMemo(() => {
        const query = medSearchTerm.toLowerCase();
        return localInventory.filter(m => 
            m.name.toLowerCase().includes(query) || m.brand_name.toLowerCase().includes(query)
        );
    }, [localInventory, medSearchTerm]);

    // --- Handlers ---

    // FIX: ADDED MISSING HELPER
    const handlePaymentChange = (val) => {
        const num = parseFloat(val) || 0;
        setPaymentInput(Math.min(num, totals.maxPayable));
    };

    const handlePickMedicine = (med) => {
        const firstBatch = med.batches?.find(b => b.stock > 0);
        if (!firstBatch) return;

        setSelectedMed(med);
        setMedSearchTerm(`${med.name} (${med.brand_name})`);
        setIsMedDropdownOpen(false);
        
        medForm.setData({
            ...medForm.data,
            admission_id: admission.id,
            bill_id: currentStatement?.id, 
            medicine_id: med.id,
            batch_id: firstBatch.id,
            description: `${med.name} (${med.brand_name})`,
            unit_price: med.price,
            quantity: 1,
            total_price: med.price 
        });
    };

    const handleAddMedicine = () => {
        if (isMiscMode ? !medForm.data.description : !selectedMed) return;

        const finalData = {
            ...medForm.data,
            admission_id: admission.id,
            bill_id: currentStatement?.id, 
            medicine_id: isMiscMode ? null : selectedMed?.id,
            batch_id: isMiscMode ? null : medForm.data.batch_id,
            description: isMiscMode ? medForm.data.description : `${selectedMed?.name} (${selectedMed?.brand_name})`,
        };

        router.post(route('admin.billing.inpatient.addItem'), finalData, {
            preserveScroll: true,
            onBefore: () => {
                if (medForm.processing) return false; 
            },
            onSuccess: () => {
                setSelectedMed(null);
                setMedSearchTerm('');
                medForm.reset('description', 'quantity', 'unit_price', 'total_price');
                setToast({ message: 'Item added successfully!', type: 'success' });
            }
        });
    };

    const handleProcessPayment = () => {
        router.post(route('admin.billing.inpatient.pay'), {
            admission_id: admission.id,
            bill_id: currentStatement?.id, // Ensures the payment is applied to THIS statement
            amount_paid: paymentInput,
        }, {
            onSuccess: () => {                              
                setShowPaymentConfirm(false);
                setPaymentInput(0);
                setToast({ message: 'Payment processed for this statement!', type: 'success' });
            }
        });
    };

    const adjustQuantity = (amount) => {
        const currentQty = parseInt(medForm.data.quantity) || 1;
        const newQty = Math.max(1, currentQty + amount);
        const uPrice = parseFloat(medForm.data.unit_price) || 0;
        medForm.setData({
            ...medForm.data,
            quantity: newQty,
            total_price: newQty * uPrice
        });
    };
    useEffect(() => {
            if (currentStatement?.id) {
                medForm.setData('bill_id', currentStatement.id);
            }
        }, [selectedStatementIdx, currentStatement?.id]);
        useEffect(() => {
        const handleClickOutside = (event) => {
            if (medDropdownRef.current && !medDropdownRef.current.contains(event.target)) {
                setIsMedDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!isOpen || !admission) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-2 md:p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[100dvh] md:h-[95vh] animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-black text-lg md:text-xl uppercase tracking-tight">Period-Based Billing</h3>
                        <p className="text-[9px] text-blue-100 uppercase font-mono font-bold">Patient: {activePatient?.name} | Admission ID: {admission.id}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-3xl">&times;</button>
                </div>

                <div className="p-4 md:p-8 space-y-6 overflow-y-auto flex-1 no-scrollbar pb-10">
                    
                    {/* 1. BILLING PERIOD OVERVIEW TABLE */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-2">Select Billing Cycle</h4>
                            <select 
                                className="bg-white border-slate-300 rounded font-bold text-[10px] px-3 py-1.5 outline-none shadow-sm"
                                value={selectedStatementIdx}
                                onChange={(e) => {
                                    setSelectedStatementIdx(parseInt(e.target.value));
                                    setPaymentInput(0); // Reset payment input when switching months
                                }}
                            >
                                {statements.map((stmt, idx) => (
                                    <option key={idx} value={idx}>
                                        {stmt.period_start ? new Date(stmt.period_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : `Cycle ${stmt.index}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <table className="w-full text-left text-xs bg-white">
                            <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] border-b">
                                <tr>
                                    <th className="p-3">Period</th>
                                    <th className="p-3 text-right">Total Amount</th>
                                    <th className="p-3 text-right">Paid</th>
                                    <th className="p-3 text-right">Balance</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCycles.map((stmt) => {
                                    const actualIdx = statements.findIndex(s => s.id === stmt.id);
                                    const isSelected = actualIdx === selectedStatementIdx;

                                    return (
                                        <tr key={stmt.id} className={`border-b transition-all duration-200 ${isSelected ? 'bg-blue-50/80 ring-1 ring-inset ring-blue-100' : 'hover:bg-slate-50'}`}>
                                            <td className="p-3 font-bold text-slate-700 uppercase">
                                                {stmt.period_start ? new Date(stmt.period_start).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : `MONTH ${stmt.index}`}
                                            </td>
                                            <td className="p-3 text-right">₱{parseFloat(stmt.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-3 text-right text-emerald-600">₱{parseFloat(stmt.amount_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-3 text-right font-black text-rose-600">₱{parseFloat(stmt.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => setSelectedStatementIdx(actualIdx)} 
                                                    className={`w-full py-1.5 rounded text-[9px] font-black uppercase transition-all shadow-sm ${isSelected ? 'bg-[#3D52A0] text-white scale-105' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                                                >
                                                    {isSelected ? 'Selected' : 'Select'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="p-4 border-t bg-slate-50/30">
                            <ClientPagination 
                                currentPage={cyclePage}           
                                totalPages={totalPages}           
                                onPageChange={handlePageChange}  
                                totalResults={statements.length} 
                                itemsPerPage={itemsPerPage}
                            />
                        </div>
                    </div>

                    {/* 2. MEDICINE TABLE */}
                    <div className="space-y-2">
                        <h4 className="font-black text-slate-700 text-[10px] uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Medication & Supplies
                        </h4>
                        <div className="border border-slate-200 rounded-xl shadow-sm bg-white relative z-10">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b">
                                    <tr>
                                        <th className="p-4">Item Description</th>
                                        <th className="p-4 text-center w-32">Qty</th>
                                        <th className="p-4 text-right w-32">Price</th>
                                        <th className="p-4 text-right w-32">Total</th>
                                        <th className="p-4 text-center sticky right-0 bg-slate-50 w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-slate-50/50">
                                            <td className="p-4 font-bold text-slate-800">{item.description}</td>
                                            <td className="p-4 text-center">
                                                <span className="font-black">{item.quantity}</span>
                                            </td>
                                            <td className="p-4 text-right font-mono">₱{parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="p-4 text-right font-black text-emerald-700">₱{parseFloat(item.total_price).toLocaleString()}</td>
                                            <td className="p-4 text-center sticky right-0 bg-white">
                                                <button onClick={() => setItemToDelete(item)} className="text-rose-600 font-black uppercase text-[10px]">Del</button>
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {/* ADD NEW ITEM ROW */}
                                    <tr className="bg-emerald-50/40 border-t-2 border-emerald-100" ref={medDropdownRef}>
                                        <td className="p-3 relative overflow-visible">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center px-1 mb-1">
                                                    <span className="text-[8px] font-black text-emerald-700 uppercase">
                                                        {isMiscMode ? '⚡ Misc Item' : '💊 Medicine'}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => {
                                                            setIsMiscMode(!isMiscMode);
                                                            medForm.setData({
                                                                ...medForm.data,
                                                                medicine_id: null,
                                                                batch_id: null,
                                                                description: '',
                                                                unit_price: 0,
                                                                total_price: 0,
                                                                quantity: 1
                                                            });
                                                            setMedSearchTerm('');
                                                        }} 
                                                        className="text-[8px] font-black text-blue-700 uppercase hover:underline"
                                                    >
                                                        {isMiscMode ? '[Switch to Search]' : '[Switch to Misc]'}
                                                    </button>
                                                </div>

                                                {isMiscMode ? (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Enter Item Name (e.g. PPE, Lab Fee...)" 
                                                        className="w-full border-emerald-200 rounded-lg text-xs font-bold py-2 px-3 shadow-inner"
                                                        value={medForm.data.description}
                                                        onChange={(e) => medForm.setData('description', e.target.value)}
                                                    />
                                                ) : (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Search medicine catalog..." 
                                                        className="w-full border-emerald-200 rounded-lg text-xs font-bold py-2 px-3 shadow-inner"
                                                        value={medSearchTerm}
                                                        onChange={(e) => {setMedSearchTerm(e.target.value); setIsMedDropdownOpen(true);}}
                                                        onFocus={() => setIsMedDropdownOpen(true)}
                                                    />
                                                )}
                                                
                                                {/* DROPDOWN: High z-index to stay on top */}
                                                {!isMiscMode && isMedDropdownOpen && (
                                                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-emerald-500 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] max-h-60 overflow-y-auto z-[9999]">
                                                        {filteredMedicineResults.map(m => (
                                                            <button key={m.id} disabled={m.totalStock <= 0} className={`w-full text-left px-4 py-3 border-b flex justify-between items-center ${m.totalStock > 0 ? 'hover:bg-emerald-50' : 'opacity-50'}`} onClick={() => handlePickMedicine(m)}>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-sm">{m.name}</p>
                                                                    <p className="text-[9px] uppercase font-black text-slate-400">{m.brand_name} • Stock: {m.totalStock}</p>
                                                                </div>
                                                                <span className="font-bold text-emerald-600">₱{m.price.toLocaleString()}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* QUANTITY: Same design as medicines */}
                                        <td className="p-3">
                                            <div className="flex items-center justify-center gap-1 bg-white rounded-lg p-1 border border-emerald-200 shadow-sm">
                                                <button type="button" onClick={() => adjustQuantity(-1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border rounded hover:bg-rose-500 hover:text-white font-bold transition-colors">-</button>
                                                <input 
                                                    type="number" 
                                                    className="w-12 text-center bg-slate-50 border-none font-black text-sm text-slate-800 focus:ring-0 rounded" 
                                                    value={medForm.data.quantity} 
                                                    readOnly 
                                                />
                                                <button type="button" onClick={() => adjustQuantity(1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 border rounded hover:bg-emerald-500 hover:text-white font-bold transition-colors">+</button>
                                            </div>
                                        </td>

                                        {/* PRICE: Manual input if Misc, Read-only if Medicine */}
                                        <td className="p-3">
                                            {isMiscMode ? (
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2 text-[10px] font-bold text-slate-400">₱</span>
                                                    <input 
                                                        type="number" 
                                                        placeholder="0.00" 
                                                        className="w-full border-emerald-200 rounded-lg text-xs font-black py-2 pl-5 bg-white shadow-inner focus:ring-emerald-500" 
                                                        value={medForm.data.unit_price} 
                                                        onChange={(e) => {
                                                            const price = parseFloat(e.target.value) || 0;
                                                            medForm.setData({ ...medForm.data, unit_price: price, total_price: price * medForm.data.quantity });
                                                        }} 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-right px-2 font-mono font-bold text-slate-500">
                                                    ₱{parseFloat(medForm.data.unit_price).toLocaleString()}
                                                </div>
                                            )}
                                        </td>

                                        {/* TOTAL: Auto-calculated */}
                                        <td className="p-3 text-right font-black text-emerald-700 pr-4">
                                            ₱{parseFloat(medForm.data.total_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>

                                        {/* ACTION: Forced !static to prevent "Gray Shit" overlap */}
                                        <td className="p-3 !static bg-emerald-100/30"> 
                                            <Button 
                                                variant="success" 
                                                className="w-full text-[9px] font-black py-2.5 uppercase shadow-md" 
                                                onClick={handleAddMedicine} 
                                                disabled={medForm.processing || (isMiscMode ? !medForm.data.description : !selectedMed)}
                                            >
                                                {medForm.processing ? 'ADDING...' : '+ ADD TO STATEMENT'}
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. FINANCIAL SUMMARY */}
                    <div className="bg-[#2E4696] rounded-2xl p-6 text-white shadow-xl space-y-6">
                        <div className="flex justify-between items-end border-b border-white/20 pb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-blue-200 tracking-widest block mb-1">Cycle Balance</span>
                                <h4 className="text-4xl font-black text-emerald-400">₱ {totals.periodBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1 tracking-widest">Statement Total</span>
                                <p className="text-xl font-bold opacity-70 italic">₱ {totals.periodTotal.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-blue-200 tracking-widest px-1">Amount to Pay</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-3.5 text-blue-300 font-bold text-lg">₱</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-blue-900/50 border-2 border-blue-400/30 rounded-xl pl-8 pr-4 py-3 text-2xl font-black text-white outline-none focus:border-emerald-400"
                                            value={paymentInput} 
                                            onChange={e => handlePaymentChange(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="success" className="px-5 text-[10px] font-black tracking-widest" onClick={() => setPaymentInput(totals.periodBalance)}>FULL</Button>
                                    <Button variant="gray" className="px-5 text-[10px] font-black tracking-widest bg-slate-500 hover:bg-slate-600" onClick={() => setPaymentInput(0)}>CLEAR</Button>
                                </div>
                            </div>

                            <div className="bg-white/10 p-5 rounded-2xl border border-white/5 flex flex-col justify-center items-end text-right">
                                <span className="text-[10px] font-black uppercase text-blue-200 block mb-1 tracking-widest">Remaining Balance After Payment</span>
                                <p className={`text-3xl font-black ${totals.newBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    ₱ {totals.newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 shrink-0">
                    <Button variant="gray" onClick={onClose} className="px-8 py-3 uppercase font-black text-[11px] tracking-widest">Close</Button>
                    <a 
                        href={route('admin.billing.inpatient.pdf', admission.id)} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-[11px] tracking-widest shadow-lg transition-all active:scale-95 order-2 md:order-2"
                    >
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        Print PDF
                    </a>
                    <Button variant="success" className="px-12 py-3 uppercase font-black text-[11px] tracking-widest shadow-lg active:scale-95" disabled={paymentInput <= 0 || paymentForm.processing} onClick={() => setShowPaymentConfirm(true)}>
                        Confirm Payment
                    </Button>
                </div>
            </div>
            
            {/* TOAST NOTIFICATIONS */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* PAYMENT CONFIRMATION OVERLAY */}
            {showPaymentConfirm && (
                 <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-emerald-600 p-6 text-center text-white">
                            <h4 className="text-xl font-black uppercase tracking-tight">Confirm Payment</h4>
                        </div>
                        <div className="p-6 space-y-6 text-center">
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">Paying for this period</span>
                                <span className="text-2xl font-black text-emerald-700">₱{parseFloat(paymentInput).toLocaleString()}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowPaymentConfirm(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black uppercase text-[10px]">Back</button>
                                <button disabled={paymentForm.processing} onClick={handleProcessPayment} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px]">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}