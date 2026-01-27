import React, { useState, useMemo, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';

export default function PatientManagement({ auth, patients, filters }) {
    // 1. Initialize state from server-side filters
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    
    // Extract variables from the Pagination Object sent by the controller
    const currentItems = patients.data || [];
    const activeTab = filters.tab || 'all';
    const itemsPerPage = 10;

    // 2. SERVER-SIDE SEARCH: Debounced function to update the URL
    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get(route('admin.patients.index'), 
                { ...filters, search: value, page: 1 }, 
                { preserveState: true, replace: true }
            );
        }, 300),
        [filters]
    );

    const onSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // 3. SERVER-SIDE TABBING: Update the URL when tabs change
    const handleTabChange = (tab) => {
        router.get(route('admin.patients.index'), 
            { ...filters, tab: tab, page: 1 }, 
            { preserveState: true }
        );
    };

    const renderActionButton = () => {
        const btnProps = { variant: "success", className: "px-6 py-2" };
        switch (activeTab) {
            case 'inpatient': return <Button {...btnProps}>ADMIT PATIENT</Button>;
            case 'outpatient': return <Button {...btnProps}>ADD PATIENT VISIT</Button>;
            default: return <Button {...btnProps}>+ ADD NEW PATIENT</Button>;
        }
    };

    return (
        <AuthenticatedLayout 
            header="Admin / Patient Management" 
            sectionTitle={
                <div className="flex w-full">
                    {['all', 'inpatient', 'outpatient'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider uppercase ${
                                activeTab === tab ? 'bg-slate-400/50 text-slate-100' : 'bg-[#2E4696] text-white hover:bg-[#243776]'
                            }`}
                        >
                            {tab === 'all' ? 'All Patients' : tab}
                        </button>
                    ))}
                </div>
            }
        >
            <Head title="Patient Management" />

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                <div className="bg-[#3D52A0] text-white p-3 font-bold text-lg">Patient List</div>

                <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={onSearchChange}
                            placeholder="Search by ID, Name, or Bill Status..."
                            className="w-full md:w-96 pl-5 pr-4 py-2 border border-slate-300 rounded shadow-sm focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                        />
                        {renderActionButton()}
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                                <tr>
                                    <th className="p-3 border-r">Patient ID</th>
                                    <th className="p-3 border-r">Full Name</th>
                                    <th className="p-3 border-r">Date of Birth</th>
                                    <th className="p-3 border-r">Contact Number</th>
                                    <th className="p-3 border-r">Status</th>
                                    <th className="p-3 border-r">Bill Status</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {currentItems.map((patient) => (
                                    <tr key={patient.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-3 font-bold border-r">{patient.patient_id}</td>
                                        <td className="p-3 font-bold text-slate-800 border-r">{patient.name}</td>
                                        <td className="p-3 border-r">{patient.dob}</td>
                                        <td className="p-3 border-r">{patient.contact}</td>
                                        <td className="p-3 border-r font-bold text-xs">{patient.status}</td>
                                        <td className={`p-3 border-r font-bold ${patient.bill_status === 'PAID' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {patient.bill_status}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button variant="success" className="text-[9px] px-2 py-1">VIEW PROFILE</Button>
                                        </td>
                                    </tr>
                                ))}
                                {/* Empty Row Fillers */}
                                {currentItems.length < itemsPerPage && [...Array(itemsPerPage - currentItems.length)].map((_, i) => (
                                    <tr key={`empty-${i}`} className="border-b border-slate-100 h-[52px]">
                                        {[...Array(6)].map((_, j) => <td key={j} className="p-4 text-center text-slate-300">—</td>)}
                                        <td className="p-3 text-center"><Button disabled variant="success" className="opacity-30 text-[9px]">VIEW PROFILE</Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Use the Inertia Pagination component with the server-side links */}
                    <Pagination 
                        links={patients.links}
                        meta={patients} // Pass the whole object if your component needs current_page, total, etc.
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}