import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Button from '@/Components/Button'; 
import Toast from '@/Components/Toast'; 
import DatePicker from '@/Components/DatePicker';

export default function AdmitPatientModal({ isOpen, onClose, patients = [], rooms = [], doctors = [], onSuccess }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        patient_id: '',
        admission_date: '',
        staff_id: '', 
        room_id: '', 
        monthly_rate: '', 
        diagnosis: '',
    });

    const [modalError, setModalError] = useState({ show: false, message: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [roomSearchQuery, setRoomSearchQuery] = useState(''); 
    const [categoryFilter, setCategoryFilter] = useState('All'); // NEW: Category Filter State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const dropdownRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);

    const scroll = (direction) => {
        const { current } = scrollContainerRef;
        if (current) {
            const scrollAmount = 300;
            current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    // Extract unique categories for the new dropdown filter
    const uniqueCategories = useMemo(() => {
        const cats = rooms.map(r => r.category?.name || 'Uncategorized');
        return [...new Set(cats)].sort();
    }, [rooms]);

    // Apply Search AND Category filters
    const filteredAndSortedRooms = useMemo(() => {
        let filtered = rooms.filter(r => {
            const query = roomSearchQuery.toLowerCase();
            const categoryName = r.category?.name || 'Uncategorized';
            
            const matchesSearch = r.room_location.toLowerCase().includes(query) || r.room_rate.toString().includes(query);
            const matchesCategory = categoryFilter === 'All' || categoryName === categoryFilter;
            
            return matchesSearch && matchesCategory;
        });
        return filtered.sort((a, b) => (a.status === 'Available' ? -1 : 1));
    }, [rooms, roomSearchQuery, categoryFilter]);

    const filteredPatients = useMemo(() => {
        const query = searchTerm.toLowerCase();

        let filtered = patients.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.patient_id?.toLowerCase().includes(query)
        );

        return filtered.sort((a, b) => {
            const aAdmitted = a.status === 'ADMITTED';
            const bAdmitted = b.status === 'ADMITTED';

            if (aAdmitted !== bAdmitted) return aAdmitted ? 1 : -1;
            return a.name.localeCompare(b.name);
        });
    }, [searchTerm, patients]);

    const validate = () => {
        let isValid = true;
        clearErrors();
        const required = ['patient_id', 'admission_date', 'staff_id', 'room_id', 'diagnosis', 'monthly_rate'];
        
        required.forEach(field => {
            if (!data[field]) {
                setError(field, 'Field required.');
                isValid = false;
            }
        });

        if (data.admission_date) {
            const selectedDate = new Date(data.admission_date);
            if (selectedDate > now) {
                setError('admission_date', 'Admission date cannot be in the future.');
                isValid = false;
            }
        }
        return isValid;
    };

    const submit = (e) => {
        e.preventDefault();
        if (validate()) {
            post(route('admin.admissions.store'), {
                onSuccess: () => {
                    if (onSuccess) onSuccess('Patient Admission Confirmed!');
                    handleModalClose();
                },
                onError: (err) => {
                    const firstMsg = Object.values(err)[0];
                    setModalError({ show: true, message: `Admission Failed: ${firstMsg}` });
                }
            });
        } else {
            setModalError({ show: true, message: 'Please complete all admission requirements.' });
        }
    };

    const handleModalClose = () => {
        reset();
        setSearchTerm('');
        setRoomSearchQuery('');
        setCategoryFilter('All');
        setIsDropdownOpen(false);
        setModalError({ show: false, message: '' });
        onClose();
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors bg-white ${
        error ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, required = true, fieldError }) => (
        <label className={`text-[10px] font-black uppercase tracking-tighter mb-1.5 block ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
            {text} {required && <span className="text-red-600 font-bold">*</span>}
        </label>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {modalError.show && (
                <Toast 
                    message={modalError.message} 
                    type="error" 
                    onClose={() => setModalError({ ...modalError, show: false })} 
                />
            )}

            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in duration-150">
                
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-5 flex justify-between items-center shrink-0 shadow-md">
                    <div>
                        <h3 className="font-black text-lg md:text-xl leading-none uppercase tracking-tight">Patient Admission</h3>
                        <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1.5 font-bold">Configure Placement & Attending Staff</p>
                    </div>
                    <button onClick={handleModalClose} className="text-2xl hover:text-red-200 transition-colors leading-none">&times;</button>
                </div>

                {/* Form Body  */}
                <form onSubmit={submit} className="flex flex-col overflow-hidden">
                    <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 scrollbar-thin scrollbar-thumb-slate-200">
                        
                        {/* IDENTIFY PATIENT */}
                        <div className="relative" ref={dropdownRef}>
                            <Label text="Search & Identify Patient" fieldError={errors.patient_id} />
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Type name or Patient ID..."
                                    className={inputClass(errors.patient_id)}
                                    value={searchTerm}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                                />
                                {data.patient_id && !errors.patient_id && <span className="absolute right-3 top-2.5 text-emerald-500">✓</span>}
                            </div>
                            
                            {isDropdownOpen && (
                                <div className="absolute z-[60] w-full mt-1 bg-white border rounded shadow-2xl max-h-56 overflow-y-auto border-slate-200 animate-in slide-in-from-top-2">
                                    {filteredPatients.length > 0 ? (
                                        filteredPatients.map(p => {
                                            const isAdmitted = p.status === 'ADMITTED';
                                            return (
                                                <button 
                                                    key={p.id} 
                                                    type="button" 
                                                    disabled={isAdmitted}
                                                    className={`w-full text-left px-4 py-3 text-sm border-b flex justify-between items-center transition-colors ${isAdmitted ? 'bg-slate-50 cursor-not-allowed opacity-70' : 'hover:bg-blue-50 bg-white'}`} 
                                                    onClick={() => { setData('patient_id', p.id); setSearchTerm(p.name); setIsDropdownOpen(false); }}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${isAdmitted ? 'text-slate-400' : 'text-slate-800'}`}>{p.name}</span>
                                                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">ID: {p.patient_id}</span>
                                                    </div>
                                                    <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase border ${isAdmitted ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                        {isAdmitted ? 'Already Admitted' : 'Available'}
                                                    </span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-slate-400 text-xs italic">No matching records found.</div>
                                    )}
                                </div>
                            )}
                            {errors.patient_id && <p className="text-red-500 text-[9px] font-bold italic mt-1 uppercase">{errors.patient_id}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label text="Admission Timestamp" fieldError={errors.admission_date} />
                            <div>
                                <DatePicker 
                                    // label="Admission Timestamp"
                                    value={data.admission_date}
                                    onChange={(val) => setData('admission_date', val)}
                                    maxDate={new Date()} // Prevents future dates
                                    dateFormat="yyyy-MM-dd"
                                    error={errors.admission_date}
                                    required
                                />
                            </div>
                                {errors.admission_date && <p className="text-red-500 text-[9px] font-bold italic mt-1 uppercase">{errors.admission_date}</p>}
                            </div>
                            <div>
                                <Label text="Attending Physician" fieldError={errors.staff_id} />
                                <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} className={inputClass(errors.staff_id)}>
                                    <option value="">-- Select Physician --</option>
                                    {doctors?.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>)}
                                </select>
                                {errors.staff_id && <p className="text-red-500 text-[9px] font-bold italic mt-1 uppercase">{errors.staff_id}</p>}
                            </div>
                        </div>

                        {/* ROOM CAROUSEL W/ CATEGORY FILTERS */}
                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                                <div className="w-full sm:max-w-lg">
                                    <Label text="Facility Placement (Select Room)" fieldError={errors.room_id} />
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Search bed or price..."
                                            className="w-1/2 border-slate-300 rounded-lg px-3 py-1.5 text-[11px] focus:ring-[#3D52A0] shadow-sm"
                                            value={roomSearchQuery}
                                            onChange={(e) => setRoomSearchQuery(e.target.value)}
                                        />
                                        <select 
                                            className="w-1/2 border-slate-300 rounded-lg px-2 py-1.5 text-[11px] focus:ring-[#3D52A0] shadow-sm font-bold text-slate-600"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="All">All Wards / Categories</option>
                                            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <Link href="/admin/rooms" className="text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 transition-all mt-2 sm:mt-0">Manage Rooms ↗</Link>
                            </div>

                            <div className="relative group px-1">
                                <button type="button" onClick={() => scroll('left')} className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-full w-8 h-8 hidden md:flex items-center justify-center text-slate-600 hover:bg-[#3D52A0] hover:text-white transition-all opacity-0 group-hover:opacity-100">❮</button>

                                <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {filteredAndSortedRooms.map(room => {
                                        const isAvailable = room.status === 'Available';
                                        const isSelected = data.room_id === room.id;
                                        const catName = room.category?.name || 'Uncategorized';

                                        return (
                                            <button
                                                key={room.id} type="button" disabled={!isAvailable}
                                                onClick={() => {
                                                    setData({
                                                        ...data,
                                                        room_id: room.id,
                                                        monthly_rate: room.room_rate
                                                    });
                                                }}
                                                className={`min-w-[170px] md:min-w-[200px] snap-start p-4 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between ${isSelected ? 'border-[#3D52A0] bg-blue-50 ring-4 ring-blue-50/50' : isAvailable ? 'border-slate-100 bg-white hover:border-slate-300 shadow-sm' : 'border-slate-50 bg-slate-50 opacity-50 cursor-not-allowed'}`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>{room.status}</span>
                                                        {isSelected && <span className="bg-[#3D52A0] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg animate-in zoom-in">✓</span>}
                                                    </div>
                                                    
                                                    {/* NEW: Displays the category inside the card */}
                                                    <p className="text-[9px] text-[#3D52A0] font-black uppercase tracking-widest mb-1 mt-2 truncate">{catName}</p>
                                                    <p className="font-bold text-slate-800 text-sm line-clamp-1 uppercase tracking-tighter">{room.room_location}</p>
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-base font-black text-[#3D52A0]">₱{parseFloat(room.room_rate).toLocaleString()}</p>
                                                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Monthly Rate</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {filteredAndSortedRooms.length === 0 && (
                                        <div className="text-[11px] font-bold text-slate-400 py-4 italic">No rooms match your filters.</div>
                                    )}
                                </div>
                                <button type="button" onClick={() => scroll('right')} className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur shadow-xl border border-slate-200 rounded-full w-8 h-8 hidden md:flex items-center justify-center text-slate-600 hover:bg-[#3D52A0] hover:text-white transition-all opacity-0 group-hover:opacity-100">❯</button>
                            </div>
                            {errors.room_id && <p className="text-red-500 text-[9px] font-bold italic mt-1 uppercase">{errors.room_id}</p>}
                        </div>

                        {/* ROOM RATE CONFIGURATION WITH NEGATIVE VALUE BLOCKER */}
                        {data.room_id && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-top-2">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex-1">
                                        <Label text="Agreed Monthly Rate" fieldError={errors.monthly_rate} />
                                        <p className="text-[10px] text-slate-500 lowercase italic mb-2">
                                            Default rate applied. You may modify this for this specific admission.
                                        </p>
                                    </div>
                                    <div className="relative w-full md:w-48">
                                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₱</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            min="0" // Prevents HTML submission
                                            onKeyDown={(e) => {
                                                // Actively blocks typing minus, plus, and 'e' characters
                                                if (['-', '+', 'e', 'E'].includes(e.key)) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className={`${inputClass(errors.monthly_rate)} pl-7 font-black text-blue-700 text-lg`}
                                            value={data.monthly_rate}
                                            onChange={e => setData('monthly_rate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                {errors.monthly_rate && <p className="text-red-500 text-[9px] font-bold italic mt-1 uppercase text-right">{errors.monthly_rate}</p>}
                            </div>
                        )}

                        <div>
                            <Label text="Initial Diagnosis / Notes" fieldError={errors.diagnosis} />
                            <textarea value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} className={`${inputClass(errors.diagnosis)} h-24 resize-none`} placeholder="Enter clinical reason for admission..." />
                            {errors.diagnosis && <p className="text-red-500 text-[9px] font-bold italic mt-1 uppercase">{errors.diagnosis}</p>}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                        <Button type="button" variant="gray" onClick={handleModalClose} className="w-full sm:w-auto px-6 py-2.5 font-black text-[10px] uppercase tracking-widest">Cancel</Button>
                        <Button type="submit" variant="success" onClick={submit} disabled={processing || !data.room_id} className="w-full sm:w-auto px-10 py-2.5 font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50">
                            {processing ? 'Processing...' : 'Confirm Admission'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}