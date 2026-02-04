// resources/js/Components/LogoutModal.jsx

import React from 'react';
import Button from '@/Components/Button';
import { router } from '@inertiajs/react';

export default function LogoutModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        router.post(route('logout'), {}, {
            onFinish: () => onClose(),
        });
    };

    const logoutIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
    );

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in font-sans">
            <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                
                {/* Danger Red Header */}
                <div className="bg-[#C84B4B] text-white p-4 flex justify-between items-center shadow-sm">
                    <h3 className="font-bold text-lg uppercase tracking-tight">Confirm Sign Out?</h3>
                    <button onClick={onClose} className="text-2xl hover:text-rose-100 leading-none">&times;</button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        {/* Red-tinted icon for warning context */}
                        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C84B4B]">
                            <span className="text-2xl">{logoutIcon}</span>
                        </div>
                        <p className="text-slate-700 font-medium leading-relaxed">
                            Are you sure you want to end your current <br/>
                            <span className="font-bold text-slate-900 uppercase">IMS Administrative Session</span>?
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                            Unsaved clinical data may be lost.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={onClose} 
                            className="px-8 py-2 bg-slate-500 hover:bg-slate-600 uppercase text-white font-bold text-xs shadow-sm"
                        >
                            Stay Active
                        </Button>
                        <Button 
                            type="button" 
                            variant="danger" // Matches your red button style
                            onClick={handleConfirm}
                            className="px-8 py-2 bg-[#C84B4B] hover:bg-[#A63E3E] text-white uppercase font-bold text-xs shadow-md"
                        >
                            Yes, Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}