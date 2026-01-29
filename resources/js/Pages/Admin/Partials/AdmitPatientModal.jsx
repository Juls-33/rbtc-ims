// resources/js/Pages/Admin/Partials/AdmitPatientModal.jsx

import React, { useMemo } from 'react';
import { useForm } from '@inertiajs/react';

export default function AdmitPatientModal({ isOpen, onClose, patients = [], rooms = [], doctors = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        admission_date: '',
        staff_id: '', 
        room_id: '', 
        diagnosis: '',
    });

    // Logic to find the selected room and display its rate
    const selectedRoom = useMemo(() => {
        return rooms.find(r => r.id === parseInt(data.room_id));
    }, [data.room_id, rooms]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.admissions.store'), {
            onSuccess: () => { reset(); onClose(); },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Admit Patient</h3>
                    <button onClick={onClose} className="text-2xl hover:text-red-200 transition-colors leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    {/* Patient Selection */}
                    <div>
                        <label className="block text-xs font-semibold mb-1 uppercase text-slate-500">Select Patient</label>
                        <select value={data.patient_id} onChange={e => setData('patient_id', e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
                            <option value="">Choose a patient...</option>
                            {patients?.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {errors.patient_id && <p className="text-red-500 text-[10px] mt-1">{errors.patient_id}</p>}
                    </div>

                    {/* Section 1: Admission Details */}
                    <div className="space-y-4 pt-2">
                        <h4 className="font-bold border-b pb-1 text-[#3D52A0] text-sm">1. Admission Details</h4>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Date and Time of Admission</label>
                            <input type="datetime-local" value={data.admission_date} onChange={e => setData('admission_date', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Attending Physician</label>
                            <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
                                <option value="">Select Doctor</option>
                                {doctors?.map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Initial Diagnosis/Complaint</label>
                            <textarea value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} className="w-full border rounded px-3 py-2 text-sm h-20" placeholder="Reason for admission..." />
                        </div>
                    </div>

                    {/* Section 2: Location of Stay */}
                    <div className="space-y-2 pt-2">
                        <h4 className="font-bold border-b pb-1 text-[#3D52A0] text-sm">2. Location of Stay</h4>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Room/Location</label>
                            <select value={data.room_id} onChange={e => setData('room_id', e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
                                <option value="">Select Location</option>
                                {rooms?.map(room => (
                                    <option key={room.id} value={room.id}>{room.room_location}</option>
                                ))}
                            </select>
                        </div>
                        {selectedRoom && (
                            <div className="bg-slate-50 p-2 border rounded">
                                <p className="text-xs text-slate-600">
                                    Location Rate: <span className="font-bold text-slate-800">Php {selectedRoom.room_rate} per day</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase">Cancel</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold text-sm uppercase shadow-md hover:bg-emerald-700">
                            {processing ? 'Processing...' : 'Confirm Admission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}