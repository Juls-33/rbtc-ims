import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ children, header, sectionTitle }) {
    const { auth } = usePage().props;
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post(route('logout'));
    };

    const navigation = {
        Admin: [
            { name: 'Dashboard', href: route('dashboard'), icon: '📊' },
            { name: 'Medicine Inventory', href: '#', icon: '💊' },
            { name: 'Patient Management', href: '#', icon: '👤' },
            { name: 'Staff Management', href: '#', icon: '🆔' },
        ],
        Doctor: [
            { name: 'Dashboard', href: '#', icon: '📊' },
            { name: 'Patient Records', href: '#', icon: '📋' },
        ],
        Nurse: [
            { name: 'Dashboard', href: '#', icon: '📊' },
            { name: 'Patient Vitals', href: '#', icon: '🌡️' },
        ],
    };

    const links = navigation[auth.user.role] || [];

    return (
        <div className="flex h-screen bg-slate-200 overflow-hidden font-sans">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex md:flex-shrink-0 w-72 flex-col bg-[#2E4696] text-white">
                
                {/* Logo Area - Matching Mockup Spacing */}
                <div className="p-6 flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {/* Replace with actual logo <img> tag */}
                        <span className="text-[#2E4696] font-bold text-xs text-center leading-none">LOGO</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight">Reality Based</h1>
                        <h1 className="text-sm font-bold leading-tight">Therapeutic</h1>
                        <h1 className="text-sm font-bold leading-tight">Community</h1>
                    </div>
                </div>
                
                {/* Navigation Links */}
                <nav className="flex-1 mt-4">
                    {links.map((item) => {
                        const isActive = item.href !== '#' && route().current(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                // Green highlight for active item as requested
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-l-4
                                    ${isActive 
                                        ? 'bg-white/10 border-[#4CAF50] text-white' 
                                        : 'border-transparent hover:bg-white/5 text-slate-200'}`}
                            >
                                <span className="mr-4 text-xl">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile & Logout Section */}
                <div className="p-6 mt-auto border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center text-[#2E4696]">
                           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{auth.user.first_name} {auth.user.last_name}</p>
                            <button 
                                onClick={handleLogout}
                                className="text-xs text-slate-300 flex items-center gap-1 hover:text-white transition-colors"
                            >
                                <span className="text-lg">↪</span> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar with Notifications */}
                <header className="bg-[#2E4696] h-16 flex items-center justify-between px-8 z-20">
                    <div className="text-slate-600  md:text-white font-medium text-sm">
                        {header}
                    </div>
                    <button className="relative p-2 text-white hover:bg-white/10 rounded-full transition">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 border-2 border-[#2E4696] rounded-full"></span>
                    </button>
                </header>

                {/* Content Wrapper */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    <div className="max-w-[1600px] mx-auto bg-white rounded-lg shadow-xl min-h-full overflow-hidden flex flex-col">
                        
                        {/* Blue Section Label Bar (Matching Mockup) */}
                        <div className="bg-[#3D52A0] px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white font-semibold tracking-wide">
                                {sectionTitle || 'Content Overview'}
                            </h2>
                        </div>

                        {/* White Page Content Area */}
                        <div className="p-6 flex-1 bg-white">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}