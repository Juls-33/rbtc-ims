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

    const roleIcon = auth.user.role === 'Doctor' ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M540-80q-108 0-184-76t-76-184v-23q-86-14-143-80.5T80-600v-240h120v-40h80v160h-80v-40h-40v160q0 66 47 113t113 47q66 0 113-47t47-113v-160h-40v40h-80v-160h80v40h120v240q0 90-57 156.5T360-363v23q0 75 52.5 127.5T540-160q75 0 127.5-52.5T720-340v-67q-35-12-57.5-43T640-520q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 70T800-407v67q0 108-76 184T540-80Zm248.5-411.5Q800-503 800-520t-11.5-28.5Q777-560 760-560t-28.5 11.5Q720-537 720-520t11.5 28.5Q743-480 760-480t28.5-11.5ZM760-520Z"/></svg>
     : auth.user.role === 'Nurse' ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M480-254 330-104q-23 23-56 23t-56-23L104-218q-23-23-23-56t23-56l150-150-150-150q-23-23-23-56t23-56l114-114q23-23 56-23t56 23l150 150 150-150q23-23 56-23t56 23l114 114q23 23 23 56t-23 56L706-480l150 150q23 23 23 56t-23 56L742-104q-23 23-56 23t-56-23L480-254Zm28.5-277.5Q520-543 520-560t-11.5-28.5Q497-600 480-600t-28.5 11.5Q440-577 440-560t11.5 28.5Q463-520 480-520t28.5-11.5ZM310-536l114-114-150-150-114 114 150 150Zm90 96q17 0 28.5-11.5T440-480q0-17-11.5-28.5T400-520q-17 0-28.5 11.5T360-480q0 17 11.5 28.5T400-440Zm108.5 68.5Q520-383 520-400t-11.5-28.5Q497-440 480-440t-28.5 11.5Q440-417 440-400t11.5 28.5Q463-360 480-360t28.5-11.5ZM560-440q17 0 28.5-11.5T600-480q0-17-11.5-28.5T560-520q-17 0-28.5 11.5T520-480q0 17 11.5 28.5T560-440Zm-24 130 150 150 114-114-150-150-114 114ZM339-621Zm282 282Z"/></svg>
     : <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><path d="M223.5-423.5Q200-447 200-480t23.5-56.5Q247-560 280-560t56.5 23.5Q360-513 360-480t-23.5 56.5Q313-400 280-400t-56.5-23.5ZM280-240q-100 0-170-70T40-480q0-100 70-170t170-70q67 0 121.5 33t86.5 87h352l120 120-180 180-80-60-80 60-85-60h-47q-32 54-86.5 87T280-240Zm0-80q56 0 98.5-34t56.5-86h125l58 41 82-61 71 55 75-75-40-40H435q-14-52-56.5-86T280-640q-66 0-113 47t-47 113q0 66 47 113t113 47Z"/></svg>;
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