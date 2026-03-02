// resources/js/Components/Pagination.jsx

import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ data }) {
    // If no data or links, don't render anything to avoid crashes
    if (!data || !data.links || data.links.length <= 3) return null;

    const { links, from, to, total } = data;

    // Helper to clean up Laravel's "&laquo; Previous" labels
    const cleanLabel = (label) => {
        return label.replace('&laquo; ', '').replace(' &raquo;', '');
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full px-2">
            {/* 1. Showing Results Text (Fixed the NaN here) */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Showing <span className="text-slate-900">{from || 0}</span> to{' '}
                <span className="text-slate-900">{to || 0}</span> of{' '}
                <span className="text-slate-900">{total || 0}</span> Records
            </div>

            {/* 2. Pagination Buttons */}
            <div className="flex items-center gap-1 shadow-sm rounded-lg overflow-hidden border border-slate-200 bg-white">
                {links.map((link, key) => {

                    
                    const isPageNumber = !isNaN(link.label);
                    const isPrevNext = link.label.includes('Previous') || link.label.includes('Next');
                    const isActive = link.active;
                    
                    return link.url === null ? (
                        <div
                            key={key}
                            className="px-3 py-2 text-[10px] font-black text-slate-300 bg-slate-50 cursor-not-allowed uppercase tracking-tighter"
                            dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }}
                        />
                    ) : (
                        <Link
                            key={key}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`px-4 py-2 text-[10px] font-black transition-all border-r last:border-0 uppercase tracking-tighter ${
                                isActive 
                                    ? 'bg-[#2E4696] text-white border-[#2E4696]' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                            }`}
                        >
                            <span dangerouslySetInnerHTML={{ __html: cleanLabel(link.label) }} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}