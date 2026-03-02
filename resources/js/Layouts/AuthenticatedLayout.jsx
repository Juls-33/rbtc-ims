import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import LogoutModal from '../Components/LogoutModal';
import NotificationPopover from '../Components/NotificationPopover';
import GlobalLoader from '@/Components/GlobalLoader';
import Toast from '@/Components/Toast';
import ResetStaffPasswordModal from '@/Pages/Admin/Partials/ResetStaffPasswordModal';

export default function AuthenticatedLayout({ children, header, sectionTitle }) {
    const { auth, notifications = [] } = usePage().props;
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [targetStaff, setTargetStaff] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ 
                id: Date.now(), 
                message: flash.success, 
                type: 'success' 
            });
        } else if (flash?.error) {
            setToast({ 
                id: Date.now(), 
                message: flash.error, 
                type: 'danger' 
            });
        }
    }, [flash]);

    const handleLogoutTrigger = (e) => {
        e.preventDefault();
        setIsLogoutModalOpen(true);
    };

    const handleNotificationClick = (alert) => {
        if (alert.actionType === 'QUICK_RESET') {
            setTargetStaff({
                id: alert.staff_db_id,
                name: alert.staff_name
            });
            setIsResetModalOpen(true);
            setIsNotificationOpen(false);
        } else if (alert.link) {
            router.get(alert.link);
            setIsNotificationOpen(false);
        }
    };

    const dashboardIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"/></svg>;
    const medicineIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M494-300q-40 40-97 40t-97-40q-40-40-40-96.5t40-96.5l166-167q40-40 97-40t97 40q40 40 40 96.5T660-467L494-300Zm-138-57q23 23 47.5 16.5T437-356l55-56-80-80-56 55q-17 17-17 40t17 40Zm248-246q-23-23-47.5-16.5T523-604l-55 56 80 80 56-55q17-17 17-40t-17-40ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm301.5-598.5Q510-807 510-820t-8.5-21.5Q493-850 480-850t-21.5 8.5Q450-833 450-820t8.5 21.5Q467-790 480-790t21.5-8.5ZM200-200v-560 560Z"/></svg>;
    const patientIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M555-435q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35ZM400-160v-76q0-21 10-40t28-30q45-27 95.5-40.5T640-360q56 0 106.5 13.5T842-306q18 11 28 30t10 40v76H400Zm86-80h308q-35-20-74-30t-80-10q-41 0-80 10t-74 30Zm182.5-251.5Q680-503 680-520t-11.5-28.5Q657-560 640-560t-28.5 11.5Q600-537 600-520t11.5 28.5Q623-480 640-480t28.5-11.5ZM640-520Zm0 280ZM120-400v-80h320v80H120Zm0-320v-80h480v80H120Zm324 160H120v-80h360q-14 17-22.5 37T444-560Z"/></svg>;
    const staffIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-157.5-77.5Q420-395 420-420t-17.5-42.5Q385-480 360-480t-42.5 17.5Q300-445 300-420t17.5 42.5Q335-360 360-360t42.5-17.5ZM560-420h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z"/></svg>;
    const roomIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M80-200v-240q0-27 11-49t29-39v-112q0-50 35-85t85-35h160q23 0 43 8.5t37 23.5q17-15 37-23.5t43-8.5h160q50 0 85 35t35 85v112q18 17 29 39t11 49v240h-80v-80H160v80H80Zm440-360h240v-80q0-17-11.5-28.5T720-680H560q-17 0-28.5 11.5T520-640v80Zm-320 0h240v-80q0-17-11.5-28.5T400-680H240q-17 0-28.5 11.5T200-640v80Zm-40 200h640v-80q0-17-11.5-28.5T760-480H200q-17 0-28.5 11.5T160-440v80Zm640 0H160h640Z"/></svg>
    const logoutIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>;

    // 🔥 Unified Navigation: All roles point to 'profile.edit' for Profile
    const navigation = {
        Admin: [
            { name: 'Dashboard', routeName: 'dashboard', href: route('dashboard'), icon: dashboardIcon },
            { name: 'Medicine Inventory', routeName: 'inventory.index', href: route('inventory.index'), icon: medicineIcon },
            { name: 'Patient Management', routeName: 'admin.patients', href: route('admin.patients'), icon: patientIcon },
            { name: 'Staff Management', routeName: 'admin.staff', href: route('admin.staff'), icon: staffIcon },
            { name: 'Room Management', routeName: 'admin.rooms', href: route('admin.rooms'), icon: roomIcon },
        ],
        Doctor: [
            { name: 'Dashboard', routeName: 'doctor.dashboard', href: route('doctor.dashboard'), icon: dashboardIcon },
            { name: 'Patients', routeName: 'doctor.patients', href: route('doctor.patients'), icon: patientIcon },
            { name: 'Profile', routeName: 'profile.edit', href: route('profile.edit'), icon: staffIcon },
        ],
        Nurse: [
            { name: 'Dashboard', routeName: 'nurse.dashboard', href: route('nurse.dashboard'), icon: dashboardIcon },
            { name: 'Patients', routeName: 'nurse.patients', href: route('nurse.patients'), icon: patientIcon },
            { name: 'Profile', routeName: 'profile.edit', href: route('profile.edit'), icon: staffIcon },
        ],
    };

    const links = navigation[auth.user.role] || [];

    // 🔥 Simplified: Same route for everyone
    const getProfileRoute = () => route('profile.edit');

    return (
        <div className="flex h-screen bg-slate-200 overflow-hidden font-sans flex-col md:flex-row">
            <div className="fixed top-5 right-5 z-[9999] w-auto max-w-[calc(100%-2.5rem)] md:max-w-sm">
                {toast && (
                    <Toast 
                        key={toast.id} 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </div>
            <GlobalLoader />
            
            <aside className="hidden md:flex md:flex-shrink-0 w-72 flex-col bg-[#2E4696] text-white">
                <div className="p-6 flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden shadow-md">
                        <img src="/assets/logo.png" alt="RBTC Logo" className="w-full h-full object-contain p-1" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight uppercase tracking-tight text-white">Reality Based</h1>
                        <h1 className="text-sm font-bold leading-tight uppercase tracking-tight text-white">Therapeutic</h1>
                        <h1 className="text-sm font-bold leading-tight uppercase tracking-tight text-white">Community</h1>
                    </div>
                </div>
                
                <nav className="flex-1 mt-4">
                    {links.map((item) => {
                        const isActive = item.routeName && route().current(item.routeName);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 border-l-[6px]
                                    ${isActive ? 'bg-white/10 border-[#4CAF50] text-white' : 'border-transparent hover:bg-white/5 text-slate-200'}`}
                            >
                                <span className="mr-4 text-xl opacity-90">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-white/10 bg-black/10">
                    <div className="flex flex-col gap-2">
                        <Link href={getProfileRoute()} className="flex items-center gap-3 hover:bg-white/10 p-2 -ml-2 rounded-lg transition-colors group">
                            <div className="w-12 h-12 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center text-[#2E4696] shadow-inner group-hover:scale-105 transition-transform">
                               <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            <div className="overflow-hidden text-white">
                                <p className="text-sm font-bold truncate leading-none mb-0.5 group-hover:text-blue-200">
                                    {auth.user.first_name} {auth.user.last_name}
                                </p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest group-hover:text-white">View Profile</p>
                            </div>
                        </Link>
                        <button onClick={handleLogoutTrigger} className="text-xs text-slate-400 flex items-center gap-1 hover:text-red-300 transition-colors ml-14 -mt-1 uppercase font-bold tracking-tighter">
                            <span className="text-base">{logoutIcon}</span> Logout
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="bg-[#2E4696] h-16 flex items-center justify-between px-4 md:px-8 z-20 shadow-md flex-shrink-0">
                    <div className="text-white font-black text-xs md:text-sm uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">
                        {header}
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            className="relative p-2 text-white hover:bg-white/10 rounded-full transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                            )}
                        </button>

                        <button onClick={handleLogoutTrigger} className="md:hidden p-2 text-white/70 hover:text-white transition">
                            {logoutIcon}
                        </button>
                    </div>

                    <NotificationPopover 
                        isOpen={isNotificationOpen} 
                        onClose={() => setIsNotificationOpen(false)} 
                        notifications={notifications} 
                        onAction={handleNotificationClick}
                    />
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-6 pb-20 md:pb-6 bg-slate-100">
                    <div className="max-w-[1600px] mx-auto bg-white rounded-xl shadow-lg min-h-full overflow-hidden flex flex-col border border-slate-300">
                        <div className="bg-[#3D52A0] border-b border-black/10 min-h-[56px] flex items-center overflow-x-auto no-scrollbar scroll-smooth">
                            <div className="flex w-full min-w-max">
                                {typeof sectionTitle === 'string' ? (
                                    <h2 className="px-6 py-4 text-white font-black uppercase tracking-widest text-xs">
                                        {sectionTitle}
                                    </h2>
                                ) : (
                                    <div className="flex-1 h-full flex min-w-0">
                                        {sectionTitle}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 md:p-8 flex-1">
                            {children}
                        </div>
                    </div>
                </main>

                <nav className="md:hidden fixed bottom-0 w-full bg-[#2E4696] border-t border-white/10 flex justify-around items-center h-16 z-30 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                    {links.map((item) => {
                        const isActive = item.routeName && route().current(item.routeName);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200
                                    ${isActive ? 'text-[#4CAF50] bg-white/5' : 'text-slate-300'}`}
                            >
                                <span className="text-xl mb-0.5">{item.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />

            {targetStaff && (
                <ResetStaffPasswordModal 
                    isOpen={isResetModalOpen} 
                    onClose={() => {
                        setIsResetModalOpen(false);
                        setTargetStaff(null);
                    }} 
                    member={targetStaff} 
                />
            )}
        </div>
    );
}