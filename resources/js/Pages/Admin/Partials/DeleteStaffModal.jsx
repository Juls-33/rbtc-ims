import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast';

export default function DeleteStaffModal({ isOpen, onClose, member }) {
    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });
    
    const { data, setData, delete: destroy, processing, reset } = useForm({
        reason: 'Duplicate',
    });

    const handleModalClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        destroy(route('admin.staff.destroy', member.id), {
            data: { reason: data.reason },
            onSuccess: () => {
                setToastInfo({ show: true, message: 'Account permanently removed from system.', type: 'success' });
                handleModalClose();
            },
            onError: () => {
                setToastInfo({ show: true, message: 'Deletion failed. System error occurred.', type: 'error' });
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 md:p-4 font-sans text-slate-800">
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
                
                {/* HEADER */}
                <div className="bg-[#C84B4B] text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-md">
                    <div>
                        <h3 className="font-black text-base md:text-lg uppercase tracking-tight leading-none">Security Alert</h3>
                        <p className="text-[10px] text-rose-100 uppercase tracking-widest mt-1">Account Deletion Protocol</p>
                    </div>
                    <button onClick={handleModalClose} className="text-2xl hover:text-rose-200 transition-colors leading-none">&times;</button>
                </div>

                {/* SCROLLABLE BODY */}
                <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                        
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Confirming permanent deletion for staff member: <br/> 
                                <span className="font-black text-slate-900 text-lg uppercase tracking-tight">{member?.name}</span>
                            </p>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">System Consequences</p>
                            <ul className="text-xs space-y-2 text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>User credentials will be immediately <span className="font-bold">revoked</span>.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>Historical records linked to this account will be archived or removed based on policy.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Reason for Deletion</label>
                            <select 
                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white transition-all"
                                value={data.reason}
                                onChange={e => setData('reason', e.target.value)}
                            >
                                <option value="Duplicate">Duplicate Account</option>
                                <option value="Test">System Testing / Debugging</option>
                                <option value="Data Retention Policy">Data Retention Policy</option>
                                <option value="Privacy Request">Personnel Privacy Request</option>
                            </select>
                        </div>
                    </div>

                    {/* FOOTER */}
                    <div className="p-6 bg-slate-100 border-t flex flex-col-reverse sm:flex-row justify-center gap-3 shrink-0">
                        <Button 
                            type="button" 
                            variant="gray" 
                            onClick={handleModalClose} 
                            className="w-full sm:flex-1 py-3 font-black text-[10px] uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="danger" 
                            disabled={processing} 
                            className="w-full sm:flex-[1.5] py-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50"
                        >
                            {processing ? 'DELETING...' : 'Yes, Delete Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}