import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import AddMedicineModal from './Partials/AddMedicineModal';
import EditMedicineModal from './Partials/EditMedicineModal';
import DeleteMedicineModal from './Partials/DeleteMedicineModal';

export default function MedicineInventory({ auth, inventory = [] }) {
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'ledger'
    
    // --- SEARCH STATE ---
    const [searchQuery, setSearchQuery] = useState('');

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // --- MODAL & ROW STATE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);

    // TEMPORARY: Placeholder for the Ledger tab
    const mockLedger = [
        { dateTime: '2023-10-25 09:30', id: 'BATCH-001', action: 'STOCK IN', amount: '+50', newQty: 150, reason: 'New Shipment', admin: 'Nurse Joy' },
        { dateTime: '2023-10-24 14:15', id: 'BATCH-002', action: 'DISPENSE', amount: '-2', newQty: 98, reason: 'Patient: John Doe', admin: 'Dr. House' },
        { dateTime: '2023-10-23 10:00', id: 'BATCH-003', action: 'STOCK IN', amount: '+100', newQty: 200, reason: 'New Shipment', admin: 'Dr. Strange' },
    ];

    // --- FILTERING LOGIC (Updated to include all columns) ---
    const getFilteredData = () => {
        const query = searchQuery.toLowerCase();

        if (activeTab === 'manage') {
            return inventory.filter(item => 
                // String fields
                item.name.toLowerCase().includes(query) || 
                item.sku.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query) ||
                
                // Number fields (convert to string first)
                item.totalStock.toString().includes(query) ||

                // Nullable fields (check if exists first)
                (item.soonestExpiry && item.soonestExpiry.toLowerCase().includes(query))
            );
        } else {
            return mockLedger.filter(log => 
                log.id.toLowerCase().includes(query) || 
                log.admin.toLowerCase().includes(query) ||
                log.action.toLowerCase().includes(query) ||
                log.reason.toLowerCase().includes(query)
            );
        }
    };

    const filteredData = getFilteredData();

    // --- PAGINATION LOGIC (Applied TO Filtered Data) ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // --- HANDLERS ---
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to page 1 when searching
        setExpandedRow(null); // Collapse rows
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
        setExpandedRow(null);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setExpandedRow(null);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setExpandedRow(null);
        }
    };

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
                        onClick={() => { setActiveTab('manage'); setSearchQuery(''); setCurrentPage(1); }}
                        className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider ${activeTab === 'manage' ? 'bg-slate-400/50 text-slate-100 hover:bg-slate-400' : 'bg-[#2E4696] text-white hover:bg-[#243776]'}`}
                    >
                        MANAGE STOCK
                    </button>
                    <button 
                        onClick={() => { setActiveTab('ledger'); setSearchQuery(''); setCurrentPage(1); }}
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
                    { label: 'Expiring Soon', value: '0' },
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
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={activeTab === 'manage' ? "Search all fields..." : "Search Logs..."}
                        className="w-full pl-5 pr-4 py-2 border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                </div>
                {activeTab === 'manage' && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#5A9167] hover:bg-[#4a7a55] text-white px-6 py-2 rounded font-bold text-sm shadow-sm transition-colors">
                        + ADD NEW MEDICINE
                    </button>
                )}
            </div>

            {/* 3. Table Container */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white min-h-[400px]">
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
                            {currentItems.map((item) => (
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
                                                                    <td colSpan="4" className="p-4 text-center text-slate-400 italic">No batches found.</td>
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
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-500">
                                        No medicines found matching "{searchQuery}".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    /* --- STOCK LEDGER TABLE --- */
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
                            {currentItems.map((log, idx) => (
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
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-500">
                                        No logs found matching "{searchQuery}".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 4. Pagination Controls */}
            {filteredData.length > 0 && (
                <div className="mt-6 flex justify-end items-center gap-4 text-sm font-medium text-slate-500">
                    <span className="text-xs text-slate-400 mr-2">
                        Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length}
                    </span>
                    
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1 transition-colors ${
                            currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:text-[#2E4696]'
                        }`}
                    >
                        ← Previous
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button
                                key={number}
                                onClick={() => goToPage(number)}
                                className={`w-8 h-8 rounded transition-colors ${
                                    currentPage === number 
                                        ? 'bg-[#2E4696] text-white' 
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                {number}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1 transition-colors ${
                            currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'hover:text-[#2E4696]'
                        }`}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Modals */}
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
                medicineName={medicineToDelete?.name}
            />
        </AuthenticatedLayout>
    );
}