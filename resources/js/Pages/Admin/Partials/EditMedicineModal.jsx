import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function EditMedicineModal({ isOpen, onClose, medicine }) {
    // Initialize form with defaults, but we will update them in useEffect
    const { data, setData, put, processing, errors, reset } = useForm({
        generic_name: '',
        brand_name: '',
        category: '',
        dosage: '',
        reorder_point: '',
        price_per_unit: '',
    });

    // When the modal opens or the 'medicine' prop changes, load the data
    useEffect(() => {
        if (medicine) {
            setData({
                generic_name: medicine.name || '', // Note: In your Index controller you mapped 'generic_name' to 'name'
                brand_name: medicine.brand_name || '', // You need to make sure 'brand_name' is passed from the controller!
                category: medicine.category || '',
                dosage: medicine.dosage || '', // Check if your Index controller passes 'dosage'
                reorder_point: medicine.reorder_point || 0,
                price_per_unit: medicine.price || 0,
            });
        }
    }, [medicine, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // We use the medicine.id for the route
        put(route('inventory.update', medicine.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen || !medicine) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
                
                {/* Header */}
                <div className="bg-[#E6AA68] px-6 py-4 flex justify-between items-center border-b border-[#ca8a04]">
                    <div>
                        <h2 className="text-[#5c3a00] font-bold text-lg tracking-wide uppercase">Edit Medicine</h2>
                        <p className="text-[#78350f] text-xs font-mono mt-0.5">Editing SKU: {medicine.sku}</p>
                    </div>
                    <button onClick={onClose} className="text-[#5c3a00] hover:text-black text-2xl font-bold leading-none">&times;</button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Generic Name */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Generic Name</label>
                            <input 
                                type="text" 
                                value={data.generic_name}
                                onChange={e => setData('generic_name', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#E6AA68] focus:border-[#E6AA68] text-sm py-2.5"
                            />
                            {errors.generic_name && <div className="text-red-500 text-xs mt-1">{errors.generic_name}</div>}
                        </div>
                        
                        {/* Brand Name */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Name</label>
                            <input 
                                type="text" 
                                value={data.brand_name}
                                onChange={e => setData('brand_name', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#E6AA68] focus:border-[#E6AA68] text-sm py-2.5"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                            <select 
                                value={data.category} 
                                onChange={e => setData('category', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#E6AA68] focus:border-[#E6AA68] text-sm py-2.5 bg-white"
                            >
                                <option value="Antibiotic">Antibiotic</option>
                                <option value="Analgesic">Analgesic</option>
                                <option value="Vitamin">Vitamin</option>
                                <option value="Antihistamine">Antihistamine</option>
                                <option value="Anti-Inflammatory">Anti-Inflammatory</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Dosage */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dosage / Form</label>
                            <input 
                                type="text" 
                                value={data.dosage}
                                onChange={e => setData('dosage', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#E6AA68] focus:border-[#E6AA68] text-sm py-2.5"
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Price Per Unit</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400">₱</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={data.price_per_unit}
                                    onChange={e => setData('price_per_unit', e.target.value)}
                                    className="w-full pl-7 border-slate-300 rounded-md shadow-sm focus:ring-[#E6AA68] focus:border-[#E6AA68] text-sm py-2.5"
                                />
                            </div>
                        </div>

                        {/* Reorder Point */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Low Stock Alert</label>
                            <input 
                                type="number" 
                                value={data.reorder_point}
                                onChange={e => setData('reorder_point', e.target.value)}
                                className="w-full border-slate-300 rounded-md shadow-sm focus:ring-[#E6AA68] focus:border-[#E6AA68] text-sm py-2.5"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-md text-sm">CANCEL</button>
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="px-6 py-2.5 bg-[#E6AA68] text-[#5c3a00] font-bold rounded-md text-sm hover:bg-[#d49a5b] transition shadow-md disabled:opacity-50"
                        >
                            {processing ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}