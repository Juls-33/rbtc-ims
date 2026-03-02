// resources/js/Components/ClientPagination.jsx
import React from 'react';

export default function ClientPagination({ currentPage, totalPages, onPageChange, totalResults, itemsPerPage }) {
    if (totalPages <= 1) return null;

    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalResults);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full px-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Showing <span className="text-slate-900">{from}</span> to <span className="text-slate-900">{to}</span> of <span className="text-slate-900">{totalResults}</span> Records
            </div>

            <div className="flex items-center gap-1 shadow-sm rounded-lg overflow-hidden border border-slate-200 bg-white">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className={`px-4 py-2 text-[10px] font-black uppercase border-r transition-all ${currentPage === 1 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                > Prev </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => onPageChange(i + 1)}
                        className={`px-4 py-2 text-[10px] font-black border-r last:border-0 transition-all ${currentPage === i + 1 ? 'bg-[#2E4696] text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                    > {i + 1} </button>
                ))}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className={`px-4 py-2 text-[10px] font-black uppercase transition-all ${currentPage === totalPages ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                > Next </button>
            </div>
        </div>
    );
}