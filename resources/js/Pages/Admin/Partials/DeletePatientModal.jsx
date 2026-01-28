import React from 'react';

export default function DeletePatientModal({ isOpen, onClose, onConfirm, patientName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-rose-600 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Confirm Deletion</h3>
                    <button onClick={onClose} className="text-white text-2xl leading-none">&times;</button>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-600 mb-2">Are you sure you want to delete the record for:</p>
                    <p className="font-bold text-lg text-slate-800 mb-4">{patientName || 'this patient'}</p>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-3 mb-4">
                        <p className="text-xs text-amber-700">
                            <strong>Warning:</strong> This will also remove all associated encrypted search indexes. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded font-bold text-xs uppercase hover:bg-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 bg-rose-600 text-white rounded font-bold text-xs uppercase hover:bg-rose-700 transition-colors shadow-sm"
                    >
                        Permanently Delete
                    </button>
                </div>
            </div>
        </div>
    );
}