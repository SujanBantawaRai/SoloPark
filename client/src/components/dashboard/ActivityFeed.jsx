import React, { useEffect, useRef } from 'react';

const MOCK_ACTIVITIES = [
    { msg: 'User booked Slot A-12', time: '09:45', type: 'booking' },
    { msg: 'Guard confirmed entry at Slot B-03', time: '09:41', type: 'entry' },
    { msg: 'Vehicle exited from Slot C-07', time: '09:38', type: 'exit' },
    { msg: 'Slot A-05 marked as occupied', time: '09:32', type: 'occupied' },
    { msg: 'User booked Slot D-02', time: '09:28', type: 'booking' },
    { msg: 'Booking for Slot B-09 cancelled', time: '09:20', type: 'cancel' },
    { msg: 'Vehicle exited from Slot A-11', time: '09:15', type: 'exit' },
    { msg: 'Guard confirmed entry at Slot D-01', time: '09:10', type: 'entry' },
];

const TYPE_CONFIG = {
    booking: { dot: 'bg-blue-400', text: 'text-blue-600' },
    entry:   { dot: 'bg-emerald-400', text: 'text-emerald-600' },
    exit:    { dot: 'bg-rose-400', text: 'text-rose-600' },
    occupied:{ dot: 'bg-amber-400', text: 'text-amber-600' },
    cancel:  { dot: 'bg-slate-400', text: 'text-slate-500' },
    default: { dot: 'bg-slate-300', text: 'text-slate-500' },
};

const getType = (msg) => {
    if (/cancel/i.test(msg)) return 'cancel';
    if (/book/i.test(msg)) return 'booking';
    if (/entry|confirmed/i.test(msg)) return 'entry';
    if (/exit/i.test(msg)) return 'exit';
    if (/occupied/i.test(msg)) return 'occupied';
    return 'default';
};

const ActivityFeed = ({ activities }) => {
    const feedRef = useRef(null);
    const items = activities.length > 0 ? activities : MOCK_ACTIVITIES;

    useEffect(() => {
        if (feedRef.current) feedRef.current.scrollTop = 0;
    }, [activities.length]);

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Recent Activity</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Latest system events</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                </span>
            </div>
            <div ref={feedRef} className="flex-1 overflow-y-auto space-y-0 max-h-64 pr-1 -mr-1">
                {items.map((a, i) => {
                    const type = a.type || getType(a.msg);
                    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.default;
                    return (
                        <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0 group hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors">
                            <div className="flex-shrink-0 mt-1.5">
                                <span className={`block w-2.5 h-2.5 rounded-full ${cfg.dot} group-hover:scale-125 transition-transform`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 leading-snug">{a.msg}</p>
                            </div>
                            <span className="text-xs font-mono text-slate-400 flex-shrink-0 mt-0.5">{a.time}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivityFeed;
