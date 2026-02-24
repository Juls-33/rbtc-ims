// resources/js/Pages/Admin/Partials/EditMedicineModal.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function EditMedicineModal({ isOpen, onClose, medicine }) {
    const standardUnits = ['mg', 'g', 'mL', 'mcg', 'IU'];
    const standardForms = ['Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Cream'];
    const standardCategories = ['Antibiotic', 'Analgesic', 'Vitamin', 'Antihistamine', 'Anti-Inflammatory'];

    const { data, setData, put, processing, errors, reset, setError, clearErrors, transform } = useForm({
        generic_name: '',
        brand_name: '',
        category_selection: '',
        custom_category: '',
        dosage_amount: '',
        dosage_unit_selection: '',
        custom_unit: '',
        dosage_form_selection: '',
        custom_form: '',
        reorder_point: '',
        price_per_unit: '',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const finalCategory = data.category_selection === 'Other' ? data.custom_category : data.category_selection;
    const finalUnit = data.dosage_unit_selection === 'Other' ? data.custom_unit : data.dosage_unit_selection;
    const finalForm = data.dosage_form_selection === 'Other' ? data.custom_form : data.dosage_form_selection;
    const constructedDosage = `${data.dosage_amount} ${finalUnit} ${finalForm}`.trim();

    const generatedSkuPrefix = useMemo(() => {
        const clean = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const g = clean(data.generic_name).substring(0, 4);
        const b = clean(data.brand_name).substring(0, 3);
        const d = (data.dosage_amount || '').toString().replace(/[^0-9]/g, '');
        return `${g}-${b}-${d}`;
    }, [data.generic_name, data.brand_name, data.dosage_amount]);

    useEffect(() => {
        transform((formValues) => ({
            ...formValues,
            category: finalCategory,
            dosage: constructedDosage,
            sku_id: generatedSkuPrefix, 
        }));
    }, [finalCategory, constructedDosage, generatedSkuPrefix]);

    useEffect(() => {
        if (medicine && isOpen) {
            const dosageParts = (medicine.dosage || "").split(" ");
            const amount = dosageParts[0] || "";
            const unit = dosageParts[1] || "";
            const form = dosageParts.slice(2).join(" ") || "";

            const isStandardUnit = standardUnits.includes(unit);
            const isStandardForm = standardForms.includes(form);
            const isStandardCat = standardCategories.includes(medicine.category);

            setData({
                generic_name: medicine.name || '',
                brand_name: medicine.brand_name || '',
                category_selection: isStandardCat ? medicine.category : 'Other',
                custom_category: isStandardCat ? '' : medicine.category,
                dosage_amount: amount,
                dosage_unit_selection: isStandardUnit ? unit : 'Other',
                custom_unit: isStandardUnit ? '' : unit,
                dosage_form_selection: isStandardForm ? form : 'Other',
                custom_form: isStandardForm ? '' : form,
                reorder_point: medicine.reorder_point || 0,
                price_per_unit: medicine.price || 0,
            });
        }
    }, [medicine, isOpen]);

    const validate = () => {
        let isValid = true;
        clearErrors();
        if (!data.generic_name) { setError('generic_name', 'Required.'); isValid = false; }
        if (data.category_selection === 'Other' && !data.custom_category) { setError('custom_category', 'Required.'); isValid = false; }
        if (!data.dosage_amount) { setError('dosage_amount', 'Required.'); isValid = false; }
        return isValid;
    };

    const handleModalClose = () => { reset(); clearErrors(); onClose(); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            put(route('inventory.update', medicine.id), {
                onSuccess: () => {
                    setToastInfo({ 
                        show: true, 
                        message: 'Medicine record and SKU updated!', 
                        type: 'success' 
                    });
                    handleModalClose();
                },
                onError: (err) => {
                    console.error("Update Error:", err);
                    setToastInfo({ 
                        show: true, 
                        message: 'Update failed. Please check the provided information.', 
                        type: 'error' 
                    });
                }
            });
        } else {
            // Frontend validation failed
            setToastInfo({ 
                show: true, 
                message: 'Please fill in all required fields.', 
                type: 'error' 
            });
        }
    };

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:ring-[#E6AA68] focus:border-[#E6AA68]'
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
                    {/* CONTAINER: flex-col with max-height constraint */}
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
                        
                        {/* FIXED HEADER: shrink-0 ensures it doesn't compress */}
                        <div className="bg-[#E6AA68] px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
                            <div>
                                <h2 className="text-[#5c3a00] font-black text-base md:text-lg uppercase leading-none">Edit Medicine</h2>
                                <div className="flex flex-wrap gap-2 md:gap-4 mt-2 md:mt-1">
                                    <p className="text-[#78350f] text-[9px] font-bold uppercase">New SKU: <span className="font-mono underline">{generatedSkuPrefix || '---'}</span></p>
                                    <p className="text-[#78350f] text-[9px] font-bold uppercase">Dosage: <span className="font-mono underline">{constructedDosage || '---'}</span></p>
                                </div>
                            </div>
                            <button onClick={handleModalClose} className="text-[#5c3a00] hover:text-black text-2xl font-bold leading-none">&times;</button>
                        </div>

                        {/* SCROLLABLE BODY: flex-1 takes up available space */}
                        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div>
                                        <Label text="Generic Name" fieldError={errors.generic_name} />
                                        <input type="text" value={data.generic_name} onChange={e => setData('generic_name', e.target.value)} className={inputClass(errors.generic_name)} />
                                    </div>
                                    <div>
                                        <Label text="Brand Name" required={false} />
                                        <input type="text" value={data.brand_name} onChange={e => setData('brand_name', e.target.value)} className={inputClass()} />
                                    </div>
                                </div>

                                {/* DOSAGE SECTION */}
                                <div className="p-4 bg-orange-50/30 rounded-lg border border-orange-100 space-y-4">
                                    <h4 className="text-[10px] font-black text-orange-800/60 uppercase tracking-widest border-b border-orange-100 pb-1">Dosage Details</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <Label text="Amount" fieldError={errors.dosage_amount} />
                                            <input type="number" value={data.dosage_amount} onChange={e => setData('dosage_amount', e.target.value)} className={inputClass(errors.dosage_amount)} />
                                        </div>
                                        <div>
                                            <Label text="Unit" />
                                            <select value={data.dosage_unit_selection} onChange={e => setData('dosage_unit_selection', e.target.value)} className={inputClass()}>
                                                {standardUnits.map(u => <option key={u} value={u}>{u}</option>)}
                                                <option value="Other">Other...</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label text="Form" />
                                            <select value={data.dosage_form_selection} onChange={e => setData('dosage_form_selection', e.target.value)} className={inputClass()}>
                                                {standardForms.map(f => <option key={f} value={f}>{f}</option>)}
                                                <option value="Other">Other...</option>
                                            </select>
                                        </div>
                                    </div>

                                    {(data.dosage_unit_selection === 'Other' || data.dosage_form_selection === 'Other') && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                            {data.dosage_unit_selection === 'Other' && (
                                                <div>
                                                    <Label text="Specify Unit" fieldError={errors.custom_unit} />
                                                    <input type="text" value={data.custom_unit} onChange={e => setData('custom_unit', e.target.value)} className={inputClass(errors.custom_unit)} placeholder="e.g. puff" />
                                                </div>
                                            )}
                                            {data.dosage_form_selection === 'Other' && (
                                                <div className={data.dosage_unit_selection !== 'Other' ? 'sm:col-start-2' : ''}>
                                                    <Label text="Specify Form" fieldError={errors.custom_form} />
                                                    <input type="text" value={data.custom_form} onChange={e => setData('custom_form', e.target.value)} className={inputClass(errors.custom_form)} placeholder="e.g. Patch" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label text="Category" fieldError={errors.category_selection} />
                                        <select value={data.category_selection} onChange={e => setData('category_selection', e.target.value)} className={inputClass(errors.category_selection)}>
                                            <option value="">Select Category</option>
                                            {standardCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="Other">Other...</option>
                                        </select>
                                        {data.category_selection === 'Other' && (
                                            <input type="text" value={data.custom_category} onChange={e => setData('custom_category', e.target.value)} className={`${inputClass(errors.custom_category)} mt-2 animate-in slide-in-from-top-1`} placeholder="Enter category" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label text="Price/Unit" fieldError={errors.price_per_unit} />
                                            <input type="number" step="0.01" value={data.price_per_unit} onChange={e => setData('price_per_unit', e.target.value)} className={inputClass(errors.price_per_unit)} />
                                        </div>
                                        <div>
                                            <Label text="Reorder Alert" />
                                            <input type="number" value={data.reorder_point} onChange={e => setData('reorder_point', e.target.value)} className={inputClass()} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FIXED FOOTER: shrink-0 ensuring it stays at the bottom */}
                            <div className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                                <Button type="button" onClick={handleModalClose} className="w-full sm:w-auto px-6 py-2.5 bg-slate-500 text-white font-black text-[10px] uppercase tracking-widest">Cancel</Button>
                                <Button type="submit" variant="warning" disabled={processing} className="w-full sm:w-auto px-8 py-2.5 bg-amber-600 text-white font-black text-[10px] uppercase tracking-widest shadow-md">
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