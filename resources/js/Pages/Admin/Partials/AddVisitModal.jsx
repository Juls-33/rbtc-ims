// resources/js/Pages/Admin/Partials/AddVisitModal.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';

export default function AddVisitModal({ isOpen, onClose, patients }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0], // Default to today
        weight: '',
        reason: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.visits.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 font-sans">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Add Patient Visit</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Select Patient */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Select Patient</label>
                        <select 
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.patient_id}
                            onChange={e => setData('patient_id', e.target.value)}
                            required
                        >
                            <option value="">Select Patient Name</option>
                            {patients.map(patient => (
                                <option key={patient.id} value={patient.id}>{patient.name}</option>
                            ))}
                        </select>
                        {errors.patient_id && <p className="text-rose-600 text-xs">{errors.patient_id}</p>}
                    </div>

                    {/* Visit Date */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Visit Date</label>
                        <input 
                            type="date"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.visit_date}
                            onChange={e => setData('visit_date', e.target.value)}
                            required
                        />
                        {errors.visit_date && <p className="text-rose-600 text-xs">{errors.visit_date}</p>}
                    </div>

                    {/* Weight */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Weight</label>
                        <input 
                            type="number"
                            placeholder="Value"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.weight}
                            onChange={e => setData('weight', e.target.value)}
                        />
                        {errors.weight && <p className="text-rose-600 text-xs">{errors.weight}</p>}
                    </div>

                    {/* Reason for Visit */}
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Reason for Visit</label>
                        <input 
                            type="text"
                            placeholder="Value"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                            required
                        />
                        {errors.reason && <p className="text-rose-600 text-xs">{errors.reason}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={onClose} 
                            className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase shadow hover:bg-slate-600 transition-colors"
                        >
                            CANCEL
                        </button>
                        <button 
                            type="submit"
                            disabled={processing}
                            className="px-8 py-2 bg-[#488D6A] text-white rounded font-bold text-sm uppercase shadow hover:bg-[#3B7557] transition-colors"
                        >
                            {processing ? 'SAVING...' : 'SAVE'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}