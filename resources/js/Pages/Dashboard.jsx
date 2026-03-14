import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; 
import Button from '@/Components/Button'; 
import StatCard from '@/Components/StatCard';
import StaffTable from '@/Components/StaffTable';
import { Head, router } from '@inertiajs/react';

export default function Dashboard({ 
    auth, doctors, nurses, roomStats, patientStats, 
    billingStats, unpaidList, inventoryStats, filters 
}) {
    const [search, setSearch] = useState(filters?.search || '');

    return (
        <AuthenticatedLayout header="Institutional Command" sectionTitle="Dashboard Overview">
            <Head title="Admin Dashboard" />

            {/* WELCOME SECTION: Restored from previous version */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight uppercase">
                    Welcome back, <span className="text-[#2E4696]">{auth.user.first_name}</span>!
                </h2>
                <p className="text-gray-500 text-sm italic">Here is the current institutional overview for today.</p>
            </div>

            {/* TIER 1: HIGH-LEVEL OUTCOMES (Institutional Blue Header) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    label="Monthly Earnings" 
                    value={`₱${billingStats.monthlyEarnings.toLocaleString()}`} 
                    color="text-emerald-600" 
                    description="From Admission Payments"
                />
                <StatCard 
                    label="Patient Census" 
                    value={patientStats.admitted} 
                    color="text-blue-600" 
                    description={`Of ${patientStats.total} Total Registered`}
                />
                <StatCard 
                    label="Room Occupancy" 
                    value={`${roomStats.occupied}/${roomStats.total}`} 
                    color="text-slate-800" 
                    description={`${roomStats.available} Available Slots`}
                />
                <StatCard 
                    label="Staff On-Duty" 
                    value={doctors.length + nurses.length} 
                    color="text-indigo-600" 
                    description="Active Personnel"
                />
            </div>

            {/* TIER 2: OPERATIONAL ALERTS (Yellow/Red Attention) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">System Alerts & Priorities</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Critical Stock</p>
                        <p className="text-xl font-black text-red-600">{inventoryStats.critical} Items</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-amber-500 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Expired / Expiring</p>
                        <p className="text-xl font-black text-amber-600">{inventoryStats.expired + inventoryStats.expiring} Batches</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-rose-500 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Unpaid Admissions</p>
                        <p className="text-xl font-black text-rose-600">{billingStats.unpaidInpatient} Patients</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Unpaid Outpatient</p>
                        <p className="text-xl font-black text-orange-600">{billingStats.unpaidOutpatient} Visits</p>
                    </div>
                </div>
            </div>

            {/* TIER 3: DETAILS (Staff & Unpaid Patients) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Pending Payments Table */}
                <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#2E4696] p-4 text-white">
                        <h4 className="font-black text-xs uppercase tracking-widest">High Balance Inpatients</h4>
                    </div>
                    <div className="p-4">
                        <table className="w-full text-left">
                            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b">
                                <tr><th className="pb-2">Patient</th><th className="pb-2 text-right">Balance</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {unpaidList.map((item, i) => (
                                    <tr key={i} className="text-sm">
                                        <td className="py-3 font-medium text-slate-700">{item.name}</td>
                                        <td className="py-3 text-right font-black text-rose-600">₱{item.balance.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* REDIRECTION: Link to Patient Management */}
                        <button 
                            onClick={() => router.visit(route('admin.patients'))}
                            className="w-full mt-4 py-2 text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 rounded transition-colors tracking-widest border border-blue-100"
                        >
                            View All Billing Alerts
                        </button>
                    </div>
                </div>

                {/* Staff Tables */}
                <div className="xl:col-span-2 space-y-8">
                    <StaffTable title="On-Duty Doctors" staff={doctors} />
                    <StaffTable title="On-Duty Nurses" staff={nurses} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}