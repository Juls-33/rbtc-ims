import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button'; // Import standardized button

export default function ManageBatchesModal({ isOpen, onClose, medicine }) {
    if (!isOpen) return null;

    const generateId = () => "BCH-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    // --- State ---
    const [formData, setFormData] = useState({ batchId: generateId(), quantity: '', expiryDate: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [batchToDelete, setBatchToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState('Stock Emptied');
    const [batchToAdjust, setBatchToAdjust] = useState(null);
    const [adjustmentData, setAdjustmentData] = useState({ type: 'add', quantity: '', reason: 'Dispensed to Patient' });

    // --- Core Persistence Logic ---
    const syncWithServer = (actionType, targetBatch, reason = "Manual Update") => {
        setIsProcessing(true);
        router.post(`/admin/inventory/${medicine.id}/batches`, { 
            action_type: actionType,
            batch: targetBatch,
            reason: reason
        }, {
            preserveState: true, 
            preserveScroll: true,
            only: ['inventory', 'logs'], 
            onSuccess: () => {
                setIsProcessing(false);
                if (actionType === 'add') {
                    setFormData({ batchId: generateId(), quantity: '', expiryDate: '' });
                }
            },
            onError: () => setIsProcessing(false)
        });
    };

    // --- Action Handlers ---
    const handleAddBatch = () => {
        if (!formData.quantity || !formData.expiryDate) return;
        const newBatch = {
            id: formData.batchId,
            stock: formData.quantity,
            expiry: formData.expiryDate,
            received: new Date().toISOString().split('T')[0]
        };
        syncWithServer('add', newBatch, "New Shipment Received");
    };

    const handleFinalDelete = () => {
        syncWithServer('delete', batchToDelete, deleteReason);
        setBatchToDelete(null);
    };

    const handleSaveAdjustment = () => {
        const qty = parseInt(adjustmentData.quantity);
        if (isNaN(qty) || qty <= 0) return;

        const currentStock = parseInt(batchToAdjust.stock);
        const newStock = adjustmentData.type === 'add' ? currentStock + qty : Math.max(0, currentStock - qty);
        const updatedBatch = { ...batchToAdjust, stock: newStock.toString() };
        
        syncWithServer('adjust', updatedBatch, adjustmentData.reason);
        setBatchToAdjust(null);
        setAdjustmentData({ type: 'add', quantity: '', reason: 'Dispensed to Patient' });
    };

    const batches = medicine?.batches || [];
    const totalPages = Math.ceil(batches.length / itemsPerPage);
    const currentBatches = batches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold uppercase tracking-tight">Manage Batches: {medicine?.name}</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Input Section */}
                    <div className="space-y-4 mb-6 max-w-md mx-auto">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch ID</label>
                            <input type="text" value={formData.batchId} readOnly className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm font-mono text-blue-600" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                                <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Value" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                                <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="success" onClick={handleAddBatch} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : '+ Add Batch to Inventory'}
                            </Button>
                        </div>
                    </div>

                    <hr className="my-8 border-slate-200" />

                    <div className="border border-gray-200 rounded overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 font-bold border-b">
                                <tr>
                                    <th className="p-3 border-r">Batch ID</th>
                                    <th className="p-3 border-r text-center">Qty</th>
                                    <th className="p-3 border-r">Expiry</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBatches.map((batch) => (
                                    <tr key={batch.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3 border-r font-mono text-xs">{batch.id}</td>
                                        <td className="p-3 border-r font-bold text-center">{batch.stock}</td>
                                        <td className="p-3 border-r text-xs">{batch.expiry}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <Button variant="success" onClick={() => setBatchToAdjust(batch)} className="w-16">ADJUST</Button>
                                                <Button variant="danger" onClick={() => setBatchToDelete(batch)} className="w-16">REMOVE</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-center">
                    <Button variant="gray" onClick={onClose} className="px-16">CLOSE</Button>
                </div>

                {/* ADJUST OVERLAY */}
                {batchToAdjust && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-40 p-6">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-[#3D52A0] text-white px-6 py-3 flex justify-between items-center">
                                <h3 className="font-semibold uppercase text-xs">Adjust Stock: {batchToAdjust.id}</h3>
                                <button onClick={() => setBatchToAdjust(null)} className="text-2xl">&times;</button>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <input type="radio" checked={adjustmentData.type === 'add'} onChange={() => setAdjustmentData({...adjustmentData, type: 'add'})} /> + ADD STOCK
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <input type="radio" checked={adjustmentData.type === 'remove'} onChange={() => setAdjustmentData({...adjustmentData, type: 'remove'})} /> - REMOVE STOCK
                                    </label>
                                </div>
                                <input type="number" placeholder="Quantity" value={adjustmentData.quantity} onChange={(e) => setAdjustmentData({...adjustmentData, quantity: e.target.value})} className="w-full border rounded p-2 text-sm" />
                                <select value={adjustmentData.reason} onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})} className="w-full border rounded p-2 text-sm bg-white">
                                    <option>Dispensed to Patient</option>
                                    <option>Damaged</option>
                                    <option>Inventory Correction</option>
                                </select>
                                <div className="flex gap-2">
                                    <Button variant="gray" onClick={() => setBatchToAdjust(null)} className="flex-1">CANCEL</Button>
                                    <Button variant="success" onClick={handleSaveAdjustment} className="flex-1">SAVE ADJUSTMENT</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DELETE OVERLAY */}
                {batchToDelete && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 p-6">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="bg-[#D65A5A] text-white px-6 py-3 flex justify-between items-center">
                                <h3 className="font-semibold uppercase text-xs">Confirm Removal</h3>
                                <button onClick={() => setBatchToDelete(null)} className="text-2xl">&times;</button>
                            </div>
                            <div className="p-6 space-y-4 text-center">
                                <p className="text-xs text-slate-600 font-medium">Permanently remove batch <span className="font-bold text-slate-900">{batchToDelete.id}</span>?</p>
                                <div className="flex gap-2">
                                    <Button variant="gray" onClick={() => setBatchToDelete(null)} className="flex-1">CANCEL</Button>
                                    <Button variant="danger" onClick={handleFinalDelete} className="flex-1">CONFIRM REMOVE</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}