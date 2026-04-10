import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartSkeleton from './ChartSkeleton';

const COLORS = {
    free: '#22c55e',
    occupied: '#ef4444',
    reserved: '#f59e0b',
    blocked: '#94a3b8',
};

const MOCK = [
    { name: 'Free', value: 18, key: 'free' },
    { name: 'Occupied', value: 12, key: 'occupied' },
    { name: 'Reserved', value: 5, key: 'reserved' },
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
                <p className="font-bold text-slate-700">{payload[0].name}</p>
                <p className="font-semibold" style={{ color: payload[0].payload.fill }}>{payload[0].value} slots</p>
            </div>
        );
    }
    return null;
};

const SlotStatusDonut = ({ slots, loading }) => {
    const chartData = slots
        ? [
            { name: 'Free', value: slots.free, key: 'free' },
            { name: 'Occupied', value: slots.occupied, key: 'occupied' },
            { name: 'Reserved', value: slots.reserved, key: 'reserved' },
        ].filter(d => d.value > 0)
        : MOCK;

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Slot Status</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Live breakdown of all parking slots</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            </div>
            {loading ? (
                <ChartSkeleton height="h-44" />
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.key] || '#94a3b8'} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>}
                            iconType="circle"
                            iconSize={8}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SlotStatusDonut;
