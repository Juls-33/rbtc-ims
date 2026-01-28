import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function AddPatientModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        birth_date: '',
        gender: '',
        civil_status: '',
        contact_no: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_relation: '',
        emergency_contact_number: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.patients.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Register New Patient</h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>

                {/* Form Body */}
                <form onSubmit={submit} className="p-6 overflow-y-auto space-y-6">
                    {/* Section 1: Personal Information */}
                    <div className="space-y-4">
                        <h4 className="font-bold border-b pb-1 text-slate-700">1. Personal Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">First Name</label>
                                <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                                {errors.first_name && <p className="text-red-500 text-[10px] mt-1">{errors.first_name}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Last Name</label>
                                <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Date of Birth</label>
                            <input type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Gender</label>
                                <select value={data.gender} onChange={e => setData('gender', e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Civil Status</label>
                                <select value={data.civil_status} onChange={e => setData('civil_status', e.target.value)} className="w-full border rounded px-3 py-2 text-sm">
                                    <option value="">Select Status</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Contact Details */}
                    <div className="space-y-4">
                        <h4 className="font-bold border-b pb-1 text-slate-700">2. Contact Details</h4>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Phone Number</label>
                            <input type="text" value={data.contact_no} onChange={e => setData('contact_no', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Home Address</label>
                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                    </div>

                    {/* Section 3: Emergency Contact */}
                    <div className="space-y-4">
                        <h4 className="font-bold border-b pb-1 text-slate-700">3. Emergency Contact</h4>
                        <div>
                            <label className="block text-xs font-semibold mb-1">Contact Name</label>
                            <input type="text" value={data.emergency_contact_name} onChange={e => setData('emergency_contact_name', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1">Relationship</label>
                                <input type="text" value={data.emergency_contact_relation} onChange={e => setData('emergency_contact_relation', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1">Contact Number</label>
                                <input type="text" value={data.emergency_contact_number} onChange={e => setData('emergency_contact_number', e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase">Cancel</button>
                    <button onClick={submit} disabled={processing} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold text-sm uppercase">
                        {processing ? 'Saving...' : 'Save Patient Record'}
                    </button>
                </div>
            </div>
        </div>
    );
}