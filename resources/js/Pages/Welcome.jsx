// resources/js/Pages/Welcome.jsx

import React, { useState } from 'react';
import { Link, Head, useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Welcome({ status, canResetPassword }) {
    // 1. Manage UI States
    const [mode, setMode] = useState('login'); // 'login', 'request', 'recovery'

    // Form for standard Login
    const loginForm = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Form for Staff Reset Request
    const requestForm = useForm({
        email: '',
    });

    // Form for Admin Master Key Recovery
    const recoveryForm = useForm({
        email: '',
        recovery_key: '',
    });

    const handleLogin = (e) => {
        e.preventDefault();
        loginForm.post(route('login'), {
            onFinish: () => loginForm.reset('password'),
        });
    };

    const handleRequestReset = (e) => {
        e.preventDefault();
        requestForm.post(route('staff.request_reset'), {
            onSuccess: () => setMode('login'),
        });
    };

    const handleAdminRecovery = (e) => {
        e.preventDefault();
        recoveryForm.post(route('admin.recover'));
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans bg-slate-50">
            <Head title="Welcome to RBTC-IMS" />

            {/* LEFT SIDE: Institutional Branding */}
            <div className="md:w-3/5 bg-[#2E4696] flex flex-col justify-center p-12 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[40px] border-white"></div>
                </div>

                <div className="relative z-10 max-w-xl">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
                        <img src="/assets/logo.png" alt="RBTC Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                        Reality Based <br /> Therapeutic Community
                    </h1>
                    <div className="h-1 w-24 bg-[#4CAF50] mb-6"></div>
                    <p className="text-lg text-blue-100 font-medium leading-relaxed mb-8">
                        Information Management System (IMS). Providing secure, clinical-grade 
                        oversight for patient recovery and institutional excellence.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Dynamic Forms */}
            <div className="md:w-2/5 flex flex-col justify-center p-8 md:p-16 bg-white">
                <div className="max-w-md w-full mx-auto">
                    
                    {/* MODE 1: STANDARD LOGIN */}
                    {mode === 'login' && (
                        <>
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Staff Login</h2>
                                <p className="text-slate-500 text-sm mt-1">Access the institutional directory.</p>
                            </div>

                            {status && <div className="mb-4 font-bold text-xs text-green-600 uppercase border-l-4 border-green-500 pl-2 py-1 bg-green-50">{status}</div>}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={loginForm.data.email}
                                        onChange={(e) => loginForm.setData('email', e.target.value)}
                                        className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                                        placeholder="admin@rbtc.com"
                                        required
                                    />
                                    {loginForm.errors.email && <p className="text-red-500 text-[10px] mt-1 italic font-bold uppercase">{loginForm.errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={loginForm.data.password}
                                        onChange={(e) => loginForm.setData('password', e.target.value)}
                                        className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="rounded border-slate-300 text-[#2E4696]" checked={loginForm.data.remember} onChange={(e) => loginForm.setData('remember', e.target.checked)} />
                                        <span className="ml-2 text-xs text-slate-600 font-bold uppercase tracking-tighter">Remember me</span>
                                    </label>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setMode('request')}
                                        className="text-[10px] font-bold text-[#2E4696] hover:underline uppercase tracking-tighter"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <Button type="submit" disabled={loginForm.processing} className="w-full py-4 bg-[#2E4696] text-white font-black uppercase tracking-widest shadow-xl">
                                    {loginForm.processing ? 'Authenticating...' : 'Sign In'}
                                </Button>
                            </form>
                        </>
                    )}

                    {/* MODE 2: STAFF RESET REQUEST */}
                    {mode === 'request' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-10">
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Reset Help</h2>
                                <p className="text-slate-500 text-sm mt-1 text-pretty italic">
                                    Enter your email below. The Administrator will be notified to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleRequestReset} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your Institutional Email</label>
                                    <input
                                        type="email"
                                        value={requestForm.data.email}
                                        onChange={(e) => requestForm.setData('email', e.target.value)}
                                        className="w-full border-slate-200 rounded-lg p-3 text-sm"
                                        required
                                    />
                                </div>

                                <Button type="submit" disabled={requestForm.processing} className="w-full py-4 bg-[#4CAF50] hover:bg-[#3d8b40] text-white font-black uppercase tracking-widest shadow-xl">
                                    {requestForm.processing ? 'Sending Request...' : 'Notify Administrator'}
                                </Button>

                                <div className="flex flex-col gap-4 text-center mt-6">
                                    <button type="button" onClick={() => setMode('login')} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                                        Back to Login
                                    </button>
                                    <button type="button" onClick={() => setMode('recovery')} className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest">
                                        Admin Recovery Mode
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* MODE 3: ADMIN MASTER RECOVERY */}
                    {mode === 'recovery' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-10 border-l-4 border-red-500 pl-4">
                                <h2 className="text-2xl font-black text-red-600 uppercase tracking-tight">Admin Recovery</h2>
                                <p className="text-slate-500 text-sm mt-1">Master Key bypass for Administrators only.</p>
                            </div>

                            <form onSubmit={handleAdminRecovery} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
                                    <input
                                        type="email"
                                        value={recoveryForm.data.email}
                                        onChange={(e) => recoveryForm.setData('email', e.target.value)}
                                        className="w-full border-red-100 rounded-lg p-3 text-sm bg-red-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Master Recovery Key</label>
                                    <input
                                        type="password"
                                        value={recoveryForm.data.recovery_key}
                                        onChange={(e) => recoveryForm.setData('recovery_key', e.target.value)}
                                        className="w-full border-red-100 rounded-lg p-3 text-sm bg-red-50"
                                        placeholder="Enter secure key"
                                        required
                                    />
                                    {recoveryForm.errors.recovery_key && <p className="text-red-600 text-[10px] mt-2 font-bold uppercase">{recoveryForm.errors.recovery_key}</p>}
                                </div>

                                <Button type="submit" disabled={recoveryForm.processing} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest shadow-xl">
                                    Verify & Login
                                </Button>

                                <button type="button" onClick={() => setMode('login')} className="w-full text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <p className="text-[10px] text-slate-400 uppercase font-medium tracking-widest italic">
                            © 2026 Reality Based Therapeutic Community
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}