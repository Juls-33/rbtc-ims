import React from 'react';

export default function DeleteMedicineModal({ isOpen, onClose, onConfirm, medicineName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                
                {/* Header - Red for Danger */}
                <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-white font-bold text-lg tracking-wide">CONFIRM DELETION</h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold leading-none">&times;</button>
                </div>

                {/* Body */}
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-lg leading-6 font-bold text-slate-900">Delete {medicineName}?</h3>
                    <div className="mt-2">
                        <p className="text-sm text-slate-500">
                            Are you sure you want to delete this medicine? 
                            <br/><span className="font-bold text-red-600">This will also delete all current stock batches.</span>
                            <br/>This action cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 px-6 py-4 flex justify-center gap-3 border-t border-slate-100">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-slate-700 font-bold hover:bg-slate-200 rounded-md text-sm transition"
                    >
                        CANCEL
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-md text-sm hover:bg-red-700 transition shadow-md"
                    >
                        YES, DELETE IT
                    </button>
                </div>
            </div>
        </div>
    );
}