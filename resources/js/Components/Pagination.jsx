import React from 'react';

export default function Pagination({ currentPage, totalPages, filteredLength, indexOfFirstItem, indexOfLastItem, onPageChange }) {
    if (filteredLength === 0) return null;

    return (
        <div className="mt-6 flex justify-end items-center gap-4 text-sm font-medium text-slate-500">
            <span className="text-xs text-slate-400 mr-2">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredLength)} of {filteredLength}
            </span>
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className={currentPage === 1 ? 'text-slate-300' : 'hover:text-[#2E4696]'}
            > ← Previous </button>
            <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button 
                        key={number} 
                        onClick={() => onPageChange(number)} 
                        className={`w-8 h-8 rounded ${currentPage === number ? 'bg-[#2E4696] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    > {number} </button>
                ))}
            </div>
            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className={currentPage === totalPages ? 'text-slate-300' : 'hover:text-[#2E4696]'}
            > Next → </button>
        </div>
    );
}