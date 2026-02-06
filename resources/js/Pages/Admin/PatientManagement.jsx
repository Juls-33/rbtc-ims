import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

// Shared Components
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddPatientModal from './Partials/AddPatientModal';
import EditPatientModal from './Partials/EditPatientModal';
import DeletePatientModal from './Partials/DeletePatientModal';
import AdmitPatientModal from './Partials/AdmitPatientModal';
import PatientProfile from './Partials/PatientProfile';
import AddVisitModal from './Partials/AddVisitModal';

export default function PatientManagement({ auth, patients = [], selectablePatients, rooms, doctors }) {
    // 1. LOCAL STATE (Medicine-Style)
    // 'patients' is now expected as a simple array for this client-side approach
    const allPatients = Array.isArray(patients) ? patients : (patients.data || []);
    const [activeTab, setActiveTab] = useState('all'); 
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'profile'
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
    const itemsPerPage = 10;

    // --- LOGIC: CLIENT-SIDE FILTERING (Medicine-Style) ---
    const filteredData = useMemo(() => {
        let data = allPatients;

        // 1. Tab Filter
        if (activeTab === 'inpatient') {
        // Show patients who have admission records (active or historical)
        data = data.filter(p => p.type?.toLowerCase() === 'inpatient');
        } else if (activeTab === 'outpatient') {
            /** * FIX: Filter for patients who are 'outpatient' AND have records 
             * in their visit history
             */
            data = data.filter(p => 
                p.type?.toLowerCase() === 'outpatient' && 
                p.visit_history?.length > 0
            );
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
            case 'inpatient': return <Button {...btnProps} onClick={() => setIsAdmitModalOpen(true)}>ADMIT PATIENT</Button>;
            case 'outpatient': return <Button {...btnProps} onClick={() => setIsAddVisitModalOpen(true)}>ADD PATIENT VISIT</Button>;
            default: return <Button {...btnProps}>+ ADD NEW PATIENT</Button>;
        }
    };
    const handleAddVisit = () => {
        setIsAddVisitModalOpen(true);
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
    const handleViewProfile = (patient) => {
        setSelectedProfile(patient);
        setViewMode('profile');
    };
    if (viewMode === 'profile') {
        return (
            <AuthenticatedLayout header={`Admin / Patient Profile: ${selectedProfile.name}`}>
                <PatientProfile 
                    patient={selectedProfile} 
                    onBack={() => setViewMode('list')} 
                    doctors={doctors} 
                    rooms={rooms}
                />
            </AuthenticatedLayout>
        );
    }
    
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

                    <div className="overflow-x-auto border border-slate-200 rounded relative">
                        <table className="w-full text-left text-sm border-collapse table-auto">
                            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                                {activeTab === 'all' ? (
                                    <tr>
                                        <th className="p-3 border-r min-w-[150px]">Name</th>
                                        <th className="p-3 border-r min-w-[100px]">Date of Birth</th>
                                        <th className="p-3 border-r">Gender</th>
                                        <th className="p-3 border-r min-w-[100px]">Civil Status</th>
                                        <th className="p-3 border-r min-w-[120px]">Phone Number</th>
                                        <th className="p-3 border-r min-w-[150px]">Home Address</th>
                                        <th className="p-3 border-r min-w-[150px]">Emergency Contact</th>
                                        <th className="p-3 border-r">Relationship</th>
                                        <th className="p-3 border-r min-w-[120px]">Emergency Contact No.</th>
                                        {/* FIXED ACTION HEADER */}
                                        <th className="p-3 text-center sticky right-0 bg-slate-100 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] z-20">Action</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th className="p-3 border-r">Patient ID</th>
                                        <th className="p-3 border-r min-w-[150px]">Full Name</th>
                                        <th className="p-3 border-r min-w-[100px]">Date of Birth</th>
                                        <th className="p-3 border-r min-w-[120px]">Contact Number</th>
                                        <th className="p-3 border-r">Status</th>
                                        <th className="p-3 border-r">Bill Status</th>
                                        {/* FIXED ACTION HEADER */}
                                        <th className="p-3 text-center sticky right-0 bg-slate-100 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] z-20">Action</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="text-slate-600">
                                {currentItems.length > 0 ? (
                                    currentItems.map((patient) => (
                                        <tr key={patient.id} className="border-b hover:bg-slate-50 transition-colors group">
                                            {activeTab === 'all' ? (
                                                <>
                                                    <td className="p-3 font-bold text-slate-800 border-r">{patient.name}</td>
                                                    <td className="p-3 border-r text-xs">{patient.dob}</td>
                                                    <td className="p-3 border-r text-xs">{patient.gender}</td>
                                                    <td className="p-3 border-r text-xs">{patient.civil_status}</td>
                                                    <td className="p-3 border-r text-xs">{patient.contact_no}</td>
                                                    <td className="p-3 border-r text-[10px] truncate max-w-[100px]">{patient.address}</td>
                                                    <td className="p-3 border-r text-[10px]">{patient.emergency_contact_name}</td>
                                                    <td className="p-3 border-r text-[10px]">{patient.emergency_contact_relation}</td>
                                                    <td className="p-3 border-r text-[10px]">{patient.emergency_contact_number}</td>
                                                    {/* FIXED ACTION CELL */}
                                                    <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] z-10">
                                                        <div className="flex flex-col gap-1">
                                                            <Button variant="success" className="text-[8px] py-1" onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}>EDIT</Button>
                                                            <Button variant="danger" className="text-[8px] py-1" onClick={() => { setPatientToDelete(patient); setIsDeleteModalOpen(true); }}>DELETE</Button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-3 font-bold border-r">{patient.patient_id}</td>
                                                    <td className="p-3 font-bold text-slate-800 border-r">{patient.name}</td>
                                                    <td className="p-3 border-r text-xs">{patient.dob}</td>
                                                    <td className="p-3 border-r text-xs">{patient.contact_no}</td>
                                                    <td className="p-3 border-r">
                                                        <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                                                            patient.status === 'ADMITTED' ? 'bg-emerald-100 text-emerald-700' : 
                                                            patient.status === 'DISCHARGED' ? 'bg-amber-100 text-amber-700' : 
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {patient.status}
                                                        </span>
                                                    </td>
                                                    <td className={`p-3 border-r font-bold text-xs ${patient.bill_status.includes('UNPAID') ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {patient.bill_status}
                                                    </td>
                                                    {/* FIXED ACTION CELL */}
                                                    <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] z-10">
                                                        <Button variant="success" className="text-[9px] px-2 py-1 shadow-sm uppercase font-bold" onClick={() => handleViewProfile(patient)}>VIEW PROFILE</Button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={activeTab === 'all' ? 10 : 7} className="p-8 text-center text-slate-400">No records found.</td>
                                    </tr>
                                )}
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
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setPatientToDelete(null); 
                }} 
                patient={patientToDelete} 
            />
            <AdmitPatientModal 
                isOpen={isAdmitModalOpen} 
                onClose={() => setIsAdmitModalOpen(false)}
                patients={selectablePatients || []} 
                rooms={rooms || []}
                doctors={doctors || []}
            />
            <AddVisitModal 
                isOpen={isAddVisitModalOpen} 
                onClose={() => setIsAddVisitModalOpen(false)}
                patients={selectablePatients || []} 
            />
        </AuthenticatedLayout>
    );
}