import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';

// Shared Components
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddPatientModal from './Partials/AddPatientModal';
import EditPatientModal from './Partials/EditPatientModal';
import DeletePatientModal from './Partials/DeletePatientModal';
import AdmitPatientModal from './Partials/AdmitPatientModal';
import PatientProfile from './Partials/PatientProfile';
import AddVisitModal from './Partials/AddVisitModal';
import Toast from '@/Components/Toast';

export default function PatientManagement({ auth, patients = [], selectablePatients, rooms, doctors, inventory = [] }) {

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
    const [profileContext, setProfileContext] = useState('inpatient');
    
    const itemsPerPage = 10;

    const listHeaderTitle = useMemo(() => {
        if (activeTab === 'inpatient') return 'Patient List (Admission | Inpatient)';
        if (activeTab === 'outpatient') return 'Patient List (Visits | Outpatient)';
        return 'Patient List (General Directory)';
    }, [activeTab]);
    const filteredData = useMemo(() => {
        let data = allPatients;

        if (activeTab === 'inpatient') {

            data = data.filter(p => p.has_admissions);
        } 
        else if (activeTab === 'outpatient') {

            data = data.filter(p => p.has_visits);
        }

        // Search logic remains the same
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            data = data.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.patient_id?.toLowerCase().includes(query)
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
        const btnProps = { variant: "success", className: "px-6 py-2" };
        switch (activeTab) {
            case 'inpatient': return <Button {...btnProps} onClick={() => setIsAdmitModalOpen(true)}>ADMIT PATIENT</Button>;
            case 'outpatient': return <Button {...btnProps} onClick={() => setIsAddVisitModalOpen(true)}>ADD PATIENT VISIT</Button>;
            default: return <Button {...btnProps} onClick={() => setIsAddModalOpen(true)}>+ ADD NEW PATIENT</Button>;
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
    const activePatient = useMemo(() => {
    if (!selectedProfile) return null;
        return allPatients.find(p => p.id === selectedProfile);
    }, [allPatients, selectedProfile]);

    const { flash } = usePage().props;
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (flash?.success) {
            handleShowToast(flash.success, 'success');
            // Optional: Clear the flash manually if your middleware doesn't
            flash.success = null; 
        }
        if (flash?.error) {
            handleShowToast(flash.error, 'danger');
            flash.error = null;
        }
    }, [flash]);
    const handleShowToast = (message, type = 'success') => {
        setToastInfo({ show: true, message, type });
    };
    const handleViewProfile = (patient) => {
        setSelectedProfile(patient.id);
        setProfileContext(activeTab === 'outpatient' ? 'outpatient' : 'inpatient');
        setViewMode('profile');
    };
    if (viewMode === 'profile' && activePatient) {
    return (
        <AuthenticatedLayout header={`Admin / Patient Profile: ${activePatient.name}`}>
            <PatientProfile 
                patient={activePatient} 
                initialTab={profileContext}
                onBack={() => {
                    setViewMode('list');
                    setSelectedProfile(null);
                }} 
                doctors={doctors} 
                rooms={rooms}
                inventory={inventory}
            />
        </AuthenticatedLayout>
    );
}
    return (
        <AuthenticatedLayout 
            header="Admin / Patient Management" 
            sectionTitle={
                <div className="grid grid-cols-1 md:flex w-full shadow-lg border-b border-[#243776]">
                    {['all', 'inpatient', 'outpatient'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => { 
                                setActiveTab(tab); 
                                setCurrentPage(1); 
                                setSearchQuery(''); 
                            }} 
                            /* 🔥 Added border-b for mobile stacking, md:border-b-0 for desktop */
                            className={`py-3 md:py-5 text-center transition-all font-black tracking-widest uppercase text-[10px] md:text-xs border-b md:border-b-0 md:border-r border-white/10 last:border-0 flex-1 ${
                                activeTab === tab 
                                    ? 'bg-slate-500/40 text-white shadow-inner' 
                                    : 'bg-[#2E4696] text-white hover:bg-[#3D52A0]'
                            }`}
                        >
                            {/* Simplified labels for better mobile fit */}
                            {tab === 'all' ? 'Directory' : tab}
                        </button>
                    ))}
                </div>
            }
        >
            <Head title="Patient Management" />
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                <div className="bg-[#3D52A0] text-white p-4 font-black text-sm uppercase tracking-widest flex justify-between items-center">
                    <span>{listHeaderTitle}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Records: {filteredData.length}</span>
                </div>
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
                                    currentItems.map((patient) => {
                                        const hasUnpaidVisit = patient.visit_history?.some(v => parseFloat(v.balance) > 0);
                                        const hasUnpaidStatement = patient.active_admission?.statements?.some(s => s.status === 'UNPAID');
                                        const aggregateBillStatus = (hasUnpaidVisit || hasUnpaidStatement) ? 'UNPAID' : 'PAID';
                                        return (
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
                                                        <td className="p-3 border-r text-center">
                                                            {(() => {
                                                                if (activeTab === 'outpatient') {
                                                                    return <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700">OUTPATIENT</span>;
                                                                }
                                                                return (
                                                                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                                                                        patient.status === 'ADMITTED' ? 'bg-emerald-100 text-emerald-700' : 
                                                                        patient.status === 'DISCHARGED' ? 'bg-amber-100 text-amber-700' : 
                                                                        'bg-slate-100 text-slate-600'
                                                                    }`}>
                                                                        {patient.status}
                                                                    </span>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="p-3 border-r">
                                                            <span className={`font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border ${
                                                                aggregateBillStatus === 'UNPAID' 
                                                                    ? 'bg-rose-100 text-rose-700 border-rose-200' 
                                                                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                            }`}>
                                                                {aggregateBillStatus}
                                                            </span>
                                                                                                    </td>
                                                        {/* FIXED ACTION CELL */}
                                                        <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] z-10">
                                                            <Button variant="success" className="text-[9px] px-2 py-1 shadow-sm uppercase font-bold" onClick={() => handleViewProfile(patient)}>VIEW PROFILE</Button>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ); 
                                    })  
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
                onSuccess={(msg) => handleShowToast(msg || 'Patient registered!', 'success')}
            />

            <EditPatientModal 
                isOpen={isEditModalOpen} 
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedPatient(null);
                }}
                patient={selectedPatient} 
                onSuccess={(msg) => handleShowToast(msg, 'success')} 
            />

            <DeletePatientModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setPatientToDelete(null); 
                }} 
                patient={patientToDelete} 
                onSuccess={(msg) => handleShowToast(msg, 'success')} 
            />
            <AdmitPatientModal 
                isOpen={isAdmitModalOpen} 
                onClose={() => setIsAdmitModalOpen(false)}
                patients={selectablePatients || []} 
                rooms={rooms || []}
                doctors={doctors || []}
                onSuccess={(msg) => handleShowToast(msg, 'success')} 
            />
            <AddVisitModal 
                isOpen={isAddVisitModalOpen} 
                onClose={() => setIsAddVisitModalOpen(false)}
                patients={selectablePatients || []} 
                onSuccess={(msg) => handleShowToast(msg, 'success')}
            />
        </AuthenticatedLayout>
    );
}