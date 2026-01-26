export default function StockLedgerTable({ logs }) {
    return (
        <table className="w-full text-left text-sm border-collapse">
            {/* ... thead remains the same ... */}
            <tbody className="text-slate-600">
                {logs.map((log, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold border-r border-slate-200">{log.dateTime}</td>
                        
                        {/* Display "CATALOG" if batch ID is null */}
                        <td className="p-3 border-r border-slate-200 text-xs font-mono">
                            {log.id !== 'N/A' ? log.id : <span className="text-blue-500 font-bold">CATALOG</span>}
                        </td>
                        
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{log.medicine_name}</td>
                        <td className="p-3 border-r border-slate-200 font-bold text-slate-800">{log.action}</td>
                        
                        {/* Hide amount if it's 0 (catalog change) */}
                        <td className={`p-3 border-r border-slate-200 text-center font-bold ${log.amount === "0" ? 'text-slate-300' : (log.amount.startsWith('+') ? 'text-emerald-600' : 'text-rose-600')}`}>
                            {log.amount === "0" ? "—" : log.amount}
                        </td>
                        
                        <td className="p-3 border-r border-slate-200 text-center font-bold text-slate-400">{log.newQty}</td>
                        <td className="p-3 border-r border-slate-200">{log.reason}</td>
                        <td className="p-3 font-bold text-slate-800">{log.admin}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}