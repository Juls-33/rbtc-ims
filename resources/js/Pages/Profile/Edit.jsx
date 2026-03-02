// resources/js/Pages/Profile/Edit.jsx

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit({ auth, mustVerifyEmail, status }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const roleIcon = auth.user.role === 'Doctor' ? '🩺' : auth.user.role === 'Nurse' ? '🩹' : '🔑';
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
                    
                    {/* Header */}
                    <div className="bg-[#30499B] text-white px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-emerald-500">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-3xl shadow-inner">
                                {roleIcon}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                                    {auth.user.first_name} {auth.user.last_name}
                                </h1>
                                <p className="text-blue-100 text-[11px] mt-2 uppercase tracking-[0.25em] font-black opacity-80">
                                    System {auth.user.role} • {auth.user.staff_id}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="success" onClick={() => setShowEditModal(true)} className="text-[9px] py-1.5 w-32 font-black uppercase tracking-widest shadow-sm">
                                Edit Info
                            </Button>
                            <Button variant="danger" onClick={() => setShowPasswordModal(true)} className="text-[9px] py-1.5 w-32 font-black uppercase tracking-widest shadow-sm">
                                Security
                            </Button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                            {/* Identity Details */}
                            <div className="space-y-8">
                                <h2 className="text-[10px] font-black text-[#30499B] uppercase tracking-[0.25em] border-b border-slate-100 pb-2">Identity Details</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelStyle}>Staff ID</label>
                                        <p className="font-mono text-lg font-black text-blue-600">{auth.user.staff_id}</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Gender</label>
                                        <p className={dataStyle}>{auth.user.gender}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelStyle}>Full Registered Name</label>
                                        <p className={dataStyle}>{auth.user.first_name} {auth.user.last_name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-8">
                                <h2 className="text-[10px] font-black text-[#30499B] uppercase tracking-[0.25em] border-b border-slate-100 pb-2">Contact Access</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelStyle}>Email Address</label>
                                        <p className="text-sm font-bold text-slate-800">{auth.user.email}</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Phone Number</label>
                                        <p className={dataStyle}>{auth.user.contact_no || 'NOT SET'}</p>
                                    </div>
                                    <div>
                                        <label className={labelStyle}>Home / Office Address</label>
                                        <p className="text-sm font-bold text-slate-700 leading-tight">{auth.user.address || 'NOT SET'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODALS CALLING PARTIALS --- */}

            {/* Edit Personal Records Modal */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 font-black uppercase tracking-widest text-xs">
                    Update Personal Records
                </div>
                <div className="p-8">
                    {/* 🔥 Calling the external component logic directly */}
                    <UpdateProfileInformationForm 
                        mustVerifyEmail={mustVerifyEmail} 
                        status={status} 
                        onSuccess={() => setShowEditModal(false)} 
                    />
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 font-black uppercase tracking-widest text-xs">
                    Security Credentials Update
                </div>
                <div className="p-8">
                    {/* 🔥 Calling the external password component */}
                    <UpdatePasswordForm 
                        onSuccess={() => setShowPasswordModal(false)} 
                    />
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}