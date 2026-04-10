import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartSkeleton from './ChartSkeleton';

const MOCK = [
    { day: 'Mon', completed: 5, pending: 3, cancelled: 1 },
    { day: 'Tue', completed: 8, pending: 2, cancelled: 2 },
    { day: 'Wed', completed: 6, pending: 4, cancelled: 0 },
    { day: 'Thu', completed: 11, pending: 1, cancelled: 3 },
    { day: 'Fri', completed: 14, pending: 5, cancelled: 1 },
    { day: 'Sat', completed: 9, pending: 2, cancelled: 2 },
    { day: 'Sun', completed: 4, pending: 3, cancelled: 1 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
                <p className="font-bold text-slate-700 mb-2">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} className="font-semibold" style={{ color: p.fill }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const BookingTrendChart = ({ data, loading }) => {
    const chartData = (data && data.length > 0) ? data : MOCK;

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Booking Trend</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Daily bookings by status (last 7 days)</p>
                </div>
                <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                </div>
            </div>
            {loading ? (
                <ChartSkeleton height="h-44" />
            ) : (
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={10} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.6)', radius: 6 }} />
                        <Legend
                            formatter={(value) => <span className="text-xs font-semibold text-slate-600 capitalize">{value}</span>}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Bar dataKey="completed" name="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pending"   name="Pending"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default BookingTrendChart;
