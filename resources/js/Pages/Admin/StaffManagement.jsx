import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import StaffTable from '@/Components/StaffTable';
import AddStaffModal from './Partials/AddStaffModal'; 

export default function StaffManagement({ auth }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'doctors', 'nurses', 'admins'
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const itemsPerPage = 10;

    // Mock data (Eventually this will come from props.staff)
    const mockStaff = [
        { id: 'D-001', name: 'Dr. Quack Reyes', role: 'Doctor', email: 'e.reyes@doctor.com', phone: '0917-123-4567', status: 'ACTIVE' },
        { id: 'N-001', name: 'Mark Zuckerberg', role: 'Nurse', email: 'm.tan@nurse.com', phone: '0920-123-4567', status: 'ACTIVE' },
        { id: 'A-001', name: 'Coco Martin', role: 'Admin', email: 'coco.martin@gmail.com', phone: '0913-123-4567', status: 'ACTIVE' },
        { id: 'A-002', name: 'Cardo Dalisay', role: 'Admin', email: 'cardo.d@gmail.com', phone: '0913-123-4568', status: 'ACTIVE' },
    ];

    // --- LOGIC: FILTERING & SEARCHING ---
    const filteredStaff = useMemo(() => {
        let data = mockStaff;

        // 1. Role Filter
        if (activeTab !== 'all') {
            const roleKey = activeTab.replace(/s$/, '').toLowerCase();
            data = data.filter(s => s.role.toLowerCase() === roleKey);
        }

        // 2. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.id.toLowerCase().includes(query)
            );
        }

        return data;
    }, [activeTab, searchQuery]);

    // --- LOGIC: PAGINATION ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    return (
        <AuthenticatedLayout 
            header="Admin / Staff Management" 
            sectionTitle={
                <div className="flex w-full">
                    {['all', 'doctors', 'nurses', 'admins'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                            className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider uppercase ${
                                activeTab === tab 
                                ? 'bg-slate-400/50 text-slate-100' : 'bg-[#2E4696] text-white hover:bg-[#243776]'
                            }`}
                        >
                            {tab === 'all' ? 'All Staff' : tab}
                        </button>
                    ))}
                </div>
            }
        >
            <Head title="Staff Management" />

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                <div className="bg-[#3D52A0] text-white p-4 font-bold text-lg uppercase tracking-tight">
                    Personnel Directory
                </div>
                
                <div className="p-8">
                    {/* Action Bar */}
                    <div className="flex justify-between items-center mb-6 gap-4">
                        <div className="flex-1 max-w-md">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Staff ID or Name..." 
                                className="w-full border border-slate-300 rounded p-2 text-sm shadow-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] outline-none"
                            />
                        </div>
                        
                        <Button variant="success" onClick={() => setIsAddModalOpen(true)}>
                            + ADD NEW STAFF
                        </Button>
                    </div>

                    {/* Table Component */}
                    <StaffTable 
                        staff={currentItems} 
                        activeTab={activeTab}
                        onEdit={(member) => console.log('Edit', member)}
                        onDeactivate={(member) => console.log('Deactivate', member)}
                        onResetPass={(member) => console.log('Reset', member)}
                    />

                    {/* Standardized Pagination */}
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        filteredLength={filteredStaff.length}
                        indexOfFirstItem={indexOfFirstItem}
                        indexOfLastItem={indexOfLastItem}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            {/* Render the Modal */}
            <AddStaffModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                initialRole={activeTab} // Passes the tab name for auto-selection
            />
        </AuthenticatedLayout>
    );
}