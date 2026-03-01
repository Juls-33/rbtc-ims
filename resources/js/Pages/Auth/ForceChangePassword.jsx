import React from 'react';
import { useForm, Head, router } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function ForceChangePassword({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('password.force-update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const inputClass = (error) => `w-full border rounded-xl px-5 py-4 text-sm transition-all outline-none ${
        error 
            ? 'bg-red-50 border-red-500 ring-4 ring-red-100 focus:border-red-600' 
            : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#3D52A0] focus:ring-4 focus:ring-blue-100'
    }`;

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
            <Head title="Security Update Required" />

            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-300">
                
                {/* Security Header */}
                <div className="bg-[#3D52A0] p-8 text-center relative">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter leading-none">Security Update Required</h1>
                    <p className="text-blue-100 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] mt-3 opacity-80">
                        Account: {auth.user.staff_id} | {auth.user.name}
                    </p>
                </div>

                <div className="p-8 md:p-12">
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-5 mb-8 rounded-r-xl">
                        <p className="text-[11px] text-amber-800 font-black uppercase tracking-tight leading-relaxed">
                            Your password was recently reset by an administrator. For your security, you must set a new private password before you can access the medical directory and patient records.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${errors.password ? 'text-red-500' : 'text-slate-500'}`}>
                                Create New Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                className={inputClass(errors.password)}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />
                            {errors.password && (
                                <p className="text-red-600 text-[10px] font-black italic uppercase tracking-tight mt-1 ml-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">
                                Confirm New Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                className={inputClass(errors.password_confirmation)}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••••••"
                                required
                            />
                        </div>

                        <div className="pt-4 flex flex-col gap-4">
                            <Button
                                type="submit"
                                variant="success"
                                disabled={processing}
                                className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-900/20 active:scale-[0.98] transition-all"
                            >
                                {processing ? 'Encrypting...' : 'Update & Secure Account'}
                            </Button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                            >
                                Sign out and try later
                            </button>
                        </div>
                    </form>
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        RBTC Medical Systems &copy; 2024 | Secure Credentials Protocol
                    </p>
                </div>
            </div>
        </div>
    );
}