import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';

export default function NurseProfile({ auth }) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Mock Data
    const nurseInfo = {
        name: auth.user.name || 'Laura F. Bailey',
        id: 'N-002',
        role: 'Nurse',
        dob: '1998-02-10',
        gender: 'Female',
        address: '62 Sampaguita St., Quezon City',
        phone: '0917-123-4567',
        email: auth.user.email || 'laurz.bailey@gmail.com',
        dateCreated: '14/11/2025'
    };

    const patients = [
        { room: '305', id: 'P-40012', name: 'Robert Robertson', reason: 'High BP' },
        { room: '303', id: 'P-40014', name: 'Malevola Gibb', reason: 'Persistent Coughing' },
        { room: '301', id: 'P-40018', name: 'Chase Walters', reason: 'Prescription Refill' }
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Nurse / Profile"
            sectionTitle={
                <div className="flex justify-between items-center w-full px-6 text-white">
                    <span className="text-white font-semibold text-lg">
                        Nurse / Profile
                    </span>
                </div>
            }
        >
            <Head title="My Profile" />

            <div className="flex flex-col gap-6 h-full">
                
                {/* TOP SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT: Profile Information */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-[#30499B] text-white px-6 py-3 font-bold text-base">
                            My Profile: {nurseInfo.name}
                        </div>
                        
                        <div className="p-6 flex-grow flex flex-col gap-4">
                            <div className="bg-[#30499B] text-white px-4 py-2 text-xs font-bold uppercase rounded w-full">
                                Profile Information
                            </div>
                            
                            <div className="space-y-3 text-sm text-gray-800">
                                <p><span className="font-bold block text-gray-900">Nurse ID:</span> {nurseInfo.id}</p>
                                <p><span className="font-bold block text-gray-900">User Role:</span> {nurseInfo.role}</p>
                                <p><span className="font-bold block text-gray-900">Date of Birth:</span> {nurseInfo.dob}</p>
                                <p><span className="font-bold block text-gray-900">Gender:</span> {nurseInfo.gender}</p>
                                <p><span className="font-bold block text-gray-900">Address:</span> {nurseInfo.address}</p>
                                <p><span className="font-bold block text-gray-900">Phone:</span> {nurseInfo.phone}</p>
                                <p><span className="font-bold block text-gray-900">Email:</span> {nurseInfo.email}</p>
                                <p><span className="font-bold block text-gray-900">Date Created:</span> {nurseInfo.dateCreated}</p>
                            </div>

                            <div className="mt-auto pt-6 flex flex-col gap-2">
                                <button 
                                    onClick={() => setShowEditModal(true)}
                                    className="bg-[#2E7D32] hover:bg-green-700 text-white w-full py-2 rounded text-xs font-bold uppercase shadow transition"
                                >
                                    Edit Personal Info
                                </button>
                                <button 
                                    onClick={() => setShowPasswordModal(true)}
                                    className="bg-[#D32F2F] hover:bg-red-700 text-white w-full py-2 rounded text-xs font-bold uppercase shadow transition"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Patients Under Care */}
                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-[#30499B] text-white px-6 py-3 font-bold text-base">
                            Patients Under Care
                        </div>
                        <div className="p-6 bg-white flex-grow">
                            <input 
                                type="text" 
                                placeholder="Search Patient by ID or Name" 
                                className="w-full text-sm border-gray-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-4"
                            />
                            
                            <div className="overflow-hidden border border-gray-200 rounded-lg">
                                <table className="w-full text-left text-sm bg-white">
                                    <thead className="bg-[#30499B] text-white uppercase font-bold text-xs">
                                        <tr>
                                            <th className="px-4 py-3">Room</th>
                                            <th className="px-4 py-3">Patient ID</th>
                                            <th className="px-4 py-3">Patient Name</th>
                                            <th className="px-4 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {patients.map((p, i) => (
                                            <tr key={i} className="hover:bg-blue-50 transition">
                                                <td className="px-4 py-3 font-bold text-blue-800">{p.room}</td>
                                                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.id}</td>
                                                <td className="px-4 py-3 font-bold text-gray-800">
                                                    {p.name}
                                                    <span className="block text-xs text-gray-400 font-normal">{p.reason}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link 
                                                        href={route('nurse.patients.profile', { id: p.id })}
                                                        className="bg-[#2E7D32] hover:bg-green-700 text-white px-3 py-1.5 rounded text-[10px] uppercase font-bold shadow-sm inline-block"
                                                    >
                                                        View Profile
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Daily Metrics */}
                <div className="bg-[#30499B] rounded-xl shadow-sm p-6 text-white">
                    <h3 className="font-bold text-sm uppercase mb-4 border-b border-blue-400/30 pb-2">Daily Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
                        {/* Metric 1 */}
                        <div className="bg-white rounded-lg p-5 shadow-lg flex items-center justify-between border-l-4 border-red-500">
                            <div>
                                <div className="text-[10px] uppercase font-bold text-red-600 mb-1">Meds Overdue</div>
                                <div className="text-4xl font-extrabold text-red-600 flex items-center gap-2">
                                    3 <span className="text-2xl">⚠️</span>
                                </div>
                            </div>
                            <div className="w-32 h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 w-[20%]"></div>
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="bg-white rounded-lg p-5 shadow-lg flex items-center justify-between border-l-4 border-green-500">
                            <div>
                                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Administered Today</div>
                                <div className="text-4xl font-extrabold text-gray-800">45</div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-conic-gradient-green shadow-sm border border-gray-100 relative">
                                <style>{`.bg-conic-gradient-green { background: conic-gradient(#4caf50 0% 75%, #e0e0e0 75% 100%); }`}</style>
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="bg-white rounded-lg p-5 shadow-lg border-l-4 border-blue-500 flex flex-col justify-center">
                            <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">Next to Administer - 11:30 AM</div>
                            <div className="text-xl font-bold text-gray-900 truncate">Malevola Gibb</div>
                            <div className="text-xs text-blue-600 font-bold mt-1">Morphine Sulfate (4mg)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* -------------------- EDIT PERSONAL INFO MODAL -------------------- */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md">
                <div className="flex flex-col bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-[#30499B] text-white px-6 py-4">
                        <h2 className="text-lg font-normal">Edit Personal Information</h2>
                        <button onClick={() => setShowEditModal(false)} className="text-white hover:text-gray-300 transition focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Nurse ID</label>
                            <input 
                                type="text" 
                                defaultValue={nurseInfo.id} 
                                disabled 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-gray-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Name</label>
                            <input 
                                type="text" 
                                defaultValue={nurseInfo.name} 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Address</label>
                            <input 
                                type="text" 
                                defaultValue={nurseInfo.address} 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Phone</label>
                            <input 
                                type="text" 
                                defaultValue={nurseInfo.phone} 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Email</label>
                            <input 
                                type="email" 
                                defaultValue={nurseInfo.email} 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 flex justify-center gap-4">
                        <SecondaryButton onClick={() => setShowEditModal(false)} className="!bg-[#6C757D] !text-white !border-none hover:!bg-gray-600 uppercase font-bold text-xs px-6 py-2.5 shadow-md rounded">
                            Cancel
                        </SecondaryButton>
                        <button 
                            className="bg-[#2E7D32] hover:bg-green-700 text-white px-6 py-2 rounded text-xs font-bold uppercase shadow-md transition"
                            onClick={() => setShowEditModal(false)}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

            {/* -------------------- CHANGE PASSWORD MODAL -------------------- */}
            <Modal show={showPasswordModal} onClose={() => setShowPasswordModal(false)} maxWidth="md">
                <div className="flex flex-col bg-white rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center bg-[#30499B] text-white px-6 py-4">
                        <h2 className="text-lg font-normal">Change Password</h2>
                        <button onClick={() => setShowPasswordModal(false)} className="text-white hover:text-gray-300 transition focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Email</label>
                            <input 
                                type="email" 
                                defaultValue={nurseInfo.email} 
                                disabled
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 bg-gray-50 text-gray-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Current Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">New Password</label>
                            <input 
                                type="password" 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm mb-1">Confirm Password</label>
                            <input 
                                type="password" 
                                className="w-full border-gray-300 rounded focus:border-blue-500 focus:ring-blue-500 text-sm" 
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 flex justify-center gap-4">
                        <SecondaryButton onClick={() => setShowPasswordModal(false)} className="!bg-[#6C757D] !text-white !border-none hover:!bg-gray-600 uppercase font-bold text-xs px-6 py-2.5 shadow-md rounded">
                            Cancel
                        </SecondaryButton>
                        <button 
                            className="bg-[#2E7D32] hover:bg-green-700 text-white px-6 py-2 rounded text-xs font-bold uppercase shadow-md transition"
                            onClick={() => setShowPasswordModal(false)}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}