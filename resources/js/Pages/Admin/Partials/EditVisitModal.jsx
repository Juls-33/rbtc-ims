import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function EditVisitModal({ isOpen, onClose, visit }) {
    const { data, setData, put, processing, reset, errors } = useForm({
        visit_date: '',
        weight: '',
        reason: '',
    });

    // Pre-fill data when a visit is selected
    useEffect(() => {
        if (visit) {
            setData({
                visit_date: visit.date || '',
                weight: visit.weight?.replace('KG', '') || '',
                reason: visit.reason || '',
            });
        }
    }, [visit, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.visits.update', visit.id), {
            onSuccess: () => onClose(),
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 font-sans">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Edit Patient Visit</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-200">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Visit Date</label>
                        <input 
                            type="date"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.visit_date}
                            onChange={e => setData('visit_date', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Weight</label>
                        <input 
                            type="text"
                            placeholder="Value"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.weight}
                            onChange={e => setData('weight', e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm font-bold text-slate-700">Reason for Visit</label>
                        <input 
                            type="text"
                            placeholder="Value"
                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-[#3D52A0] outline-none"
                            value={data.reason}
                            onChange={e => setData('reason', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-sm uppercase">CANCEL</button>
                        <button type="submit" disabled={processing} className="px-8 py-2 bg-[#488D6A] text-white rounded font-bold text-sm uppercase">UPDATE</button>
                    </div>
                </form>
            </div>
        </div>
    );
}