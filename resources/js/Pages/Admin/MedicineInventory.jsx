import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

// Shared Components
import Button from '@/Components/Button';
import InventoryStats from '@/Components/InventoryStats';
import Pagination from '@/Components/Pagination';
import ManageStockTable from '@/Components/ManageStockTable';
import StockLedgerTable from '@/Components/StockLedgerTable';

// Page Partials
import AddMedicineModal from './Partials/AddMedicineModal';
import EditMedicineModal from './Partials/EditMedicineModal';
import DeleteMedicineModal from './Partials/DeleteMedicineModal';
import ManageBatchesModal from './Partials/ManageBatchesModal';

export default function MedicineInventory({ auth, inventory = [], logs = [] }) {
    const [activeTab, setActiveTab] = useState('manage');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedRow, setExpandedRow] = useState(null);
    const itemsPerPage = 5;

    // --- LOGIC: PREPROCESSING ---
    const today = new Date().toISOString().split('T')[0];
    const processedInventory = inventory.map(item => {
        const validBatches = item.batches?.filter(batch => batch.expiry >= today) || [];
        const calculatedTotal = validBatches.reduce((sum, batch) => sum + parseInt(batch.stock || 0), 0);
        const soonest = validBatches.length > 0 
            ? validBatches.reduce((min, b) => (b.expiry < min ? b.expiry : min), validBatches[0].expiry)
            : null;
        return {
            ...item,
            calculatedTotal,
            calculatedSoonest: soonest,
            calculatedStatus: calculatedTotal === 0 ? 'OUT OF STOCK' : (calculatedTotal < 20 ? 'LOW STOCK' : 'IN STOCK')
        };
    });

    // --- MODAL STATE ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchMedicine, setBatchMedicine] = useState(null);

    // --- LOGIC: FILTERING & PAGINATION ---
    const getFilteredData = () => {
        const query = searchQuery.toLowerCase();
        if (activeTab === 'manage') {
            return processedInventory.filter(item => 
                item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) || item.calculatedStatus.toLowerCase().includes(query)
            );
        }
        return logs.filter(log => 
            log.id.toLowerCase().includes(query) || log.medicine_name.toLowerCase().includes(query) ||
            log.admin.toLowerCase().includes(query) || log.action.toLowerCase().includes(query)
        );
    };

    const filteredData = getFilteredData();
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const stats = {
        totalItems: processedInventory.length,
        critical: processedInventory.filter(i => i.calculatedTotal < 20 && i.calculatedTotal > 0).length,
        outOfStock: processedInventory.filter(i => i.calculatedTotal === 0).length,
        expiringSoon: processedInventory.filter(i => {
            if (!i.calculatedSoonest) return false;
            const diff = (new Date(i.calculatedSoonest) - new Date(today)) / (1000 * 60 * 60 * 24);
            return diff <= 30 && diff >= 0;
        }).length
    };

    // --- HANDLERS ---
    const confirmDelete = () => {
        if (medicineToDelete) {
            router.delete(route('inventory.destroy', medicineToDelete.id), {
                onSuccess: () => { setIsDeleteModalOpen(false); setMedicineToDelete(null); }
            });
        }
    };

    const activeMedicine = inventory.find(m => m.id === batchMedicine?.id);

    return (
        <AuthenticatedLayout 
            header="Admin / Medicine Inventory" 
            sectionTitle={
                <div className="flex w-full">
                    <button onClick={() => { setActiveTab('manage'); setSearchQuery(''); setCurrentPage(1); }} className={`flex-1 py-4 text-center font-bold ${activeTab === 'manage' ? 'bg-slate-400/50 text-slate-100' : 'bg-[#2E4696] text-white'}`}> MANAGE STOCK </button>
                    <button onClick={() => { setActiveTab('ledger'); setSearchQuery(''); setCurrentPage(1); }} className={`flex-1 py-4 text-center font-bold ${activeTab === 'ledger' ? 'bg-slate-400/50 text-slate-100' : 'bg-[#2E4696] text-white'}`}> STOCK LEDGER (LOGS) </button>
                </div>
            }
        >
            <Head title="Medicine Inventory" />

            <InventoryStats stats={stats} />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); setExpandedRow(null); }} placeholder="Search..." className="w-full md:w-96 pl-5 pr-4 py-2 border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                {activeTab === 'manage' && (
                    <Button variant="success" onClick={() => setIsAddModalOpen(true)}> + ADD NEW MEDICINE </Button>
                )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white min-h-[400px]">
                {activeTab === 'manage' ? (
                    <ManageStockTable 
                        items={currentItems} 
                        expandedRow={expandedRow} 
                        toggleRow={(id) => setExpandedRow(expandedRow === id ? null : id)} 
                        today={today}
                        onManage={(item) => { setBatchMedicine(item); setIsBatchModalOpen(true); }}
                        onEdit={(item) => { setSelectedMedicine(item); setIsEditModalOpen(true); }}
                        onDelete={(item) => { setMedicineToDelete(item); setIsDeleteModalOpen(true); }}
                    />
                ) : (
                    <StockLedgerTable logs={currentItems} />
                )}
            </div>

            <Pagination 
                currentPage={currentPage} totalPages={totalPages} filteredLength={filteredData.length} 
                indexOfFirstItem={indexOfFirstItem} indexOfLastItem={indexOfLastItem} 
                onPageChange={(p) => { setCurrentPage(p); setExpandedRow(null); }} 
            />

            {/* Modals remain exactly the same */}
            <AddMedicineModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditMedicineModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMedicine(null); }} medicine={selectedMedicine} />
            <DeleteMedicineModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} medicineName={medicineToDelete?.name} />
            <ManageBatchesModal isOpen={isBatchModalOpen} onClose={() => { setIsBatchModalOpen(false); setBatchMedicine(null); }} medicine={activeMedicine} />
        </AuthenticatedLayout>
    );
}