import React from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import InputError from '@/Components/InputError';

export default function DatePicker({ 
    label, 
    value, 
    onChange, 
    error, 
    minDate, 
    maxDate, 
    placeholder = "YYYY-MM-DD",
    required = false 
}) {
    // Custom internal class to match your project's TextInput style
    const inputClass = `w-full border rounded-lg px-3 py-2 text-sm transition-colors shadow-sm focus:ring-1 focus:ring-[#3D52A0] focus:border-[#3D52A0] ${
        error ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white'
    }`;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <ReactDatePicker
                selected={value ? new Date(value) : null}
                onChange={(date) => {
                    // Format back to YYYY-MM-DD for Laravel database compatibility
                    if (date) {
                        const offset = date.getTimezoneOffset();
                        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                        onChange(adjustedDate.toISOString().split('T')[0]);
                    } else {
                        onChange('');
                    }
                }}
                dateFormat="yyyy-MM-dd"
                minDate={minDate}
                maxDate={maxDate}
                placeholderText={placeholder}
                className={inputClass}
                autoComplete="off"
                // Standard browser behavior overrides
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
            />
            
            {error && <InputError message={error} className="mt-1" />}
        </div>
    );
}