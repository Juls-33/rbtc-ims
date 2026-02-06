// resources/js/Pages/Admin/Partials/StaffManagementTable.jsx

import React, { useMemo, useState } from 'react';
import Button from '@/Components/Button';
import { router } from '@inertiajs/react';
import EditStaffModal from '../Pages/Admin/Partials/EditStaffModal';
import DeactivateStaffModal from '../Pages/Admin/Partials/DeactivateStaffModal';
import ResetStaffPasswordModal from '../Pages/Admin/Partials/ResetStaffPasswordModal';
import ActivateStaffModal from '../Pages/Admin/Partials/ActivateStaffModal';

export default function StaffManagementTable({ staff = [], activeTab }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [isResetPassOpen, setIsResetPassOpen] = useState(false);
    const [isActivateOpen, setIsActivateOpen] = useState(false);
    const [selectedForActivate, setSelectedForActivate] = useState(null);
    const itemsPerPage = 10;

    const filteredStaff = useMemo(() => {
        if (activeTab === 'all') return staff;
        const targetRole = activeTab.endsWith('s') ? activeTab.slice(0, -1) : activeTab;
        return staff.filter(s => s.role.toLowerCase() === targetRole.toLowerCase());
    }, [activeTab, staff]);

    const triggerStatusToggle = (member) => {
        if (member.status === 'INACTIVE') {
            setSelectedForActivate(member);
            setIsActivateOpen(true);
        } else {
            setSelectedMember(member); 
            setIsDeactivateOpen(true);
        }
    };

    const currentItems = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto relative">
                {/* table-fixed or min-w is used to ensure horizontal scroll exists */}
                <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase">
                        <tr>
                            <th className="p-3 border-r w-[120px]">Staff ID</th>
                            <th className="p-3 border-r min-w-[200px]">Full Name</th>
                            {activeTab === 'all' && <th className="p-3 border-r w-[100px]">Role</th>}
                            <th className="p-3 border-r min-w-[200px]">Email</th>
                            <th className="p-3 border-r w-[150px]">Phone Number</th>
                            {activeTab === 'all' && <th className="p-3 border-r w-[100px]">Status</th>}
                            
                            {/* --- FIXED ACTIONS HEADER --- */}
                            <th className="p-3 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] z-20 w-[150px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-600">
                        {currentItems.length > 0 ? (
                            currentItems.map((member) => {
                                const isDeactivated = member.status === 'INACTIVE';
                                const isDefaultAdmin = member.email === 'admin@rbtc.com';

                                return (
                                    <tr 
                                        key={member.id} 
                                        className={`border-b transition-colors group ${
                                            isDeactivated ? 'bg-rose-50 hover:bg-rose-100' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <td className="p-3 border-r font-bold">{member.staff_id}</td>
                                        <td className="p-3 border-r font-bold text-slate-800">{member.name}</td>
                                        {activeTab === 'all' && <td className="p-3 border-r">{member.role}</td>}
                                        <td className="p-3 border-r italic text-blue-600 underline">{member.email}</td>
                                        <td className="p-3 border-r">{member.phone}</td>
                                        {activeTab === 'all' && (
                                            <td className="p-3 border-r text-center">
                                                <span className={`font-bold text-[10px] ${isDeactivated ? 'text-rose-600' : 'text-slate-800'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                        )}

                                        {/* --- FIXED ACTIONS CELL --- */}
                                        <td className={`p-3 sticky right-0 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors ${
                                            isDeactivated ? 'bg-rose-50 group-hover:bg-rose-100' : 'bg-white group-hover:bg-slate-50'
                                        }`}>
                                            <div className="flex flex-col gap-1 items-center">
                                                <Button 
                                                    variant="success" 
                                                    onClick={() => { setSelectedMember(member); setIsEditOpen(true); }}
                                                    className="text-[8px] py-1 px-4 w-24"
                                                >
                                                    EDIT
                                                </Button>

                                                {!isDefaultAdmin && (
                                                    <Button 
                                                        variant={isDeactivated ? "success" : "danger"} 
                                                        onClick={() => triggerStatusToggle(member)}
                                                        className="text-[8px] py-1 px-4 w-24"
                                                    >
                                                        {isDeactivated ? 'ACTIVATE' : 'DEACTIVATE'}
                                                    </Button>
                                                )}
                                                
                                                {member.reset_requested && !isDeactivated && (
                                                    <Button 
                                                        variant="danger"
                                                        onClick={() => { setSelectedMember(member); setIsResetPassOpen(true); }}
                                                        className="text-[8px] py-1 px-4 w-24 bg-red-600 animate-pulse border-2 border-red-200"
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
                                <td colSpan={activeTab === 'all' ? 7 : 5} className="p-12 text-center text-slate-400 italic">
                                    No records found for {activeTab}.
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