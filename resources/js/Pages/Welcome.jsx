// resources/js/Pages/Welcome.jsx

import React from 'react';
import { Link, Head, useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Welcome({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans bg-slate-50">
            <Head title="Welcome to RBTC-IMS" />

            {/* LEFT SIDE: Institutional Branding */}
            <div className="md:w-3/5 bg-[#2E4696] flex flex-col justify-center p-12 text-white relative overflow-hidden">
                {/* Decorative Background Element */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-white"></div>
                </div>

                <div className="relative z-10 max-w-xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
                        <img 
                            src="/assets/logo.png" 
                            alt="RBTC Logo" 
                            className="w-full h-full object-contain p-1" 
                        />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                        Reality Based <br /> 
                        Therapeutic Community
                    </h1>
                    <div className="h-1 w-24 bg-[#4CAF50] mb-6"></div> {/* High-visibility accent */}
                    <p className="text-lg text-blue-100 font-medium leading-relaxed mb-8">
                        Information Management System (IMS). Providing secure, clinical-grade 
                        oversight for patient recovery and institutional excellence.
                    </p>
                    
                    {/* <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="border-l-2 border-blue-400 pl-4">
                            <span className="block font-bold text-white uppercase tracking-widest mb-1">Secure</span>
                            <span className="text-blue-200">Field-level searchable encryption (CipherSweet).</span>
                        </div>
                        <div className="border-l-2 border-blue-400 pl-4">
                            <span className="block font-bold text-white uppercase tracking-widest mb-1">Accountable</span>
                            <span className="text-blue-200">Full-spectrum audit trails and stock ledgers.</span>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* RIGHT SIDE: Seamless Login Form */}
            <div className="md:w-2/5 flex flex-col justify-center p-8 md:p-16 bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Staff Login</h2>
                        <p className="text-slate-500 text-sm mt-1">Please enter your credentials to access the directory.</p>
                    </div>

                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696] transition-all"
                                placeholder="admin@rbtc.com"
                                required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 italic">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696] transition-all"
                                required
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1 italic">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-[#2E4696] shadow-sm focus:ring-[#2E4696]"
                                />
                                <span className="ml-2 text-xs text-slate-600 font-bold uppercase tracking-tighter">Remember me</span>
                            </label>
                            
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[10px] font-bold text-[#2E4696] hover:underline uppercase tracking-tighter"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                                className="w-full py-4 bg-[#2E4696] hover:bg-[#1E2E63] text-white font-black uppercase tracking-widest shadow-xl"
                            >
                                {processing ? 'Authenticating...' : 'Sign In'}
                            </Button>
                        </div>
                    </form>
                    
                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-widest">
                            © 2026 Reality Based Therapeutic Community
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}