// resources/js/Pages/Admin/StaffManagement.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link} from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddStaffModal from './Partials/AddStaffModal'; 
import StaffManagementTable from '@/Components/StaffManagementTable';
import StaffLogs from './Partials/StaffLogs';

export default function StaffManagement({ auth, staff = [], flash }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'doctors', 'nurses', 'admins'
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isStaffLogsOpen, setIsStaffLogsOpen] = useState(false);
    const itemsPerPage = 10;

    // --- LOGIC: FILTERING & SEARCHING ---
    const filteredStaff = useMemo(() => {
        let data = staff;

        // 1. Role Filter Logic: Maps 'doctors' tab to 'Doctor' role in DB
        if (activeTab !== 'all') {
            // Remove 's' from tab name and capitalize first letter (e.g., 'doctors' -> 'Doctor')
            const targetRole = activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1);
            data = data.filter(s => s.role === targetRole);
        }

        // 2. Search Filter: Matches by Staff ID or Full Name
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.staff_id?.toLowerCase().includes(query)
            );
        }

        return data;
    }, [activeTab, searchQuery, staff]);

    // --- LOGIC: PAGINATION ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    const handleResetPassword = (id) => {
        if (confirm('Are you sure you want to reset this staff member\'s password to the default?')) {
            router.put(route('admin.staff.reset-password', id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // You could trigger a toast here if you have one
                }
            });
        }
    };

    return (
        <AuthenticatedLayout 
            header="Admin / Staff Management" 
            sectionTitle={
                <div className="flex w-full">
                    {['all', 'doctors', 'nurses', 'admins'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => { 
                                setActiveTab(tab); 
                                setCurrentPage(1); 
                                setSearchQuery(''); // Clear search on tab switch for seamless feel
                            }}
                            className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider uppercase border-b-2 ${
                                activeTab === tab 
                                    ? 'bg-slate-400/50 text-white border-white' 
                                    : 'bg-[#2E4696] text-white hover:bg-[#243776] border-transparent'
                            }`}
                        >
                            {tab === 'all' ? 'All Staff' : tab}
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
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                <div className="bg-[#3D52A0] text-white p-4 font-bold text-lg uppercase tracking-tight">
                    Personnel Directory
                </div>
                
                <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex-1 max-w-md">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search by Staff ID or Name..." 
                                className="w-full border border-slate-300 rounded p-2 text-sm shadow-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] outline-none"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            {/* NEW HISTORY BUTTON */}
                            <Link 
                                href={route('admin.staff.logs')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded font-bold text-[11px] uppercase tracking-widest flex items-center border border-slate-300 transition-all"
                            >
                                🕒 System Logs
                            </Link>

                            <Button variant="success" className="px-6" onClick={() => setIsAddModalOpen(true)}>
                                + ADD NEW STAFF
                            </Button>
                        </div>
                    </div>

                    {/* Integrated Table Component */}
                    <StaffManagementTable 
                        staff={currentItems} 
                        activeTab={activeTab}
                    />

                    {/* Standardized Dynamic Pagination */}
                    <div className="mt-6">
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

            {/* Modal for adding new personnel */}
            <AddStaffModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                // Auto-select role based on current tab if it's not 'all'
                initialRole={activeTab === 'all' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} 
            />
            {/* <StaffLogs
                isOpen={isStaffLogsOpen} 
                onClose={() => setIsStaffLogsOpen(false)} 
                initialRole={activeTab === 'all' ? '' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} 
            /> */}
        </AuthenticatedLayout>
    );
}