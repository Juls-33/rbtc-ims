import React from 'react';

export default function StatCard({ label, value, color = 'text-gray-800', icon: Icon }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            {/* Optional: Icon Slot for better visuals */}
            {Icon && (
                <div className={`p-3 rounded-full bg-gray-50 ${color.replace('text', 'bg-opacity-10')}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
            )}
            
            <div className="text-center w-full">
                <h3 className={`text-3xl font-extrabold ${color}`}>
                    {value ?? 0}
                </h3>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                    {label}
                </p>
            </div>
        </div>
    );
}