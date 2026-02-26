// resources/js/Pages/Admin/Partials/StaffManagementTable.jsx

import React, { useMemo, useState } from 'react';
import Button from '@/Components/Button';
import { router } from '@inertiajs/react';
import EditStaffModal from '../Pages/Admin/Partials/EditStaffModal';
import DeactivateStaffModal from '../Pages/Admin/Partials/DeactivateStaffModal';
import ResetStaffPasswordModal from '../Pages/Admin/Partials/ResetStaffPasswordModal';
import ActivateStaffModal from '../Pages/Admin/Partials/ActivateStaffModal';

export default function StaffManagementTable({ staff = [], activeTab, searchQuery, sortConfig, onSort }) {
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [isResetPassOpen, setIsResetPassOpen] = useState(false);
    const [isActivateOpen, setIsActivateOpen] = useState(false);
    const [selectedForActivate, setSelectedForActivate] = useState(null);

    // --- SORT ICON HELPER ---
    const SortIcon = ({ column }) => {
        if (sortConfig?.key !== column) return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 font-bold">↑</span> 
            : <span className="ml-1 text-blue-600 font-bold">↓</span>;
    };

    // --- THE FILTERING PIPELINE ---
    const processedStaff = useMemo(() => {
        let result = [...staff];

        // 1. Role Filtering (Tabs)
        if (activeTab !== 'all') {
            const targetRole = activeTab.endsWith('s') ? activeTab.slice(0, -1) : activeTab;
            result = result.filter(s => s.role.toLowerCase() === targetRole.toLowerCase());
        }

        // 2. Search Query Filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.staff_id?.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query)
            );
        }

        // 3. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                let valA = a[sortConfig.key] || '';
                let valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [staff, activeTab, searchQuery, sortConfig]);

    const triggerStatusToggle = (member) => {
        if (member.status === 'INACTIVE') {
            setSelectedForActivate(member);
            setIsActivateOpen(true);
        } else {
            setSelectedMember(member); 
            setIsDeactivateOpen(true);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 text-slate-700 font-black uppercase text-[10px] tracking-widest border-b">
                        <tr>
                            <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('staff_id')}>
                                Staff ID <SortIcon column="staff_id" />
                            </th>
                            <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('name')}>
                                Full Name <SortIcon column="name" />
                            </th>
                            {activeTab === 'all' && (
                                <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('role')}>
                                    Role <SortIcon column="role" />
                                </th>
                            )}
                            <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('email')}>
                                Email Address <SortIcon column="email" />
                            </th>

                            <th className="p-4 border-r w-[150px]">Phone</th>
                            {activeTab === 'all' && (
                                <th className="p-4 border-r text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => onSort('status')}>
                                    Status <SortIcon column="status" />
                                </th>
                            )}
                            
                            <th className="p-4 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-20 w-[160px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600 divide-y divide-slate-100">
                        {processedStaff.length > 0 ? (
                            processedStaff.map((member) => {
                                const isDeactivated = member.status === 'INACTIVE';
                                const isDefaultAdmin = member.email === 'admin@rbtc.com';

                                return (
                                    <tr key={member.id} className={`transition-colors group ${isDeactivated ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50/50'}`}>
                                        <td className="p-4 border-r font-mono font-bold text-slate-500">{member.staff_id}</td>
                                        <td className="p-4 border-r font-black text-slate-800 uppercase tracking-tight">{member.name}</td>
                                        {activeTab === 'all' && <td className="p-4 border-r font-bold text-slate-500">{member.role}</td>}
                                        <td className="p-4 border-r italic text-blue-600 truncate">{member.email}</td>
                                        <td className="p-4 border-r font-medium">{member.phone}</td>
                                        {activeTab === 'all' && (
                                            <td className="p-4 border-r text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                    isDeactivated ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                        )}

                                        {/* Sticky Actions */}
                                        <td className={`p-3 sticky right-0 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors ${
                                            isDeactivated ? 'bg-[#fff5f5] group-hover:bg-[#fff0f0]' : 'bg-white group-hover:bg-[#f8fafc]'
                                        }`}>
                                            <div className="flex flex-col gap-1.5 items-center">
                                                <Button 
                                                    variant="warning" 
                                                    onClick={() => { setSelectedMember(member); setIsEditOpen(true); }}
                                                    className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm"
                                                >
                                                    EDIT PROFILE
                                                </Button>

                                                {!isDefaultAdmin && (
                                                    <Button 
                                                        variant={isDeactivated ? "success" : "danger"} 
                                                        onClick={() => triggerStatusToggle(member)}
                                                        className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm"
                                                    >
                                                        {isDeactivated ? 'ACTIVATE' : 'DEACTIVATE'}
                                                    </Button>
                                                )}
                                                
                                                {member.reset_requested && !isDeactivated && (
                                                    <Button 
                                                        variant="danger"
                                                        onClick={() => { setSelectedMember(member); setIsResetPassOpen(true); }}
                                                        className="text-[9px] py-1.5 w-28 bg-red-600 animate-pulse border-2 border-red-200 font-black"
                                                    >
                                                        RESET REQ!
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={activeTab === 'all' ? 7 : 5} className="p-20 text-center text-slate-400 italic font-medium">
                                    No personnel match your current search or filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <EditStaffModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} member={selectedMember} />
            <DeactivateStaffModal isOpen={isDeactivateOpen} onClose={() => setIsDeactivateOpen(false)} member={selectedMember} />
            <ResetStaffPasswordModal isOpen={isResetPassOpen} onClose={() => setIsResetPassOpen(false)} member={selectedMember} />
            <ActivateStaffModal isOpen={isActivateOpen} onClose={() => setIsActivateOpen(false)} member={selectedForActivate} />
        </div>
    );
}