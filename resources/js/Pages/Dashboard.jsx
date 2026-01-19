import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Import your new Layout
import Button from '@/Components/Button'; 
import StatCard from '@/Components/StatCard';
import StaffTable from '@/Components/StaffTable';
import { Head, router } from '@inertiajs/react';

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

        // This keeps the search logic working within the new layout
        router.get(route('dashboard'), 
            { search: value }, 
            { 
                preserveState: true, 
                replace: true       
            }
        );
    };

    return (
        <AuthenticatedLayout 
            header="Admin / Dashboard" 
            sectionTitle="Patient List"
            // The Layout now handles the Sidebar and User Profile automatically
        >
            <Head title="RBTC-IMS Dashboard" />

            {/* Header & Search - Refined to match the new layout */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome back, {auth.user.first_name}</h2>
                    <p className="text-gray-500 text-sm">Here is what's happening in the community today.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text"
                            placeholder="Search staff names..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            value={search}
                            onChange={handleSearch}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <Button variant="success" onClick={() => router.visit(route('admin.inventory'))}>
                        + Add New Medicine
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Critical Stock" value={criticalStock} color="text-red-600" />
                <StatCard label="Expiring Soon" value={expiringSoon} color="text-amber-500" />
                <StatCard label="Admitted Patients" value={admittedCount} color="text-blue-600" />
                <StatCard label="Bills Alert" value={billsAlert} color="text-emerald-600" />
            </div>

            {/* Staff Tables Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <StaffTable title="On-Duty Doctors" staff={doctors} />
                <StaffTable title="On-Duty Nurses" staff={nurses} />
            </div>
        </AuthenticatedLayout>
    );
}