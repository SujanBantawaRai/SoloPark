import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import ChartSkeleton from './ChartSkeleton';

const MOCK = [
    { hour: '12am', count: 0 }, { hour: '1am', count: 1 }, { hour: '2am', count: 0 },
    { hour: '3am', count: 0 },  { hour: '4am', count: 0 }, { hour: '5am', count: 2 },
    { hour: '6am', count: 4 },  { hour: '7am', count: 8 }, { hour: '8am', count: 18 },
    { hour: '9am', count: 22 }, { hour: '10am', count: 15 },{ hour: '11am', count: 10 },
    { hour: '12pm', count: 12 },{ hour: '1pm', count: 9 }, { hour: '2pm', count: 7 },
    { hour: '3pm', count: 11 }, { hour: '4pm', count: 16 },{ hour: '5pm', count: 20 },
    { hour: '6pm', count: 14 }, { hour: '7pm', count: 8 }, { hour: '8pm', count: 5 },
    { hour: '9pm', count: 3 },  { hour: '10pm', count: 2 },{ hour: '11pm', count: 1 },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
                <p className="font-bold text-slate-700">{label}</p>
                <p className="text-indigo-600 font-semibold">{payload[0].value} entries</p>
            </div>
        );
    }
    return null;
};

const PeakHoursChart = ({ data, loading }) => {
    const chartData = (data && data.length > 0) ? data : MOCK;
    const maxCount = Math.max(...chartData.map(d => d.count), 1);

    return (
        <div className="glass-panel rounded-3xl border border-blue-200 bg-blue-50/20 p-6">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-800 text-base">Peak Hours Analysis</h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black border border-blue-200">SA Only</span>
            </div>
            <p className="text-slate-400 text-xs font-medium mb-5">Busiest parking hours (last 30 days)</p>
            {loading ? (
                <ChartSkeleton height="h-44" />
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                        <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.6)' }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.count === maxCount ? '#6366f1' : entry.count > maxCount * 0.6 ? '#818cf8' : '#c7d2fe'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default PeakHoursChart;
