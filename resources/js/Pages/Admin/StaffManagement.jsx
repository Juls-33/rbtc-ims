import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddStaffModal from './Partials/AddStaffModal'; 
import StaffManagementTable from '@/Components/StaffManagementTable';

export default function StaffManagement({ auth, staff, filters }) {
    const [activeTab, setActiveTab] = useState(filters.tab || 'all'); 
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.staff'), 
                { search: searchQuery, tab: activeTab }, 
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeTab]);

    const currentStaff = useMemo(() => {
        const items = [...(staff.data || [])];
        // Optional: Local sorting of just the 10 items
        items.sort((a, b) => {
            const valA = a[sortConfig.key] || '';
            const valB = b[sortConfig.key] || '';
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return items;
    }, [staff.data, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    return (
        <AuthenticatedLayout 
            header="Admin / Staff Management" 
            sectionTitle={
                <div className="grid grid-cols-2 md:flex w-full shadow-lg border-b border-[#243776]">
                    {['all', 'doctors', 'nurses', 'admins'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 text-center transition-all font-black text-[10px] md:text-xs uppercase tracking-widest border-r border-white/10 last:border-0 flex-1 ${
                                activeTab === tab 
                                    ? 'bg-slate-500/40 text-white shadow-inner' 
                                    : 'bg-[#2E4696] text-white hover:bg-[#3D52A0]'
                            }`}
                        >
                            {tab === 'all' ? 'All Personnel' : tab}
                        </button>
                    ))}
                </div>
            }
        >
            <Head title="Staff Management" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="font-black text-sm md:text-lg uppercase tracking-tight">Personnel Directory</h2>
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">
                        Total Records: {staff.total}
                    </span>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Staff ID or Name..." 
                                className="w-full border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm shadow-sm focus:ring-[#3D52A0] outline-none"
                            />
                        </div>
                        
                        <div className="flex flex-row gap-2">
                            <Link 
                                href={route('admin.staff.logs')}
                                className="flex-1 lg:flex-none justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center border border-slate-300 transition-all"
                            >
                                System Logs
                            </Link>
                            <Button 
                                variant="success" 
                                className="flex-1 lg:flex-none justify-center px-8 py-2.5 rounded-md font-black text-[10px] uppercase tracking-widest shadow-md" 
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                + ADD STAFF
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                        <StaffManagementTable 
                            staff={currentStaff} 
                            activeTab={activeTab}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                        />
                        
                        {currentStaff.length === 0 && (
                            <div className="p-20 text-center text-slate-400 italic font-medium">No results found for your filters.</div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <Pagination data={staff} />
                    </div>
                </div>
            </div>

            <AddStaffModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                initialRole={activeTab === 'all' ? '' : activeTab.slice(0, -1)} 
            />
        </AuthenticatedLayout>
    );
}