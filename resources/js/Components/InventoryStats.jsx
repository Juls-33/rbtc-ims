// resources/js/Pages/Admin/Partials/InventoryStats.jsx

import React from 'react';

export default function InventoryStats({ stats }) {
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {stats.map((stat, i) => (
                <div 
                    key={i} 
                    className={`p-5 md:p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center transition-all hover:shadow-md shadow-sm ${stat.bg}`}
                >
                    <span className={`text-3xl md:text-4xl font-black mb-1 ${stat.color}`}>
                        {stat.value || 0}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] text-center leading-tight">
                        {stat.label}
                    </span>
                </div>
            ))}
        </div>
    );
}