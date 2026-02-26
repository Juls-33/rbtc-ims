import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 
import Pagination from '@/Components/Pagination';

export default function ManageBatchesModal({ isOpen, onClose, medicine }) {
    if (!isOpen) return null;

    const generateId = () => "BCH-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const [formData, setFormData] = useState({ batchId: generateId(), quantity: '', expiryDate: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const today = new Date().toISOString().split('T')[0];

    const [errors, setErrors] = useState({}); 
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    
    const [batchToDelete, setBatchToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState('Stock Emptied');
    const [batchToAdjust, setBatchToAdjust] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({ type: 'add', quantity: '', reason: 'Dispensed to Patient' });

    const showToast = (message, type = 'error') => {
        setToastInfo({ show: true, message, type });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = "Enter a valid quantity.";
        }
        if (!formData.expiryDate) {
            newErrors.expiryDate = "Expiry date required.";
        }
        
        setErrors(newErrors); 
        return Object.keys(newErrors).length === 0;
    };

    const syncWithServer = (actionType, targetBatch, reason = "Manual Update") => {
        setIsProcessing(true);
        router.post(`/admin/inventory/${medicine.id}/batches`, { 
            action_type: actionType,
            batch: targetBatch,
            reason: reason
        }, {
            preserveState: true, 
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                // if (actionType === 'add') {
                //     setFormData({ batchId: generateId(), quantity: '', expiryDate: '' });
                //     showToast('New batch added!', 'success');
                // } else if (actionType === 'adjust') {
                //     showToast('Stock level adjusted.', 'success');
                // } else {
                //     showToast('Batch removed.', 'success');
                // }
                setErrors({}); 
            },
            onError: () => {
                setIsProcessing(false);
                showToast('Server error. Failed to sync inventory.');
            }
        });
    };

    // --- Action Handlers ---
    const handleAddBatch = () => {
        if (validate()) {
            const newBatch = {
                id: formData.batchId,
                stock: formData.quantity,
                expiry: formData.expiryDate,
                received: new Date().toISOString().split('T')[0]
            };
            syncWithServer('add', newBatch, "New Shipment Received");
        } else {
            showToast('Submission Failed. Please check highlighted fields.');
        }
    };

    const handleFinalDelete = () => {
        syncWithServer('delete', batchToDelete, deleteReason);
        setBatchToDelete(null);
    };

    const handleSaveAdjustment = () => {
        const qty = parseInt(adjustmentData.quantity);
        const currentStock = parseInt(batchToAdjust.stock);
        if (isNaN(qty) || qty <= 0) {
            showToast('Please enter a valid positive quantity.', 'error');
            return;
        }

        if (adjustmentData.type === 'remove' && qty > currentStock) {
            showToast(`Cannot remove ${qty}. Only ${currentStock} units available in this batch.`, 'error');
            return;
        }

        const newStock = adjustmentData.type === 'add' ? currentStock + qty : Math.max(0, currentStock - qty);
        const updatedBatch = { ...batchToAdjust, stock: newStock.toString(), expiry: adjustmentData.expiryDate };
        
        syncWithServer('adjust', updatedBatch, adjustmentData.reason);
        setBatchToAdjust(null);
        setAdjustmentData({ type: 'add', quantity: '', reason: 'Dispensed to Patient' });
    };

    const handleAdjustmentQuantityChange = (e) => {
        let val = e.target.value;
        
        // Convert to number for comparison
        const numericVal = parseInt(val);
        const maxAvailable = parseInt(batchToAdjust.stock);

        // If removing stock, cap the input at the max available
        if (adjustmentData.type === 'remove' && numericVal > maxAvailable) {
            val = maxAvailable.toString();
            showToast(`Capped at maximum available stock: ${maxAvailable}`, 'warning');
        }

        setAdjustmentData({ ...adjustmentData, quantity: val });
    };

    const batches = medicine?.batches || [];
    const totalPages = Math.ceil(batches.length / itemsPerPage);
    const currentBatches = batches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, required = true, fieldError }) => (
        <label className={`block text-[10px] font-black uppercase tracking-tighter mb-1 ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
            {text} {required && <span className="text-red-600">*</span>}
        </label>
    );

    const handleModalClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
            {toastInfo.show && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, show: false })} />}

            {/* CONTAINER */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in duration-150">
                
                {/* HEADER */}
                <div className="bg-[#3D52A0] text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-md">
                    <div>
                        <h2 className="text-lg font-black uppercase tracking-tight leading-none">Manage Batches</h2>
                        <p className="text-[10px] text-blue-100 uppercase font-bold mt-1 tracking-widest">{medicine?.name}</p>
                    </div>
                    <button onClick={handleModalClose} className="text-white hover:text-red-200 text-2xl font-bold leading-none">&times;</button>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4 mb-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Registration of New Stock</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label text="Batch Serial ID" required={false} />
                                <input type="text" value={formData.batchId} readOnly className="w-full border border-slate-200 bg-slate-100 rounded px-3 py-2 text-sm font-mono text-blue-600 cursor-not-allowed opacity-70" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label text="Quantity" fieldError={errors.quantity} />
                                    <input 
                                        type="number" 
                                        value={formData.quantity} 
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                                        className={inputClass(errors.quantity)} 
                                        placeholder="e.g. 100" 
                                    />
                                    {errors.quantity && <p className="text-[9px] text-red-500 mt-1 font-bold italic uppercase">{errors.quantity}</p>}
                                </div>
                                <div>
                                    <Label text="Expiry Date" fieldError={errors.expiryDate} />
                                    <input 
                                        type="date" 
                                        value={formData.expiryDate} 
                                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
                                        className={inputClass(errors.expiryDate)} 
                                    />
                                    {errors.expiryDate && <p className="text-[9px] text-red-500 mt-1 font-bold italic uppercase">{errors.expiryDate}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="success" onClick={handleAddBatch} disabled={isProcessing} className="w-full md:w-auto px-8 py-2.5 font-black text-[10px] uppercase shadow-lg">
                                {isProcessing ? 'Processing...' : '+ Add Batch to Inventory'}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Active Batches</h4>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[9px] tracking-widest border-b">
                                        <tr>
                                            <th className="p-3 border-r">ID</th>
                                            <th className="p-3 border-r text-center">In Stock</th>
                                            <th className="p-3 border-r text-center">Expiry</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {currentBatches.length > 0 ? currentBatches.map((batch) => {
                                            const isExpired = batch.expiry < today; 
                                            
                                            return (
                                                <tr key={batch.id} className={`transition-colors ${isExpired ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                                                    <td className={`p-3 border-r font-mono text-[11px] ${isExpired ? 'text-red-600 font-bold' : 'text-slate-500'}`}>{batch.id}</td>
                                                    <td className={`p-3 border-r font-black text-center ${isExpired ? 'text-red-700' : 'text-slate-800'}`}>{batch.stock}</td>
                                                    <td className={`p-3 border-r text-[11px] text-center font-bold ${isExpired ? 'text-red-600 underline decoration-double' : 'text-slate-600'}`}>
                                                        {batch.expiry} {isExpired && <span className="block text-[8px] uppercase tracking-tighter">Expired</span>}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex gap-2 justify-center">
                                                            <Button variant="success" onClick={() => setBatchToAdjust(batch)} className="px-3 py-1 text-[8px] font-black uppercase">ADJUST</Button>
                                                            <Button variant="danger" onClick={() => setBatchToDelete(batch)} className="px-3 py-1 text-[8px] font-black uppercase">REMOVE</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr><td colSpan="4" className="p-10 text-center text-slate-400 italic text-xs">No active batches for this medicine.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {batches.length > itemsPerPage && (
                            <div className="mt-4">
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-center shrink-0">
                    <Button variant="gray" onClick={handleModalClose} className="w-full md:w-auto px-16 py-2.5 font-black text-[10px] uppercase">CLOSE MANAGER</Button>
                </div>

                {/* ADJUST OVERLAY */}
                {batchToAdjust && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 md:p-6 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[95%] overflow-hidden transform animate-in zoom-in-95">
                            
                            <div className="bg-[#3D52A0] text-white px-5 py-4 flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="font-black uppercase text-[10px] tracking-[0.15em] leading-none">Adjust Inventory</h3>
                                    <p className="text-[9px] font-mono text-blue-100 mt-1 uppercase">Batch: {batchToAdjust.id}</p>
                                </div>
                                <button onClick={() => setBatchToAdjust(null)} className="text-white hover:text-rose-200 text-2xl leading-none">&times;</button>
                            </div>

                            <div className="p-6 space-y-5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                                {/* Current Stock Indicator */}
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Current Batch Stock</p>
                                    <p className="text-xl font-black text-[#3D52A0]">{batchToAdjust.stock} <span className="text-[10px]">Units</span></p>
                                </div>

                                {/* Type Selection */}
                                <div className="flex flex-col gap-2">
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${adjustmentData.type === 'add' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
                                        <input 
                                            type="radio" 
                                            name="adj_type"
                                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" 
                                            checked={adjustmentData.type === 'add'} 
                                            onChange={() => setAdjustmentData({...adjustmentData, type: 'add'})} 
                                        /> 
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${adjustmentData.type === 'add' ? 'text-emerald-700' : 'text-slate-500'}`}>+ Increase Stock</span>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${adjustmentData.type === 'remove' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                                        <input 
                                            type="radio" 
                                            name="adj_type"
                                            className="w-4 h-4 text-rose-600 focus:ring-rose-500" 
                                            checked={adjustmentData.type === 'remove'} 
                                            onChange={() => {
                                                let qty = adjustmentData.quantity;
                                                if (parseInt(qty) > parseInt(batchToAdjust.stock)) {
                                                    qty = batchToAdjust.stock;
                                                }
                                                setAdjustmentData({...adjustmentData, type: 'remove', quantity: qty});
                                            }} 
                                        /> 
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${adjustmentData.type === 'remove' ? 'text-rose-700' : 'text-slate-500'}`}>- Decrease Stock</span>
                                    </label>
                                </div>

                                {/* Quantity Input with Capping logic */}
                                <div>
                                    <Label text="Adjustment Amount" />
                                    <input 
                                        type="number" 
                                        min="1"
                                        max={adjustmentData.type === 'remove' ? batchToAdjust.stock : undefined}
                                        placeholder="Enter value..." 
                                        value={adjustmentData.quantity} 
                                        onChange={handleAdjustmentQuantityChange} 
                                        className={inputClass()} 
                                    />
                                    <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">
                                        {adjustmentData.type === 'remove' ? `Max allowed: ${batchToAdjust.stock}` : 'Enter amount to add'}
                                    </p>
                                </div>

                                {/* Expiry Date Field */}
                                <div>
                                    <Label text="Update Expiry Date" />
                                    <input 
                                        type="date" 
                                        value={adjustmentData.expiryDate || batchToAdjust.expiry} 
                                        onChange={(e) => setAdjustmentData({...adjustmentData, expiryDate: e.target.value})} 
                                        className={inputClass()} 
                                    />
                                </div>

                                {/* Reason Select */}
                                <div>
                                    <Label text="Reason for Change" />
                                    <select 
                                        value={adjustmentData.reason} 
                                        onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})} 
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                                    >
                                        <option>Dispensed to Patient</option>
                                        <option>Damaged</option>
                                        <option>Inventory Correction</option>
                                        <option>Expired Stock Removal</option>
                                        <option>Return to Supplier</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 border-t flex flex-col-reverse sm:flex-row gap-2 shrink-0">
                                <Button variant="gray" onClick={() => setBatchToAdjust(null)} className="flex-1 py-3 font-black text-[10px] uppercase">Cancel</Button>
                                <Button variant="success" onClick={handleSaveAdjustment} className="flex-1 py-3 font-black text-[10px] uppercase shadow-lg">Save Changes</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DELETE */}
                {batchToDelete && (
                    <div className="absolute inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 md:p-6 animate-in fade-in">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col max-h-[95%] overflow-hidden transform animate-in zoom-in-95">
                            <div className="bg-rose-600 text-white px-6 py-4 shrink-0 shadow-sm">
                                <h3 className="font-black uppercase text-[10px] tracking-[0.2em] text-center">Confirm Batch Removal</h3>
                            </div>
                            <div className="p-6 md:p-8 space-y-6 text-center overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 shrink-0">
                                    <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">
                                        Delete Batch {batchToDelete.id}?
                                    </h4>
                                    <p className="text-sm text-slate-500 leading-relaxed px-2">
                                        Are you sure you want to permanently remove this stock? 
                                        This will deduct <span className="font-bold text-slate-900">{batchToDelete.stock} units</span> from the generic inventory.
                                    </p>
                                </div>

                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 py-2 rounded-lg border border-rose-100 italic">
                                    This action cannot be undone
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-5 bg-slate-50 border-t flex flex-col-reverse sm:flex-row gap-3 shrink-0">
                                <Button 
                                    variant="gray" 
                                    onClick={() => setBatchToDelete(null)} 
                                    className="w-full sm:flex-1 py-3 font-black text-[10px] uppercase tracking-widest"
                                >
                                    No, Cancel
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={handleFinalDelete} 
                                    className="w-full sm:flex-1 py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100"
                                >
                                    Yes, Remove
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}