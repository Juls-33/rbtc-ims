import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

// Shared Components
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddPatientModal from './Partials/AddPatientModal';
import EditPatientModal from './Partials/EditPatientModal';
import DeletePatientModal from './Partials/DeletePatientModal';

export default function PatientManagement({ auth, patients = [] }) {
    // 1. LOCAL STATE (Medicine-Style)
    // 'patients' is now expected as a simple array for this client-side approach
    const allPatients = Array.isArray(patients) ? patients : (patients.data || []);
    const [activeTab, setActiveTab] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    // NEW: Delete States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const itemsPerPage = 10;

    // --- LOGIC: CLIENT-SIDE FILTERING (Medicine-Style) ---
    const filteredData = useMemo(() => {
        let data = allPatients;

        // 1. Tab Filter
        if (activeTab !== 'all') {
            data = data.filter(p => p.type?.toLowerCase() === activeTab);
        }

        // 2. Search Filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.patient_id.toLowerCase().includes(query) ||
                p.bill_status.toLowerCase().includes(query)
            );
        }

        return data;
    }, [activeTab, searchQuery, allPatients]);

    // --- PAGINATION LOGIC ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const renderActionButton = () => {
        const btnProps = { variant: "success", className: "px-6 py-2" , onClick: () => setIsAddModalOpen(true)};
        switch (activeTab) {
            case 'inpatient': return <Button {...btnProps}>ADMIT PATIENT</Button>;
            case 'outpatient': return <Button {...btnProps}>ADD PATIENT VISIT</Button>;
            default: return <Button {...btnProps}>+ ADD NEW PATIENT</Button>;
        }
    };
    const handleDelete = () => {
        router.delete(route('admin.patients.destroy', patientToDelete.id), {
            onBefore: () => confirm('Are you sure you want to delete this encrypted record? This cannot be undone.'),
            onSuccess: () => setIsDeleteModalOpen(false),
        });
    };
    const confirmDelete = () => {
        if (patientToDelete) {
            router.delete(route('admin.patients.destroy', patientToDelete.id), {
                onSuccess: () => {
                    setIsDeleteModalOpen(false);
                    setPatientToDelete(null);
                }
            });
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
                            onClick={() => { 
                                setActiveTab(tab); 
                                setCurrentPage(1); 
                                setSearchQuery(''); // Clear search on tab switch
                            }} 
                            className={`flex-1 py-4 text-center transition-colors font-bold tracking-wider uppercase ${
                                activeTab === tab 
                                    ? 'bg-slate-400/50 text-slate-100' 
                                    : 'bg-[#2E4696] text-white hover:bg-[#243776]'
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
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                                            <div className="flex justify-center gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    className="text-[9px] px-2 py-1"
                                                    onClick={() => {
                                                        setSelectedPatient(patient);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                >
                                                    EDIT
                                                </Button>
                                                <Button 
                                                    variant="danger" 
                                                    className="text-[9px] px-2 py-1"
                                                    onClick={() => {
                                                        setPatientToDelete(patient);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    DELETE  
                                                </Button>
                                            </div>
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

                    <Pagination 
                        currentPage={currentPage} 
                        totalPages={totalPages} 
                        filteredLength={filteredData.length} 
                        indexOfFirstItem={indexOfFirstItem} 
                        indexOfLastItem={indexOfLastItem} 
                        onPageChange={setCurrentPage} 
                    />
                </div>
            </div>
            <AddPatientModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
            />

            <EditPatientModal 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPatient(null);
                }}
                patient={selectedPatient} 
            />

            <DeletePatientModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                onConfirm={confirmDelete}
                patientName={patientToDelete?.name} 
            />
        </AuthenticatedLayout>
    );
}