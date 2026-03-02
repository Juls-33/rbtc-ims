import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import InventoryStats from '@/Components/InventoryStats';
import Pagination from '@/Components/Pagination';
import ManageStockTable from '@/Components/ManageStockTable';
import StockLedgerTable from '@/Components/StockLedgerTable';
import AddMedicineModal from './Partials/AddMedicineModal';
import EditMedicineModal from './Partials/EditMedicineModal';
import DeleteMedicineModal from './Partials/DeleteMedicineModal';
import ManageBatchesModal from './Partials/ManageBatchesModal';

export default function MedicineInventory({ auth, inventory, logs, filters }) {
    const [activeTab, setActiveTab] = useState('manage');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    
    // --- MODAL STATES ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [medicineToDelete, setMedicineToDelete] = useState(null);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchMedicineId, setBatchMedicineId] = useState(null);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('inventory.index'), 
                { search: searchQuery }, 
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

   
    const processedInventory = useMemo(() => {
        return (inventory.data || []).map(item => {
            const calculatedTotal = item.batches?.reduce((sum, b) => sum + parseInt(b.stock || 0), 0) || 0;
            const soonest = item.batches?.length > 0 
                ? item.batches.reduce((min, b) => (b.expiry < min ? b.expiry : min), item.batches[0].expiry)
                : null;
            
            return {
                ...item,
                calculatedTotal,
                calculatedSoonest: soonest,
                calculatedStatus: calculatedTotal === 0 ? 'OUT OF STOCK' : (calculatedTotal < 20 ? 'LOW STOCK' : 'IN STOCK')
            };
        });
    }, [inventory.data]);

    // Statistics logic
    const inventoryStatsData = useMemo(() => [
        { label: 'Total Items', value: inventory.total || 0, color: 'text-slate-800', bg: 'bg-slate-50' },
        { label: 'Critical Stock', value: processedInventory.filter(i => i.calculatedTotal < 20 && i.calculatedTotal > 0).length, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Expiring Soon', value: processedInventory.filter(i => {
            if (!i.calculatedSoonest) return false;
            const diff = (new Date(i.calculatedSoonest) - new Date(today)) / (1000 * 60 * 60 * 24);
            return diff <= 30 && diff >= 0;
        }).length, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Out of Stock', value: processedInventory.filter(i => i.calculatedTotal === 0).length, color: 'text-rose-600', bg: 'bg-rose-50' },
    ], [inventory.total, processedInventory, today]);

    const handleSort = (key) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    return (
        <AuthenticatedLayout 
            header="Admin / Medicine Inventory" 
            sectionTitle={
                <div className="grid grid-cols-2 md:flex w-full shadow-lg border-b border-[#243776]">
                    <button 
                        onClick={() => setActiveTab('manage')} 
                        className={`py-5 text-center transition-all font-black tracking-widest uppercase text-[10px] md:text-xs border-r border-white/10 flex-1 ${activeTab === 'manage' ? 'bg-slate-500/40 text-white shadow-inner' : 'bg-[#2E4696] text-white hover:bg-[#3D52A0]'}`}
                    > MANAGE STOCK </button>
                    <button 
                        onClick={() => setActiveTab('ledger')} 
                        className={`py-5 text-center transition-all font-black tracking-widest uppercase text-[10px] md:text-xs border-white/10 flex-1 ${activeTab === 'ledger' ? 'bg-slate-500/40 text-white shadow-inner' : 'bg-[#2E4696] text-white hover:bg-[#3D52A0]'}`}
                    > STOCK LEDGER (LOGS) </button>
                </div>
            }
        >
            <Head title="Medicine Inventory" />

            <InventoryStats stats={inventoryStatsData} />

            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search medicines, categories, or SKUs..." 
                    className="w-full md:w-96 pl-5 pr-4 py-2 border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 outline-none text-sm" 
                />
                {activeTab === 'manage' && (
                    <Button 
                        variant="success" 
                        className="px-8 py-2.5 rounded-md font-black text-[10px] uppercase tracking-widest shadow-md"
                        onClick={() => setIsAddModalOpen(true)}
                    > + ADD NEW MEDICINE </Button>
                )}
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white min-h-[400px]">
                {activeTab === 'manage' ? (
                    <ManageStockTable 
                        items={processedInventory} 
                        expandedRow={expandedRow} 
                        toggleRow={(id) => setExpandedRow(expandedRow === id ? null : id)} 
                        today={today}
                        onManage={(item) => { setBatchMedicineId(item.id); setIsBatchModalOpen(true); }}
                        onEdit={(item) => { setSelectedMedicine(item); setIsEditModalOpen(true); }}
                        onDelete={(item) => { setMedicineToDelete(item); setIsDeleteModalOpen(true); }}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                ) : (
                    <StockLedgerTable logs={logs.data} />
                )}
            </div>

            <div className="p-6 border-t bg-slate-50/30">
                <Pagination data={activeTab === 'manage' ? inventory : logs} />
            </div>

            {/* Modals */}
            <AddMedicineModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditMedicineModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMedicine(null); }} medicine={selectedMedicine} />
            <DeleteMedicineModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={() => router.delete(route('inventory.destroy', medicineToDelete.id), { onSuccess: () => setIsDeleteModalOpen(false) })} 
                medicineName={medicineToDelete?.name} 
            />
            <ManageBatchesModal 
                isOpen={isBatchModalOpen} 
                onClose={() => { setIsBatchModalOpen(false); setBatchMedicineId(null); }} 
                medicine={processedInventory.find(m => m.id === batchMedicineId)} 
            />
        </AuthenticatedLayout>
    );
}