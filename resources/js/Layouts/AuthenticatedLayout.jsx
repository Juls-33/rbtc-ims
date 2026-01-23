import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
//import MedicineInventory from '@/Pages/admin/MedicineInventory';

export default function AuthenticatedLayout({ children, header, sectionTitle }) {
    const { auth } = usePage().props;
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const navigation = {
        Admin: [
            { name: 'Dashboard', routeName: 'dashboard', href: route('dashboard'), icon: '📊' },
            { name: 'Medicine Inventory', routeName: 'inventory.index', href: route('inventory.index'), icon: '💊' },
            { name: 'Patient Management', routeName: 'admin.patients', href: route('admin.patients'), icon: '👤' },
            { name: 'Staff Management', routeName: 'admin.staff', href: route('admin.staff'), icon: '🆔' },
        ],
        Doctor: [
            { name: 'Dashboard', routeName: 'doctor.dashboard', href: '#', icon: '📊' },
            { name: 'Patient Records', routeName: 'doctor.patients', href: '#', icon: '📋' },
        ],
        Nurse: [
            { name: 'Dashboard', routeName: 'nurse.dashboard', href: '#', icon: '📊' },
            { name: 'Patient Vitals', routeName: 'nurse.patients', href: '#', icon: '🌡️' },
        ],
    };

    const links = navigation[auth.user.role] || [];

    return (
        <div className="flex h-screen bg-slate-200 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex md:flex-shrink-0 w-72 flex-col bg-[#2E4696] text-white">
                
                {/* Logo Area */}
                <div className="p-6 flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                        <span className="text-[#2E4696] font-bold text-xs text-center leading-none">LOGO</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight uppercase tracking-tight">Reality Based</h1>
                        <h1 className="text-sm font-bold leading-tight uppercase tracking-tight">Therapeutic</h1>
                        <h1 className="text-sm font-bold leading-tight uppercase tracking-tight">Community</h1>
                    </div>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 mt-4">
                    {links.map((item) => {
                        // Use routeName to check active state
                        const isActive = item.routeName && route().current(item.routeName);
                        
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-l-[6px]
                                    ${isActive 
                                        ? 'bg-white/10 border-[#4CAF50] text-white' 
                                        : 'border-transparent hover:bg-white/5 text-slate-200'}`}
                            >
                                <span className="mr-4 text-xl opacity-90">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile & Logout Section */}
                <div className="p-6 mt-auto border-t border-white/10 bg-black/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center text-[#2E4696] shadow-inner">
                           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate leading-none mb-1">{auth.user.first_name} {auth.user.last_name}</p>
                            <button 
                                onClick={handleLogout}
                                className="text-xs text-slate-300 flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <span className="text-base">↪</span> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-[#2E4696] h-16 flex items-center justify-between px-8 z-20 shadow-md">
                    <div className="text-white font-medium text-sm tracking-wide">
                        {header}
                    </div>
                    <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition group">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-[#2E4696] rounded-full group-hover:scale-110 transition-transform"></span>
                    </button>
                </header>

                {/* Content Wrapper */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-2xl min-h-full overflow-hidden flex flex-col">
                        
                        {/* Blue Section Label Bar */}
                        <div className="bg-[#3D52A0] border-b border-black/10 min-h-[56px] flex items-center">
                            {typeof sectionTitle === 'string' ? (
                                <h2 className="px-6 py-4 text-white font-bold uppercase tracking-widest text-sm">
                                    {sectionTitle}
                                </h2>
                            ) : (
                                /* This allows the Tabs component to take up the full bar */
                                <div className="w-full h-full flex">
                                    {sectionTitle}
                                </div>
                            )}
                        </div>

                        {/* White Page Content Area */}
                        <div className="p-8 flex-1 bg-white">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}