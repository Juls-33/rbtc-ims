// resources/js/Pages/Admin/Partials/DeleteMedicineModal.jsx

import React from 'react';
import Button from '@/Components/Button';

export default function DeleteMedicineModal({ isOpen, onClose, onConfirm, medicineName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
            {/* CONTAINER: flex-col with max-height to handle small screens */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in duration-150">
                
                {/* FIXED HEADER: shrink-0 ensures it stays at the top */}
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
                    <h2 className="text-white font-black text-base md:text-lg tracking-wide uppercase">Confirm Deletion</h2>
                    <button 
                        onClick={onClose} 
                        className="text-white/70 hover:text-white text-2xl font-bold leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                {/* SCROLLABLE BODY: flex-1 allows this area to expand/contract */}
                <div className="p-6 md:p-8 text-center overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6 shrink-0">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-lg leading-tight font-black text-slate-900 uppercase tracking-tight">
                        Delete {medicineName}?
                    </h3>
                    
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Are you sure you want to delete this medicine? 
                        </p>
                        <p className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            WARNING: This will permanently remove all associated stock batches from the system.
                        </p>
                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest pt-2">
                            This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* FIXED FOOTER: Buttons stack on mobile for easier tapping */}
                <div className="bg-slate-50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-center gap-3 border-t border-slate-100 shrink-0">
                    <Button 
                        variant="gray" 
                        className="w-full sm:w-auto px-8 py-2.5 font-black text-[10px] tracking-widest uppercase"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    
                    <Button 
                        variant="danger" 
                        className="w-full sm:w-auto px-8 py-2.5 font-black text-[10px] tracking-widest uppercase shadow-lg shadow-red-100"
                        onClick={onConfirm}
                    >
                        Yes, Delete Record
                    </Button>
                </div>
            </div>
        </div>
    );
}