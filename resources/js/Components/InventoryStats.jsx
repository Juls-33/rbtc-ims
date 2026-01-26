import React from 'react';

export default function InventoryStats({ stats }) {
    const statCards = [
        { label: 'Total Items', value: stats.totalItems },
        { label: 'Critical Stock', value: stats.critical },
        { label: 'Expiring Soon', value: stats.expiringSoon },
        { label: 'Out of Stock', value: stats.outOfStock },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</span>
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</span>
                </div>
            ))}
        </div>
    );
}