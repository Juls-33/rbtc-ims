import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
    if (!message) return null;
    React.useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [message]);

    return (
        <div className="fixed top-5 right-5 z-[200] animate-in fade-in slide-in-from-right-8 duration-300">
            <div className={`flex items-center gap-3 p-4 rounded-lg shadow-2xl border-l-4 bg-white ${
                type === 'success' ? 'border-emerald-500' : 'border-red-500'
            }`}>
                <div className={`p-1 rounded-full ${type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {type === 'success' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">System Message</span>
                    <p className="text-xs font-bold text-slate-800">{message}</p>
                </div>
            </div>
        </div>
    );
}