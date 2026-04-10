import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartSkeleton from './ChartSkeleton';

const MOCK = [
    { hour: '6am', entries: 2, exits: 0 },
    { hour: '7am', entries: 5, exits: 1 },
    { hour: '8am', entries: 12, exits: 2 },
    { hour: '9am', entries: 15, exits: 4 },
    { hour: '10am', entries: 8, exits: 6 },
    { hour: '11am', entries: 6, exits: 9 },
    { hour: '12pm', entries: 10, exits: 7 },
    { hour: '1pm', entries: 4, exits: 8 },
    { hour: '2pm', entries: 3, exits: 11 },
    { hour: '3pm', entries: 2, exits: 14 },
    { hour: '4pm', entries: 1, exits: 10 },
    { hour: '5pm', entries: 0, exits: 6 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
                <p className="font-bold text-slate-700 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="font-semibold" style={{ color: p.stroke }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const EntryExitChart = ({ data, loading }) => {
    const chartData = (data && data.filter(d => d.entries > 0 || d.exits > 0).length > 0) ? data : MOCK;

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Entry vs Exit</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Vehicle flow over the last 24 hours</p>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="w-3 h-0.5 bg-emerald-400 rounded" />Entries
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-rose-500">
                        <span className="w-3 h-0.5 bg-rose-400 rounded" />Exits
                    </span>
                </div>
            </div>
            {loading ? (
                <ChartSkeleton height="h-44" />
            ) : (
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="exitGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="hour" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="entries" name="Entries" stroke="#22c55e" strokeWidth={2} fill="url(#entryGrad)" dot={false} />
                        <Area type="monotone" dataKey="exits"   name="Exits"   stroke="#f43f5e" strokeWidth={2} fill="url(#exitGrad)"  dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default EntryExitChart;
