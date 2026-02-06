// resources/js/Pages/Admin/Partials/AddVisitModal.jsx

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import Toast from '@/Components/Toast'; 

export default function AddVisitModal({ isOpen, onClose, patients = [] }) {
    const { data, setData, post, processing, reset, errors, setError, clearErrors } = useForm({
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0], 
        weight: '',
        reason: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    const today = new Date().toISOString().split('T')[0];

    // --- SEARCH & DROPDOWN STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Filter patients based on name or ID
    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id_no?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, patients]);

    // --- CLICK OUTSIDE HANDLER ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const validate = () => {
        let isValid = true;
        clearErrors();

        if (!data.patient_id) {
            setError('patient_id', 'Please select a patient.');
            isValid = false;
        }

        if (!data.visit_date) {
            setError('visit_date', 'Visit date is required.');
            isValid = false;
        } else if (new Date(data.visit_date) > new Date()) {
            setError('visit_date', 'Visit date cannot be in the future.');
            isValid = false;
        }

        if (!data.reason || data.reason.trim() === '') {
            setError('reason', 'Reason for visit is required.');
            isValid = false;
        } else if (data.reason.length > 250) {
            setError('reason', 'Maximum 250 characters only.');
            isValid = false;
        }

        if (data.weight && parseFloat(data.weight) <= 0) {
            setError('weight', 'Weight must be a positive number.');
            isValid = false;
        }

        return isValid;
    };

    const handleModalClose = () => {
        reset();
        setSearchTerm('');
        setIsDropdownOpen(false);
        clearErrors();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            post(route('admin.visits.store'), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Visit record saved!', type: 'success' });
                    handleModalClose();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Please correct the errors.', type: 'error' });
                }
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors bg-white ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, current, max, required = false, fieldError }) => (
        <div className="flex justify-between items-center mb-1">
            <label className={`text-[10px] font-black uppercase tracking-tighter ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600 font-bold">*</span>}
            </label>
            {max && current > 0 && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    return (
        <>
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Add Patient Visit</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">Outpatient Log Entry</p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-slate-200 transition-colors">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
                            
                            {/* --- SEARCHABLE PATIENT SELECTION --- */}
                            <div className="relative" ref={dropdownRef}>
                                <Label text="Select Patient" required fieldError={errors.patient_id} />
                                
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Search Name or Patient ID..."
                                        className={inputClass(errors.patient_id)}
                                        value={searchTerm}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                    />
                                    {searchTerm && (
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                setSearchTerm(''); 
                                                setData('patient_id', '');
                                                setIsDropdownOpen(false);
                                            }}
                                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute z-[110] w-full mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-48 overflow-y-auto scrollbar-thin animate-in slide-in-from-top-1 duration-150">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex justify-between items-center group transition-colors"
                                                    onClick={() => {
                                                        setData('patient_id', p.id);
                                                        setSearchTerm(p.name);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    <span className="font-bold text-slate-700 group-hover:text-[#3D52A0]">{p.name}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-[#3D52A0] group-hover:text-white transition-all">
                                                        {p.patient_id || p.id_no || `ID: ${p.id}`}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-slate-400 italic">No matching patients.</div>
                                        )}
                                    </div>
                                )}
                                {errors.patient_id && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.patient_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label text="Visit Date" required fieldError={errors.visit_date} />
                                    <input 
                                        type="date" 
                                        max={today}
                                        value={data.visit_date} 
                                        onChange={e => setData('visit_date', e.target.value)} 
                                        className={inputClass(errors.visit_date)} 
                                    />
                                    {errors.visit_date && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.visit_date}</p>}
                                </div>
                                <div>
                                    <Label text="Weight (KG)" fieldError={errors.weight} />
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        placeholder="0.0"
                                        value={data.weight} 
                                        onChange={e => setData('weight', e.target.value)} 
                                        className={inputClass(errors.weight)} 
                                    />
                                    {errors.weight && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.weight}</p>}
                                </div>
                            </div>

                            <div>
                                <Label text="Reason for Visit" current={data.reason.length} max={250} required fieldError={errors.reason} />
                                <textarea 
                                    maxLength={250}
                                    value={data.reason} 
                                    onChange={e => setData('reason', e.target.value)} 
                                    className={`${inputClass(errors.reason)} h-24 resize-none`} 
                                    placeholder="Brief description of the consultation..."
                                />
                                {errors.reason && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.reason}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={handleModalClose} className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : 'Save Visit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}