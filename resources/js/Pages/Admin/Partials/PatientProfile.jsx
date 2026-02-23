// resources/js/Pages/Admin/Partials/PatientProfile.jsx

import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';
import EditAdmissionModal from './EditAdmissionModal';
import ViewBillModal from './ViewBillModal';
import DischargeModal from './DischargeModal';
import DeletePatientModal from './DeletePatientModal';
import EditPatientModal from './EditPatientModal';
import EditVisitModal from './EditVisitModal';
import ViewOutpatientBillModal from './ViewOutpatientBillModal';

export default function PatientProfile({ patient, onBack, doctors, rooms, inventory }) {
    const [activeSubTab, setActiveSubTab] = useState('admission');
    const [isEditAdmissionOpen, setIsEditAdmissionOpen] = useState(false);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [activeAdmissionId, setActiveAdmissionId] = useState(null);
    const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false); // New State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [isEditVisitOpen, setIsEditVisitOpen] = useState(false);
    const [isVisitBillOpen, setIsVisitBillOpen] = useState(false);
    const [isDeleteVisitOpen, setIsDeleteVisitOpen] = useState(false);
    const [visitToDelete, setVisitToDelete] = useState(null);
    const [selectedReasonOption, setSelectedReasonOption] = useState(''); 
    const [admissionToDelete, setAdmissionToDelete] = useState(null);
    const [deleteReason, setDeleteReason] = useState(''); // For "Other" text
    const [otherReasonText, setOtherReasonText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const reasonsList = [
        "Invalid Record / Data Entry Error",
        "Request for Deletion (Patient/Doctor)",
        "Duplicate Admission Entry",
        "Other"
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const visitHistory = patient.visit_history || [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVisits = useMemo(() => {
        return visitHistory.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, visitHistory]);

    const unpaidStatements = useMemo(() => {
        return patient.active_admission?.statements?.filter(s => s.status === 'UNPAID') || [];
    }, [patient.active_admission?.statements]);

    const unpaidCount = unpaidStatements.length;

    const totalPages = Math.ceil(visitHistory.length / itemsPerPage);

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
    const confirmDeleteAdmission = () => {
        if (!deleteReason) return alert("Please provide a reason for deletion.");
        setIsDeleting(true);
        router.delete(route('admin.admissions.destroy', admissionToDelete.id), {
        data: { reason: finalReason },
        onSuccess: () => {
            setAdmissionToDelete(null);
            setDeleteReason('');
            setSelectedReasonOption('');
        },
        onError: () => {
            setIsDeleting(false); 
        },
        onFinish: () => setIsDeleting(false)
    });
    };
    if (patient.status === 'OUTPATIENT') {
        return (
            <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                {/* Header & Personal Info Card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#3D52A0] text-white p-3 flex justify-between items-center font-bold">
                        <span>Patient Information (Outpatient)</span>
                        <div className="flex gap-2">
                            <Button 
                                variant="danger" 
                                className="text-[10px] px-4"
                                onClick={() => setIsDeleteModalOpen(true)} // Trigger modal
                            >
                                DELETE PATIENT RECORD
                            </Button>
                            <Button
                                variant='success'
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-[10px] px-4 "
                            >
                                EDIT DETAILS
                            </Button>
                            <button onClick={onBack} className="text-sm hover:underline ml-4">{"< Back"}</button>
                        </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-2 gap-y-2 text-sm text-slate-700">
                        <p><span className="font-bold">Date of Birth:</span> {patient.dob}</p>
                        <p><span className="font-bold">Phone:</span> {patient.contact_no}</p>
                        <p><span className="font-bold">Gender:</span> {patient.gender}</p>
                        <p><span className="font-bold">Email:</span> {patient.email || 'N/A'}</p>
                        <p className="col-span-2"><span className="font-bold">Address:</span> {patient.address}</p>
                        <p className="col-span-2"><span className="font-bold">Emergency Contact:</span> {patient.emergency_contact_name} ({patient.emergency_contact_number})</p>
                    </div>
                </div>

                {/* Visit History Table Card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-[#3D52A0] text-white p-2 font-bold text-sm text-center uppercase tracking-widest">
                        Visit History Record
                    </div>
                    <div className="p-6">
                        <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                            <thead className="bg-slate-50 border-b font-black text-slate-700 uppercase tracking-tighter">
                                <tr>
                                    <th className="p-3 border-r w-24">Visit ID</th>
                                    <th className="p-3 border-r w-32">Visit Date</th>
                                    <th className="p-3 border-r w-24">Weight</th>
                                    <th className="p-3 border-r">Reason</th>
                                    <th className="p-3 border-r text-right w-32">Remaining Balance</th>
                                    <th className="p-3 border-r text-center w-28">Status</th>
                                    <th className="p-3 text-center w-48">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                {patient.visit_history && patient.visit_history.length > 0 ? (
                                    currentVisits.map((visit) => (
                                        <tr key={visit.id} className="border-b hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border-r font-bold text-slate-800">{visit.visit_id}</td>
                                            <td className="p-3 border-r">{visit.date}</td>
                                            <td className="p-3 border-r font-bold">{visit.weight}</td>
                                            <td className="p-3 border-r truncate max-w-[150px]" title={visit.reason}>
                                                {visit.reason}
                                            </td>

                                            {/* BALANCE COLUMN */}
                                            <td className={`p-3 border-r text-right font-black ${parseFloat(visit.balance) > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                ₱ {parseFloat(visit.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            {/* STATUS BADGE COLUMN */}
                                            <td className="p-3 border-r text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    parseFloat(visit.balance) <= 0 
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                }`}>
                                                    {parseFloat(visit.balance) <= 0 ? 'PAID' : 'UNPAID'}
                                                </span>
                                            </td>

                                            <td className="p-3 text-center flex justify-center gap-2">
                                                <Button
                                                    variant="success"
                                                    onClick={() => handleEditVisit(visit)}
                                                    className="px-2 py-1 rounded font-bold uppercase text-[9px]"
                                                >
                                                    EDIT
                                                </Button>
                                                <Button 
                                                    variant="primary"
                                                    onClick={() => handleViewVisitBill(visit)}
                                                    className="px-2 py-1 rounded font-bold uppercase text-[9px]"
                                                >
                                                    VIEW BILL
                                                </Button>
                                                <Button 
                                                    variant="danger"
                                                    onClick={() => handleDeleteVisitClick(visit)}
                                                    className="px-2 py-1  text-rose-600 border border-rose-200 rounded font-black uppercase text-[9px] hover:bg-rose-600 hover:text-white transition-all"
                                                >
                                                    DELETE
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-400 italic">No visit history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        <div className="mt-4">
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        </div>
                    </div>
                </div>
                <DeletePatientModal 
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    patient={patient}
                />
                <EditPatientModal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    patient={patient} 
                />
                <EditVisitModal 
                    isOpen={isEditVisitOpen} 
                    onClose={() => setIsEditVisitOpen(false)} 
                    visit={selectedVisit} 
                />
                <ViewOutpatientBillModal 
                    isOpen={isVisitBillOpen} 
                    onClose={() => setIsVisitBillOpen(false)} 
                    patient={patient}
                    visit={selectedVisit}
                    medicines={inventory}
                />
                {isDeleteVisitOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="bg-rose-600 p-6 text-center text-white">
                            <h4 className="text-xl font-black uppercase">Delete Visit Record?</h4>
                            <p className="text-[10px] text-rose-100 uppercase mt-1">This will return all items to inventory</p>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-slate-600 text-sm mb-6">
                                Are you sure you want to delete <span className="font-bold text-slate-900">{visitToDelete?.visit_id}</span>? 
                                This action will reset stock counts for any medicines included in this bill.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="gray" className="flex-1" onClick={() => setIsDeleteVisitOpen(false)}>CANCEL</Button>
                                <Button 
                                    variant="danger" 
                                    className="flex-1" 
                                    onClick={() => {
                                        router.delete(route('admin.visits.destroy', visitToDelete.id), {
                                            onSuccess: () => setIsDeleteVisitOpen(false)
                                        });
                                    }}
                                >
                                    YES, DELETE
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        );
    }else{
        return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#3D52A0] text-white p-3 flex justify-between items-center font-bold">
                    <span>Patient Information (Inpatient)</span>
                    <button onClick={onBack} className="text-sm hover:underline">{"< Back"}</button>
                </div>
                
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                            <p><span className="font-bold">Date of Birth:</span> {patient.dob}</p>
                            <p><span className="font-bold">Phone:</span> {patient.contact_no}</p>
                            <p><span className="font-bold">Gender:</span> {patient.gender}</p>
                            <p><span className="font-bold">Email:</span> {patient.email || 'N/A'}</p>
                            <p><span className="font-bold">Address:</span> {patient.address}</p>
                            <p><span className="font-bold">Emergency Phone:</span> {patient.emergency_contact_number}</p>
                            <p className="col-span-2"><span className="font-bold">Emergency Contact:</span> {patient.emergency_contact_name}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="danger" 
                                className="text-[10px] px-4"
                                onClick={() => setIsDeleteModalOpen(true)} // Trigger modal
                            >
                                DELETE PATIENT RECORD
                            </Button>
                            <Button
                                variant='success'
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-[10px] px-4 "
                            >
                                EDIT DETAILS
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex w-full border-t">
                        <button 
                            onClick={() => setActiveSubTab('admission')}
                            className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider ${activeSubTab === 'admission' ? 'bg-[#3D52A0] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            ADMISSION HISTORY
                        </button>
                        <button 
                            onClick={() => setActiveSubTab('prescription')}
                            className={`flex-1 py-3 font-bold text-xs uppercase tracking-wider ${activeSubTab === 'prescription' ? 'bg-[#3D52A0] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        >
                            PRESCRIPTION HISTORY
                        </button>
                    </div>
                </div>
            </div>

            {/* Current Admission Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Current Admission Status</h4>
                    <Button variant="success" className="text-[9px] px-3" onClick={() => setIsEditAdmissionOpen(true)}>
                        EDIT STATUS
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                        <p><span className="font-bold">Status:</span> <span className="text-emerald-600">ADMITTED</span></p>
                        <p><span className="font-bold">Admission Date:</span> {patient.admission_date || '2025-11-15'}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Assigned Doctor:</span> {patient.attending_physician || 'Dr. Quack Reyes'}</p>
                        <p><span className="font-bold">Room:</span> {patient.current_room || 'Room 204 (Private)'}</p>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    {unpaidCount > 0 ? (
                            <p className="text-rose-600 font-bold text-sm">
                                {unpaidCount} Unpaid Billing Statement{unpaidCount > 1 ? 's' : ''}: Click "View Bill" to see details
                            </p>
                        ) : (
                            <p className="text-emerald-600 font-bold text-sm">
                                All billing statements for this admission are fully settled.
                            </p>
                        )}
                    <div className="flex justify-center gap-4">
                        <Button 
                            variant="success" 
                            className="px-8 py-2" 
                            onClick={() => handleViewBill(patient.active_admission?.id)} // 🔥 Use real ID
                        >
                            VIEW BILL
                        </Button>
                        <Button variant="success" className="px-8 py-2" onClick={() => setIsDischargeModalOpen(true)}>
                            DISCHARGE AND PAY THE REMAINING BALANCE
                        </Button>
                    </div>
                </div>
            </div>

            {/* Historical Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <h4 className="font-bold text-slate-700 mb-4 tracking-widest uppercase text-xs text-center">Inpatient Record History (All Stays)</h4>
                    <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                        <thead className="bg-slate-50 border-b font-black text-slate-600 uppercase">
                            <tr>
                                <th className="p-3 border-r w-32">Admission ID</th>
                                <th className="p-3 border-r">Date Admitted</th>
                                <th className="p-3 border-r">Total Bill</th>
                                <th className="p-3 border-r">Balance</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600">
                            {(patient.admission_history || []).length > 0 ? (
                                patient.admission_history.map((adm) => (
                                    <tr key={adm.id} className="border-b hover:bg-slate-50 transition-colors">
                                        <td className="p-3 border-r font-black text-slate-800">ADM-{String(adm.id).padStart(5, '0')}</td>
                                        <td className="p-3 border-r">{new Date(adm.admission_date).toLocaleDateString()}</td>
                                        <td className="p-3 border-r font-bold text-slate-800">₱ {parseFloat(adm.total_bill || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className={`p-3 border-r font-black ${adm.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            ₱ {parseFloat(adm.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-3 text-center flex justify-center items-center gap-2">
                                            <Button 
                                                variant="success" 
                                                className="text-[8px] px-3 py-1 font-black uppercase shadow-sm" 
                                                onClick={() => handleViewBill(adm.id)}
                                            >
                                                VIEW BILL
                                            </Button>

                                            <Button 
                                                variant="danger" 
                                                className="text-[8px] px-3 py-1 font-black uppercase shadow-sm transition-all"
                                                onClick={() => setAdmissionToDelete(adm)} 
                                            >
                                                DELETE
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">No admission history found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

            {admissionToDelete && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden transform animate-in zoom-in-95 duration-200">
                        {/* Header matches your image */}
                        <div className="bg-[#C84B4B] text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg">Are you sure you want to delete?</h3>
                            <button onClick={() => setAdmissionToDelete(null)} className="text-white text-xl hover:text-rose-200">&times;</button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <p className="text-slate-700">
                                    Are you sure you want to delete admission record: <span className="font-bold underline">ADM-{String(admissionToDelete.id).padStart(5, '0')}</span>?
                                </p>
                                <p className="text-[#C84B4B] text-sm italic font-medium">
                                    This action cannot be undone and will return charged medicines to inventory.
                                </p>
                            </div>
                            
                            {/* Reason for Deletion Section */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700">Reason for deletion</h4>
                                
                                <div className="space-y-3 px-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            className="w-5 h-5 text-rose-600 border-slate-300 focus:ring-rose-500"
                                            checked={selectedReasonOption === 'Patient Requested for record deletion'}
                                            onChange={() => setSelectedReasonOption('Patient Requested for record deletion')}
                                        />
                                        <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Patient Requested for record deletion</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            className="w-5 h-5 text-rose-600 border-slate-300 focus:ring-rose-500"
                                            checked={selectedReasonOption === 'Invalid Record'}
                                            onChange={() => setSelectedReasonOption('Invalid Record')}
                                        />
                                        <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Invalid Record</span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            className="w-5 h-5 text-rose-600 border-slate-300 focus:ring-rose-500"
                                            checked={selectedReasonOption === 'Others'}
                                            onChange={() => setSelectedReasonOption('Others')}
                                        />
                                        <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Others</span>
                                    </label>
                                </div>

                                {/* Show textarea only if 'Others' is selected */}
                                {selectedReasonOption === 'Others' && (
                                    <textarea 
                                        className="w-full mt-2 border-slate-300 rounded-lg text-sm focus:ring-rose-500 focus:border-rose-500 p-3"
                                        placeholder="Please specify the reason..."
                                        rows="2"
                                        value={otherReasonText}
                                        onChange={(e) => setOtherReasonText(e.target.value)}
                                    />
                                )}
                            </div>

                            {/* Buttons match your image style */}
                            <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
                                <Button 
                                    variant="gray" 
                                    className="px-12 py-3 bg-[#6C757D] hover:bg-[#5A6268] text-white uppercase font-bold text-sm tracking-wide rounded"
                                    onClick={() => { setAdmissionToDelete(null); setSelectedReasonOption(''); }}
                                >
                                    CANCEL
                                </Button>
                                <Button 
                                    variant="danger"
                                    disabled={isDeleting || !selectedReasonOption || (selectedReasonOption === 'Others' && !otherReasonText)}
                                    onClick={() => {
                                        const finalReason = selectedReasonOption === 'Others' ? otherReasonText : selectedReasonOption;
                                        setIsDeleting(true);
                                        router.delete(route('admin.admissions.destroy', admissionToDelete.id), {
                                            data: { reason: finalReason },
                                            onSuccess: () => { setAdmissionToDelete(null); setSelectedReasonOption(''); setOtherReasonText(''); },
                                            onError: () => setIsDeleting(false),
                                            onFinish: () => setIsDeleting(false)
                                        });
                                    }} 
                                    className="px-10 py-3 bg-[#C84B4B] hover:bg-[#A63E3E] text-white uppercase font-bold text-sm tracking-wide rounded shadow-md disabled:opacity-50"
                                >
                                    {isDeleting ? 'REMOVING...' : 'REMOVE RECORD'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <EditAdmissionModal 
                isOpen={isEditAdmissionOpen}
                onClose={() => setIsEditAdmissionOpen(false)}
                admission={patient.active_admission} // Ensure your controller sends this object
                doctors={doctors}
                rooms={rooms}
            />
            <ViewBillModal 
                isOpen={isBillModalOpen}
                onClose={() => setIsBillModalOpen(false)}
                admissionId={activeAdmissionId}
                patient={patient}      // 🔥 Added this
                medicines={inventory} // 🔥 Added this
            />
            <DischargeModal 
                isOpen={isDischargeModalOpen}
                onClose={() => setIsDischargeModalOpen(false)}
                patient={patient}
                bill={patient.active_admission?.latest_bill} // Ensure this is sent from controller
            />
            <DeletePatientModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                patient={patient}
            />
            <EditPatientModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                patient={patient} 
            />
        </div>
    );
    }
    
}