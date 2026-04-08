import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Added router
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function NurseDashboard({ auth, administrations, stats, batches = [] }) {
    const adminList = administrations || [];
    const metrics = stats || { overdue_count: 0, administered_today: 0, next_up: null, completion_rate: 0 };

    const [showAdministerModal, setShowAdministerModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    // Added this state to store filtered batches
    const [filteredBatches, setFilteredBatches] = useState([]);

    const { data, setData, post, processing, errors, reset } = useForm({
        prescription_id: '',
        sku_batch_id: '',
    });

    const submitAdminister = (e) => {
        e.preventDefault();
        // Updated to pass the ID in the route to match your controller: public function administerMedication(Request $request, $prescriptionId)
        post(route('nurse.prescriptions.administer', selectedPrescription.prescription_id), {
            onSuccess: () => {
                setShowAdministerModal(false);
                reset();
            },
        });
    };

    // Handle Outside Medication (The Direct flow)
    const handleAdministerOutside = (admin) => {
        if (confirm(`Administer ${admin.medication}? This will be logged but not tracked in inventory.`)) {
            router.post(route('administer.outside', admin.prescription_id), {}, {
                onSuccess: () => {
                    // You can add a toast notification call here
                    alert('Outside medication logged successfully!');
                }
            });
        }
    };

    // THE MAIN HANDLER: This decides which flow to take
    const handleAction = (admin) => {
        if (!admin.medicine_id) {
            handleAdministerOutside(admin);
        } else {
            const medicineBatches = batches.filter(b => Number(b.medicine_id) === Number(admin.medicine_id));
            
            if (medicineBatches.length === 0) {
                alert("No stock available for this medication!");
                return;
            }

            setSelectedPrescription(admin);
            setFilteredBatches(medicineBatches);
            setData('prescription_id', admin.prescription_id);
            setShowAdministerModal(true);
        }
    };

    return (    
        <AuthenticatedLayout
            auth={auth}
            header="Nurse / Dashboard"
        >
            <Head title="Nurse Dashboard" />

            <div className="space-y-6">
                {/* Top Section: Split View */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT COLUMN: Pending Administrations Table */}
                    <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[500px]">
                        <div className="bg-[#30499B] px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                            Pending Administrations
                        </div>
                        
                        <div className="p-0 overflow-auto flex-grow">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#30499B] text-white sticky top-0 z-10">
                                    <tr>
                                        <th className="p-3 border-r border-blue-400">Time Due</th>
                                        <th className="p-3 border-r border-blue-400">Patient ID</th>
                                        <th className="p-3 border-r border-blue-400">Patient Name</th>
                                        <th className="p-3 border-r border-blue-400">Room Number</th>
                                        <th className="p-3 border-r border-blue-400">Medications Due</th>
                                        <th className="p-3 border-r border-blue-400">Dosage</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {adminList.length > 0 ? adminList.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className={`p-3 font-bold ${item.isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                                                {item.time}
                                                {item.isOverdue && <div className="text-[10px] text-red-500 font-extrabold">OVERDUE</div>}
                                            </td>
                                            <td className="p-3 text-blue-600 font-bold">
                                                <Link href={route('nurse.patients.profile', item.db_id)} className="hover:underline">
                                                    {item.id}
                                                </Link>
                                            </td>
                                            <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="p-3 text-gray-700">{item.room}</td>
                                            <td className="p-3 font-bold text-blue-800">{item.medication}</td>
                                            <td className="p-3 text-gray-700">{item.dosage}</td>
                                            <td className="p-3 text-center">
                                                <button 
                                                    onClick={() => handleAction(item)} // Changed from openAdministerModal
                                                    className={`${!item.medicine_id ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#2E7D32] hover:bg-green-700'} text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase transition shadow-sm`}
                                                >
                                                    Administer
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="p-10 text-center text-gray-400 italic">
                                                No pending administrations for today.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Patient Search */}
                    <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[500px] flex flex-col">
                        <div className="bg-[#30499B] px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                            Patient Search
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <div className="mb-4">
                                <Link 
                                    href={route('nurse.patients')}
                                    className="w-full border border-gray-300 rounded shadow-sm text-xs py-2 px-3 block text-gray-400 hover:border-blue-500"
                                >
                                    Search Patient by ID or Name...
                                </Link>
                            </div>
                            
                            <div className="flex-grow flex items-center justify-center text-gray-400 text-xs italic border-2 border-dashed border-gray-100 rounded bg-gray-50 text-center p-4">
                                Use the search bar above to access full patient records.
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Daily Metrics */}
                <div className="bg-[#30499B] rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-2 text-white font-semibold border-b border-blue-400/30">
                        Daily Metrics
                    </div>
                    <div className="bg-white p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Metric 1: Meds Overdue */}
                        <div className="border border-gray-200 rounded p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                            <span className="text-sm font-bold text-red-500 uppercase flex items-center gap-1">
                                Meds Overdue 
                            </span>
                            <div className="flex items-end gap-2 mt-1">
                                <span className="text-3xl font-bold text-red-600">{metrics.overdue_count}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                
                                {/* Dynamic Progress Bar */}
                                <div className="w-full h-4 bg-blue-100 rounded-full mb-2 ml-2 overflow-hidden relative">
                                    <div 
                                        className="h-full bg-green-500 transition-all duration-500" 
                                        style={{ width: `${metrics.completion_rate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Metric 2: Administered Today */}
                        <div className="border border-gray-200 rounded p-4 shadow-sm flex justify-between items-center">
                            <div>
                                <span className="text-sm font-bold text-gray-500 uppercase">Administered Today</span>
                                <div className="text-3xl font-bold text-gray-800 mt-1">{metrics.administered_today}</div>
                            </div>
                            <div className="h-10 w-10 rounded-full border-4 border-t-purple-400 border-r-blue-500 border-b-green-400 border-l-orange-400"></div>
                        </div>

                        {/* Metric 3: Next to Administer */}
                        <div className="border border-gray-200 rounded p-4 shadow-sm">
                            <span className="text-sm font-bold text-gray-500 uppercase">
                                Next: {metrics.next_up ? metrics.next_up.time : '--:--'}
                            </span>
                            <div className="text-xl font-bold text-gray-800 mt-1 truncate">
                                {metrics.next_up ? metrics.next_up.name : 'No pending tasks'}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {/* --- ADMINISTER MODAL --- */}
            <Modal show={showAdministerModal} onClose={() => setShowAdministerModal(false)} maxWidth="md">
                <div className="bg-[#30499B] text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-bold uppercase tracking-wide text-sm">Administer Medication</h3>
                    <button onClick={() => setShowAdministerModal(false)} className="text-xl hover:text-gray-200">&times;</button>
                </div>

                <form onSubmit={submitAdminister} className="p-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Nurse's Name" />
                            <TextInput value={auth.user.name} disabled className="mt-1 block w-full bg-gray-100" />
                        </div>
                        <div>
                            <InputLabel value="Patient" />
                            <TextInput value={selectedPrescription?.name || ''} disabled className="mt-1 block w-full bg-gray-100" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Medicine Name" />
                            <TextInput value={selectedPrescription?.medication || ''} disabled className="mt-1 block w-full bg-gray-100 font-semibold text-[#30499B]" />
                        </div>
                        <div>
                            <InputLabel value="Prescribed Dosage" />
                            <TextInput value={selectedPrescription?.dosage || ''} disabled className="mt-1 block w-full bg-gray-100 font-semibold text-[#30499B]" />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Select Available Batch" />
                        <select 
                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm mt-1 text-sm"
                            value={data.sku_batch_id} 
                            onChange={e => setData('sku_batch_id', e.target.value)}
                            required
                        >
                            <option value="">Select a Batch</option>
                            {filteredBatches.map(batch => (
                                <option key={batch.sku_batch_id} value={batch.sku_batch_id}>
                                    Batch: {batch.sku_batch_id} (Qty: {batch.current_quantity}) - Exp: {batch.expiry_date}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.sku_batch_id} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => setShowAdministerModal(false)}>CANCEL</SecondaryButton>
                        <PrimaryButton className="bg-green-600 hover:bg-green-700" disabled={processing}>
                            {processing ? 'PROCESSING...' : 'CONFIRM ADMINISTRATION'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}