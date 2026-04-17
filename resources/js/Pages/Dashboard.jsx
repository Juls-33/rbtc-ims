import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; 
import Button from '@/Components/Button'; 
import StatCard from '@/Components/StatCard';
import StaffTable from '@/Components/StaffTable';
import { Head, router } from '@inertiajs/react';

export default function Dashboard({ 
    auth, doctors, nurses, roomStats, patientStats, 
    billingStats, unpaidList, inventoryStats, filters,
    revenueTrends = [], censusTrends = []
}) {
    const [search, setSearch] = useState(filters?.search || '');

    const maxRevenue = Math.max(...revenueTrends.map(d => d.total), 100); 
    const maxCensus = Math.max(...censusTrends.map(d => d.admissions + d.outpatient), 10);

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
                
                {/* Changed to grid-cols-5 to accommodate the new metric */}
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Critical Stock</p>
                        <p className="text-xl font-black text-red-600 mt-1">{inventoryStats.critical} Items</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-amber-500 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Expiring Soon</p>
                        <p className="text-xl font-black text-amber-600 mt-1">{inventoryStats.expired + inventoryStats.expiring} Batches</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-rose-400 shadow-sm flex flex-col justify-center relative overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight relative z-10">Unpaid (Admitted)</p>
                        <p className="text-xl font-black text-rose-500 mt-1 relative z-10">{billingStats.unpaidAdmitted} Patients</p>
                    </div>

                    {/* NEW: UNPAID & DISCHARGED CARD (High Priority) */}
                    <div className="bg-white p-4 rounded-lg border-l-4 border-rose-600 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-rose-100 text-rose-600 text-[8px] font-black px-2 py-0.5 rounded-bl-lg">HIGH RISK</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight relative z-10">Unpaid (Discharged)</p>
                        <p className="text-xl font-black text-rose-700 mt-1 relative z-10">{billingStats.unpaidDischarged} Patients</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">Unpaid Outpatient</p>
                        <p className="text-xl font-black text-orange-600 mt-1">{billingStats.unpaidOutpatient} Visits</p>
                    </div>

                </div>
            </div>

            {/* CHART TIER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* REVENUE TREND CHART */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">6-Month Revenue Trend</h3>
                            <p className="text-2xl font-black text-[#2E4696]">₱ {revenueTrends.reduce((sum, item) => sum + item.total, 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                        </div>
                        <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1"></span> Total Collected
                        </div>
                    </div>
                    
                    <div className="flex items-end h-48 gap-3 mt-4">
                        {revenueTrends.map((data, i) => (
                            <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                {/* Tooltip (Shows on hover) */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap transition-opacity z-10">
                                    ₱ {data.total.toLocaleString()}
                                </div>
                                {/* Bar */}
                                <div 
                                    style={{ height: `${Math.max((data.total / maxRevenue) * 100, 2)}%` }} 
                                    className="bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-all duration-300 w-full"
                                ></div>
                                {/* Label */}
                                <div className="text-center text-[10px] mt-3 font-bold text-slate-500 uppercase">{data.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PATIENT CENSUS CHART */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Patient Volume Trend</h3>
                            <p className="text-2xl font-black text-blue-600">{censusTrends.reduce((sum, item) => sum + item.admissions + item.outpatient, 0)} Patients</p>
                        </div>
                        <div className="text-right text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span> Volume
                        </div>
                    </div>
                    
                    <div className="flex items-end h-48 gap-3 mt-4">
                        {censusTrends.map((data, i) => {
                            const totalVol = data.admissions + data.outpatient;
                            return (
                                <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                    {/* Tooltip */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-14 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap transition-opacity z-10 text-center">
                                        {totalVol} Total<br/>
                                        <span className="text-blue-300">{data.admissions} In | {data.outpatient} Out</span>
                                    </div>
                                    {/* Bar */}
                                    <div 
                                        style={{ height: `${Math.max((totalVol / maxCensus) * 100, 2)}%` }} 
                                        className="bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-300 w-full"
                                    ></div>
                                    {/* Label */}
                                    <div className="text-center text-[10px] mt-3 font-bold text-slate-500 uppercase">{data.label}</div>
                                </div>
                            );
                        })}
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