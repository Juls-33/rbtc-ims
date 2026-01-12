import React from 'react';

export default function StaffTable({ staff, title }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-700">{title}</h3>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-xs uppercase text-gray-400 bg-gray-50/50">
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold">Role</th>
                        <th className="px-6 py-3 font-semibold">Contact</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {staff.length > 0 ? staff.map((person) => (
                        <tr key={person.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                {person.first_name} {person.last_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{person.role}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{person.contact_no}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-8 text-center text-gray-400 italic">
                                No records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}