// resources/js/Pages/Admin/Partials/EditAdmissionModal.jsx

import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function EditAdmissionModal({ isOpen, onClose, admission, doctors = [], rooms = [] }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        admission_date: '',
        staff_id: '',
        diagnosis: '',
        room_id: '',
    });

    useEffect(() => {
        if (admission && isOpen) {
            setData({
                admission_date: admission.admission_date || '',
                staff_id: admission.staff_id || '',
                diagnosis: admission.diagnosis || '',
                room_id: admission.room_id || '',
            });
        }
    }, [admission, isOpen]);

    const submit = (e) => {
        e.preventDefault();
        if (!admission?.id) return; // Safety check

        put(route('admin.admissions.update', admission.id), {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    {/* FIX: Added optional chaining here */}
                    <h3 className="font-bold text-lg">Edit Admission: {admission?.patient_name || 'Loading...'}</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200 transition-colors">&times;</button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* FIX: Added optional chaining here */}
                    <p className="text-xs font-bold text-slate-500 uppercase">Patient ID: {admission?.patient_id_display || 'N/A'}</p>

                    <div className="space-y-4">
                        <h4 className="font-bold border-b pb-1 text-[#3D52A0] text-sm">1. Admission Details</h4>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Date and Time of Admission</label>
                            <input type="datetime-local" value={data.admission_date} onChange={e => setData('admission_date', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Attending Physician</label>
                            <select value={data.staff_id} onChange={e => setData('staff_id', e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
                                <option value="">Select Doctor</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.first_name} {doc.last_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Diagnosis/Complaint/Consultation</label>
                            <textarea value={data.diagnosis} onChange={e => setData('diagnosis', e.target.value)} className="w-full border rounded px-3 py-2 text-sm h-20" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold border-b pb-1 text-[#3D52A0] text-sm">2. Location of Stay</h4>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Location of Stay</label>
                            <select value={data.room_id} onChange={e => setData('room_id', e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
                                <option value="">Select Room</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.room_location} ({room.status})</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[10px] text-slate-500">Location Rate: Php 2000 per day</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase">Cancel</button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold text-sm uppercase shadow-md hover:bg-emerald-700">
                            {processing ? 'Updating...' : 'Update Admission'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}