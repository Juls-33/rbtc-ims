import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
// --- ADDED Button Import ---
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.id_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.patient_id?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, patients]);

    const validate = () => {
        let isValid = true;
        clearErrors();
        const required = ['patient_id', 'admission_date', 'staff_id', 'room_id', 'diagnosis'];
        required.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                setError(field, 'Required field.');
                isValid = false;
            }
        });
        return isValid;
    };

    const handleModalClose = () => {
        reset();
        setSearchTerm('');
        setIsDropdownOpen(false);
        clearErrors();
        onClose();
    };

    const submit = (e) => {
        e.preventDefault();
        if (validate()) {
            post(route('admin.admissions.store'), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Patient Admission Confirmed!', type: 'success' });
                    handleModalClose();
                },
            });
        }
    };

    const selectedRoom = useMemo(() => {
        return rooms.find(r => r.id === parseInt(data.room_id));
    }, [data.room_id, rooms]);

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors bg-white ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, current, max, required = true, fieldError }) => (
        <div className="flex justify-between items-center mb-1">
            <label className={`text-[10px] font-black uppercase tracking-tighter ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600 font-bold">*</span>}
            </label>
        </div>
    );

    return (
        <>
            {toastInfo.show && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, show: false })} />}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center shadow-md">
                            <div>
                                <h3 className="font-bold text-lg leading-none uppercase tracking-tight">Admit Patient</h3>
                                <p className="text-[10px] text-blue-100 uppercase tracking-widest mt-1">Assign Room and Physician</p>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl hover:text-slate-200 transition-colors">&times;</button>
                        </div>

                        <form onSubmit={submit} className="p-6 overflow-y-auto space-y-6 text-slate-800">
                            <div className="relative" ref={dropdownRef}>
                                <Label text="Select Patient" fieldError={errors.patient_id} />
                                <div className="relative">
                                    <input 
                                        type="text"
                                        placeholder="Search by Name or ID..."
                                        className={inputClass(errors.patient_id)}
                                        value={searchTerm}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                                    />
                                    {searchTerm && (
                                        <button type="button" onClick={() => { setSearchTerm(''); setData('patient_id', ''); }} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold">✕</button>
                                    )}
                                </div>
                                {isDropdownOpen && (
                                    <div className="absolute z-[60] w-full mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-48 overflow-y-auto">
                                        {filteredPatients.map(p => (
                                            <button key={p.id} type="button" className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex justify-between items-center group" onClick={() => { setData('patient_id', p.id); setSearchTerm(p.name); setIsDropdownOpen(false); }}>
                                                <span className="font-bold text-slate-700">{p.name}</span>
                                                <span className="text-[10px] font-mono text-slate-400">{p.patient_id || p.id_no}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <Label text="Admission Date/Time" fieldError={errors.admission_date} />
                                    <input type="datetime-local" max={currentDateTime} value={data.admission_date} onChange={e => setData('admission_date', e.target.value)} className={inputClass(errors.admission_date)} />
                                </div>
                                <div>
                                    <Label text="Attending Physician" fieldError={errors.staff_id} />
                                    <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} className={inputClass(errors.staff_id)}>
                                        <option value="">Select Doctor</option>
                                        {doctors?.map(doc => <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label text="Reason for Admission" fieldError={errors.diagnosis} />
                                <textarea value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} className={`${inputClass(errors.diagnosis)} h-24 resize-none`} placeholder="Chief complaint..." />
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <Label text="Room / Ward" fieldError={errors.room_id} />
                                <select value={data.room_id} onChange={e => setData('room_id', e.target.value)} className={inputClass(errors.room_id)}>
                                    <option value="">Select Location</option>
                                    {rooms?.filter(r => r.status === 'Available').map(room => (
                                        <option key={room.id} value={room.id}>{room.room_location} (₱{room.room_rate}/day)</option>
                                    ))}
                                </select>
                                <div className="mt-1 flex justify-end">
                                    {/* Link component handles the navigation */}
                                    <Link href="/admin/rooms" className="text-[9px] font-bold text-blue-600 hover:underline uppercase">Manage Room Availability ↗</Link>
                                </div>
                                {selectedRoom && (
                                    <div className="mt-3 bg-emerald-50 p-3 border border-emerald-100 rounded-lg flex justify-between items-center">
                                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Daily Rate:</span>
                                        <span className="font-bold text-emerald-800 text-sm">Php {selectedRoom.room_rate}</span>
                                    </div>
                                )}
                            </div>
                        </form>

                        {/* --- FOOTER: Using the Button Component --- */}
                        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="gray" 
                                onClick={handleModalClose} 
                                className="px-6 py-2 uppercase font-black text-[10px] tracking-widest"
                            >
                                Cancel
                            </Button>
                            
                            <Button 
                                type="submit" 
                                variant="success" 
                                onClick={submit}
                                disabled={processing} 
                                className="px-8 py-2 uppercase font-black text-[10px] tracking-widest shadow-md"
                            >
                                {processing ? 'Admitting...' : 'Confirm Admission'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}