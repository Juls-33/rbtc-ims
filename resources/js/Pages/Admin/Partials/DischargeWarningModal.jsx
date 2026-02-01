// resources/js/Pages/Admin/Partials/DischargeWarningModal.jsx

import React from 'react';

export default function DischargeWarningModal({ isOpen, onClose, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div className="bg-[#C84B4B] text-white p-3 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Discharge Patient with Remaining Balance</h3>
                    <button onClick={onClose} className="text-xl hover:text-white/80">&times;</button>
                </div>
                <div className="p-8 text-center">
                    <p className="text-sm text-slate-700 leading-relaxed">
                        <span className="text-[#C84B4B] font-bold italic">Warning:</span> Patient has unpaid bills. This will reflect on his/her billing status.
                    </p>
                    <div className="flex justify-center gap-4 mt-8">
                        <button 
                            onClick={onClose} 
                            className="px-8 py-2 bg-slate-500 text-white rounded font-bold text-xs uppercase shadow hover:bg-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            // FIX: Use the onConfirm prop passed from the parent
                            onClick={onConfirm}
                            className="px-6 py-2 bg-[#C84B4B] text-white rounded font-bold text-xs uppercase shadow hover:bg-[#A63E3E] transition-colors"
                        >
                            Discharge Patient Only
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}