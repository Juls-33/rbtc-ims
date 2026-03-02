// resources/js/Pages/Profile/Edit.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Edit({ auth }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Dynamic Role Icon
    const roleIcon = auth.user.role === 'Doctor' ? '🩺' : auth.user.role === 'Nurse' ? '🩹' : '🔑';

    // 1. Personal Info Form
    const { data, setData, patch, processing, errors } = useForm({
        first_name: auth.user.first_name || '',
        last_name: auth.user.last_name || '',
        address: auth.user.address || '',
        contact_no: auth.user.contact_no || '',
        email: auth.user.email || '',
    });

    // 2. Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        patch(route('profile.update'), { 
            onSuccess: () => setShowEditModal(false),
            preserveScroll: true,
        });
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            onSuccess: () => {
                setShowPasswordModal(false);
                passwordForm.reset();
            },
        });
    };

    const labelStyle = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1";
    const dataStyle = "text-sm font-bold text-slate-800 uppercase tracking-tight";

    return (
        <AuthenticatedLayout 
            auth={auth} 
            header={`${auth.user.role} / Account Management`}
            sectionTitle="Profile Overview"
        >
            <Head title="My Profile" />

            <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                    
                    {/* 1. IDENTITY HEADER (Friend's Basis + Heavy UI) */}
                    <div className="bg-[#30499B] text-white px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-emerald-500">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-4xl shadow-inner">
                                {auth.user.role === 'Doctor' ? '🩺' : auth.user.role === 'Nurse' ? '🩹' : '🔑'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                                    {auth.user.first_name} {auth.user.last_name}
                                </h1>
                                <p className="text-blue-100 text-[11px] mt-2 uppercase tracking-[0.25em] font-black opacity-80">
                                    {auth.user.role} • RBTC Medical Staff
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="success" 
                                onClick={() => setShowEditModal(true)}
                                className="text-[9px] py-2 w-32 font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20"
                            >
                                Edit Profile
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={() => setShowPasswordModal(true)}
                                className="text-[9px] py-2 w-32 font-black uppercase tracking-widest shadow-lg shadow-rose-900/20"
                            >
                                Security
                            </Button>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* 2. INFORMATION GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                            
                            {/* Column A: Service Details */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-4 bg-[#30499B] rounded-full"></div>
                                    <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Service Identity</h2>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className={labelStyle}>Staff ID Number</label>
                                        <p className="font-mono text-lg font-black text-blue-600">{auth.user.staff_id}</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Legal Gender</label>
                                        <p className={dataStyle}>{auth.user.gender}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelStyle}>Full Registered Name</label>
                                        <p className={dataStyle}>{auth.user.first_name} {auth.user.last_name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Column B: Access & Location */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-4 bg-[#30499B] rounded-full"></div>
                                    <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Contact Details</h2>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelStyle}>Institutional Email</label>
                                        <p className="text-sm font-bold text-slate-800 lowercase">{auth.user.email}</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Contact Number</label>
                                        <p className={dataStyle}>{auth.user.contact_no || 'NOT REGISTERED'}</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Registered Address</label>
                                        <p className="text-sm font-bold text-slate-600 leading-tight uppercase">{auth.user.address || 'NOT REGISTERED'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. AUDIT FOOTER */}
                        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                Account Verification: {new Date(auth.user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Authorized Access Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS (Standardized with Heavy UI style) --- */}

            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl overflow-hidden">
                    <div className="bg-[#30499B] text-white px-6 py-4 font-black uppercase tracking-widest text-xs">
                        Update Personal Records
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>First Name</label>
                                <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full border-slate-300 rounded-lg text-sm font-bold focus:ring-[#30499B]" />
                            </div>
                            <div>
                                <label className={labelStyle}>Last Name</label>
                                <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full border-slate-300 rounded-lg text-sm font-bold focus:ring-[#30499B]" />
                            </div>
                        </div>
                        <div>
                            <label className={labelStyle}>Address</label>
                            <input type="text" value={data.address} onChange={e => setData('address', e.target.value)} className="w-full border-slate-300 rounded-lg text-sm font-bold focus:ring-[#30499B]" />
                        </div>
                        <div>
                            <label className={labelStyle}>Phone Number</label>
                            <input type="text" value={data.contact_no} onChange={e => setData('contact_no', e.target.value)} className="w-full border-slate-300 rounded-lg text-sm font-bold focus:ring-[#30499B]" />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowEditModal(false)} className="text-[10px] font-black uppercase text-slate-400">Cancel</button>
                        <Button variant="success" disabled={processing} className="px-8 py-2 text-[10px] font-black uppercase shadow-lg">Save Changes</Button>
                    </div>
                </form>
            </Modal>

            {/* CHANGE PASSWORD MODAL */}
            <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} maxWidth="md">
                <form onSubmit={handleChangePassword} className="flex flex-col bg-white rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-[#30499B] text-white px-6 py-4">
                        <h2 className="text-lg font-normal">Change Password</h2>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Current Password</label>
                            <input 
                                type="password" 
                                value={passwordForm.data.current_password}
                                onChange={e => passwordForm.setData('current_password', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm" 
                            />
                            {passwordForm.errors.current_password && <div className="text-red-500 text-xs mt-1">{passwordForm.errors.current_password}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">New Password</label>
                            <input 
                                type="password" 
                                value={passwordForm.data.password}
                                onChange={e => passwordForm.setData('password', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm" 
                            />
                            {passwordForm.errors.password && <div className="text-red-500 text-xs mt-1">{passwordForm.errors.password}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                value={passwordForm.data.password_confirmation}
                                onChange={e => passwordForm.setData('password_confirmation', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm" 
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-0 flex justify-center gap-4">
                        <SecondaryButton onClick={() => setShowPasswordModal(false)}>Cancel</SecondaryButton>
                        <button 
                            type="submit"
                            disabled={passwordForm.processing}
                            className="bg-[#2E7D32] hover:bg-green-700 text-white px-6 py-2 rounded text-xs font-bold uppercase shadow-md transition disabled:opacity-50"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}