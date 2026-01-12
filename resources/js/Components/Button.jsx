import React from 'react';

export default function Button({ 
    type = 'button', 
    variant = 'primary', 
    className = '', 
    disabled, 
    children, 
    ...props 
}) {
    // Styling mapping to match your UI
    const variants = {
        primary: 'bg-[#2E4696] hover:bg-[#2d3a75] text-white', //blue
        success: 'bg-[#2E8B57] hover:bg-[#4a824e] text-white', //green
        danger: 'bg-[#D63E3E] hover:bg-red-700 text-white', //custom red
        outline: 'border-2 border-[#2E4696] text-[#2E4696] hover:bg-[#2E4696] hover:text-white',
    };

    return (
        <button
            {...props}
            type={type}
            disabled={disabled}
            className={
                `inline-flex items-center px-4 py-2 rounded-md font-bold text-xs uppercase tracking-widest transition ease-in-out duration-150 ${
                    disabled && 'opacity-25'
                } ${variants[variant]} ${className}`
            }
        >
            {children}
        </button>
    );
}