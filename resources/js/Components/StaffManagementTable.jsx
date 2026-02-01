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

    // 1. Client-side Filtering Logic
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
            setSelectedForDeactivate(member); // Your existing deactivation state
            setIsDeactivateOpen(true);
        }
    };

    // 2. Pagination Logic
    const currentItems = filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase">
                        <tr>
                            <th className="p-3 border-r">Staff ID</th>
                            <th className="p-3 border-r">Full Name</th>
                            {activeTab === 'all' && <th className="p-3 border-r">Role</th>}
                            <th className="p-3 border-r">Email</th>
                            <th className="p-3 border-r">Phone Number</th>
                            {activeTab === 'all' && <th className="p-3 border-r">Status</th>}
                            <th className="p-3 text-center">Actions</th>
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
                                        className={`border-b transition-colors ${
                                            isDeactivated 
                                                ? 'bg-rose-50 hover:bg-rose-100' // Red mark on row
                                                : 'hover:bg-slate-50'
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
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1 items-center">
                                                <Button 
                                                    variant="success" 
                                                    onClick={() => { setSelectedMember(member); setIsEditOpen(true); }}
                                                    className="text-[8px] py-1 px-4 w-24"
                                                >
                                                    EDIT
                                                </Button>

                                                {/* Guard: Default admin cannot be deactivated */}
                                                {!isDefaultAdmin && (
                                                    <Button 
                                                        variant={isDeactivated ? "success" : "danger"} 
                                                        onClick={() => triggerStatusToggle(member)}
                                                        className="text-[8px] py-1 px-4 w-24"
                                                    >
                                                        {isDeactivated ? 'ACTIVATE' : 'DEACTIVATE'}
                                                    </Button>
                                                )}
                                                
                                                {/* Guard: No reset pass if inactive or on 'all staff' tab */}
                                                {activeTab !== 'all' && !isDeactivated && (
                                                    <Button 
                                                        variant="blue"
                                                        onClick={() => { setSelectedMember(member); setIsResetPassOpen(true); }}
                                                        className="text-[8px] py-1 px-4 w-24"
                                                    >
                                                        RESET PASS
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

            {/* Modal Components */}
            <EditStaffModal 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                member={selectedMember} 
            />
            <DeactivateStaffModal 
                isOpen={isDeactivateOpen} 
                onClose={() => setIsDeactivateOpen(false)} 
                member={selectedMember} 
            />
            <ResetStaffPasswordModal 
                isOpen={isResetPassOpen} 
                onClose={() => setIsResetPassOpen(false)} 
                member={selectedMember} 
            />
            <ActivateStaffModal 
                isOpen={isActivateOpen} 
                onClose={() => setIsActivateOpen(false)} 
                member={selectedForActivate} 
            />
        </div>
    );
}