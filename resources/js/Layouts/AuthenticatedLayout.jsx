import { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AuthenticatedLayout({ children, header }) {
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
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex md:flex-shrink-0 w-64 flex-col bg-[#2E4696] text-white">
                
                {/* Full Branding Area */}
                <div className="flex flex-col justify-center p-6 bg-[#243775] border-b border-[#3b58b8]/30 shadow-sm">
                    <h1 className="text-sm font-bold leading-tight uppercase tracking-wider">
                        Reality Based <br /> 
                        <span className="text-white">Therapeutic Community</span>
                    </h1>
                    <div className="mt-2 h-1 w-12 bg-blue-400 rounded-full"></div>
                    <p className="mt-2 text-[10px] text-blue-200 uppercase tracking-[0.15em] font-semibold opacity-80">
                        Information Management<br />System
                    </p>
                </div>
                
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {links.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 
                                    ${item.href !== '#' && route().current(item.href) 
                                        ? 'bg-[#3b58b8] text-white shadow-md' 
                                        : 'hover:bg-white/10 hover:text-white'}`}
                            >
                                <span className="mr-3 text-lg opacity-90">{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile & Logout Section */}
                    <div className="p-4 border-t border-[#3b58b8]/30 bg-[#243775]/50">
                        <div className="flex items-center mb-4 px-2">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 border-2 border-blue-300 flex items-center justify-center text-white font-bold shadow-sm">
                                {auth.user.first_name[0]}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">
                                    {auth.user.first_name} {auth.user.last_name}
                                </p>
                                <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
                                    {auth.user.role}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm font-medium text-blue-100 hover:bg-red-600 hover:text-white rounded-lg transition-all group"
                        >
                            <span className="mr-3 transition-transform group-hover:scale-110">🚪</span> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Top Navbar */}
                <header className="md:hidden bg-[#2E4696] text-white flex items-center justify-between px-4 h-16 shadow-lg z-20">
                    <span className="font-bold text-xs uppercase tracking-tight">Reality Based TC</span>
                    <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 rounded-md hover:bg-[#243775]">
                        {isMobileOpen ? '✕' : '☰'}
                    </button>
                </header>

                {/* Mobile Menu Dropdown */}
                {isMobileOpen && (
                    <div className="md:hidden bg-[#2E4696] text-white px-4 pt-2 pb-6 space-y-1 shadow-inner z-20 border-t border-[#3b58b8]/30">
                        {links.map((item) => (
                            <Link key={item.name} href={item.href} className="block px-3 py-2 rounded-md hover:bg-[#3b58b8] transition">
                                {item.name}
                            </Link>
                        ))}
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-300 font-bold">Logout</button>
                    </div>
                )}

                {/* Page Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 z-10">
                    <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                            {header}
                        </h1>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}