import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import Label from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import Button from '@/Components/Button';
import axios from 'axios';

export default function AddOutpatientModal({ isOpen, onClose }) {
    const [patients, setPatients] = useState([]);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        blood_pressure: '',
        heart_rate: '',
        temperature: '',
        weight: '',
        reason: '',
    });

    // Fetch master list directly when modal opens
    useEffect(() => {
        if (isOpen) {
            axios.get(route('doctor.patients.list'))
                .then(res => setPatients(res.data.selectablePatients))
                .catch(err => console.error("Error loading registry profiles", err));
        }
    }, [isOpen]);

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('doctor.outpatients.store'), {
            onSuccess: () => handleClose(),
        });
    };

    return (
        <Modal show={isOpen} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit} noValidate>
                <div className="bg-[#3D52A0] text-white px-6 py-4 shadow-md flex justify-between items-center">
                    <div>
                        <h3 className="font-black uppercase tracking-tight text-sm">Register Outpatient Visit</h3>
                        <p className="text-[10px] text-blue-100 uppercase tracking-widest italic mt-0.5">Doctor Direct Check-In</p>
                    </div>
                    <button type="button" onClick={handleClose} className="text-2xl font-light hover:text-red-300">&times;</button>
                </div>

                <div className="p-6 space-y-4 bg-white text-slate-800">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Select Registered Patient *</label>
                        <select 
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-[#3D52A0]"
                            value={data.patient_id}
                            onChange={e => setData('patient_id', e.target.value)}
                        >
                            <option value="">-- Choose Profile --</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                            ))}
                        </select>
                        <InputError message={errors.patient_id} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Visit Date</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                value={data.visit_date}
                                onChange={e => setData('visit_date', e.target.value)}
                            />
                            <InputError message={errors.visit_date} className="mt-1" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Blood Pressure</label>
                            <input 
                                type="text" 
                                placeholder="120/80"
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                                value={data.blood_pressure}
                                onChange={e => setData('blood_pressure', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Pulse (bpm)</label>
                            <input 
                                type="text" placeholder="72"
                                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                                value={data.heart_rate}
                                onChange={e => setData('heart_rate', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Temp (°C)</label>
                            <input 
                                type="text" placeholder="36.5"
                                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                                value={data.temperature}
                                onChange={e => setData('temperature', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Weight (kg)</label>
                            <input 
                                type="text" placeholder="60"
                                className="w-full border border-slate-300 rounded px-3 py-1.5 text-sm"
                                value={data.weight}
                                onChange={e => setData('weight', e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Reason for Visit *</label>
                        <textarea 
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm h-20 resize-none"
                            placeholder="Symptoms or primary clinical complaint..."
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                        />
                        <InputError message={errors.reason} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={handleClose}>Cancel</SecondaryButton>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-[#3D52A0] text-white font-black uppercase text-[10px] px-6 tracking-widest"
                        >
                            {processing ? 'SAVING...' : 'Log Visit'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}