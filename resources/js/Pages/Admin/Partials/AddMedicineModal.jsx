// resources/js/Pages/Admin/Partials/AddMedicineModal.jsx

import React, { useState, useEffect, useMemo } from 'react'; 
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function AddMedicineModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors, transform } = useForm({
        generic_name: '',
        brand_name: '',
        category_selection: '', 
        custom_category: '',    
        dosage_amount: '',
        dosage_unit_selection: 'mg', 
        custom_unit: '',             
        dosage_form_selection: 'Tablet', 
        custom_form: '',                 
        reorder_point: 10,
        price_per_unit: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const finalCategory = data.category_selection === 'Other' ? data.custom_category : data.category_selection;
    const finalUnit = data.dosage_unit_selection === 'Other' ? data.custom_unit : data.dosage_unit_selection;
    const finalForm = data.dosage_form_selection === 'Other' ? data.custom_form : data.dosage_form_selection;
    const constructedDosage = `${data.dosage_amount} ${finalUnit} ${finalForm}`.trim();

    const generatedSku = useMemo(() => {
        const cleanText = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const g = cleanText(data.generic_name).substring(0, 4);
        const b = cleanText(data.brand_name).substring(0, 3);
        const d = data.dosage_amount || ''; 
        return `${g}-${b}-${d}`;
    }, [data.generic_name, data.brand_name, data.dosage_amount]);

    useEffect(() => {
        transform((formValues) => ({
            ...formValues,
            category: finalCategory,
            dosage: constructedDosage,
            sku_id: generatedSku,
        }));
    }, [finalCategory, constructedDosage, generatedSku]);

    const validate = () => {
        let isValid = true;
        clearErrors();
        const required = ['generic_name', 'category_selection', 'dosage_amount', 'price_per_unit'];
        required.forEach(f => {
            if (!data[f] || data[f].toString().trim() === '') {
                setError(f, 'Required.');
                isValid = false;
            }
        });
        if (data.category_selection === 'Other' && !data.custom_category) { setError('custom_category', 'Enter category.'); isValid = false; }
        if (data.dosage_unit_selection === 'Other' && !data.custom_unit) { setError('custom_unit', 'Enter unit.'); isValid = false; }
        if (data.dosage_form_selection === 'Other' && !data.custom_form) { setError('custom_form', 'Enter form.'); isValid = false; }
        return isValid;
    };

    const handleModalClose = () => { reset(); clearErrors(); onClose(); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            post(route('inventory.store'), {
                onSuccess: () => {
                    setToastInfo({ 
                        show: true, 
                        message: 'Medicine added successfully!', 
                        type: 'success' 
                    });
                    handleModalClose();
                },
                // 2. Handle Backend/Server Errors
                onError: (err) => {
                    console.error("Backend Error:", err);
                    setToastInfo({ 
                        show: true, 
                        message: 'Submission failed. Please check for duplicate records or server errors.', 
                        type: 'error' 
                    });
                },
            });
        } else {
            // 3. Handle Frontend Validation Failure
            setToastInfo({ 
                show: true, 
                message: 'Please fill in all mandatory fields correctly.', 
                type: 'error' 
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#2E4696] focus:border-[#2E4696]'
    }`;

    const Label = ({ text, required = true, fieldError }) => (
        <label className={`block text-[10px] font-black uppercase tracking-tighter mb-1 ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
            {text} {required && <span className="text-red-600">*</span>}
        </label>
    );

    return (
        <>
            {toastInfo.show && <Toast message={toastInfo.message} type={toastInfo.type} onClose={() => setToastInfo({ ...toastInfo, show: false })} />}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4">
                    {/* 🔥 MODAL CONTAINER: flex flex-col and max-height for scrolling */}
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in duration-150">
                        
                        {/* FIXED HEADER */}
                        <div className="bg-[#2E4696] px-6 py-4 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h2 className="font-black text-base md:text-lg uppercase leading-none">Add New Medicine</h2>
                                <div className="flex flex-wrap gap-2 md:gap-4 mt-2 md:mt-1">
                                    <p className="text-[9px] font-bold uppercase opacity-80">SKU: <span className="font-mono text-white underline">{generatedSku || '---'}</span></p>
                                    <p className="text-[9px] font-bold uppercase opacity-80">Dosage: <span className="font-mono text-white underline">{constructedDosage || '---'}</span></p>
                                </div>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl font-bold leading-none hover:text-red-200 transition-colors">&times;</button>
                        </div>

                        {/* SCROLLABLE FORM BODY */}
                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                                
                                {/* Generic & Brand: Stack on mobile */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <Label text="Generic Name" fieldError={errors.generic_name} />
                                        <input type="text" value={data.generic_name} onChange={e => setData('generic_name', e.target.value)} className={inputClass(errors.generic_name)} placeholder="e.g. Amoxicillin" />
                                    </div>
                                    <div>
                                        <Label text="Brand Name" required={false} />
                                        <input type="text" value={data.brand_name} onChange={e => setData('brand_name', e.target.value)} className={inputClass()} placeholder="e.g. Moxx" />
                                    </div>
                                </div>

                                {/* DOSAGE SECTION */}
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Dosage Configuration</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <Label text="Amount" fieldError={errors.dosage_amount} />
                                            <input type="number" value={data.dosage_amount} onChange={e => setData('dosage_amount', e.target.value)} className={inputClass(errors.dosage_amount)} placeholder="500" />
                                        </div>
                                        <div>
                                            <Label text="Unit" />
                                            <select value={data.dosage_unit_selection} onChange={e => setData('dosage_unit_selection', e.target.value)} className={inputClass()}>
                                                <option value="mg">mg</option>
                                                <option value="g">g</option>
                                                <option value="mL">mL</option>
                                                <option value="Other">Other...</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label text="Form" />
                                            <select value={data.dosage_form_selection} onChange={e => setData('dosage_form_selection', e.target.value)} className={inputClass()}>
                                                <option value="Tablet">Tablet</option>
                                                <option value="Capsule">Capsule</option>
                                                <option value="Syrup">Syrup</option>
                                                <option value="Other">Other...</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Custom Unit/Form inputs: Stack on mobile */}
                                    {(data.dosage_unit_selection === 'Other' || data.dosage_form_selection === 'Other') && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                            {data.dosage_unit_selection === 'Other' && (
                                                <div>
                                                    <Label text="Specify Unit" fieldError={errors.custom_unit} />
                                                    <input type="text" value={data.custom_unit} onChange={e => setData('custom_unit', e.target.value)} className={inputClass(errors.custom_unit)} placeholder="e.g. puff" />
                                                </div>
                                            )}
                                            {data.dosage_form_selection === 'Other' && (
                                                <div>
                                                    <Label text="Specify Form" fieldError={errors.custom_form} />
                                                    <input type="text" value={data.custom_form} onChange={e => setData('custom_form', e.target.value)} className={inputClass(errors.custom_form)} placeholder="e.g. Patch" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* CATEGORY & PRICING */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label text="Category" fieldError={errors.category_selection} />
                                        <select value={data.category_selection} onChange={e => setData('category_selection', e.target.value)} className={inputClass(errors.category_selection)}>
                                            <option value="">Select Category</option>
                                            <option value="Antibiotic">Antibiotic</option>
                                            <option value="Analgesic">Analgesic</option>
                                            <option value="Other">Other...</option>
                                        </select>
                                        {data.category_selection === 'Other' && (
                                            <div className="mt-2 animate-in slide-in-from-top-1">
                                                <input type="text" value={data.custom_category} onChange={e => setData('custom_category', e.target.value)} className={inputClass(errors.custom_category)} placeholder="Enter custom category" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label text="Price/Unit" fieldError={errors.price_per_unit} />
                                            <input type="number" step="0.01" value={data.price_per_unit} onChange={e => setData('price_per_unit', e.target.value)} className={inputClass(errors.price_per_unit)} placeholder="0.00" />
                                        </div>
                                        <div>
                                            <Label text="Reorder Alert" />
                                            <input type="number" value={data.reorder_point} onChange={e => setData('reorder_point', e.target.value)} className={inputClass()} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STICKY FOOTER */}
                            <div className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                                <Button type="button" variant="gray" onClick={handleModalClose} className="w-full sm:w-auto px-6 py-2.5 uppercase font-black text-[10px]">Cancel</Button>
                                <Button type="submit" variant="success" disabled={processing} className="w-full sm:w-auto px-8 py-2.5 uppercase font-black text-[10px] shadow-lg">
                                    {processing ? 'Creating...' : 'Create Medicine'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}