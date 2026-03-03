import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import AddPatientModal from './Partials/AddPatientModal';
import EditPatientModal from './Partials/EditPatientModal';
import DeletePatientModal from './Partials/DeletePatientModal';
import AdmitPatientModal from './Partials/AdmitPatientModal';
import PatientProfile from './Partials/PatientProfile';
import AddVisitModal from './Partials/AddVisitModal';

export default function PatientManagement({ auth, patients, filters, selectablePatients, rooms, doctors, inventory = [] }) {
    const allPatients = patients.data || [];
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [activeTab, setActiveTab] = useState(filters.tab || 'all');
    
    // 🔥 FIXED: Changed default sort from 'name' to 'patient_id'
    const [sortConfig, setSortConfig] = useState({ key: 'patient_id', direction: 'desc' });
    
    const [viewMode, setViewMode] = useState('list');
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profileContext, setProfileContext] = useState('inpatient');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientToDelete, setPatientToDelete] = useState(null);
    
    const itemsPerPage = 10;
    
    const activePatient = useMemo(() => 
        allPatients.find(p => p.id === selectedProfile), 
    [allPatients, selectedProfile]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.patients'), 
                { search: searchQuery, tab: activeTab }, 
                { preserveState: true, replace: true, preserveScroll: true }
            );
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, activeTab]);
   
    const processedData = useMemo(() => {
        let data = allPatients.map(p => {
            const hasUnpaidVisit = p.visit_history?.some(v => parseFloat(v.balance) > 0);
            const hasUnpaidStatement = p.active_admission?.statements?.some(s => s.status === 'UNPAID');
            return {
                ...p,
                bill_status: (hasUnpaidVisit || hasUnpaidStatement) ? 'UNPAID' : 'PAID'
            };
        });

        data.sort((a, b) => {
            let valA = a[sortConfig.key] || '';
            let valB = b[sortConfig.key] || '';
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return data;
    }, [allPatients, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const SortIcon = ({ column }) => {
        if (sortConfig.key !== column) return <span className="ml-1 opacity-20 text-[10px]">↕</span>;
        return sortConfig.direction === 'asc' 
            ? <span className="ml-1 text-blue-600 font-bold">↑</span> 
            : <span className="ml-1 text-blue-600 font-bold">↓</span>;
    };

    const handleViewProfile = (patient) => {
        setSelectedProfile(patient.id);
        setProfileContext(activeTab === 'outpatient' ? 'outpatient' : 'inpatient');
        setViewMode('profile');
    };

    const renderActionButton = () => {
        const btnClass = "px-6 py-2 font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95";
        return (
            <div className="flex gap-2 w-full md:w-auto">
                <Link href={route('admin.patient.logs')} className="flex-1 lg:flex-none justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center border border-slate-300 transition-all">View Audit Logs</Link>
                {activeTab === 'inpatient' && <Button variant="success" className={btnClass} onClick={() => setIsAdmitModalOpen(true)}>Admit Patient</Button>}
                {activeTab === 'outpatient' && <Button variant="success" className={btnClass} onClick={() => setIsAddVisitModalOpen(true)}>Log Visit</Button>}
                {activeTab === 'all' && <Button variant="success" className={btnClass} onClick={() => setIsAddModalOpen(true)}>+ Register New</Button>}
            </div>
        );
    };

    if (viewMode === 'profile' && activePatient) {
        return (
            <AuthenticatedLayout header={`Patient Profile: ${activePatient.name}`}>
                <PatientProfile 
                    patient={activePatient} initialTab={profileContext}
                    onBack={() => { setViewMode('list'); setSelectedProfile(null); }} 
                    doctors={doctors} rooms={rooms} inventory={inventory}
                />
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout 
            header="Admin / Patient Management" 
            sectionTitle={
                <div className="grid grid-cols-3 md:flex w-full shadow-lg border-b border-[#243776]">
                    {['all', 'inpatient', 'outpatient'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-center transition-all font-black tracking-widest uppercase text-[10px] md:text-xs border-r border-white/10 last:border-0 flex-1 ${activeTab === tab ? 'bg-slate-500/40 text-white shadow-inner' : 'bg-[#2E4696] text-white hover:bg-[#3D52A0]'}`}>{tab === 'all' ? 'All Patients' : tab}</button>
                    ))}
                </div>
            }
        >
            <Head title="Patient Management" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
                <div className="bg-[#3D52A0] text-white p-4 font-black text-sm uppercase tracking-widest flex justify-between items-center shrink-0 shadow-md">
                    <span>{activeTab === 'inpatient' ? 'Inpatient Admission Registry' : activeTab === 'outpatient' ? 'Outpatient Visit History' : 'General Patient Directory'}</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[10px]">Total Records: {patients.total}</span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="relative w-full md:w-80">
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by ID or Exact Name..." className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-1 focus:ring-[#3D52A0] outline-none text-xs transition-all" />
                        </div>
                        {renderActionButton()}
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl relative shadow-sm">
                        <table className="w-full text-left text-sm border-collapse table-auto min-w-[1000px]">
                            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest border-b">
                                <tr>
                                    {activeTab === 'all' ? (
                                        <>
                                            <th className="p-4 border-r">Name</th>
                                            <th className="p-4 border-r">DOB</th>
                                            <th className="p-4 border-r">Gender</th>
                                            <th className="p-4 border-r">Phone</th>
                                            <th className="p-4 border-r min-w-[200px]">Address</th>
                                            <th className="p-4 border-r">Emergency Contact</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('patient_id')}>
                                                Patient ID <SortIcon column="patient_id" />
                                            </th>
                                            <th className="p-4 border-r">Full Name</th>
                                            <th className="p-4 border-r">Contact</th>
                                            <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                                                Status <SortIcon column="status" />
                                            </th>
                                            <th className="p-4 border-r cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('bill_status')}>
                                                Bill Status <SortIcon column="bill_status" />
                                            </th>
                                        </>
                                    )}
                                    <th className="p-4 text-center sticky right-0 bg-gray-50 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] w-40">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600 divide-y divide-slate-100">
                                {processedData.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                                        {activeTab === 'all' ? (
                                            <>
                                                <td className="p-4 font-black text-slate-800 border-r tracking-tight">{patient.name}</td>
                                                <td className="p-4 border-r text-xs">{patient.dob}</td>
                                                <td className="p-4 border-r text-xs font-bold">{patient.gender}</td>
                                                <td className="p-4 border-r text-xs">{patient.contact_no}</td>
                                                <td className="p-4 border-r text-[10px] truncate max-w-[150px]">{patient.address}</td>
                                                <td className="p-4 border-r text-[10px] font-bold">{patient.emergency_contact_name}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 border-r font-mono text-[11px] font-bold text-slate-500">{patient.patient_id}</td>
                                                <td className="p-4 border-r font-black text-slate-800 tracking-tight">{patient.name}</td>
                                                <td className="p-4 border-r text-xs">{patient.contact_no}</td>
                                                <td className="p-4 border-r text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${patient.status === 'ADMITTED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : patient.status === 'DISCHARGED' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{activeTab === 'outpatient' ? 'OUTPATIENT' : patient.status}</span>
                                                </td>
                                                <td className="p-4 border-r text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${patient.bill_status === 'UNPAID' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{patient.bill_status}</span>
                                                </td>
                                            </>
                                        )}
                                        <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                                            <div className="flex flex-col gap-1.5 items-center justify-center">
                                                {activeTab === 'all' ? (
                                                    <div className="flex flex-col gap-1.5 w-full items-center">
                                                        <Button variant="warning" className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm" onClick={() => { setSelectedPatient(patient); setIsEditModalOpen(true); }}>EDIT</Button>
                                                        <Button variant="danger" className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm" onClick={() => { setPatientToDelete(patient); setIsDeleteModalOpen(true); }}>DELETE</Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="success" className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm" onClick={() => handleViewProfile(patient)}>VIEW PROFILE</Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processedData.length === 0 && <div className="p-20 text-center text-slate-400 italic font-medium">No records found matching your filters.</div>}
                    </div>
                </div>

                <div className="p-6 border-t bg-slate-50/30 mt-auto">
                    <Pagination data={patients} />
                </div>
            </div>

            <AddPatientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditPatientModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedPatient(null); }} patient={selectedPatient} />
            <DeletePatientModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setPatientToDelete(null); }} patient={patientToDelete} />
            <AdmitPatientModal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} patients={selectablePatients || []} rooms={rooms || []} doctors={doctors || []} />
            <AddVisitModal isOpen={isAddVisitModalOpen} onClose={() => setIsAddVisitModalOpen(false)} patients={selectablePatients || []} />
        </AuthenticatedLayout>
    );
}