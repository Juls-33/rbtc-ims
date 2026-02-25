import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Button from '@/Components/Button';
import Toast from '@/Components/Toast'; 

export default function AddRoomModal({ isOpen, onClose, onSuccess }) {
    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        room_location: '',
        room_rate: '',
        status: 'Available',
    });

    const [toastInfo, setToastInfo] = useState({ show: false, message: '', type: 'success' });

    const handleModalClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    // --- Validation Logic ---
    const validate = () => {
        let isValid = true;
        clearErrors();

        if (!data.room_location || data.room_location.trim() === '') {
            setError('room_location', 'Location name is required.');
            isValid = false;
        }

        if (!data.room_rate || parseFloat(data.room_rate) <= 0) {
            setError('room_rate', 'Provide a valid daily rate.');
            isValid = false;
        }

        return isValid;
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (validate()) {
            post(route('admin.rooms.store'), {
                onSuccess: () => {
                    setToastInfo({ show: true, message: 'Room registered successfully!', type: 'success' });
                    // Give user time to see toast or handle success immediately
                    if (onSuccess) onSuccess(); 
                    handleModalClose();
                },
                onError: (err) => {
                    setToastInfo({ 
                        show: true, 
                        message: 'Submission failed. Please check inputs.', 
                        type: 'error' 
                    });
                }
            });
        } else {
            setToastInfo({ 
                show: true, 
                message: 'Please fill in the required fields.', 
                type: 'error' 
            });
        }
    };

    if (!isOpen) return null;

    const inputClass = (error) => `w-full border rounded px-3 py-2 text-sm transition-colors ${
        error ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-[#3D52A0] focus:border-[#3D52A0]'
    }`;

    const Label = ({ text, required = true, fieldError }) => (
        <label className={`block text-[10px] font-black uppercase tracking-tighter mb-1 ${fieldError ? 'text-red-500' : 'text-slate-500'}`}>
            {text} {required && <span className="text-red-600">*</span>}
        </label>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {toastInfo.show && (
                <Toast 
                    message={toastInfo.message} 
                    type={toastInfo.type} 
                    onClose={() => setToastInfo({ ...toastInfo, show: false })} 
                />
            )}

            {/* CONTAINER: Responsive flex-col with max-height for mobile scrolling */}
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-in zoom-in duration-150">
                
                {/* FIXED HEADER */}
                <div className="bg-[#3D52A0] text-white px-6 py-4 flex justify-between items-center shrink-0 shadow-sm">
                    <div>
                        <h3 className="font-black text-lg uppercase tracking-tight leading-none">Register New Room</h3>
                        <p className="text-[10px] text-blue-100 uppercase font-bold mt-1 tracking-widest">Facility Unit Setup</p>
                    </div>
                    <button onClick={handleModalClose} className="text-white hover:text-red-200 text-2xl font-bold leading-none">&times;</button>
                </div>

                {/* SCROLLABLE BODY */}
                <form onSubmit={submit} className="flex flex-col overflow-hidden">
                    <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-300">
                        
                        {/* Room Location */}
                        <div>
                            <Label text="Room Location / ID" fieldError={errors.room_location} />
                            <input 
                                type="text" 
                                className={inputClass(errors.room_location)}
                                placeholder="e.g. Ward B - Room 102"
                                value={data.room_location}
                                onChange={e => setData('room_location', e.target.value)}
                            />
                            {errors.room_location && (
                                <p className="text-[9px] text-red-500 mt-1 font-bold italic uppercase">{errors.room_location}</p>
                            )}
                        </div>

                        {/* Room Rate */}
                        <div>
                            <Label text="Daily Rate (₱)" fieldError={errors.room_rate} />
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-slate-400 text-sm font-bold">₱</span>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className={`${inputClass(errors.room_rate)} pl-7 font-mono font-bold`}
                                    placeholder="0.00"
                                    value={data.room_rate}
                                    onChange={e => setData('room_rate', e.target.value)}
                                />
                            </div>
                            {errors.room_rate && (
                                <p className="text-[9px] text-red-500 mt-1 font-bold italic uppercase">{errors.room_rate}</p>
                            )}
                        </div>

                        {/* Status Select */}
                        <div>
                            <Label text="Initial Status" required={false} />
                            <select 
                                className={inputClass()}
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                            >
                                <option value="Available">Available</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Cleaning">Cleaning</option>
                            </select>
                        </div>
                    </div>

                    {/* FIXED FOOTER: Stacked on mobile for better ergonomics */}
                    <div className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                        <Button 
                            type="button" 
                            variant="gray" 
                            onClick={handleModalClose} 
                            className="w-full sm:w-auto px-6 py-2.5 text-[10px] font-black uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="success" 
                            disabled={processing} 
                            className="w-full sm:w-auto px-8 py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95"
                        >
                            {processing ? 'Processing...' : 'Register Room'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}