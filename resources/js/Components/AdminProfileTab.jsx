// resources/js/Pages/Admin/Partials/AdminProfileTab.jsx

import React from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function AdminProfileTab({ user }) {
    // Initialize form with admin-specific mapping
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_no: user.phone || user.contact_no || '',
        gender: user.gender || 'Male',
        address: user.address || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pointing to the central profile update route
        put(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => console.log("Admin profile synchronized."),
        });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 font-sans">
            <div className="mb-6 border-b border-slate-100 pb-4 flex justify-between items-end">
                <div>
                    <h3 className="text-lg font-bold text-[#2E4696] uppercase tracking-wide">Administrator Profile</h3>
                    <p className="text-xs text-slate-500">Manage your institutional account details and contact information.</p>
                </div>
                {/* Visual indicator of Admin status */}
                <span className="bg-[#3D52A0] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                    System Root
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* READ-ONLY IDENTITY SECTION */}
                <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-md border border-slate-100 shadow-inner">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Staff ID</label>
                        <p className="text-sm font-black text-[#2E4696]">{user.staff_id}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</label>
                        <p className="text-sm font-bold text-slate-700 uppercase">{user.role}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">First Name</label>
                        <input 
                            type="text"
                            value={data.first_name}
                            onChange={e => setData('first_name', e.target.value)}
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#2E4696] focus:border-[#2E4696] bg-white transition-all"
                            placeholder="Enter First Name"
                        />
                        {errors.first_name && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.first_name}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">Last Name</label>
                        <input 
                            type="text"
                            value={data.last_name}
                            onChange={e => setData('last_name', e.target.value)}
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#2E4696] focus:border-[#2E4696] bg-white transition-all"
                            placeholder="Enter Last Name"
                        />
                        {errors.last_name && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.last_name}</p>}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase">Primary Admin Email</label>
                    <input 
                        type="email"
                        value={data.email}
                        onChange={e => setData('email', e.target.value)}
                        className="w-full border-slate-300 rounded text-sm bg-slate-50 italic text-slate-500"
                        readOnly={user.email === 'admin@rbtc.com'} // Guard the root email
                    />
                    {user.email === 'admin@rbtc.com' && (
                        <p className="text-[9px] text-slate-400 mt-1 italic leading-none">Note: The root administrator email is protected and cannot be changed here.</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">Contact Number</label>
                        <input 
                            type="text"
                            value={data.contact_no}
                            onChange={e => setData('contact_no', e.target.value)}
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                            placeholder="09XX-XXX-XXXX"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-600 uppercase">Gender</label>
                        <select 
                            value={data.gender}
                            onChange={e => setData('gender', e.target.value)}
                            className="w-full border-slate-300 rounded text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase">Residential Address</label>
                    <textarea 
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        rows="2"
                        className="w-full border-slate-300 rounded text-sm focus:ring-[#2E4696] focus:border-[#2E4696]"
                        placeholder="House No., Street, Brgy, City"
                    />
                    {errors.address && <p className="text-red-500 text-[10px] mt-1 font-bold italic">{errors.address}</p>}
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                    <Button 
                        type="submit" 
                        variant="success" 
                        disabled={processing}
                        className="px-10 py-3 shadow-md"
                    >
                        {processing ? 'UPDATING...' : 'UPDATE ADMIN PROFILE'}
                    </Button>

                    {recentlySuccessful && (
                        <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2 duration-300 uppercase tracking-tighter">
                            ✓ System Records Synchronized
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
}