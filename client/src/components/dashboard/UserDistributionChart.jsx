import React from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import ChartSkeleton from './ChartSkeleton';

const COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#0ea5e9', '#f59e0b', '#94a3b8'];

const MOCK = [
    { name: 'Student', value: 35 },
    { name: 'Teacher', value: 12 },
    { name: 'Guard', value: 5 },
    { name: 'Admin', value: 3 },
    { name: 'Super Admin', value: 1 },
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const total = payload[0].payload.total;
        const val = payload[0].value;
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
                <p className="font-bold text-slate-700">{payload[0].name}</p>
                <p className="font-semibold" style={{ color: payload[0].payload.fill }}>
                    {val} users {total ? `(${Math.round(val / total * 100)}%)` : ''}
                </p>
            </div>
        );
    }
    return null;
};

const UserDistributionChart = ({ data, loading }) => {
    const raw = (data && data.length > 0) ? data : MOCK;
    const total = raw.reduce((sum, d) => sum + d.value, 0);
    const chartData = raw.map(d => ({ ...d, total }));

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">User Distribution</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Breakdown by role and type</p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{total} total</span>
            </div>
            {loading ? (
                <ChartSkeleton height="h-44" />
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="45%"
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>}
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ paddingTop: '8px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default UserDistributionChart;
