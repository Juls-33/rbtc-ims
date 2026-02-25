// resources/js/Pages/Admin/StaffManagement.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddStaffModal from './Partials/AddStaffModal'; 
import StaffManagementTable from '@/Components/StaffManagementTable';

export default function StaffManagement({ auth, staff = [], flash }) {
    const [activeTab, setActiveTab] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const itemsPerPage = 10;

    // --- LOGIC: FILTERING & SEARCHING ---
    const filteredStaff = useMemo(() => {
        let data = staff;
        if (activeTab !== 'all') {
            const targetRole = activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1);
            data = data.filter(s => s.role === targetRole);
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.staff_id?.toLowerCase().includes(query)
            );
        }
        return data;
    }, [activeTab, searchQuery, staff]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    return (
        <AuthenticatedLayout 
            header="Admin / Staff Management" 
            sectionTitle={
                <div className="grid grid-cols-1 md:flex w-full shadow-lg border-b border-[#243776]">
                    {['all', 'doctors', 'nurses', 'admins'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => { 
                                setActiveTab(tab); 
                                setCurrentPage(1); 
                                setSearchQuery(''); 
                            }}
                            className={`py-3 md:py-5 text-center transition-all font-black text-[11px] md:text-xs uppercase tracking-widest border-b md:border-b-0 md:border-r border-white/10 last:border-0 flex-1 ${
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

            {flash?.success && (
                <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-bold uppercase tracking-widest shadow-sm animate-in fade-in slide-in-from-top-2">
                    {flash.success}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="font-black text-sm md:text-lg uppercase tracking-tight">Personnel Directory</h2>
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tighter">
                        Total: {filteredStaff.length}
                    </span>
                </div>
                
                <div className="p-4 md:p-8 flex-1 flex flex-col">
                    {/* 🔥 RESPONSIVE ACTION BAR */}
                    <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 gap-4">
                        <div className="relative flex-1 max-w-2xl">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by Staff ID or Name..." 
                                className="w-full border border-slate-300 rounded-lg pl-4 pr-10 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-[#3D52A0]/20 focus:border-[#3D52A0] outline-none transition-all"
                            />
                            <div className="absolute right-3 top-3 text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#4f4f4f"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
                            </div>
                        </div>
                        
                        <div className="flex flex-row gap-2">
                            <Link 
                                href={route('admin.staff.logs')}
                                className="flex-1 lg:flex-none justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 md:px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center border border-slate-300 transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343"><path d="M612-292 440-464v-216h80v184l148 148-56 56Zm-498-25q-13-29-21-60t-11-63h81q3 21 8.5 42t13.5 41l-71 40ZM82-520q3-32 11-63.5t22-60.5l70 40q-8 20-13.5 41t-8.5 43H82Zm165 366q-27-20-50-43.5T154-248l70-40q14 18 29.5 33.5T287-225l-40 71Zm-22-519-71-40q20-27 43-50t50-43l40 71q-17 14-32.5 29.5T225-673ZM440-82q-32-3-63.5-11T316-115l40-70q20 8 41 13.5t43 8.5v81Zm-84-693-40-70q29-14 60.5-22t63.5-11v81q-22 3-43 8.5T356-775ZM520-82v-81q22-3 43-8.5t41-13.5l40 70q-29 14-60.5 22T520-82Zm84-693q-20-8-41-13.5t-43-8.5v-81q32 3 63.5 11t60.5 22l-40 70Zm109 621-40-71q17-14 32.5-29.5T735-287l71 40q-20 27-43 50.5T713-154Zm22-519q-14-17-29.5-32.5T673-735l40-71q27 19 50 42t42 50l-70 41Zm62 153q-3-22-8.5-43T775-604l70-41q13 30 21.5 61.5T878-520h-81Zm48 204-70-40q8-20 13.5-41t8.5-43h81q-3 32-11 63.5T845-316Z"/></svg> 
                                System Logs
                            </Link>

                            <Button 
                                variant="success" 
                                className="flex-1 lg:flex-none justify-center px-4 md:px-8 py-2.5 rounded-md font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95" 
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                + ADD STAFF
                            </Button>
                        </div>
                    </div>

                    {/* Integrated Table Component (Ensure this component handles internal horizontal scroll) */}
                    <div className="flex-1 overflow-hidden">
                        <StaffManagementTable 
                            staff={currentItems} 
                            activeTab={activeTab}
                        />
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            filteredLength={filteredStaff.length}
                            indexOfFirstItem={indexOfFirstItem}
                            indexOfLastItem={Math.min(indexOfLastItem, filteredStaff.length)}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            </div>

            <AddStaffModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                initialRole={activeTab === 'all' ? '' : activeTab} 
            />
        </AuthenticatedLayout>
    );
}