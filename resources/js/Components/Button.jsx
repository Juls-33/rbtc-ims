// resources/js/Components/Button.jsx
import React from 'react';

export default function Button({ 
    type = 'button', 
    variant = 'primary', 
    className = '', 
    disabled, 
    children, 
    ...props 
}) {
    const variants = {
        primary: 'bg-[#2E4696] hover:bg-[#243776] text-white',
        success: 'bg-[#5A9167] hover:bg-[#4a7a55] text-white',
        danger: 'bg-[#D63E3E] hover:bg-red-700 text-white',
        warning: 'bg-[#E6AA68] hover:bg-[#d18e3a] text-white',
        gray: 'bg-slate-500 hover:bg-slate-600 text-white', // Added Gray variant
        outline: 'border-2 border-[#2E4696] text-[#2E4696] hover:bg-[#2E4696] hover:text-white',
        blue: 'bg-[#2E4696] text-white text-[8px] py-1 rounded w-24 font-bold uppercase shadow-sm hover:bg-[#1E2E63]',
    };

    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={
                `inline-flex items-center justify-center px-4 py-2 rounded font-bold text-[10px] uppercase tracking-widest transition ease-in-out duration-150 shadow-sm ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                } ${variants[variant]} ${className}`
            }
        >
            {children}
        </button>
    );
}