import React from 'react';

const ChartSkeleton = ({ height = 'h-48', label = 'Loading chart...' }) => (
    <div className={`${height} rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse flex items-center justify-center`}>
        <div className="text-center">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-blue-400 rounded-full animate-spin mx-auto mb-2" style={{ borderWidth: '3px' }} />
            <p className="text-slate-400 text-xs font-semibold">{label}</p>
        </div>
    </div>
);

export default ChartSkeleton;
