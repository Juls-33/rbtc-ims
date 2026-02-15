import React, { useEffect } from 'react';
// Configuration for different toast states
    const toastConfig = {
        success: {
            border: 'border-emerald-500',
            iconBg: 'bg-emerald-100 text-emerald-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        },
        warning: {
            border: 'border-amber-500',
            iconBg: 'bg-amber-100 text-amber-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        },
        error: {
            border: 'border-red-500',
            iconBg: 'bg-red-100 text-red-600',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        }
    };

export default function Toast({ message, type = 'success', onClose }) {
    if (!message) return null;

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    
    // Fallback to error if type is unrecognized
    const current = toastConfig[type] || toastConfig.error;

    return (
        <div className="fixed top-5 right-5 z-[250] animate-in fade-in slide-in-from-right-8 duration-300">
            <div className={`flex items-center gap-3 p-4 rounded-lg shadow-2xl border-l-4 bg-white ${current.border}`}>
                <div className={`p-1 rounded-full ${current.iconBg}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {current.icon}
                    </svg>
                </div>
                <div className="flex flex-col pr-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                        System Message
                    </span>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                        {message}
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-slate-300 hover:text-slate-500 transition-colors ml-auto"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}