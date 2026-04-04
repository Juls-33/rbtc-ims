import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const medicineIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M494-300q-40 40-97 40t-97-40q-40-40-40-96.5t40-96.5l166-167q40-40 97-40t97 40q40 40 40 96.5T660-467L494-300Zm-138-57q23 23 47.5 16.5T437-356l55-56-80-80-56 55q-17 17-17 40t17 40Zm248-246q-23-23-47.5-16.5T523-604l-55 56 80 80 56-55q17-17 17-40t-17-40ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm301.5-598.5Q510-807 510-820t-8.5-21.5Q493-850 480-850t-21.5 8.5Q450-833 450-820t8.5 21.5Q467-790 480-790t21.5-8.5ZM200-200v-560 560Z"/></svg>;
const patientIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M555-435q-35-35-35-85t35-85q35-35 85-35t85 35q35 35 35 85t-35 85q-35 35-85 35t-85-35ZM400-160v-76q0-21 10-40t28-30q45-27 95.5-40.5T640-360q56 0 106.5 13.5T842-306q18 11 28 30t10 40v76H400Zm86-80h308q-35-20-74-30t-80-10q-41 0-80 10t-74 30Zm182.5-251.5Q680-503 680-520t-11.5-28.5Q657-560 640-560t-28.5 11.5Q600-537 600-520t11.5 28.5Q623-480 640-480t28.5-11.5ZM640-520Zm0 280ZM120-400v-80h320v80H120Zm0-320v-80h480v80H120Zm324 160H120v-80h360q-14 17-22.5 37T444-560Z"/></svg>;
const staffIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M160-80q-33 0-56.5-23.5T80-160v-440q0-33 23.5-56.5T160-680h200v-120q0-33 23.5-56.5T440-880h80q33 0 56.5 23.5T600-800v120h200q33 0 56.5 23.5T880-600v440q0 33-23.5 56.5T800-80H160Zm0-80h640v-440H600q0 33-23.5 56.5T520-520h-80q-33 0-56.5-23.5T360-600H160v440Zm80-80h240v-18q0-17-9.5-31.5T444-312q-20-9-40.5-13.5T360-330q-23 0-43.5 4.5T276-312q-17 8-26.5 22.5T240-258v18Zm320-60h160v-60H560v60Zm-157.5-77.5Q420-395 420-420t-17.5-42.5Q385-480 360-480t-42.5 17.5Q300-445 300-420t17.5 42.5Q335-360 360-360t42.5-17.5ZM560-420h160v-60H560v60ZM440-600h80v-200h-80v200Zm40 220Z"/></svg>;

export default function DoctorFaqs({ auth }) {
    const [activeTab, setActiveTab] = useState('clinical');

    const tabs = [
        { id: 'clinical', name: 'Clinical Documentation', icon: patientIcon },
        { id: 'prescriptions', name: 'Prescription Management', icon: medicineIcon },
        { id: 'account', name: 'Account & Profile', icon: staffIcon },
    ];

    return (
        <AuthenticatedLayout auth={auth} header="Doctor User Guide" sectionTitle="Clinical Manual">
            <Head title="Doctor Guide" />
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tab Navigation */}
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
                            <span className={activeTab === tab.id ? 'text-white' : 'text-slate-400'}>
                                {tab.icon}
                            </span> 
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[50vh]">
                    {activeTab === 'clinical' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                            <h3 className="text-xl font-black text-[#2E4696] uppercase mb-4">Patient Documentation</h3>
                            <FaqItem q="How do I add consultation notes?" a="Navigate to the Patient Profile and use the 'Medical Notes' or 'Edit Status' sections to record findings and progress." />
                            <FaqItem q="Can I see historical data?" a="Yes. The 'Consultation History' tab provides a chronological view of all previous admissions and outpatient visits for that patient." />
                        </div>
                    )}
                    {activeTab === 'prescriptions' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                            <h3 className="text-xl font-black text-[#2E4696] uppercase mb-4">Managing Prescriptions</h3>
                            <FaqItem q="What is the difference between Catalog and Manual entry?" a="Searching the catalog links the prescription to inventory, allowing nurses to track stock. Manual entry is for items not currently in hospital supply." />
                            <FaqItem q="How does the schedule time work?" a="Set a time (e.g., 08:00) to specify when the nurse should administer the dose. This time triggers 'Overdue' alerts on the nurse dashboard." />
                        </div>
                    )}
                    {activeTab === 'account' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                            <h3 className="text-xl font-black text-[#2E4696] uppercase mb-4">Account Security</h3>
                            <FaqItem q="Can I change my role?" a="No. Roles are managed by the System Administrator. Contact them if your access level needs modification." />
                            <FaqItem q="How do I update my password?" a="Click your profile name in the header and select 'Profile Settings' to change your personal security information." />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function FaqItem({ q, a }) {
    return (
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h4 className="font-black text-[#3D52A0] text-sm uppercase mb-2 flex gap-2">
                <span className="text-blue-400">Q:</span> {q}
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed pl-6 border-l-2 border-blue-200">
                <span className="font-bold text-slate-400 mr-1 italic">A:</span> {a}
            </p>
        </div>
    );
}