import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';

export default function AddVisitModal({ isOpen, onClose, patients = [] }) {
    const { data, setData, post, processing, reset, errors, setError, clearErrors } = useForm({
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0], 
        weight: '',
        checkup_fee: 2500, 
        reason: '',
    });

    const today = new Date().toISOString().split('T')[0];

    // --- SEARCH & DROPDOWN STATE ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const filteredPatients = useMemo(() => {
        let results = patients;
        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            results = patients.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.patient_id?.toLowerCase().includes(query) ||
                p.id_no?.toLowerCase().includes(query)
            );
        }
        return [...results].sort((a, b) => {
            const aAdmitted = a.status?.toLowerCase() === 'admitted';
            const bAdmitted = b.status?.toLowerCase() === 'admitted';
            if (aAdmitted !== bAdmitted) return aAdmitted ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }, [searchTerm, patients]);

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
        } 
        if (!data.reason || data.reason.trim() === '') {
            setError('reason', 'Reason for visit is required.');
            isValid = false;
        }
        if (data.checkup_fee === '' || parseFloat(data.checkup_fee) < 0) {
            setError('checkup_fee', 'A valid fee is required.');
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
                onSuccess: () => handleModalClose(),
            });
        }
    };

    const inputClass = (error) => `w-full border rounded-lg px-4 py-3 md:py-2 text-sm transition-all outline-none ${
        error 
            ? 'bg-red-50 !border-red-500 ring-2 ring-red-200 focus:!border-red-600' 
            : 'bg-white border-slate-300 focus:border-[#3D52A0] focus:ring-2 focus:ring-blue-100'
    }`;

    const Label = ({ text, current, max, required = false, fieldError }) => (
        <div className="flex justify-between items-center mb-1.5 px-1">
            <label className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600">*</span>}
            </label>
            {max && current > 0 && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] border border-slate-200">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 md:p-5 flex justify-between items-center shrink-0 shadow-lg">
                    <div>
                        <h3 className="font-black text-sm md:text-lg uppercase tracking-tight leading-none">Add Patient Visit</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-bold tracking-widest mt-1.5">New Outpatient Entry</p>
                    </div>
                    <button 
                        onClick={handleModalClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-2xl leading-none"
                    >&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto no-scrollbar flex-1 text-slate-800">
                    
                    {/* Patient Search */}
                    <div className="relative" ref={dropdownRef}>
                        <Label text="Search Patient" required fieldError={errors.patient_id} />
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Search Name or Patient ID..."
                                className={inputClass(errors.patient_id)}
                                value={searchTerm}
                                onFocus={() => setIsDropdownOpen(true)}
                                onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                            />
                            {searchTerm && (
                                <button type="button" onClick={() => { setSearchTerm(''); setData('patient_id', ''); setIsDropdownOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg">&times;</button>
                            )}
                        </div>
                        {isDropdownOpen && (
                            <div className="absolute z-[160] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto no-scrollbar ring-1 ring-black/5 animate-in slide-in-from-top-1">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            disabled={p.status?.toLowerCase() === 'admitted'}
                                            className={`w-full text-left px-5 py-4 text-sm flex justify-between items-center border-b border-slate-50 transition-colors ${p.status?.toLowerCase() === 'admitted' ? 'bg-slate-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                                            onClick={() => { setData('patient_id', p.id); setSearchTerm(p.name); setIsDropdownOpen(false); }}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className={`font-black uppercase tracking-tight ${p.status?.toLowerCase() === 'admitted' ? 'text-slate-400' : 'text-slate-800'}`}>{p.name}</span>
                                                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest">{p.patient_id || p.id_no}</span>
                                            </div>
                                            {p.status?.toLowerCase() === 'admitted' && (
                                                <span className="text-[8px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded uppercase">Admitted</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-xs text-slate-400 italic">No patients found.</div>
                                )}
                            </div>
                        )}
                        {errors.patient_id && <p className="text-red-600 text-[10px] mt-1.5 font-black italic uppercase tracking-tight ml-1">{errors.patient_id}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <Label text="Visit Date" required fieldError={errors.visit_date} />
                            <input type="date" max={today} value={data.visit_date} onChange={e => setData('visit_date', e.target.value)} className={inputClass(errors.visit_date)} />
                            {errors.visit_date && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase">{errors.visit_date}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label text="Weight (KG)" fieldError={errors.weight} />
                            <input type="number" step="0.1" placeholder="0.0" value={data.weight} onChange={e => setData('weight', e.target.value)} className={inputClass(errors.weight)} />
                            {errors.weight && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase">{errors.weight}</p>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label text="Doctor's Consultation Fee" required fieldError={errors.checkup_fee} />
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₱</span>
                            <input 
                                type="number" 
                                value={data.checkup_fee} 
                                onChange={e => setData('checkup_fee', e.target.value)} 
                                className={`${inputClass(errors.checkup_fee)} pl-8 font-black text-emerald-700 text-lg`} 
                            />
                        </div>
                        {errors.checkup_fee && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase ml-1">{errors.checkup_fee}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label text="Reason / Diagnosis" current={data.reason.length} max={250} required fieldError={errors.reason} />
                        <textarea 
                            maxLength={250} 
                            value={data.reason} 
                            onChange={e => setData('reason', e.target.value)} 
                            className={`${inputClass(errors.reason)} h-28 resize-none`} 
                            placeholder="State the primary concern or initial diagnosis..." 
                        />
                        {errors.reason && <p className="text-red-600 text-[10px] mt-1 font-black italic uppercase ml-1">{errors.reason}</p>}
                    </div>
                </form>

                <div className="p-4 md:p-6 bg-slate-50 border-t flex flex-col md:flex-row justify-center gap-3 shrink-0">
                    <button 
                        type="button" 
                        onClick={handleModalClose} 
                        className="w-full md:w-auto px-10 py-3.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black text-[11px] uppercase tracking-widest order-2 md:order-1 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={processing} 
                        className="w-full md:w-auto px-12 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50 order-1 md:order-2 transition-all"
                    >
                        {processing ? 'Saving...' : 'Save Visit Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}