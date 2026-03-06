import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans bg-slate-50">
            <Head title="Reset Password" />

            {/* LEFT SIDE: Institutional Branding (Consistent with Welcome.jsx) */}
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
                        Information Management System (IMS). Secure credential reset for 
                        institutional excellence and patient record safety.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Reset Password Form */}
            <div className="md:w-2/5 flex flex-col justify-center p-8 md:p-16 bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Create New Password</h2>
                        <p className="text-slate-500 text-sm mt-1">Please enter and confirm your new credentials below.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Institutional Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-[10px] mt-1 italic font-bold uppercase">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && (
                                <p className="text-red-500 text-[10px] mt-1 italic font-bold uppercase">{errors.password}</p>
                            )}
                        </div>

                        {/* Password Confirmation Field */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="w-full border-slate-200 rounded-lg p-3 text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-[10px] mt-1 italic font-bold uppercase">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full py-4 bg-[#2E4696] text-white font-black uppercase tracking-widest shadow-xl"
                        >
                            {processing ? 'Saving Changes...' : 'Update Password'}
                        </Button>
                    </form>

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