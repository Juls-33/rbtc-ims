// resources/js/Pages/Admin/Partials/EditMedicineModal.jsx

import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function EditMedicineModal({ isOpen, onClose, medicine }) {
    const { data, setData, put, processing, errors, reset, setError, clearErrors } = useForm({
        generic_name: '',
        brand_name: '',
        category: '',
        dosage: '',
        reorder_point: '',
        price_per_unit: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    // --- Data Loading Logic ---
    useEffect(() => {
        if (medicine && isOpen) {
            setData({
                generic_name: medicine.name || '',
                brand_name: medicine.brand_name || '',
                category: medicine.category || '',
                dosage: medicine.dosage || '',
                reorder_point: medicine.reorder_point || 0,
                price_per_unit: medicine.price || 0,
            });
        }
    }, [medicine, isOpen]);

    // --- Passive Validation on Submit ---
    const validate = () => {
        let isValid = true;
        clearErrors();

        const requiredFields = ['generic_name', 'category', 'dosage', 'price_per_unit'];
        requiredFields.forEach(field => {
            if (!data[field] || data[field].toString().trim() === '') {
                setError(field, 'Required field.');
                isValid = false;
            }
        });

        if (parseFloat(data.price_per_unit) < 0) {
            setError('price_per_unit', 'Price cannot be negative.');
            isValid = false;
        }

        if (parseInt(data.reorder_point) < 0) {
            setError('reorder_point', 'Reorder point cannot be negative.');
            isValid = false;
        }

        return isValid;
    };

    const handleModalClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!medicine?.id) return;

        if (validate()) {
            put(route('inventory.update', medicine.id), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Medicine entry updated!', type: 'success' });
                    handleModalClose();
                },
                onError: () => {
                    setToastInfo({ show: true, message: 'Update failed. Check inputs.', type: 'error' });
                }
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2.5 text-sm transition-colors ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#E6AA68] focus:border-[#E6AA68]'
    }`;

    const Label = ({ text, current, max, required = true, fieldError }) => (
        <div className="flex justify-between items-center mb-1.5">
            <label className={`text-[10px] font-black uppercase tracking-tighter ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
                {text} {required && <span className="text-red-600 font-bold">*</span>}
            </label>
            {max && (
                <span className={`text-[9px] font-bold ${current > max ? 'text-red-500' : 'text-slate-400'}`}>
                    {current}/{max}
                </span>
            )}
        </div>
    );

    return (
        <>
            {/* Persistent Toast */}
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all animate-in zoom-in duration-200">
                        
                        {/* Header */}
                        <div className="bg-[#E6AA68] px-6 py-4 flex justify-between items-center border-b border-[#ca8a04] shadow-sm">
                            <div>
                                <h2 className="text-[#5c3a00] font-black text-lg tracking-tight uppercase leading-none">Edit Medicine</h2>
                                <p className="text-[#78350f] text-[10px] font-mono mt-1 font-bold uppercase">SKU: {medicine?.sku || '---'}</p>
                            </div>
                            <button onClick={handleModalClose} className="text-[#5c3a00] hover:text-black text-2xl font-bold leading-none transition-transform hover:scale-110">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 text-slate-800">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                
                                {/* Generic Name */}
                                <div>
                                    <Label text="Generic Name" current={data.generic_name.length} max={100} fieldError={errors.generic_name} />
                                    <input 
                                        type="text" 
                                        maxLength={100}
                                        value={data.generic_name}
                                        onChange={e => setData('generic_name', e.target.value)}
                                        className={inputClass(errors.generic_name)}
                                        placeholder="e.g., Paracetamol"
                                    />
                                    {errors.generic_name && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.generic_name}</p>}
                                </div>
                                
                                {/* Brand Name */}
                                <div>
                                    <Label text="Brand Name" current={data.brand_name.length} max={100} required={false} fieldError={errors.brand_name} />
                                    <input 
                                        type="text" 
                                        maxLength={100}
                                        value={data.brand_name}
                                        onChange={e => setData('brand_name', e.target.value)}
                                        className={inputClass(errors.brand_name)}
                                        placeholder="e.g., Biogesic"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <Label text="Classification" fieldError={errors.category} />
                                    <select 
                                        value={data.category} 
                                        onChange={e => setData('category', e.target.value)}
                                        className={inputClass(errors.category)}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Analgesic">Analgesic</option>
                                        <option value="Vitamin">Vitamin</option>
                                        <option value="Antihistamine">Antihistamine</option>
                                        <option value="Anti-Inflammatory">Anti-Inflammatory</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.category}</p>}
                                </div>

                                {/* Dosage */}
                                <div>
                                    <Label text="Dosage / Form" current={data.dosage.length} max={50} fieldError={errors.dosage} />
                                    <input 
                                        type="text" 
                                        maxLength={50}
                                        value={data.dosage}
                                        onChange={e => setData('dosage', e.target.value)}
                                        className={inputClass(errors.dosage)}
                                        placeholder="e.g., 500mg Tablet"
                                    />
                                    {errors.dosage && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.dosage}</p>}
                                </div>

                                {/* Price */}
                                <div>
                                    <Label text="Price Per Unit" fieldError={errors.price_per_unit} />
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₱</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            value={data.price_per_unit}
                                            onChange={e => setData('price_per_unit', e.target.value)}
                                            className={`${inputClass(errors.price_per_unit)} pl-7`}
                                        />
                                    </div>
                                    {errors.price_per_unit && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.price_per_unit}</p>}
                                </div>

                                {/* Reorder Point */}
                                <div>
                                    <Label text="Low Stock Alert Level" fieldError={errors.reorder_point} />
                                    <input 
                                        type="number" 
                                        value={data.reorder_point}
                                        onChange={e => setData('reorder_point', e.target.value)}
                                        className={inputClass(errors.reorder_point)}
                                        placeholder="0"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase">System will notify when stock hits this level.</p>
                                    {errors.reorder_point && <p className="text-red-500 text-[9px] mt-1 font-bold italic uppercase">{errors.reorder_point}</p>}
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end gap-3 border-t pt-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                                <Button 
                                    type="button" 
                                    variant="gray" 
                                    onClick={handleModalClose}
                                    className="px-6 py-2 bg-slate-500 hover:bg-slate-600 text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </Button>

                                <Button 
                                    type="submit" 
                                    variant="warning" 
                                    disabled={processing}
                                    className="px-8 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 disabled:opacity-50 transition-all"
                                >
                                    {processing ? 'SAVING...' : 'Update Record'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}