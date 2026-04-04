import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Icons provided by user
const dashboardIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Zm80-400h160v-240H200v240Zm400 320h160v-240H600v240Zm0-480h160v-80H600v80ZM200-200h160v-80H200v80Zm160-320Zm240-160Zm0 240ZM360-280Z"/></svg>;
const medicineIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M494-300q-40 40-97 40t-97-40q-40-40-40-96.5t40-96.5l166-167q40-40 97-40t97 40q40 40 40 96.5T660-467L494-300Zm-138-57q23 23 47.5 16.5T437-356l55-56-80-80-56 55q-17 17-17 40t17 40Zm248-246q-23-23-47.5-16.5T523-604l-55 56 80 80 56-55q17-17 17-40t-17-40ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm301.5-598.5Q510-807 510-820t-8.5-21.5Q493-850 480-850t-21.5 8.5Q450-833 450-820t8.5 21.5Q467-790 480-790t21.5-8.5ZM200-200v-560 560Z"/></svg>;
const patientIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M555-435q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35ZM400-160v-76q0-21 10-40t28-30q45-27 95.5-40.5T640-360q56 0 106.5 13.5T842-306q18 11 28 30t10 40v76H400Zm86-80h308q-35-20-74-30t-80-10q-41 0-80 10t-74 30Zm182.5-251.5Q680-503 680-520t-11.5-28.5Q657-560 640-560t-28.5 11.5Q600-537 600-520t11.5 28.5Q623-480 640-480t28.5-11.5ZM640-520Zm0 280ZM120-400v-80h320v80H120Zm0-320v-80h480v80H120Zm324 160H120v-80h360q-14 17-22.5 37T444-560Z"/></svg>;
const staffIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-157.5-77.5Q420-395 420-420t-17.5-42.5Q385-480 360-480t-42.5 17.5Q300-445 300-420t17.5 42.5Q335-360 360-360t42.5-17.5ZM560-420h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z"/></svg>;
const roomIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="M80-200v-240q0-27 11-49t29-39v-112q0-50 35-85t85-35h160q23 0 43 8.5t37 23.5q17-15 37-23.5t43-8.5h160q50 0 85 35t35 85v112q18 17 29 39t11 49v240h-80v-80H160v80H80Zm440-360h240v-80q0-17-11.5-28.5T720-680H560q-17 0-28.5 11.5T520-640v80Zm-320 0h240v-80q0-17-11.5-28.5T400-680H240q-17 0-28.5 11.5T200-640v80Zm-40 200h640v-80q0-17-11.5-28.5T760-480H200q-17 0-28.5 11.5T160-440v80Zm640 0H160h640Z"/></svg>;
const archiveIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><path d="m480-120-151-151 56-56 55 55v-228h80v228l55-55 56 56-151 151ZM240-320q-33 0-56.5-23.5T160-400v-400q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v400q0 33-23.5 56.5T720-320H240Zm0-80h480v-400H240v400Zm0 0v-400 400Z"/></svg>;

export default function Faqs({ auth }) {
    const [activeTab, setActiveTab] = useState('billing');

    const tabs = [
        { id: 'billing', name: 'Patient & Billing', icon: patientIcon },
        { id: 'inventory', name: 'Medicine Management', icon: medicineIcon },
        { id: 'room', name: 'Room Management', icon: roomIcon },
        { id: 'staff', name: 'Staff & Security', icon: staffIcon },
        { id: 'archive', name: 'Archive & Logs', icon: archiveIcon },
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header="Application User Guide"
            sectionTitle="Frequently Asked Questions & Manual"
        >
            <Head title="User Guide" />

            <div className="flex flex-col md:flex-row gap-6">
                {/* Tab Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-3 ${
                                activeTab === tab.id 
                                    ? 'bg-[#3D52A0] text-white shadow-md transform scale-[1.02]' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                        >
                            <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[65vh]">
                    <div className="p-6 md:p-8">
                        
                        {/* PATIENT & BILLING TAB */}
                        {activeTab === 'billing' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                                <section>
                                    <h3 className="text-xl font-black text-[#2E4696] uppercase tracking-tight mb-6 flex items-center gap-2">
                                        <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                                        Patient & Clinical Management
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ManualCard title="Registration" roles="Auth Staff" content="Register new patients via the Directory to create a permanent record." />
                                        <ManualCard title="Admissions" roles="Admin" content="Admit patients to available rooms and set the custom monthly rate." />
                                        <ManualCard title="Consultation" roles="Doctor" content="Doctors add medical notes and prescribe meds with specific dosages." />
                                        <ManualCard title="Updates" roles="Auth Staff" content="Authorized personnel can update patient info or delete old records." />
                                    </div>
                                </section>

                                <section className="pt-4 border-t border-slate-100">
                                    <h3 className="text-xl font-black text-[#2E4696] uppercase tracking-tight mb-6 flex items-center gap-2">
                                        <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
                                        Billing & Financial Processing
                                    </h3>
                                    <div className="space-y-4">
                                        <FaqItem q="How do I View and Manage Bills?" a="Click the 'Money' icon on a patient to see the View Bill Modal. Here you can see individual monthly statements, add misc items, or apply payments." />
                                        <FaqItem q="How do I Mark a Bill as Paid?" a="Use the Waterfall Logic: During discharge or in the billing modal, enter the amount. The system pays off the oldest statements first automatically." />
                                        <FaqItem q="How do I Generate a Billing Summary?" a="Inside the Discharge modal, use the 'Receipt PDF' button to generate a downloadable, itemized summary of all charges and payments." />
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* MEDICINE MANAGEMENT TAB */}
                        {activeTab === 'inventory' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                                <h3 className="text-xl font-black text-[#2E4696] uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <div className="h-6 w-1 bg-purple-500 rounded-full"></div>
                                    Medicine & Inventory Function
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <ManualCard title="Add New Medicine Supply" roles="Admin" content="Use 'Add Medicine' to create a catalog entry (Generic Name, Brand, Price, and Reorder Level)." />
                                    <ManualCard title="Modify Medicine Batches" roles="Admin" content="Manage SKU IDs, Expiry Dates, and Stock levels. Always add a new batch for new shipments to track expiry properly." />
                                    <ManualCard title="Update Medicine Details" roles="Admin" content="Edit existing catalog items to update pricing or generic names. This will affect all future prescriptions." />
                                </div>
                            </div>
                        )}

                        {/* ROOM MANAGEMENT TAB */}
                        {activeTab === 'room' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                                <h3 className="text-xl font-black text-[#2E4696] uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <div className="h-6 w-1 bg-teal-500 rounded-full"></div>
                                    Room & Facility Management
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <ManualCard 
                                        title="Manage Actual Rooms" 
                                        roles="Admin" 
                                        content="Navigate to 'Room Management' to add new rooms, modify existing room locations, or change their current maintenance status." 
                                    />
                                    <ManualCard 
                                        title="Set Default Prices" 
                                        roles="Admin" 
                                        content="Each room can be assigned a default Daily Rate. This rate is automatically pulled when a patient is admitted to that room, but can be overridden manually during admission if needed." 
                                    />
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <FaqItem 
                                        q="Can I change a room status manually?" 
                                        a="Yes. While the system automatically marks rooms as 'Occupied' upon admission and 'Available' upon discharge, Admins can manually set rooms to 'Maintenance' if they are undergoing repairs." 
                                    />
                                </div>
                            </div>
                        )}

                        {/* STAFF & SECURITY TAB */}
                        {activeTab === 'staff' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                                <h3 className="text-xl font-black text-[#2E4696] uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <div className="h-6 w-1 bg-rose-500 rounded-full"></div>
                                    Profile & Account Management
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ManualCard title="Create New Profile" roles="Admin" content="Register new staff members and assign their initial temporary password." />
                                    <ManualCard title="Update Account Roles" roles="Admin" content="Change staff roles between Admin, Doctor, or Nurse to modify their system access." />
                                    <ManualCard title="Reset User Passwords" roles="Admin" content="Use 'Quick Reset' to help staff who lost access. They must change it after logging in." />
                                    <ManualCard title="Deactivate Profiles" roles="Admin" content="Disable login access for resigned staff while preserving their historical audit logs." />
                                </div>
                                <section className="pt-4 border-t border-slate-100">
                                    <FaqItem q="How do I update my own Profile Information?" a="Click your name in the top right corner and select 'Profile Settings' to update your last name, contact number, or change your own password." />
                                </section>
                            </div>
                        )}

                        {/* ARCHIVE TAB */}
                        {activeTab === 'archive' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h3 className="text-xl font-black text-[#2E4696] uppercase tracking-tight mb-6 flex items-center gap-2">
                                    <div className="h-6 w-1 bg-slate-500 rounded-full"></div>
                                    Archive & Data Accountability
                                </h3>
                                <div className="space-y-6">
                                    <FaqItem q="Where are Deleted Profiles?" a="User profiles are 'Soft Deleted.' They are hidden from active lists but remain in the database to maintain integrity of medical logs." />
                                    <FaqItem q="What is the Stock Ledger?" a="Every time a batch quantity is modified, a record is created here showing who did it and the reason (e.g., Damage/Restock)." />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function FaqItem({ q, a }) {
    return (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h4 className="font-black text-[#3D52A0] text-sm uppercase tracking-wide mb-2 flex gap-2">
                <span className="text-blue-400">Q:</span> {q}
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed pl-6 border-l-2 border-blue-200">
                <span className="font-bold text-slate-400 mr-1 italic">A:</span> {a}
            </p>
        </div>
    );
}

function ManualCard({ title, roles, content }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-slate-800 text-sm uppercase">{title}</h4>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase">{roles}</span>
            </div>
            <p className="text-slate-600 text-sm leading-snug">{content}</p>
        </div>
    );
}