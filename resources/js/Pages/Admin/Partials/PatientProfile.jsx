// resources/js/Pages/Admin/Partials/PatientProfile.jsx

import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import Toast from '@/Components/Toast'; 
import EditAdmissionModal from './EditAdmissionModal';
import ViewBillModal from './ViewBillModal';
import DischargeModal from './DischargeModal';
import DeletePatientModal from './DeletePatientModal';
import EditPatientModal from './EditPatientModal';
import EditVisitModal from './EditVisitModal';
import ViewOutpatientBillModal from './ViewOutpatientBillModal';

export default function PatientProfile({ patient, initialTab, onBack, doctors, rooms, inventory }) {
    const [activeSubTab, setActiveSubTab] = useState(initialTab === 'outpatient' ? 'visit' : 'admission'); 
    
    // 🔥 Toast state for local feedback
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const handleShowToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const [isEditAdmissionOpen, setIsEditAdmissionOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [activeAdmissionId, setActiveAdmissionId] = useState(null);
    const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
    const [isVisitBillOpen, setIsVisitBillOpen] = useState(false);
    const [isDeleteVisitOpen, setIsDeleteVisitOpen] = useState(false);
    const [visitToDelete, setVisitToDelete] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const visitHistory = useMemo(() => {
        const data = patient?.visit_history;
        return Array.isArray(data) ? data : [];
    }, [patient]);

    const currentVisits = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return visitHistory.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, visitHistory]);

    const selectedAdmissionData = useMemo(() => {
        if (!activeAdmissionId) return null;
        if (patient.active_admission?.id === activeAdmissionId) return patient.active_admission;
        return (patient.admission_history || []).find(a => a.id == activeAdmissionId);
    }, [activeAdmissionId, patient]);

    const handleViewBill = (admissionId) => {
        setActiveAdmissionId(admissionId);
        setIsBillModalOpen(true);
    };

    const handleEditVisit = (visit) => {
        setSelectedVisit(visit);
        setIsEditVisitOpen(true);
    };

    const handleViewVisitBill = (visit) => {
        setSelectedVisit(visit);
        setIsVisitBillOpen(true);
    };

    const handleDeleteVisitClick = (visit) => {
        setVisitToDelete(visit);
        setIsDeleteVisitOpen(true);
    };

    // --- REVERTED TYPOGRAPHY INFO CARD ---
    const renderInfoCard = (typeLabel) => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#3D52A0] text-white p-3 flex justify-between items-center font-bold">
                <span>Patient Information ({typeLabel})</span>
                <div className="flex gap-2">
                    <Button variant="danger" className="text-[10px] px-4" onClick={() => setIsDeleteModalOpen(true)}>DELETE PATIENT RECORD</Button>
                    <Button variant='success' onClick={() => setIsEditModalOpen(true)} className="text-[10px] px-4">EDIT DETAILS</Button>
                    <button onClick={onBack} className="text-[10px] font-black hover:bg-white/20 ml-2 bg-white/10 px-3 py-1.5 rounded transition-all uppercase tracking-tighter border border-white/20">
                        {"< Back to List"}
                    </button>
                </div>
            </div>
            
            {/* Typography restored to your preferred bold style */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm text-slate-700">
                <p><span className="font-bold">Date of Birth:</span> {patient.dob}</p>
                <p><span className="font-bold">Phone:</span> {patient.contact_no}</p>
                <p><span className="font-bold">Gender:</span> {patient.gender}</p>
                <p><span className="font-bold">Email:</span> {patient.email || 'N/A'}</p>
                <p className="md:col-span-2"><span className="font-bold">Address:</span> {patient.address}</p>
                <p className="md:col-span-2"><span className="font-bold">Emergency Contact:</span> {patient.emergency_contact_name} ({patient.emergency_contact_number})</p>
            </div>

            <div className="flex w-full border-t">
                <button 
                    onClick={() => setActiveSubTab(activeSubTab === 'visit' ? 'admission' : 'visit')} 
                    className="flex-1 py-2 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase hover:bg-slate-100 transition-colors"
                >
                    {activeSubTab === 'visit' ? 'Switch to Inpatient View' : 'Switch to Outpatient View'}
                </button>
            </div>
        </div>
    );

    let tabContent;

    if (activeSubTab === 'visit') {
        tabContent = (
            <div className="space-y-6 animate-in fade-in duration-300">
                {renderInfoCard('Outpatient')}

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#3D52A0] text-white p-2 font-bold text-sm text-center uppercase tracking-widest">Visit History Record</div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-slate-200 border-collapse min-w-[800px]">
                                <thead className="bg-slate-50 border-b font-black text-slate-700 uppercase tracking-tighter">
                                    <tr>
                                        <th className="p-3 border-r w-24">Visit ID</th>
                                        <th className="p-3 border-r w-32">Visit Date</th>
                                        <th className="p-3 border-r w-24">Weight</th>
                                        <th className="p-3 border-r">Reason</th>
                                        <th className="p-3 border-r text-right w-32">Total Amount</th>
                                        <th className="p-3 border-r text-right w-32">Balance</th>
                                        <th className="p-3 text-center w-48">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    {visitHistory.length > 0 ? currentVisits.map((visit) => (
                                        <tr key={visit.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border-r font-bold text-slate-800">{visit.visit_id}</td>
                                            <td className="p-3 border-r">{visit.date}</td>
                                            <td className="p-3 border-r font-bold">{visit.weight}</td>
                                            <td className="p-3 border-r truncate max-w-[150px]">{visit.reason}</td>
                                            <td className="p-3 border-r text-right font-bold">₱ {parseFloat(visit.total_bill || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                            <td className={`p-3 border-r text-right font-black ${parseFloat(visit.balance) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                ₱ {parseFloat(visit.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <Button variant="success" onClick={() => handleEditVisit(visit)} className="px-2 py-1 text-[9px]">EDIT</Button>
                                                <Button variant="primary" onClick={() => handleViewVisitBill(visit)} className="px-2 py-1 text-[9px]">VIEW BILL</Button>
                                                <Button variant="danger" onClick={() => handleDeleteVisitClick(visit)} className="px-2 py-1 text-[9px]">DELETE</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">No visit history found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4"><Pagination currentPage={currentPage} totalPages={Math.ceil(visitHistory.length / itemsPerPage)} onPageChange={setCurrentPage} /></div>
                    </div>
                </div>
            </div>
        );
    } else {
        tabContent = (
            <div className="space-y-6 animate-in fade-in duration-300">
                {renderInfoCard('Inpatient')}

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Current Admission Status</h4>
                        <Button variant="success" className="text-[9px] px-3" onClick={() => setIsEditAdmissionOpen(true)}>EDIT STATUS</Button>
                    </div>
                    {patient.active_admission ? (
                        <div className="text-center space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6 text-left">
                                <div>
                                    <p><span className="font-bold">Status:</span> <span className="text-emerald-600 font-black uppercase">{patient.status}</span></p>
                                    <p><span className="font-bold">Admission Date:</span> {patient.admission_date}</p>
                                </div>
                                <div className="text-right">
                                    <p><span className="font-bold">Physician:</span> {patient.attending_physician}</p>
                                    <p><span className="font-bold">Room:</span> {patient.current_room}</p>
                                </div>
                            </div>
                            <div className="flex justify-center gap-4">
                                <Button variant="success" className="px-8 py-2 font-black" onClick={() => handleViewBill(patient.active_admission.id)}>VIEW BILL</Button>
                                <Button variant="danger" className="px-8 py-2 font-black" onClick={() => setIsDischargeModalOpen(true)}>DISCHARGE & SETTLE</Button>
                            </div>
                        </div>
                    ) : <div className="py-10 text-center text-slate-400 italic border-2 border-dashed rounded">No active admission.</div>}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h4 className="font-bold text-slate-700 mb-4 tracking-widest uppercase text-xs text-center">Inpatient Stay History</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-slate-200 border-collapse min-w-[600px]">
                            <thead className="bg-slate-50 border-b font-black text-slate-600 uppercase">
                                <tr>
                                    <th className="p-3 border-r w-32">Admission ID</th>
                                    <th className="p-3 border-r">Date Admitted</th>
                                    <th className="p-3 border-r text-right">Total Bill</th>
                                    <th className="p-3 border-r text-right">Balance</th>
                                    <th className="p-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {(patient.admission_history || []).length > 0 ? patient.admission_history.map((adm) => (
                                    <tr key={adm.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-3 border-r font-black text-slate-800">ADM-{String(adm.id).padStart(5, '0')}</td>
                                        <td className="p-3 border-r">{new Date(adm.admission_date).toLocaleDateString()}</td>
                                        <td className="p-3 border-r text-right font-bold">₱ {parseFloat(adm.total_bill || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td className={`p-3 border-r text-right font-black ${adm.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            ₱ {parseFloat(adm.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button variant="success" className="text-[8px] px-3 py-1 font-black shadow-sm" onClick={() => handleViewBill(adm.id)}>VIEW BILL</Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No historical records.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative space-y-6">
            {/* 🔥 Toast Implementation */}
            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ ...toast, show: false })} 
                />
            )}

            {tabContent}

            {/* Modals with Success Hooks */}
            <DeletePatientModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} patient={patient} />
            <EditPatientModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                patient={patient} 
                onSuccess={(msg) => handleShowToast(msg, 'success')} 
            />
            {isEditVisitOpen && <EditVisitModal isOpen={isEditVisitOpen} onClose={() => setIsEditVisitOpen(false)} visit={selectedVisit} onSuccess={(msg) => handleShowToast(msg, 'success')} />}
            {isVisitBillOpen && <ViewOutpatientBillModal isOpen={isVisitBillOpen} onClose={() => setIsVisitBillOpen(false)} patient={patient} visit={selectedVisit} medicines={inventory} onSuccess={(msg) => handleShowToast(msg, 'success')} />}

            {isEditAdmissionOpen && patient.active_admission && (
                <EditAdmissionModal isOpen={isEditAdmissionOpen} onClose={() => setIsEditAdmissionOpen(false)} admission={patient.active_admission} doctors={doctors} rooms={rooms} onSuccess={(msg) => handleShowToast(msg, 'success')} onError={(msg) => handleShowToast(msg, 'danger')}/>
            )}
            
            {isBillModalOpen && activeAdmissionId && (
                <ViewBillModal
                    key={`bill-${activeAdmissionId}`}
                    isOpen={isBillModalOpen}
                    onClose={() => { setIsBillModalOpen(false); setActiveAdmissionId(null); }}
                    admissionId={activeAdmissionId}
                    patient={patient}
                    medicines={inventory}
                    admissionData={selectedAdmissionData}
                    onSuccess={(msg) => handleShowToast(msg, 'success')}
                />
            )}
            
            {isDischargeModalOpen && patient.active_admission && (
                <DischargeModal 
                    isOpen={isDischargeModalOpen} 
                    onClose={() => setIsDischargeModalOpen(false)} 
                    patient={patient} 
                    bill={patient.active_admission} 
                    onSuccess={(msg) => handleShowToast(msg, 'success')}
                />
            )}
        </div>
    );
}