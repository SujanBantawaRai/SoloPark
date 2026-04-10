import React from 'react';

const MOCK = [
    { _id: '1', slotNumber: 'A-12', zone: 'Zone A', vehicleNumber: 'BA 1 JA 1234', userName: 'Aarav Sharma', entryTime: new Date(Date.now() - 72 * 60000), minsParked: 72, vehicleStatus: 'Occupied' },
    { _id: '2', slotNumber: 'B-03', zone: 'Zone B', vehicleNumber: 'BA 2 KA 5678', userName: 'Priya Thapa', entryTime: new Date(Date.now() - 185 * 60000), minsParked: 185, vehicleStatus: 'Occupied' },
    { _id: '3', slotNumber: 'C-07', zone: 'Zone C', vehicleNumber: 'BA 3 CHA 9012', userName: 'Rajan Rai', entryTime: new Date(Date.now() - 410 * 60000), minsParked: 410, vehicleStatus: 'Leaving Soon' },
    { _id: '4', slotNumber: 'D-01', zone: 'Zone D', vehicleNumber: 'BA 1 PA 3456', userName: 'Sita Gurung', entryTime: new Date(Date.now() - 520 * 60000), minsParked: 520, vehicleStatus: 'Overstay' },
    { _id: '5', slotNumber: 'A-05', zone: 'Zone A', vehicleNumber: 'BA 4 DA 7890', userName: 'Bikash Limbu', entryTime: new Date(Date.now() - 30 * 60000), minsParked: 30, vehicleStatus: 'Occupied' },
];

const STATUS_BADGE = {
    Occupied:       'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Leaving Soon': 'bg-amber-50 text-amber-700 border-amber-200',
    Overstay:       'bg-red-50 text-red-700 border-red-200',
};

const formatMins = (m) => {
    if (m < 60) return `${m}m`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const LiveVehiclesTable = ({ data, loading }) => {
    const rows = (data && data.length > 0) ? data : MOCK;

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Live Parked Vehicles</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">{rows.length} active parkings right now</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Real-time
                </span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/70 border-b border-slate-100">
                        <tr>
                            {['Slot', 'User', 'Vehicle No.', 'Entry Time', 'Duration', 'Status'].map(h => (
                                <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white/50">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(6)].map((_, j) => (
                                        <td key={j} className="px-5 py-4">
                                            <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (j * 10) % 30}%` }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : rows.map(row => (
                            <tr key={row._id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-5 py-4">
                                    <div>
                                        <p className="font-black text-slate-800 text-sm">{row.slotNumber}</p>
                                        <p className="text-xs text-slate-400 font-medium">{row.zone}</p>
                                    </div>
                                </td>
                                <td className="px-5 py-4 font-semibold text-slate-700 text-sm">{row.userName}</td>
                                <td className="px-5 py-4 font-mono font-bold text-slate-700 text-sm">{row.vehicleNumber}</td>
                                <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                                    {row.entryTime ? new Date(row.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                </td>
                                <td className="px-5 py-4 font-bold text-slate-700 text-sm">{formatMins(row.minsParked)}</td>
                                <td className="px-5 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[row.vehicleStatus] || STATUS_BADGE.Occupied}`}>
                                        {row.vehicleStatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LiveVehiclesTable;
