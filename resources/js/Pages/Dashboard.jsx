import React, { useState } from 'react'; // Added { useState }
import Button from '@/Components/Button'; 
import StatCard from '@/Components/StatCard';
import StaffTable from '@/Components/StaffTable';
import { Head, router } from '@inertiajs/react'; // Added router

export default function Dashboard({ 
    auth, 
    doctors, 
    nurses, 
    criticalStock, 
    expiringSoon, 
    admittedCount, 
    billsAlert,
    filters
}) {
    const [search, setSearch] = useState(filters?.search || '');
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);

        router.get('/dashboard', 
            { search: value }, 
            { 
                preserveState: true, 
                replace: true       
            }
        );
    };
    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Head title="RBTC-IMS Dashboard" />

            {/* Sidebar */}
            <aside className="w-64 bg-indigo-900 text-white p-6 shadow-xl shrink-0">
                <div className="mb-8">
                    <h1 className="text-xl font-bold leading-tight">Reality Based Therapeutic Community</h1>
                    <p className="text-xs text-indigo-300 mt-1 uppercase tracking-widest">Inventory & Management</p>
                </div>
                <nav className="space-y-4">
                    <a href="#" className="block py-2 px-4 bg-indigo-700 rounded shadow-inner">Dashboard</a>
                    <a href="#" className="block py-2 px-4 hover:bg-indigo-700 transition">Medicine Inventory</a>
                    <a href="#" className="block py-2 px-4 hover:bg-indigo-700 transition">Patient Management</a>
                    <a href="#" className="block py-2 px-4 hover:bg-indigo-700 transition">Staff Management</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-800">System Overview</h2>
                        <p className="text-gray-500">Welcome back, {auth.user.first_name}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {/* Search Input for Encrypted Data */}
                        <div className="relative w-full md:w-64">
                            <input 
                                type="text"
                                placeholder="Search staff names..."
                                className="w-full pl-4 pr-10 py-2 border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                value={search}
                                onChange={handleSearch}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>

                        <Button variant="success" onClick={() => router.visit('/inventory')}>
                            + Add New Medicine
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Critical Stock" value={criticalStock} color="text-red-600" />
                    <StatCard label="Expiring Soon" value={expiringSoon} color="text-amber-500" />
                    <StatCard label="Admitted Patients" value={admittedCount} color="text-indigo-600" />
                    <StatCard label="Bills Alert" value={billsAlert} color="text-emerald-600" />
                </div>

                {/* Staff Tables Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <StaffTable title="On-Duty Doctors" staff={doctors} />
                    <StaffTable title="On-Duty Nurses" staff={nurses} />
                </div>
            </main>
        </div>
    );
}
