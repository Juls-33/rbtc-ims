import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import AddMedicineModal from './Partials/AddMedicineModal';
import EditMedicineModal from './Partials/EditMedicineModal';
import DeleteMedicineModal from './Partials/DeleteMedicineModal';

export default function MedicineInventory({ auth, inventory = [] }) {
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'ledger'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);

    // TEMPORARY: Placeholder for the Ledger tab until we build that backend
    const mockLedger = [
        { dateTime: '2023-10-25 09:30', id: 'BATCH-001', action: 'STOCK IN', amount: '+50', newQty: 150, reason: 'New Shipment', admin: 'Nurse Joy' },
        { dateTime: '2023-10-24 14:15', id: 'BATCH-002', action: 'DISPENSE', amount: '-2', newQty: 98, reason: 'Patient: John Doe', admin: 'Dr. House' },
    ];

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleEditClick = (medicine) => {
        setSelectedMedicine(medicine);
        setIsEditModalOpen(true);
    };
    const handleDeleteClick = (medicine) => {
        setMedicineToDelete(medicine);
        setIsDeleteModalOpen(true);
    };
    const confirmDelete = () => {
        if (medicineToDelete) {
            router.delete(route('inventory.destroy', medicineToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setMedicineToDelete(null);
                    // Optional: setExpandedRow(null) if you want to close any open rows
                }
            });
        }
    };

    return (
        <AuthenticatedLayout 
            header="Admin / Medicine Inventory" 
            sectionTitle={
                <div className="flex w-full">
                    <button 
                        onClick={() => setActiveTab('manage')}
                        className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider ${activeTab === 'manage' ? 'bg-slate-400/50 text-slate-100 hover:bg-slate-400' : 'bg-[#2E4696] text-white hover:bg-[#243776]'}`}
                    >
                        MANAGE STOCK
                    </button>
                    <button 
                        onClick={() => setActiveTab('ledger')}
                        className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider ${activeTab === 'ledger' ? 'bg-slate-400/50 text-slate-100 hover:bg-slate-400' : 'bg-[#2E4696] text-white hover:bg-[#243776]'}`}
                    >
                        STOCK LEDGER (LOGS)
                    </button>
                </div>
            }
        >
            <Head title="Medicine Inventory" />

            {/* 1. Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Items', value: inventory.length },
                    { label: 'Critical Stock', value: inventory.filter(i => i.totalStock < 20).length },
                    { label: 'Expiring Soon', value: '0' }, // Placeholder until we calculate this in controller
                    { label: 'Out of Stock', value: inventory.filter(i => i.totalStock === 0).length },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</span>
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* 2. Search and Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder={activeTab === 'manage' ? "Search Medicine by SKU or Name" : "Search Logs by ID or Admin"}
                        className="w-full pl-5 pr-4 py-2 border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                {/* Only show "Add New Medicine" on the Manage tab */}
                {activeTab === 'manage' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#5A9167] hover:bg-[#4a7a55] text-white px-6 py-2 rounded font-bold text-sm shadow-sm transition-colors">
                        + ADD NEW MEDICINE
                    </button>
                )}
            </div>

            {/* 3. Table Container (Conditional Content) */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                {activeTab === 'manage' ? (
                    /* --- MANAGE STOCK TABLE --- */
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-3 w-10 text-center"></th>
                                <th className="p-3 border-r border-slate-200">SKU</th>
                                <th className="p-3 border-r border-slate-200">Medicine Name</th>
                                <th className="p-3 border-r border-slate-200">Category</th>
                                <th className="p-3 border-r border-slate-200 text-center">Total Stock</th>
                                <th className="p-3 border-r border-slate-200 text-center">Soonest Expiry</th>
                                <th className="p-3 border-r border-slate-200 text-center">Status</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600">
                            {/* FIXED: Using 'inventory' instead of 'mockMedicines' */}
                            {inventory.map((item) => (
                                <React.Fragment key={item.id}>
                                    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 text-center border-r border-slate-200">
                                            <button 
                                                onClick={() => toggleRow(item.id)}
                                                className="font-bold text-lg text-slate-400 hover:text-slate-600"
                                            >
                                                {expandedRow === item.id ? '-' : '+'}
                                            </button>
                                        </td>
                                        <td className="p-3 font-medium border-r border-slate-200">{item.sku}</td>
                                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200">{item.name}</td>
                                        <td className="p-3 border-r border-slate-200">{item.category}</td>
                                        <td className="p-3 text-center font-bold border-r border-slate-200">{item.totalStock}</td>
                                        <td className="p-3 text-center border-r border-slate-200">{item.soonestExpiry || '-'}</td>
                                        <td className="p-3 text-center border-r border-slate-200">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                item.status === 'LOW STOCK' ? 'text-amber-600' : 'text-emerald-600'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1">
                                                <button className="bg-[#3D52A0] text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-[#2E4696]">
                                                    MANAGE BATCHES
                                                </button>
                                                <button 
                                                    onClick={() => handleEditClick(item)}
                                                    className="bg-[#E6AA68] text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-[#d18e3a]">
                                                    EDIT
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded hover:bg-red-600"
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    {/* Nested Batch Rows */}
                                    {expandedRow === item.id && (
                                        <tr className="bg-slate-50">
                                            <td colSpan="8" className="p-0">
                                                <div className="overflow-hidden transition-all duration-300">
                                                    <table className="w-full bg-white border-l-8 border-[#2E4696]">
                                                        <thead className="bg-slate-100 text-[11px] font-bold uppercase text-slate-500">
                                                            <tr>
                                                                <th className="p-2 border border-slate-200">Batch ID</th>
                                                                <th className="p-2 border border-slate-200">Date Received</th>
                                                                <th className="p-2 border border-slate-200">Expiry Date</th>
                                                                <th className="p-2 border border-slate-200">Batch Stock</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {item.batches.map((batch, idx) => (
                                                                <tr key={idx} className="text-xs text-slate-600">
                                                                    <td className="p-2 border border-slate-100">{batch.id}</td>
                                                                    <td className="p-2 border border-slate-100">{batch.received}</td>
                                                                    <td className="p-2 border border-slate-100 font-bold">{batch.expiry}</td>
                                                                    <td className="p-2 border border-slate-100 font-bold">{batch.stock}</td>
                                                                </tr>
                                                            ))}
                                                            {item.batches.length === 0 && (
                                                                <tr>
                                                                    <td colSpan="4" className="p-4 text-center text-slate-400 italic">No batches found for this medicine.</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            {/* Show message if inventory is empty */}
                            {inventory.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        No medicines found in database. Please run the seeder or add an item.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    /* --- STOCK LEDGER TABLE (Using temporary mockLedger) --- */
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                            <tr>
                                <th className="p-3 border-r border-slate-200">Date and Time</th>
                                <th className="p-3 border-r border-slate-200">ID</th>
                                <th className="p-3 border-r border-slate-200">Action</th>
                                <th className="p-3 border-r border-slate-200 text-center">Amount</th>
                                <th className="p-3 border-r border-slate-200 text-center">New Quantity</th>
                                <th className="p-3 border-r border-slate-200">Reason</th>
                                <th className="p-3">Admin User</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600">
                            {mockLedger.map((log, idx) => (
                                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-bold border-r border-slate-200">{log.dateTime}</td>
                                    <td className="p-3 border-r border-slate-200">{log.id}</td>
                                    <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{log.action}</td>
                                    <td className={`p-3 border-r border-slate-200 text-center font-bold ${log.amount.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {log.amount}
                                    </td>
                                    <td className="p-3 border-r border-slate-200 text-center font-bold">{log.newQty}</td>
                                    <td className="p-3 border-r border-slate-200">{log.reason}</td>
                                    <td className="p-3 font-bold text-slate-800">{log.admin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 4. Pagination */}
            <div className="mt-6 flex justify-end items-center gap-4 text-sm font-medium text-slate-500">
                <button className="flex items-center gap-1 hover:text-[#2E4696] transition-colors">
                    ← Previous
                </button>
                <div className="flex gap-2">
                    <button className="w-8 h-8 rounded bg-[#2E4696] text-white">1</button>
                </div>
                <button className="flex items-center gap-1 hover:text-[#2E4696] transition-colors">
                    Next →
                </button>
            </div>
            <AddMedicineModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />
            <EditMedicineModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedMedicine(null);
                }}
                medicine={selectedMedicine}
            />
            <DeleteMedicineModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                medicineName={medicineToDelete?.name} // Uses the name from the selected item
            />
        </AuthenticatedLayout>
    );
}