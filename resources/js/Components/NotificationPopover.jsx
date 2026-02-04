// resources/js/Components/NotificationPopover.jsx

import { router } from '@inertiajs/react';

export default function NotificationPopover({ isOpen, onClose, notifications = [] }) {
    if (!isOpen) return null;

    const dismissNotification = (id) => {
        router.post(route('notifications.dismiss'), { id }, { 
            preserveScroll: true,
            onSuccess: () => console.log("Dismissal successful!"),
            onError: (errors) => console.error("Dismissal failed:", errors)
        });
    };

    const clearAll = () => {
        // Extract just the IDs from the notifications array
        const allIds = notifications.map(n => n.id);
        
        console.log("Clearing all these IDs:", allIds);

        router.post(route('notifications.dismiss_all'), { 
            ids: allIds 
        }, { 
            preserveScroll: true,
            onSuccess: () => console.log("All notifications cleared!"),
            onError: (err) => console.error("Clear All failed:", err)
        });
    };

    return (
        <>
            <div className="fixed inset-0 z-[190]" onClick={onClose} />
            <div className="absolute top-14 right-0 z-[200] w-[400px] animate-in fade-in zoom-in-95 duration-200 font-sans">
                <div className="absolute -top-1.5 right-4 w-4 h-4 bg-[#5A9167] rotate-45" />
                
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col border border-slate-200">
                    <div className="bg-[#5A9167] px-6 py-3 flex justify-between items-center text-white shrink-0">
                        <div className="flex flex-col">
                            <h2 className="font-bold text-xs tracking-widest uppercase leading-none">Notifications</h2>
                            <span className="text-[9px] opacity-80 mt-1">{notifications.length} Active Alerts</span>
                        </div>
                        {/* Android-style Clear All */}
                        {notifications.length > 0 && (
                            <button onClick={clearAll} className="text-[10px] font-black hover:text-red-200 transition-colors uppercase underline decoration-2 underline-offset-4">
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-[450px] overflow-y-auto p-5 space-y-4 bg-white">
                        {notifications.length === 0 ? (
                            <div className="text-center py-10"><p className="text-xs text-slate-400 font-bold uppercase italic">No new notifications</p></div>
                        ) : (
                            notifications.map((item) => (
                                <div key={item.id} className="relative group p-3 rounded-lg border border-slate-50 hover:bg-slate-50 transition-all border-l-4 border-l-[#5A9167]">
                                    {/* Dismiss 'X' Button */}
                                    <button 
                                        onClick={() => dismissNotification(item.id)}
                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        &times;
                                    </button>

                                    <h4 className="text-xs font-bold text-slate-800 pr-4">{item.title}</h4>
                                    <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>
                                    
                                    <div className="mt-3">
                                        <a href={item.link} className="text-[9px] font-black text-[#2E4696] hover:underline uppercase tracking-tighter">
                                            {item.buttonText} →
                                        </a>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}