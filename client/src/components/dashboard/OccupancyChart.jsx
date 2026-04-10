import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import ChartSkeleton from './ChartSkeleton';

const MOCK = [
    { day: 'Mon', occupied: 12 },
    { day: 'Tue', occupied: 19 },
    { day: 'Wed', occupied: 15 },
    { day: 'Thu', occupied: 22 },
    { day: 'Fri', occupied: 28 },
    { day: 'Sat', occupied: 18 },
    { day: 'Sun', occupied: 10 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
                <p className="font-bold text-slate-700 mb-1">{label}</p>
                <p className="text-indigo-600 font-semibold">{payload[0].value} vehicles</p>
            </div>
        );
    }
    return null;
};

const OccupancyChart = ({ data, loading }) => {
    const chartData = (data && data.length > 0) ? data : MOCK;

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Occupancy Trend</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Vehicles parked per day (last 7 days)</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            {loading ? (
                <ChartSkeleton height="h-44" />
            ) : (
                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="occupied"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="url(#occGrad)"
                            dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default OccupancyChart;
