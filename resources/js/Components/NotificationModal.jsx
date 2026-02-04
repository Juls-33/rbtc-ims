// resources/js/Components/NotificationPopover.jsx

import React from 'react';
import Button from '@/Components/Button';

export default function NotificationPopover({ isOpen, onClose, notifications }) {
    if (!isOpen) return null;

    const groupedNotifications = {
        Today: notifications.filter(n => n.group === 'Today'),
        Yesterday: notifications.filter(n => n.group === 'Yesterday'),
    };

    return (
        <>
            {/* Backdrop for closing when clicking outside */}
            <div className="fixed inset-0 z-[190]" onClick={onClose} />

            {/* The Popover Container */}
            <div className="absolute top-14 right-6 z-[200] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                
                {/* Visual Arrow pointing to the bell */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-[#5A9167] rotate-45" />

                <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                    
                    {/* Header with Green Branding */}
                    <div className="bg-[#5A9167] px-6 py-3 flex justify-between items-center text-white shrink-0">
                        <h2 className="font-bold text-sm tracking-tight">NOTIFICATIONS ({notifications.length})</h2>
                        <button onClick={onClose} className="text-xl hover:text-green-100">&times;</button>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="max-h-[500px] overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 bg-white">
                        {Object.entries(groupedNotifications).map(([group, items]) => (
                            <div key={group} className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">{group}</h3>
                                
                                {items.map((item, index) => (
                                    <div key={index} className="space-y-2 border-l-2 border-transparent hover:border-[#5A9167] pl-2 transition-all">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                                            <span className="text-[9px] text-slate-400 font-bold">{item.time}</span>
                                        </div>
                                        
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            {item.description}
                                        </p>

                                        <div className="pt-1">
                                            <Button 
                                                variant="blue" 
                                                className="text-[9px] py-1 px-4 bg-[#2E4696] hover:bg-[#1E2E63] shadow-sm font-bold uppercase"
                                            >
                                                {item.buttonText}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    {/* <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                        <Button type="button" onClick={onClose} className="bg-slate-500 text-white px-6 py-1.5 text-[10px] font-bold">CANCEL</Button>
                        <Button type="button" onClick={onClose} className="bg-[#5A9167] text-white px-8 py-1.5 text-[10px] font-bold">SAVE</Button>
                    </div> */}
                </div>
            </div>
        </>
    );
}