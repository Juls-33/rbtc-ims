// resources/js/Pages/Admin/Partials/PatientProfile.jsx

import React, { useState, useMemo, useEffect } from 'react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import EditAdmissionModal from './EditAdmissionModal';
import ViewBillModal from './ViewBillModal';
import DischargeModal from './DischargeModal';
import EditPatientModal from './EditPatientModal';
import EditVisitModal from './EditVisitModal';
import ViewOutpatientBillModal from './ViewOutpatientBillModal';

export default function PatientProfile({ patient, initialTab, onBack, doctors, rooms, inventory }) {
    const [activeSubTab, setActiveSubTab] = useState(initialTab === 'outpatient' ? 'visit' : 'admission'); 
    
    // --- 1. STATES FOR FILTERING & SORTING ---
    const [visitSearch, setVisitSearch] = useState('');
    const [visitSort, setVisitSort] = useState({ key: 'date', direction: 'desc' });
    const [visitPage, setVisitPage] = useState(1);

    const [admSearch, setAdmSearch] = useState('');
    const [admSort, setAdmSort] = useState({ key: 'admission_date', direction: 'desc' });
    const itemsPerPage = 5;

    // Modal States
    const [isEditAdmissionOpen, setIsEditAdmissionOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [activeAdmissionId, setActiveAdmissionId] = useState(null);
    const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
    const [isVisitBillOpen, setIsVisitBillOpen] = useState(false);

    // --- 2. LOGIC PIPELINES (Must be above any return) ---

    // Visit Pipeline
    const filteredVisits = useMemo(() => {
        let data = [...(patient?.visit_history || [])];
        if (visitSearch) {
            const q = visitSearch.toLowerCase();
            data = data.filter(v => v.visit_id.toLowerCase().includes(q) || v.reason.toLowerCase().includes(q));
        }
        data.sort((a, b) => {
            let vA = a[visitSort.key], vB = b[visitSort.key];
            if (visitSort.key === 'balance') { vA = parseFloat(vA); vB = parseFloat(vB); }
            if (vA < vB) return visitSort.direction === 'asc' ? -1 : 1;
            if (vA > vB) return visitSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [patient.visit_history, visitSearch, visitSort]);

    const currentVisits = filteredVisits.slice((visitPage - 1) * itemsPerPage, visitPage * itemsPerPage);

    // Admission Pipeline
    const filteredAdmissions = useMemo(() => {
        let data = [...(patient?.admission_history || [])];
        if (admSearch) {
            const q = admSearch.toLowerCase();
            data = data.filter(a => String(a.id).includes(q));
        }
        data.sort((a, b) => {
            let vA = a[admSort.key], vB = b[admSort.key];
            if (vA < vB) return admSort.direction === 'asc' ? -1 : 1;
            if (vA > vB) return admSort.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return data;
    }, [patient.admission_history, admSearch, admSort]);

    const activePatientData = useMemo(() => patient, [patient]); // For profile logic

    const selectedAdmissionData = useMemo(() => {
        if (!activeAdmissionId) return null;
        if (patient.active_admission?.id === activeAdmissionId) return patient.active_admission;
        return (patient.admission_history || []).find(a => a.id == activeAdmissionId);
    }, [activeAdmissionId, patient]);

    // --- 3. HELPERS ---
    const SortIcon = ({ config, column }) => {
        if (config.key !== column) return <span className="ml-1 opacity-20">↕</span>;
        return config.direction === 'asc' ? <span className="ml-1 text-blue-600">↑</span> : <span className="ml-1 text-blue-600">↓</span>;
    };

    const handleSortVisit = (key) => setVisitSort(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    const handleSortAdm = (key) => setAdmSort(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const handleViewBill = (admissionId) => { setActiveAdmissionId(admissionId); setIsBillModalOpen(true); };
    const handleEditVisit = (visit) => { setSelectedVisit(visit); setIsEditVisitOpen(true); };
    const handleViewVisitBill = (visit) => { setSelectedVisit(visit); setIsVisitBillOpen(true); };

    // --- 4. RENDER ORIGINAL INFO CARD ---
    const renderInfoCard = (typeLabel) => (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-[#3D52A0] text-white p-3 flex justify-between items-center font-bold">
                <span>Patient Information ({typeLabel})</span>
                <div className="flex gap-2">
                    <Button variant="danger" className="text-[10px] px-4" onClick={() => {/* Trigger Delete */}}>DELETE PATIENT RECORD</Button>
                    <Button variant='success' onClick={() => setIsEditModalOpen(true)} className="text-[10px] px-4">EDIT DETAILS</Button>
                    <button onClick={onBack} className="text-[10px] font-black hover:bg-white/20 ml-2 bg-white/10 px-3 py-1.5 rounded transition-all uppercase tracking-tighter border border-white/20">
                        {"< Back to List"}
                    </button>
                </div>
            </div>
            
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

    // --- 5. CONDITIONAL RENDER (List vs Profile Logic handled in Parent, but SubTab content here) ---
    let tabContent;

    if (activeSubTab === 'visit') {
        tabContent = (
            <div className="space-y-6">
                {renderInfoCard('Outpatient')}

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#3D52A0] text-white p-2 font-bold text-sm text-center uppercase tracking-widest flex justify-between items-center px-6">
                        <span>Visit History Record</span>
                        <input 
                            type="text" 
                            value={visitSearch} 
                            onChange={e => { setVisitSearch(e.target.value); setVisitPage(1); }} 
                            placeholder="Search" 
                            className="text-slate-800 text-xs px-3 py-1 rounded border-none outline-none w-64"
                        />
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-slate-200 border-collapse min-w-[800px]">
                                <thead className="bg-slate-50 border-b font-black text-slate-700 uppercase tracking-tighter">
                                    <tr>
                                        <th className="p-3 border-r w-24 cursor-pointer" onClick={() => handleSortVisit('visit_id')}>Visit ID <SortIcon config={visitSort} column="visit_id"/></th>
                                        <th className="p-3 border-r w-32 cursor-pointer" onClick={() => handleSortVisit('date')}>Visit Date <SortIcon config={visitSort} column="date"/></th>
                                        <th className="p-3 border-r w-24">Weight</th>
                                        <th className="p-3 border-r">Reason</th>
                                        <th className="p-3 border-r text-right w-32">Total Amount</th>
                                        <th className="p-3 border-r text-right w-32 cursor-pointer" onClick={() => handleSortVisit('balance')}>Balance <SortIcon config={visitSort} column="balance"/></th>
                                        <th className="p-3 text-center w-48">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    {currentVisits.length > 0 ? currentVisits.map((v) => (
                                        <tr key={v.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border-r font-bold text-slate-800">{v.visit_id}</td>
                                            <td className="p-3 border-r">{v.date}</td>
                                            <td className="p-3 border-r font-bold">{v.weight}</td>
                                            <td className="p-3 border-r truncate max-w-[150px]">{v.reason}</td>
                                            <td className="p-3 border-r text-right font-bold">₱ {parseFloat(v.total_bill || 0).toLocaleString()}</td>
                                            <td className={`p-3 border-r text-right font-black ${parseFloat(v.balance) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                ₱ {parseFloat(v.balance || 0).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <Button variant="success" onClick={() => handleEditVisit(v)} className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm">EDIT</Button>
                                                <Button variant="primary" onClick={() => handleViewVisitBill(v)} className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm">VIEW BILL</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="p-8 text-center text-slate-400 italic">No visits found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4">
                            <Pagination currentPage={visitPage} totalPages={Math.ceil(filteredVisits.length / itemsPerPage)} onPageChange={setVisitPage} />
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        tabContent = (
            <div className="space-y-6">
                {renderInfoCard('Inpatient')}

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Current Admission Status</h4>
                        <Button variant="success" className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm" onClick={() => setIsEditAdmissionOpen(true)}>EDIT STATUS</Button>
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

                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#3D52A0] text-white p-2 font-bold text-sm text-center uppercase tracking-widest flex justify-between items-center px-6">
                        <span>Stay History</span>
                        <input 
                            type="text" 
                            value={admSearch} 
                            onChange={e => setAdmSearch(e.target.value)} 
                            placeholder="Search" 
                            className="text-slate-800 text-xs px-3 py-1 rounded border-none outline-none w-64"
                        />
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-slate-200 border-collapse min-w-[600px]">
                                <thead className="bg-slate-50 border-b font-black text-slate-600 uppercase">
                                    <tr>
                                        <th className="p-3 border-r w-32 cursor-pointer" onClick={() => handleSortAdm('id')}>Admission ID <SortIcon config={admSort} column="id"/></th>
                                        <th className="p-3 border-r cursor-pointer" onClick={() => handleSortAdm('admission_date')}>Date Admitted <SortIcon config={admSort} column="admission_date"/></th>
                                        <th className="p-3 border-r text-right">Total Bill</th>
                                        <th className="p-3 border-r text-right">Balance</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    {filteredAdmissions.length > 0 ? filteredAdmissions.map((adm) => (
                                        <tr key={adm.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border-r font-black text-slate-800">ADM-{String(adm.id).padStart(5, '0')}</td>
                                            <td className="p-3 border-r">{new Date(adm.admission_date).toLocaleDateString()}</td>
                                            <td className="p-3 border-r text-right font-bold">₱ {parseFloat(adm.total_bill || 0).toLocaleString()}</td>
                                            <td className={`p-3 border-r text-right font-black ${adm.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                ₱ {parseFloat(adm.balance || 0).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button variant="success" className="text-[9px] py-1.5 w-28 font-black uppercase tracking-widest shadow-sm" onClick={() => handleViewBill(adm.id)}>VIEW INVOICE</Button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No stay records found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative space-y-6">
            {tabContent}

            {/* Modals remain exactly as they were */}
            <EditPatientModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} patient={patient} />
            {isEditVisitOpen && <EditVisitModal isOpen={isEditVisitOpen} onClose={() => setIsEditVisitOpen(false)} visit={selectedVisit} />}
            {isVisitBillOpen && <ViewOutpatientBillModal isOpen={isVisitBillOpen} onClose={() => setIsVisitBillOpen(false)} patient={patient} visit={selectedVisit} medicines={inventory} />}
            {isEditAdmissionOpen && patient.active_admission && <EditAdmissionModal isOpen={isEditAdmissionOpen} onClose={() => setIsEditAdmissionOpen(false)} admission={patient.active_admission} doctors={doctors} rooms={rooms} />}
            {isBillModalOpen && activeAdmissionId && <ViewBillModal key={`bill-${activeAdmissionId}`} isOpen={isBillModalOpen} onClose={() => { setIsBillModalOpen(false); setActiveAdmissionId(null); }} admissionId={activeAdmissionId} patient={patient} medicines={inventory} admissionData={selectedAdmissionData} />}
            {isDischargeModalOpen && patient.active_admission && <DischargeModal isOpen={isDischargeModalOpen} onClose={() => setIsDischargeModalOpen(false)} patient={patient} bill={patient.active_admission} />}
        </div>
    );
}