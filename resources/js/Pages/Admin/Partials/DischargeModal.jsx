import { useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import Button from '@/Components/Button';
import DischargeWarningModal from './DischargeWarningModal';

export default function DischargeModal({ isOpen, onClose, patient, bill, onDischargeSuccess }) {
    const [showWarning, setShowWarning] = useState(false);
    const { data, setData, post, processing, transform } = useForm({ 
        admission_id: patient?.active_admission?.id || '',
        amount_to_pay: '',
        payment_type: 'full', 
    });
    useEffect(() => {
        if (patient?.active_admission?.id) {
            setData('admission_id', patient.active_admission.id);
        }
    }, [patient, isOpen]);

    const handleAction = (type) => {
        post(route('admin.admissions.discharge', { type }), {
            onSuccess: () => onClose(),
        });
    };
    const handleDischargeOnlyClick = () => {
        setShowWarning(true);
    };
   const handleMarkAsPaid = (e) => {
        e.preventDefault();
        
        // 1. Clean the strings by removing commas before parsing
        const rawBalance = String(bill?.total_amount || '0').replace(/,/g, '');
        const rawPayment = String(data.amount_to_pay || '0').replace(/,/g, '');

        const totalAmount = parseFloat(rawBalance);
        const amountToPay = parseFloat(rawPayment);

        // 2. Debugging: Check your console to see what the values actually are
        console.log("Balance:", totalAmount, "Payment:", amountToPay);

        if (amountToPay > totalAmount) {
            alert(`The payment amount (Php ${amountToPay}) cannot exceed the remaining balance (Php ${totalAmount}).`);
            return;
        }

        // 3. Use transform to inject the payment_type properly
        transform((data) => ({
            ...data,
            payment_type: 'full',
        }));
        
        // 4. Send ONLY ONE post request
        post(route('admin.admissions.discharge'), {
            onSuccess: () => {
                onClose();
                if (onDischargeSuccess) onDischargeSuccess(); 
            },
        });
    };

    const confirmDischargeOnly = () => {
        transform((data) => ({
            ...data,
            payment_type: 'none',
            amount_to_pay: 0, // Ensure no payment is recorded
        }));
        post(route('admin.admissions.discharge'), { 
            onSuccess: () => {
                setShowWarning(false);
                onClose();
                if (onDischargeSuccess) onDischargeSuccess();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 text-slate-800">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="bg-[#3D52A0] text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Hospital Bill Invoice #{bill?.bill_id || 'N/A'}</h3>
                    <button onClick={onClose} className="text-white text-2xl hover:text-rose-200">&times;</button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="text-sm">
                            <p className="font-bold text-lg">Patient: {patient?.name}</p>
                            <p className="text-slate-500">Date Issued: {new Date().toLocaleDateString()}</p>
                            <p className="text-slate-500">Status: <span className="font-bold text-rose-600">Unpaid</span></p>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase">Patient ID: {patient?.patient_id}</p>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-200">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 border-r">Description</th>
                                <th className="p-3 border-r">Quantity</th>
                                <th className="p-3 border-r">Unit Price</th>
                                <th className="p-3">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3 border-r font-bold">{patient?.current_room}</td>
                                <td className="p-3 border-r text-center">1</td>
                                <td className="p-3 border-r">1,500.00</td>
                                <td className="p-3 font-bold">1,500.00</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="text-right space-y-1 pr-4 border-t pt-4">
                        <h4 className="text-xl font-bold">GRAND TOTAL: Php {bill?.total_amount || '1,500.00'}</h4>
                        <p className="font-bold text-slate-600">Balance: Php {bill?.total_amount || '1,500.00'}</p>
                        <div className="flex justify-end items-center gap-3 mt-4">
                            <label className="font-bold text-sm italic underline">Amount to Pay:</label>
                            <input 
                                type="number" 
                                value={data.amount_to_pay}
                                onChange={e => setData('amount_to_pay', e.target.value)}
                                className="w-40 border-b-2 border-slate-800 text-right font-bold outline-none text-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button 
                            onClick={handleMarkAsPaid}
                            disabled={processing}
                            className="bg-emerald-600 text-white py-3 rounded font-bold text-xs uppercase shadow hover:bg-emerald-700"
                        >
                            Discharge and Mark as Paid
                        </button>
                        <button 
                            onClick={handleDischargeOnlyClick}
                            className="bg-[#C84B4B] text-white py-3 rounded font-bold text-xs uppercase shadow hover:bg-[#A63E3E]"
                        >
                            Discharge Patient Only
                        </button>
                    </div>

                    <div className="flex justify-center gap-4 border-t pt-6">
                        <button onClick={onClose} className="px-10 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase">Cancel</button>
                        <button className="px-10 py-2 bg-emerald-700 text-white rounded font-bold text-xs uppercase">Print PDF</button>
                    </div>
                </div>
            </div>
            <DischargeWarningModal 
                isOpen={showWarning} 
                onClose={() => setShowWarning(false)} 
                onConfirm={confirmDischargeOnly} 
            />
        </div>
    );
}