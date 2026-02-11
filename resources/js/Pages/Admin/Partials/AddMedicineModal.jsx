// resources/js/Pages/Admin/Partials/AddMedicineModal.jsx

import React, { useState, useEffect, useMemo } from 'react'; 
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function AddMedicineModal({ isOpen, onClose }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors, transform } = useForm({
        generic_name: '',
        brand_name: '',
        category_selection: '', // Dropdown state
        custom_category: '',    // "Other" text state
        dosage_amount: '',
        dosage_unit_selection: 'mg', // Dropdown state
        custom_unit: '',             // "Other" text state
        dosage_form_selection: 'Tablet', // Dropdown state
        custom_form: '',                 // "Other" text state
        reorder_point: 10,
        price_per_unit: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    // --- LOGIC: RESOLVE FINAL VALUES ---
    const finalCategory = data.category_selection === 'Other' ? data.custom_category : data.category_selection;
    const finalUnit = data.dosage_unit_selection === 'Other' ? data.custom_unit : data.dosage_unit_selection;
    const finalForm = data.dosage_form_selection === 'Other' ? data.custom_form : data.dosage_form_selection;
    
    const constructedDosage = `${data.dosage_amount} ${finalUnit} ${finalForm}`.trim();

    // --- LOGIC: SKU GENERATION ---
    const generatedSku = useMemo(() => {
        const cleanText = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const g = cleanText(data.generic_name).substring(0, 4);
        const b = cleanText(data.brand_name).substring(0, 3);
        const d = data.dosage_amount || ''; // Using numeric amount for SKU consistency
        
        return `${g}-${b}-${d}`;
    }, [data.generic_name, data.brand_name, data.dosage_amount]);

    // Send final merged data to Laravel
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

        // "Other" validation
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
                    setToastInfo({ show: true, message: 'Medicine added successfully!', type: 'success' });
                    handleModalClose();
                },
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-150">
                        
                        <div className="bg-[#2E4696] px-6 py-4 flex justify-between items-center text-white">
                            <div>
                                <h2 className="font-black text-lg uppercase leading-none">Add New Medicine</h2>
                                <div className="flex gap-4 mt-1">
                                    <p className="text-[9px] font-bold uppercase opacity-80">Final SKU: <span className="font-mono text-white underline">{generatedSku || '---'}</span></p>
                                    <p className="text-[9px] font-bold uppercase opacity-80">Dosage: <span className="font-mono text-white underline">{constructedDosage || '---'}</span></p>
                                </div>
                            </div>
                            <button onClick={handleModalClose} className="text-2xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label text="Generic Name" fieldError={errors.generic_name} />
                                    <input type="text" value={data.generic_name} onChange={e => setData('generic_name', e.target.value)} className={inputClass(errors.generic_name)} placeholder="e.g. Amoxicillin" />
                                </div>
                                <div>
                                    <Label text="Brand Name" required={false} />
                                    <input type="text" value={data.brand_name} onChange={e => setData('brand_name', e.target.value)} className={inputClass()} placeholder="e.g. Moxx" />
                                </div>
                            </div>

                            {/* --- DOSAGE SECTION --- */}
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                                <div className="grid grid-cols-3 gap-4">
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

                                {/* Custom Unit/Form inputs */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div /> {/* Spacer */}
                                    {data.dosage_unit_selection === 'Other' && (
                                        <div>
                                            <Label text="Specify Unit" fieldError={errors.custom_unit} />
                                            <input type="text" value={data.custom_unit} onChange={e => setData('custom_unit', e.target.value)} className={inputClass(errors.custom_unit)} placeholder="e.g. puff" />
                                        </div>
                                    )}
                                    {data.dosage_form_selection === 'Other' && (
                                        <div className={data.dosage_unit_selection !== 'Other' ? 'col-start-3' : ''}>
                                            <Label text="Specify Form" fieldError={errors.custom_form} />
                                            <input type="text" value={data.custom_form} onChange={e => setData('custom_form', e.target.value)} className={inputClass(errors.custom_form)} placeholder="e.g. Patch" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* --- CATEGORY SECTION --- */}
                                <div>
                                    <Label text="Category" fieldError={errors.category_selection} />
                                    <select value={data.category_selection} onChange={e => setData('category_selection', e.target.value)} className={inputClass(errors.category_selection)}>
                                        <option value="">Select Category</option>
                                        <option value="Antibiotic">Antibiotic</option>
                                        <option value="Analgesic">Analgesic</option>
                                        <option value="Other">Other...</option>
                                    </select>
                                    {data.category_selection === 'Other' && (
                                        <div className="mt-2">
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

                            <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button type="button" variant="gray" onClick={handleModalClose} className="px-6 py-2 uppercase font-black text-[10px]">Cancel</Button>
                                <Button type="submit" variant="success" disabled={processing} className="px-8 py-2 uppercase font-black text-[10px] shadow-md">
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