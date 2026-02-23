import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

export default function GlobalLoader() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // router.on returns a function that unregisters the listener when called
        const unregisterStart = router.on('start', () => setLoading(true));
        const unregisterFinish = router.on('finish', () => setLoading(false));

        // When the component unmounts, we call both functions to clean up
        return () => {
            unregisterStart();
            unregisterFinish();
        };
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-[1.5px] animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100 transform animate-in zoom-in-95 duration-200">
                {/* Modern Spinning Ring */}
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#3D52A0] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3D52A0]">Processing</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Please wait...</p>
                </div>
            </div>
        </div>
    );
}