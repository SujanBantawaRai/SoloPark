import React from 'react';

const StatCard = ({ icon, label, value, sub, subColor = 'text-slate-400', accent = 'border-blue-500', bg = 'bg-blue-50', iconColor = 'text-blue-500', onClick }) => (
    <div
        onClick={onClick}
        className={`glass-panel p-5 rounded-2xl border-l-4 ${accent} hover-lift ${onClick ? 'cursor-pointer' : ''} transition-all duration-200 hover:scale-[1.02] hover:shadow-lg`}
    >
        <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1 opacity-70 truncate">{label}</p>
                <p className="text-2xl font-black text-slate-800 leading-none tracking-tight">{value}</p>
            </div>
            <div className={`p-2.5 ${bg} ${iconColor} rounded-xl flex-shrink-0 ml-3 shadow-sm`}>
                {icon}
            </div>
        </div>
        {sub && (
            <div className="mt-3 pt-3 border-t border-slate-100">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${subColor} opacity-80`}>{sub}</span>
            </div>
        )}
    </div>
);

export default StatCard;
