import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function StaffManagement({ auth }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'doctors', 'nurses', 'admins'

    // Mock data based on your images
    const mockStaff = [
        { id: 'D-001', name: 'Dr. Quack Reyes', role: 'Doctor', email: 'e.reyes@doctor.com', phone: '0917-123-4567', status: 'ACTIVE' },
        { id: 'N-001', name: 'Mark Zuckerberg', role: 'Nurse', email: 'm.tan@nurse.com', phone: '0920-123-4567', status: 'ACTIVE' },
        { id: 'A-001', name: 'Coco Martin', role: 'Admin', email: 'coco.martin@gmail.com', phone: '0913-123-4567', status: 'ACTIVE' },
        { id: 'A-002', name: 'Cardo Dalisay', role: 'Admin', email: 'cardo.d@gmail.com', phone: '0913-123-4568', status: 'ACTIVE' },
    ];

    // Filter logic
    const filteredStaff = activeTab === 'all' 
        ? mockStaff 
        : mockStaff.filter(s => s.role.toLowerCase() === activeTab.replace(/s$/, ''));

    return (
        <AuthenticatedLayout 
            header="Admin / Staff Management" 
            sectionTitle={
                <div className="flex w-full">
                    {['all', 'doctors', 'nurses', 'admins'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider uppercase ${
                                activeTab === tab 
                                ? 'bg-slate-400/50 text-slate-100 hover:bg-slate-400' : 'bg-[#2E4696] text-white hover:bg-[#243776]'
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
                <div className="bg-[#3D52A0] text-white p-4 font-bold text-lg">
                    Staff List
                </div>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6 gap-4">
                        <div className="flex-1 max-w-md">
                            <input 
                                type="text" 
                                placeholder="Search by Staff ID or Name" 
                                className="w-full border border-slate-300 rounded p-2 text-sm shadow-sm focus:ring-[#3D52A0] focus:border-[#3D52A0] outline-none"
                            />
                        </div>
                        
                        <button className="bg-[#5A9167] hover:bg-[#4a7a55] text-white px-6 py-2 rounded font-bold text-xs shadow-sm transition-colors uppercase whitespace-nowrap">
                            + ADD NEW STAFF
                        </button>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                                <tr>
                                    <th className="p-3 border-r border-slate-200">Staff ID</th>
                                    <th className="p-3 border-r border-slate-200">Full Name</th>
                                    {activeTab === 'all' && <th className="p-3 border-r border-slate-200">Role</th>}
                                    <th className="p-3 border-r border-slate-200">Email</th>
                                    <th className="p-3 border-r border-slate-200">Phone Number</th>
                                    {activeTab === 'all' && <th className="p-3 border-r border-slate-200">Status</th>}
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {filteredStaff.map((staff, idx) => (
                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                        <td className="p-3 font-bold border-r border-slate-200">{staff.id}</td>
                                        <td className="p-3 font-bold text-slate-800 border-r border-slate-200">{staff.name}</td>
                                        {activeTab === 'all' && <td className="p-3 border-r border-slate-200">{staff.role}</td>}
                                        <td className="p-3 border-r border-slate-200 font-medium">{staff.email}</td>
                                        <td className="p-3 border-r border-slate-200">{staff.phone}</td>
                                        {activeTab === 'all' && <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{staff.status}</td>}
                                        <td className="p-3">
                                            <div className="flex flex-col gap-1 items-center">
                                                <button className="w-20 bg-[#5A9167] text-white text-[9px] font-bold py-1 rounded hover:bg-[#4a7a55] uppercase">
                                                    EDIT
                                                </button>
                                                <button className="w-20 bg-[#CD5C5C] text-white text-[9px] font-bold py-1 rounded hover:bg-[#b04a4a] uppercase">
                                                    DEACTIVATE
                                                </button>
                                                {activeTab !== 'all' && (
                                                    <button className="w-20 bg-[#3D52A0] text-white text-[9px] font-bold py-1 rounded hover:bg-[#2E4696] uppercase">
                                                        RESET PASS
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination (Matching design) */}
                    <div className="mt-8 flex justify-end items-center gap-4 text-sm font-medium text-slate-400">
                        <button className="flex items-center gap-1 hover:text-[#2E4696] transition-colors">← Previous</button>
                        <div className="flex gap-2">
                            <button className="w-8 h-8 rounded bg-[#2E4696] text-white">1</button>
                            <button className="w-8 h-8 rounded hover:bg-slate-100 transition-colors">2</button>
                            <button className="w-8 h-8 rounded hover:bg-slate-100 transition-colors">3</button>
                            <span>...</span>
                            <button className="w-8 h-8 rounded hover:bg-slate-100 transition-colors">67</button>
                            <button className="w-8 h-8 rounded hover:bg-slate-100 transition-colors">68</button>
                        </div>
                        <button className="flex items-center gap-1 hover:text-[#2E4696] transition-colors">Next →</button>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}