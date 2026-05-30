import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ── Zone config (mirrors StudentDashboard) ────────────────────────────────────
const ZONES = [
    {
        id: 'HCK', label: 'Zone 1', name: 'HCK Block', type: 'Cars & Bikes',
        color: { bg: 'from-blue-600 to-indigo-700', accent: '#2563eb', accentLight: '#eff6ff' },
    },
    {
        id: 'WLV', label: 'Zone 2', name: 'WLV Block', type: 'Cars Only',
        color: { bg: 'from-violet-600 to-purple-700', accent: '#7c3aed', accentLight: '#f5f3ff' },
    },
    {
        id: 'ING', label: 'Zone 3', name: 'ING Block', type: 'Scooters & Bikes',
        color: { bg: 'from-emerald-500 to-teal-600', accent: '#059669', accentLight: '#ecfdf5' },
    },
];

const getSlotStatus = (slot) => {
    if (!slot) return 'free';
    if (slot.status === 'occupied' || slot.isBooked) return 'occupied';
    if (slot.status === 'reserved') return 'reserved';
    if (slot.slotType === 'Visitor') return 'visitor';
    return 'free';
};

const SC = {
    free:     { bg: '#bbf7d0', bd: '#4ade80', tx: '#166534' },
    reserved: { bg: '#fef08a', bd: '#fbbf24', tx: '#92400e' },
    occupied: { bg: '#fecaca', bd: '#f87171', tx: '#991b1b' },
    visitor:  { bg: '#bfdbfe', bd: '#60a5fa', tx: '#1e40af' },
};

const DURATION_PRESETS = [
    { label: '2 hrs',   minutes: 120, tag: 'Most Common', tagCls: 'bg-emerald-100 text-emerald-700' },
    { label: '2.5 hrs', minutes: 150, tag: 'Common',      tagCls: 'bg-blue-100 text-blue-700'      },
    { label: 'Custom',  minutes: null, tag: 'For Events',  tagCls: 'bg-violet-100 text-violet-700'  },
];

const roundUpTo30 = (d) => {
    const m = d.getMinutes();
    if (m === 0 || m === 30) return d;
    const r = new Date(d);
    r.setMinutes(m < 30 ? 30 : 60, 0, 0);
    return r;
};

const toLocalInput = (d) => {
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
    <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold pointer-events-auto
                ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}>
                {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'} {t.message}
            </div>
        ))}
    </div>
);

// ── Reservation Modal ─────────────────────────────────────────────────────────
const ReservationModal = ({ slot, zone, onClose, onConfirm, loading, defaultVehicleNumber, defaultStartTime, defaultEndTime }) => {
    const slotNum = slot?.slotNumber?.split('-')[1] || slot?.slotNumber;

    const [minStart] = useState(() => {
        const d = new Date(); d.setMinutes(d.getMinutes() + 5);
        return toLocalInput(roundUpTo30(d));
    });
    const [vehicleNumber, setVehicleNumber] = useState(defaultVehicleNumber || '');
    const [vehicleType, setVehicleType]     = useState('Car');
    const [startTime, setStartTime]         = useState(() => {
        if (defaultStartTime) return toLocalInput(new Date(defaultStartTime));
        return minStart;
    });
    const [durationMins, setDurationMins]   = useState(() => {
        if (defaultEndTime) return null; // Use custom end time
        return 120;
    });
    const [customEnd, setCustomEnd]         = useState(() => {
        if (defaultEndTime) return toLocalInput(new Date(defaultEndTime));
        const s = new Date(minStart); s.setHours(s.getHours() + 2);
        return toLocalInput(roundUpTo30(s));
    });
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const snapStart = (val) => {
        const d = new Date(val);
        return isNaN(d) ? val : toLocalInput(roundUpTo30(d));
    };

    const computedEnd = (() => {
        if (durationMins === null) return null;
        const s = new Date(startTime);
        return isNaN(s) ? null : new Date(s.getTime() + durationMins * 60000);
    })();

    const handleSubmit = () => {
        setErrorMsg('');
        if (!vehicleNumber.trim()) { setErrorMsg('Please enter your vehicle number.'); return; }
        if (!startTime)            { setErrorMsg('Please select a start time.'); return; }
        const parsedStart = new Date(startTime);
        const parsedEnd   = durationMins !== null ? computedEnd : new Date(customEnd);
        if (!parsedEnd || isNaN(parsedEnd))   { setErrorMsg('Please select a valid end time.'); return; }
        if (parsedEnd <= parsedStart)          { setErrorMsg('End time must be after start time.'); return; }
        onConfirm({
            vehicleNumber: vehicleNumber.toUpperCase(),
            vehicleType,
            startTime: new Date(startTime).toISOString(),
            endTime:   parsedEnd.toISOString(),
        });
    };

    const fmtD = (d) => d instanceof Date && !isNaN(d)
        ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

    const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 focus:bg-white transition-all duration-200 text-sm';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">

                {/* Gradient header */}
                <div className={`bg-gradient-to-br ${zone?.color?.bg} px-6 pt-6 pb-8 relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
                                📍 Reserve Slot
                            </span>
                            <h3 className="text-2xl font-extrabold text-white tracking-tight leading-tight">{zone?.name}</h3>
                            <p className="text-white/70 text-sm font-semibold mt-0.5">{zone?.type}</p>
                        </div>
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex flex-col items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
                            <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Slot</span>
                            <span className="text-xl font-black text-white leading-tight">{slotNum}</span>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-50 text-base font-bold">
                        ✕
                    </button>
                </div>

                {/* Form */}
                <div className="-mt-4 bg-white rounded-t-3xl px-6 pt-6 pb-6 space-y-5 overflow-y-auto flex-1 relative z-10">

                    {/* Vehicle Number */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            🚗 Vehicle Number <span className="text-red-400 normal-case">*</span>
                        </label>
                        <input type="text" className={inputCls} placeholder="e.g. BA 334"
                            value={vehicleNumber}
                            onChange={e => { setVehicleNumber(e.target.value); setErrorMsg(''); }} />
                    </div>

                    {/* Vehicle Type */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            ℹ️ Vehicle Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { type: 'Car',    icon: '🚗' },
                                { type: 'Bike',   icon: '🚲' },
                                { type: 'Scooter',icon: '🛵' },
                            ].map(({ type: vt, icon }) => (
                                <button key={vt} type="button" onClick={() => setVehicleType(vt)}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 font-bold text-sm transition-all
                                        ${vehicleType === vt
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}>
                                    <span className="text-xl">{icon}</span>
                                    {vt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            🕐 Arrival / Start Time <span className="text-red-400 normal-case">*</span>
                        </label>
                        <input type="datetime-local" className={inputCls} value={startTime} min={minStart}
                            onChange={e => { setStartTime(snapStart(e.target.value)); setErrorMsg(''); }}
                            onBlur={e  => { const s = snapStart(e.target.value); if (s !== e.target.value) setStartTime(s); }} />
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                            ℹ️ Only :00 and :30 minute marks are accepted — auto-snapped on selection.
                        </p>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            🕐 Booking Duration <span className="text-red-400 normal-case">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {DURATION_PRESETS.map(p => (
                                <button key={p.label} type="button" onClick={() => setDurationMins(p.minutes)}
                                    className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition-all
                                        ${durationMins === p.minutes ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                    <div className="flex w-full justify-between items-center mb-1">
                                        <span className={`text-base font-extrabold ${durationMins === p.minutes ? 'text-blue-700' : 'text-slate-700'}`}>
                                            {p.label}
                                        </span>
                                        {durationMins === p.minutes && <span className="text-blue-500 text-sm">✔</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${p.tagCls}`}>{p.tag}</span>
                                </button>
                            ))}
                        </div>
                        {durationMins === null && (
                            <div className="mt-3">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 block">Custom End Time</label>
                                <input type="datetime-local" className={inputCls} value={customEnd} min={startTime}
                                    onChange={e => setCustomEnd(e.target.value)} />
                            </div>
                        )}
                    </div>

                    {/* End time preview */}
                    {durationMins !== null && computedEnd && (
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
                            <div>
                                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">End Time</p>
                                <p className="text-sm font-bold text-slate-700">{fmtD(computedEnd)}</p>
                            </div>
                            <span className="text-2xl">🕐</span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-semibold">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={loading}
                        className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all
                            bg-gradient-to-r ${zone?.color?.bg} text-white shadow-lg hover:opacity-90
                            disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Reserving…</>
                            : <>📍 Confirm Reservation</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Map primitives ─────────────────────────────────────────────────────────────
const Tree = ({ x, y }) => (
    <div style={{
        position: 'absolute', left: x - 9, top: y,
        width: 18, height: 18, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #4ade80, #15803d)',
        boxShadow: '0 2px 8px rgba(22,163,74,0.45)',
    }} />
);

const Building = ({ x, y, w, h, label, fill, border, textColor, isMain = false }) => (
    <div style={{
        position: 'absolute', left: x, top: y, width: w, height: h,
        background: fill, border: `2.5px solid ${border}`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isMain ? `inset 0 4px 16px ${border}30, 0 8px 24px ${border}50` : `0 4px 12px ${border}40`,
    }}>
        <span style={{ 
            fontWeight: 800, 
            fontSize: isMain ? 18 : 12, 
            color: textColor, 
            textTransform: 'uppercase', 
            letterSpacing: isMain ? '2px' : '1.5px' 
        }}>{label}</span>
    </div>
);

const SlotCell = ({ num, slot, onBook, canBook, timeFilterActive }) => {
    let status  = getSlotStatus(slot);
    let clickable;

    if (timeFilterActive && slot) {
        if (slot.availabilityStatus === 'available') {
            status = 'free';
            clickable = canBook;
        } else {
            status = 'occupied';
            clickable = false;
        }
    } else {
        clickable = status === 'free' && canBook && slot;
    }

    const c = SC[status];
    return (
        <div
            onClick={() => {
                if (timeFilterActive && slot && slot.availabilityStatus === 'unavailable') {
                    onBook(slot);
                } else if (clickable) {
                    onBook(slot);
                }
            }}
            title={
                timeFilterActive && slot
                    ? `Slot ${num}: ${slot.availabilityStatus === 'available' ? 'Available' : 'Unavailable'}`
                    : `Slot ${num}: ${status.charAt(0).toUpperCase() + status.slice(1)}`
            }
            style={{
                width: 28, height: 24,
                background: c.bg, border: `1.5px solid ${c.bd}`, borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: c.tx,
                cursor: (clickable || (timeFilterActive && slot && slot.availabilityStatus === 'unavailable')) ? 'pointer' : 'default',
                transition: 'transform 0.1s, box-shadow 0.1s',
                userSelect: 'none', flexShrink: 0,
            }}
            onMouseEnter={e => {
                if (clickable || (timeFilterActive && slot && slot.availabilityStatus === 'unavailable')) {
                    e.currentTarget.style.transform = 'scale(1.2)';
                    e.currentTarget.style.boxShadow = `0 2px 10px ${c.bd}90`;
                }
            }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {num}
        </div>
    );
};

const ParkingArea = ({ areaId, cols, slots, startNum, onBook, canBook, accentColor, timeFilterActive }) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Badge */}
        <div style={{
            position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
            width: 28, height: 28, borderRadius: '50%',
            background: accentColor || '#0f172a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 800,
            zIndex: 5, boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
            {areaId}
        </div>
        {/* Dashed border */}
        <div style={{
            padding: '18px 8px 8px',
            border: '2px dashed #94a3b8',
            borderRadius: 8,
            background: 'rgba(248,250,252,0.9)',
        }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 28px)`, gap: 3 }}>
                {slots.map((sl, i) => (
                    <SlotCell key={sl?._id || `${areaId}-${i}`}
                        num={startNum + i} slot={sl}
                        onBook={onBook} canBook={canBook}
                        timeFilterActive={timeFilterActive} />
                ))}
            </div>
        </div>
    </div>
);

const Road = ({ top }) => (
    <div style={{ position: 'absolute', left: 0, right: 0, top, height: 54, background: '#64748b', borderRadius: top === 0 ? '12px 12px 0 0' : 0 }}>
        <div style={{ position: 'absolute', top: 5, left: 0, right: 0, height: 3, background: '#94a3b8', opacity: 0.4 }} />
        <div style={{ position: 'absolute', bottom: 5, left: 0, right: 0, height: 3, background: '#94a3b8', opacity: 0.4 }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '3px dashed #94a3b8', transform: 'translateY(-50%)' }} />
    </div>
);

const VerticalRoad = ({ x, top, bottom }) => (
    <div style={{ position: 'absolute', left: x, top, width: 44, height: bottom - top, background: '#64748b' }}>
        <div style={{ position: 'absolute', top: 0, left: 4, bottom: 0, width: 3, background: '#94a3b8', opacity: 0.4 }} />
        <div style={{ position: 'absolute', top: 0, right: 4, bottom: 0, width: 3, background: '#94a3b8', opacity: 0.4 }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: '3px dashed #94a3b8', transform: 'translateX(-50%)' }} />
    </div>
);

// ── HCK Campus Map ─────────────────────────────────────────────────────────────
const HCKMap = ({ slots, onBook, canBook, accentColor, timeFilterActive }) => {
    const a1 = slots.slice(0, 20);
    const a2 = slots.slice(20);
    const trees = [
        [40, 10], [120, 30], [200, 15], [40, 120], [120, 150], [40, 230], [130, 240],
        [800, 10], [880, 20], [820, 120], [900, 140], [800, 230], [890, 220],
        [50, 435], [150, 440], [300, 435], [450, 440], [600, 435], [750, 440], [880, 435]
    ];
    return (
        <div style={{ position: 'relative', width: 950, height: 455, background: '#e8edf2', borderRadius: 12, flexShrink: 0, margin: '0 auto' }}>
            {trees.map(([x, y], i) => <Tree key={i} x={x} y={y} />)}
            <Building x={270} y={0} w={429} h={80} label="HCK Block" isMain
                fill="#bbf7d0" border="#4ade80" textColor="#166534" />
            {/* A1 Parking Area */}
            <div style={{ position: 'absolute', left: 270, top: 117 }}>
                <ParkingArea areaId="A1" cols={5} slots={a1} startNum={1}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>
            <Building x={270} y={260} w={178} h={80} label="Reception"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />
            <Building x={488} y={260} w={211} h={80} label="Cafe"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />
            {/* A2 Parking Area */}
            <div style={{ position: 'absolute', left: 488, top: 90 }}>
                <ParkingArea areaId="A2" cols={6} slots={a2} startNum={21}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>
            <Road top={355} />
        </div>
    );
};

// ── WLV Campus Map ─────────────────────────────────────────────────────────────
const WLVMap = ({ slots, onBook, canBook, accentColor, timeFilterActive }) => {
    const b1 = slots.slice(0, 8);
    const b2 = slots.slice(8, 48);
    const b3 = slots.slice(48, 60);
    const trees = [
        [100, 90], [150, 180], [100, 290], [150, 400], [100, 510], [150, 600],
        [800, 90], [750, 200], [800, 320], [750, 440], [800, 540], [750, 620]
    ];
    return (
        <div style={{ position: 'relative', width: 950, height: 650, background: '#e8edf2', borderRadius: 12, flexShrink: 0, margin: '0 auto' }}>
            {trees.map(([x, y], i) => <Tree key={i} x={x} y={y} />)}
            
            <Road top={10} />

            {/* Left Column */}
            <Building x={213} y={90} w={220} h={80} label="Library"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />
            
            <div style={{ position: 'absolute', left: 252, top: 185 }}>
                <ParkingArea areaId="B1" cols={4} slots={b1} startNum={1}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            <Building x={213} y={292} w={220} h={80} label="SSD / RTE / Finance"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />

            <Building x={213} y={392} w={220} h={80} label="WLV Block" isMain
                fill="#ede9fe" border="#8b5cf6" textColor="#5b21b6" />
            
            <div style={{ position: 'absolute', left: 252, top: 492 }}>
                <ParkingArea areaId="B3" cols={4} slots={b3} startNum={49}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            {/* Right Column */}
            <div style={{ position: 'absolute', left: 473, top: 90 }}>
                <ParkingArea areaId="B2" cols={8} slots={b2} startNum={9}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            <Building x={473} y={292} w={265} h={80} label="Canteen"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />

            {/* Sitting Area – Aerial View */}
            <div style={{
                position: 'absolute', left: 473, top: 392,
                width: 265, height: 110,
                background: '#fef9ec',
                border: '2.5px solid #fde68a',
                borderRadius: 12,
                boxShadow: '0 4px 12px #fde68a40',
                overflow: 'hidden',
            }}>
                {/* Label */}
                <div style={{
                    position: 'absolute', top: 4, left: 0, right: 0,
                    textAlign: 'center', fontSize: 9, fontWeight: 800,
                    color: '#b45309', textTransform: 'uppercase', letterSpacing: '1.5px'
                }}>Sitting Area</div>
                <svg width="265" height="110" style={{ position: 'absolute', top: 0, left: 0 }}>
                    {/* Helper: one table+chairs unit. Table = rect, chairs = small rects around it */}
                    {[
                        { tx: 30,  ty: 52 },
                        { tx: 98,  ty: 52 },
                        { tx: 166, ty: 52 },
                        { tx: 234, ty: 52 },
                    ].map(({ tx, ty }, i) => (
                        <g key={i} transform={`translate(${tx},${ty})`}>
                            {/* Table top */}
                            <rect x={-13} y={-10} width={26} height={20} rx={4}
                                fill="#d97706" stroke="#92400e" strokeWidth={1.2} />
                            {/* Chair top */}
                            <rect x={-6} y={-22} width={12} height={9} rx={3}
                                fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
                            {/* Chair bottom */}
                            <rect x={-6} y={13} width={12} height={9} rx={3}
                                fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
                            {/* Chair left */}
                            <rect x={-25} y={-5} width={9} height={10} rx={3}
                                fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
                            {/* Chair right */}
                            <rect x={17} y={-5} width={9} height={10} rx={3}
                                fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
                        </g>
                    ))}
                </svg>
            </div>

            <Building x={473} y={512} w={265} h={120} label="Basketball Court"
                fill="#ffedd5" border="#fdba74" textColor="#c2410c" />
        </div>
    );
};

// ── ING Campus Map ─────────────────────────────────────────────────────────────
const INGMap = ({ slots, onBook, canBook, accentColor, timeFilterActive }) => {
    const c4 = slots.slice(0, 20);   // right col – slim single column (20 slots)
    const c1 = slots.slice(20, 50);  // right col – below Office (30 slots)
    const c3 = slots.slice(50, 70);  // right col – bottom-left of ING block (20 slots)
    const c2 = slots.slice(70, 95);  // left col – middle (25 slots)
    const c5 = slots.slice(95, 110); // left col – bottom (15 slots)
    const trees = [
        [18, 70], [18, 180], [18, 320], [18, 500], [18, 640],
        [920, 70], [920, 180], [920, 320], [920, 500], [920, 640],
    ];

    return (
        <div style={{ position: 'relative', width: 950, height: 739, background: '#e8edf2', borderRadius: 12, flexShrink: 0, margin: '0 auto' }}>
            {trees.map(([x, y], i) => <Tree key={i} x={x} y={y} />)}

            {/* ── Main Road (top) ── */}
            <Road top={0} />

            {/* ── Vertical Connecting Road ── */}
            <VerticalRoad x={393} top={0} bottom={320} />

            {/* ════ LEFT COLUMN ════ */}

            {/* Parking Lot (Empty Space) */}
            <div style={{
                position: 'absolute', left: 153, top: 68, width: 232, height: 160,
                background: 'rgba(248, 250, 252, 0.4)',
                border: '2.5px dashed #cbd5e1',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 4px 12px rgba(203, 213, 225, 0.05)',
            }}>
                <span style={{ fontWeight: 800, fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', lineHeight: '1.4' }}>
                    Parking Lot<br/>(Empty Space)
                </span>
            </div>

            {/* Canteen */}
            <Building x={153} y={240} w={232} h={80} label="Canteen"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />

            {/* C1 – 25 slots */}
            <div style={{ position: 'absolute', left: 217, top: 332 }}>
                <ParkingArea areaId="C1" cols={5} slots={c2} startNum={71}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            {/* C2 – 15 slots */}
            <div style={{ position: 'absolute', left: 217, top: 527 }}>
                <ParkingArea areaId="C2" cols={5} slots={c5} startNum={96}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            {/* ════ RIGHT COLUMN ════ */}

            {/* Office */}
            <Building x={440} y={68} w={232} h={252} label="Office"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />

            {/* C5 – slim single column */}
            <div style={{ position: 'absolute', left: 692, top: 114 }}>
                <ParkingArea areaId="C5" cols={2} slots={c4} startNum={1}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            {/* C4 – 30 slots */}
            <div style={{ position: 'absolute', left: 440, top: 332 }}>
                <ParkingArea areaId="C4" cols={5} slots={c1} startNum={21}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            {/* Cafe */}
            <Building x={619} y={459} w={168} h={90} label="Cafe"
                fill="#f1f5f9" border="#cbd5e1" textColor="#64748b" />

            {/* C3 – 20 slots */}
            <div style={{ position: 'absolute', left: 440, top: 561 }}>
                <ParkingArea areaId="C3" cols={5} slots={c3} startNum={51}
                    onBook={onBook} canBook={canBook} accentColor={accentColor}
                    timeFilterActive={timeFilterActive} />
            </div>

            {/* ING Block */}
            <Building x={619} y={561} w={168} h={149} label="ING Block" isMain
                fill="#d1fae5" border="#34d399" textColor="#065f46" />
        </div>
    );
};

const MAP_COMPONENTS = { HCK: HCKMap, WLV: WLVMap, ING: INGMap };

// ── Main ZoneMapPage ──────────────────────────────────────────────────────────
const ZoneMapPage = () => {
    const { zoneId }   = useParams();
    const navigate     = useNavigate();
    const { user }     = useAuth();
    const zone         = ZONES.find(z => z.id === zoneId);

    const [slots,         setSlots]         = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [activeBooking, setActiveBooking] = useState(null);
    const [selectedSlot,  setSelectedSlot]  = useState(null);
    const [reserveLoading,setReserveLoading]= useState(false);
    const [toasts,        setToasts]        = useState([]);
    const toastId = useRef(0);

    // States for time-range filtering
    const [timeFilter, setTimeFilter] = useState({ start: '', end: '' });
    const [timeFilterActive, setTimeFilterActive] = useState(false);

    // Map scale-to-fit
    const MAP_NATIVE = { HCK: [950, 455], WLV: [950, 650], ING: [950, 739] };
    const [mapNativeW, mapNativeH] = MAP_NATIVE[zoneId] || [950, 500];
    const [mapScale, setMapScale]  = useState(1);
    const mapWrapRef               = useRef(null);
    useEffect(() => {
        if (!mapWrapRef.current) return;
        const obs = new ResizeObserver(([entry]) => {
            const avail = entry.contentRect.width;
            if (avail > 0) setMapScale(Math.min(avail / mapNativeW, 1));
        });
        obs.observe(mapWrapRef.current);
        return () => obs.disconnect();
    }, [mapNativeW]);

    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const fetchSlots = useCallback(async (start, end) => {
        if (!zoneId) return;
        try {
            const params = new URLSearchParams();
            if (start) params.set('startTime', new Date(start).toISOString());
            if (end)   params.set('endTime',   new Date(end).toISOString());
            const query = params.toString() ? `?${params.toString()}` : '';
            const { data } = await api.get(`/slots/zone/${zoneId}${query}`);
            setSlots((Array.isArray(data) ? data : []).sort((a, b) => {
                const nA = parseInt(a.slotNumber?.replace(/\D/g, '')) || 0;
                const nB = parseInt(b.slotNumber?.replace(/\D/g, '')) || 0;
                return nA - nB;
            }));
        } catch { setSlots([]); }
        finally  { setLoading(false); }
    }, [zoneId]);

    const fetchActiveBooking = useCallback(async () => {
        try {
            const { data } = await api.get('/bookings/myactive');
            setActiveBooking(data || null);
        } catch { setActiveBooking(null); }
    }, []);

    useEffect(() => {
        if (!zone) { navigate('/student'); return; }
        setLoading(true);
        fetchSlots(timeFilterActive ? timeFilter.start : undefined, timeFilterActive ? timeFilter.end : undefined);
        fetchActiveBooking();
    }, [zone, zoneId, fetchSlots, fetchActiveBooking, navigate, timeFilterActive, timeFilter]);

    // 10-second polling
    useEffect(() => {
        const id = setInterval(() => {
            fetchSlots(timeFilterActive ? timeFilter.start : undefined, timeFilterActive ? timeFilter.end : undefined);
            fetchActiveBooking();
        }, 10000);
        return () => clearInterval(id);
    }, [fetchSlots, fetchActiveBooking, timeFilterActive, timeFilter]);

    const applyTimeFilter = async () => {
        if (!timeFilter.start || !timeFilter.end) {
            addToast('Please select both a start and end time.', 'info');
            return;
        }
        if (new Date(timeFilter.end) <= new Date(timeFilter.start)) {
            addToast('End time must be after start time.', 'error');
            return;
        }
        setTimeFilterActive(true);
        setLoading(true);
        await fetchSlots(timeFilter.start, timeFilter.end);
    };

    const clearTimeFilter = async () => {
        setTimeFilter({ start: '', end: '' });
        setTimeFilterActive(false);
        setLoading(true);
        await fetchSlots();
    };

    const handleSlotClick = (slot) => {
        if (timeFilterActive && slot.availabilityStatus === 'unavailable') {
            const from = slot.conflictStart ? new Date(slot.conflictStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
            const to   = slot.conflictEnd   ? new Date(slot.conflictEnd).toLocaleTimeString('en-US',   { hour: '2-digit', minute: '2-digit' }) : '';
            addToast(`This slot is booked ${from}–${to}. Try a different time or slot.`, 'error');
            return;
        }
        if (activeBooking) {
            addToast('You already have an active reservation. Cancel it first.', 'info');
            return;
        }
        setSelectedSlot(slot);
    };

    const handleReserve = async ({ vehicleNumber, vehicleType, startTime, endTime }) => {
        setReserveLoading(true);
        try {
            await api.post('/bookings', {
                slotId: selectedSlot._id,
                vehicleNumber, vehicleType,
                startTime: new Date(startTime).toISOString(),
                endTime:   new Date(endTime).toISOString(),
            });
            window.dispatchEvent(new CustomEvent('solopark:notify', {
                detail: { title: 'Booking Submitted 🕐', message: 'Your booking is pending guard approval.', type: 'info' }
            }));
            addToast('Booking submitted! Pending guard approval.', 'info');
            setSelectedSlot(null);
            await fetchSlots(timeFilterActive ? timeFilter.start : undefined, timeFilterActive ? timeFilter.end : undefined);
            await fetchActiveBooking();
        } catch (e) {
            addToast(e.response?.data?.message || 'Booking failed', 'error');
        } finally { setReserveLoading(false); }
    };

    if (!zone) return null;

    const MapComp       = MAP_COMPONENTS[zone.id];

    return (
        <div className="min-h-screen bg-slate-50 pt-4 md:pt-5 pb-12 px-4 md:px-6 lg:px-8">
            <Toast toasts={toasts} />

            {selectedSlot && (
                <ReservationModal
                    slot={selectedSlot}
                    zone={zone}
                    onClose={() => setSelectedSlot(null)}
                    onConfirm={handleReserve}
                    loading={reserveLoading}
                    defaultVehicleNumber={user?.vehicleNumber}
                    defaultStartTime={timeFilterActive ? timeFilter.start : undefined}
                    defaultEndTime={timeFilterActive ? timeFilter.end : undefined}
                />
            )}

            <div className="max-w-full mx-auto px-2 md:px-4">

                {/* Back link */}
                <Link to="/student"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 mb-5 transition-colors group">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                    Back to Dashboard
                </Link>

                {/* ── Header ── */}
                <div className="mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5"
                                style={{ color: zone.color.accent }}>{zone.label}</p>
                            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">{zone.name}</h1>
                            <p className="text-slate-400 text-sm font-medium mt-0.5">
                                {zone.type} · {loading ? '…' : slots.length} total slots
                            </p>
                        </div>
                    </div>

                    {/* ── Time Range Availability Checker ── */}
                    <div className="mt-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                            🕐 Check availability for a specific time range
                        </p>
                        <div className="flex flex-col md:flex-row md:items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={timeFilter.start}
                                    onChange={e => setTimeFilter(f => ({ ...f, start: e.target.value }))}
                                    className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Time</label>
                                <input
                                    type="datetime-local"
                                    value={timeFilter.end}
                                    min={timeFilter.start}
                                    onChange={e => setTimeFilter(f => ({ ...f, end: e.target.value }))}
                                    className="w-full text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-all"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={applyTimeFilter}
                                    disabled={!timeFilter.start || !timeFilter.end}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-all shadow-sm active:scale-95 shadow-blue-500/20"
                                >
                                    Check Slots
                                </button>
                                {timeFilterActive && (
                                    <button
                                        onClick={clearTimeFilter}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-lg transition-all border border-slate-200 active:scale-95"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                        {timeFilterActive && (
                            <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
                                <span className="text-base leading-none">ℹ️</span>
                                <span>
                                    Showing availability for{' '}
                                    <strong>{new Date(timeFilter.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                                    {' → '}
                                    <strong>{new Date(timeFilter.end).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>.
                                    {' '}Green = free for this duration. Red = already booked.
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Map card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
                    <div className="mb-4">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight">{zone.name} Map</h2>
                        <p className="text-sm font-medium mt-0.5" style={{ color: zone.color.accent }}>
                            {zone.label} — {timeFilterActive ? 'Click on a green slot to reserve for your selected time range' : 'Click on a green slot to view and reserve'}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-slate-400 font-medium text-sm">Loading parking map…</p>
                        </div>
                    ) : (
                        <div
                            ref={mapWrapRef}
                            style={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}
                        >
                            <div
                                style={{
                                    transformOrigin: 'top center',
                                    transform: `scale(${mapScale})`,
                                    width: mapNativeW,
                                    height: mapNativeH,
                                    flexShrink: 0,
                                    marginBottom: mapNativeH * mapScale - mapNativeH,
                                }}
                            >
                                {MapComp ? (
                                    <MapComp
                                        slots={slots}
                                        onBook={handleSlotClick}
                                        canBook={!activeBooking}
                                        accentColor={zone.color.accent}
                                        timeFilterActive={timeFilterActive}
                                    />
                                ) : (
                                    <p className="text-slate-400 text-sm p-8 text-center">Map not available for this zone.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="mt-5 flex flex-wrap justify-center gap-5 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
                        {timeFilterActive ? (
                            [
                                { color: '#4ade80', label: 'Available for selected range' },
                                { color: '#f87171', label: 'Unavailable / Booked' },
                            ].map(({ color, label }) => (
                                <span key={label} className="flex items-center gap-1.5">
                                    <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }} />
                                    {label}
                                </span>
                            ))
                        ) : (
                            [
                                { color: '#4ade80', label: 'Available — click to reserve' },
                                { color: '#fbbf24', label: 'Reserved' },
                                { color: '#f87171', label: 'Occupied' },
                                { color: '#60a5fa', label: 'Visitor' },
                            ].map(({ color, label }) => (
                                <span key={label} className="flex items-center gap-1.5">
                                    <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }} />
                                    {label}
                                </span>
                            ))
                        )}
                    </div>
                </div>

                {/* Active booking banner */}
                {activeBooking && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                        <span className="text-xl mt-0.5 flex-shrink-0">⚠️</span>
                        <p className="text-amber-700 font-semibold text-sm">
                            You have an active reservation for slot{' '}
                            <strong className="text-amber-900">{activeBooking.slot?.slotNumber}</strong>.
                            Cancel your current booking first to reserve a different slot.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZoneMapPage;
