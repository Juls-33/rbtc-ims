import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react'; // Added useForm
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function DoctorProfile({ auth }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Personal Info Form
    const { data, setData, patch, processing, errors, reset } = useForm({
    name: `${auth.user.first_name || ''} ${auth.user.last_name || ''}`.trim(),
    address: auth.user.address || '',
    phone: auth.user.contact_no || '',
    email: auth.user.email || '',
    });

    // Password Form
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

    return (
        <AuthenticatedLayout auth={auth} header="Doctor / Profile">
            <Head title="My Profile" />

            <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-[#30499B] text-white px-8 py-6">
                        <h1 className="text-2xl font-bold">Doctor Profile</h1>
                        <p className="text-blue-100 text-xl mt-1 uppercase tracking-wider font-semibold">
                            {auth.user.first_name} {auth.user.last_name}
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Section Sub-header */}
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-sm font-bold text-[#30499B] uppercase tracking-widest">General Information</h2>
                            <div className="h-px bg-gray-200 flex-grow"></div>
                        </div>

                        {/* Two-Column Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-12">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Doctor ID</label>
                                    <p className="text-lg font-medium text-gray-900">{auth.user.staff_id || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Full Name</label>
                                    <p className="text-lg font-medium text-gray-900">{auth.user.first_name} {auth.user.last_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Role</label>
                                    <p className="text-lg font-medium text-gray-900">{auth.user.role}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Gender</label>
                                    <p className="text-lg font-medium text-gray-900 capitalize">{auth.user.gender}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Email Address</label>
                                    <p className="text-lg font-medium text-gray-900">{auth.user.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Phone Number</label>
                                    <p className="text-lg font-medium text-gray-900">{auth.user.contact_no || 'None set'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Office Address</label>
                                    <p className="text-lg font-medium text-gray-900">{auth.user.address || 'None set'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Account Created</label>
                                    <p className="text-lg font-medium text-gray-900">{new Date(auth.user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-8">
                            <button 
                                onClick={() => setShowEditModal(true)} 
                                className="inline-flex justify-center items-center px-6 py-3 bg-[#2E7D32] hover:bg-green-700 text-white rounded-lg text-sm font-bold uppercase tracking-wide shadow-md transition-all duration-200"
                            >
                                Edit Profile Information
                            </button>
                            <button 
                                onClick={() => setShowPasswordModal(true)} 
                                className="inline-flex justify-center items-center px-6 py-3 bg-white border-2 border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white rounded-lg text-sm font-bold uppercase tracking-wide transition-all duration-200"
                            >
                                Security Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PERSONAL INFO MODAL */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <form onSubmit={handleUpdateProfile} className="flex flex-col bg-white rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center bg-[#30499B] text-white px-6 py-4">
                        <h2 className="text-lg font-normal">Edit Personal Information</h2>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Doctor's Name</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm focus:ring-[#30499B]" 
                            />
                            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Address</label>
                            <input 
                                type="text" 
                                value={data.address} 
                                onChange={e => setData('address', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm focus:ring-[#30499B]" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Phone</label>
                            <input 
                                type="text" 
                                value={data.phone} 
                                onChange={e => setData('phone', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm focus:ring-[#30499B]" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Email</label>
                            <input 
                                type="email" 
                                value={data.email} 
                                onChange={e => setData('email', e.target.value)}
                                className="w-full border-gray-300 rounded text-sm focus:ring-[#30499B]" 
                            />
                        </div>
                    </div>

                    <div className="p-6 pt-0 flex justify-center gap-4">
                        <SecondaryButton onClick={() => setShowEditModal(false)}>Cancel</SecondaryButton>
                        <button 
                            type="submit"
                            disabled={processing}
                            className="bg-[#2E7D32] hover:bg-green-700 text-white px-6 py-2 rounded text-xs font-bold uppercase shadow-md transition disabled:opacity-50"
                        >
                            Save Changes
                        </button>
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