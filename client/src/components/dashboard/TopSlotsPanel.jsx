import React, { useState } from 'react';
import { FaTrophy, FaArrowDown } from 'react-icons/fa';

const MOCK_TOP = [
    { slotNumber: 'A-12', zone: 'Zone A', count: 48 },
    { slotNumber: 'B-03', zone: 'Zone B', count: 41 },
    { slotNumber: 'C-07', zone: 'Zone C', count: 36 },
    { slotNumber: 'A-05', zone: 'Zone A', count: 30 },
    { slotNumber: 'D-01', zone: 'Zone D', count: 25 },
];

const MOCK_LEAST = [
    { slotNumber: 'D-15', zone: 'Zone D', count: 2 },
    { slotNumber: 'C-14', zone: 'Zone C', count: 3 },
    { slotNumber: 'B-18', zone: 'Zone B', count: 4 },
    { slotNumber: 'A-20', zone: 'Zone A', count: 5 },
    { slotNumber: 'D-12', zone: 'Zone D', count: 6 },
];

const RANK_COLORS = ['text-yellow-500', 'text-slate-400', 'text-amber-600', 'text-slate-500', 'text-slate-400'];
const BARS_MAX = 50;

const SlotRow = ({ slot, rank, color, max = 50 }) => (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
        <span className={`text-sm font-black w-5 text-center ${color || 'text-slate-400'}`}>{rank}</span>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-slate-700 text-sm">{slot.slotNumber}</p>
                <p className="text-xs font-bold text-slate-500">{slot.count} bookings</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${Math.round((slot.count / max) * 100)}%`,
                        background: rank <= 1 ? '#f59e0b' : rank <= 3 ? '#6366f1' : '#94a3b8'
                    }}
                />
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{slot.zone}</p>
        </div>
    </div>
);

const TopSlotsPanel = ({ data, loading }) => {
    const [view, setView] = useState('top');
    const top5  = data?.top5  || MOCK_TOP;
    const least5 = data?.least5 || MOCK_LEAST;
    const displayData = view === 'top' ? top5 : least5;
    const maxCount = Math.max(...(top5.map(s => s.count)), 1);

    return (
        <div className="glass-panel rounded-3xl border border-blue-200 bg-blue-50/20 p-6">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-slate-800 text-base">Slot Usage Ranking</h3>
                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black border border-blue-200">SA Only</span>
            </div>
            <p className="text-slate-400 text-xs font-medium mb-4">Most and least used parking slots</p>

            {/* Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5 w-fit gap-1">
                <button
                    onClick={() => setView('top')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'top' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FaTrophy size={10} /> Top 5
                </button>
                <button
                    onClick={() => setView('least')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'least' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FaArrowDown size={10} /> Least 5
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div>
                    {displayData.map((slot, i) => (
                        <SlotRow
                            key={slot.slotNumber || i}
                            slot={slot}
                            rank={i + 1}
                            color={RANK_COLORS[i]}
                            max={maxCount}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopSlotsPanel;
