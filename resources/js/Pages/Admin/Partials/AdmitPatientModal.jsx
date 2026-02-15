import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
import Button from '@/Components/Button'; 
import Toast from '@/Components/Toast'; 

export default function AdmitPatientModal({ isOpen, onClose, patients = [], rooms = [], doctors = [] }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        patient_id: '',
        admission_date: '',
        staff_id: '', 
        room_id: '', 
        diagnosis: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    const [searchTerm, setSearchTerm] = useState('');
    const [roomSearchQuery, setRoomSearchQuery] = useState(''); 
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

    const filteredAndSortedRooms = useMemo(() => {
        let filtered = rooms.filter(r => {
            const query = roomSearchQuery.toLowerCase();
            return r.room_location.toLowerCase().includes(query) || 
                   r.room_rate.toString().includes(query);
        });

        // Sorting: Available rooms first
        return filtered.sort((a, b) => {
            if (a.status === 'Available' && b.status !== 'Available') return -1;
            if (a.status !== 'Available' && b.status === 'Available') return 1;
            return 0;
        });
    }, [rooms, roomSearchQuery]);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.id_no?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, patients]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.admissions.store'), {
            onSuccess: () => {
                setToastInfo({ show: true, message: 'Patient Admission Confirmed!', type: 'success' });
                handleModalClose();
            },
        });
    };

    const handleModalClose = () => {
        reset();
        setSearchTerm('');
        setRoomSearchQuery('');
        setIsDropdownOpen(false);
        onClose();
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors bg-white ${
        error ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, required = true }) => (
        <label className="text-[10px] font-black uppercase tracking-tighter text-slate-500 mb-1.5 block">
            {text} {required && <span className="text-red-600">*</span>}
        </label>
    );

    return (
        <>
            {toastInfo.show && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, show: false })} />}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
                        
                        <div className="bg-[#3D52A0] text-white p-5 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-xl leading-none uppercase tracking-tight">Patient Admission</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1.5 font-medium">Configure Placement & Attending Staff</p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-red-300 transition-colors">&times;</button>
                        </div>

                        <form onSubmit={submit} className="p-8 overflow-y-auto space-y-6 text-slate-800 scrollbar-thin">
                            {/* IDENTIFY PATIENT */}
                            <div className="relative" ref={dropdownRef}>
                                <Label text="Identify Patient" />
                                <input 
                                    type="text"
                                    placeholder="Search name or ID..."
                                    className={inputClass(errors.patient_id)}
                                    value={searchTerm}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                                />
                                {isDropdownOpen && (
                                    <div className="absolute z-[60] w-full mt-1 bg-white border rounded shadow-2xl max-h-40 overflow-y-auto">
                                        {filteredPatients.map(p => (
                                            <button key={p.id} type="button" className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b flex justify-between items-center" onClick={() => { setData('patient_id', p.id); setSearchTerm(p.name); setIsDropdownOpen(false); }}>
                                                <span className="font-bold">{p.name}</span>
                                                <span className="text-[10px] font-mono text-slate-400">{p.patient_id}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label text="Admission Timestamp" />
                                    <input type="datetime-local" max={currentDateTime} value={data.admission_date} onChange={e => setData('admission_date', e.target.value)} className={inputClass(errors.admission_date)} />
                                </div>
                                <div>
                                    <Label text="Attending Physician" />
                                    <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} className={inputClass(errors.staff_id)}>
                                        <option value="">Select Doctor</option>
                                        {doctors?.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* --- ROOM SELECTION CAROUSEL --- */}
                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex-1 max-w-xs">
                                        <Label text="Select Room" />
                                        <input 
                                            type="text" 
                                            placeholder="Search name or price (e.g. 1500)..."
                                            className="w-full border-slate-300 rounded-full px-4 py-1.5 text-[11px] focus:ring-[#3D52A0]"
                                            value={roomSearchQuery}
                                            onChange={(e) => setRoomSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Link href="/admin/rooms" className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-widest self-end pb-1">
                                        Manage Rooms ↗
                                    </Link>
                                </div>

                                <div className="relative group px-2">
                                    {/* Left Arrow Button */}
                                    <button 
                                        type="button" 
                                        onClick={() => scroll('left')} 
                                        className="absolute left-[-15px] top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        ❮
                                    </button>

                                    {/* Carousel Container */}
                                    <div 
                                        ref={scrollContainerRef}
                                        className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar"
                                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                    >
                                        {filteredAndSortedRooms.map(room => {
                                            const isAvailable = room.status === 'Available';
                                            const isSelected = data.room_id === room.id;

                                            return (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    disabled={!isAvailable}
                                                    onClick={() => setData('room_id', room.id)}
                                                    className={`min-w-[190px] snap-start p-4 rounded-xl border-2 text-left transition-all relative ${
                                                        isSelected 
                                                        ? 'border-[#3D52A0] bg-blue-50 ring-4 ring-blue-50' 
                                                        : isAvailable 
                                                            ? 'border-slate-100 bg-white hover:border-slate-300 shadow-sm' 
                                                            : 'border-slate-50 bg-slate-50 opacity-50 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                            isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                            {room.status}
                                                        </span>
                                                        {isSelected && <span className="bg-[#3D52A0] text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">✓</span>}
                                                    </div>
                                                    <p className="font-bold text-slate-800 text-sm line-clamp-1 uppercase tracking-tighter">{room.room_location}</p>
                                                    <p className="text-base font-black text-[#3D52A0] mt-1">₱{parseFloat(room.room_rate).toLocaleString()}</p>
                                                    <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Rate / Day</p>
                                                </button>
                                            );
                                        })}
                                        {filteredAndSortedRooms.length === 0 && (
                                            <div className="w-full py-8 text-center text-slate-400 italic text-xs border-2 border-dashed border-slate-100 rounded-xl">No matching rooms found.</div>
                                        )}
                                    </div>

                                    {/* Right Arrow Button */}
                                    <button 
                                        type="button" 
                                        onClick={() => scroll('right')} 
                                        className="absolute right-[-15px] top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border border-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        ❯
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label text="Initial Diagnosis" />
                                <textarea value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} className={`${inputClass(errors.diagnosis)} h-24 resize-none`} placeholder="Describe reason for admission..." />
                            </div>
                        </form>

                        <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 shadow-inner">
                            <Button type="button" variant="gray" onClick={handleModalClose} className="px-6 py-2.5 uppercase font-black text-[10px] tracking-widest">Cancel</Button>
                            <Button type="submit" variant="success" onClick={submit} disabled={processing || !data.room_id} className="px-10 py-2.5 uppercase font-black text-[10px] tracking-widest shadow-lg">
                                {processing ? 'Processing...' : 'Confirm Admission'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}