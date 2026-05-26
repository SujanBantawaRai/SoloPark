import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FaExclamationTriangle } from 'react-icons/fa';

// ── Inline Icons ──────────────────────────────────────────────────────────────
const Icons = {
    Car: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" /><circle cx="7.5" cy="14.5" r="1.5" /><circle cx="16.5" cy="14.5" r="1.5" /></svg>,
    Bike: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5S3.1 13.5 5 13.5 8.5 15.1 8.5 17 6.9 20.5 5 20.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V11c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 10.4C7.4 10.8 7 11.3 7 12s.4 1.2.8 1.6L11 16v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z" /></svg>,
    Close: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>,
    Check: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>,
    Search: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>,
    Parking: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z" /></svg>,
    Clock: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" /></svg>,
    Map: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" /></svg>,
    Stats: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>,
    Refresh: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>,
    Pin: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>,
    Alert: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>,
};

// ── Zone config ───────────────────────────────────────────────────────────────
const ZONES = [
    { id: 'HCK', label: 'Zone 1', name: 'HCK Block', type: 'Cars & Bikes', vehicleIcon: 'Car', color: { bg: 'from-blue-600 to-indigo-700', bar: 'bg-blue-500', ring: 'ring-blue-400' } },
    { id: 'WLV', label: 'Zone 2', name: 'WLV Block', type: 'Cars Only', vehicleIcon: 'Car', color: { bg: 'from-violet-600 to-purple-700', bar: 'bg-violet-500', ring: 'ring-violet-400' } },
    { id: 'ING', label: 'Zone 3', name: 'ING Block', type: 'Scooters & Bikes', vehicleIcon: 'Bike', color: { bg: 'from-emerald-500 to-teal-600', bar: 'bg-emerald-500', ring: 'ring-emerald-400' } },
];

const FILTERS = ['All', 'Available', 'Reserved', 'Occupied', 'Visitor'];

// ── Slot helpers ──────────────────────────────────────────────────────────────
const getSlotStatus = (slot) => {
    if (slot.status === 'occupied' || slot.isBooked) return 'occupied';
    if (slot.status === 'reserved') return 'reserved';
    if (slot.slotType === 'Visitor') return 'visitor';
    return 'free';
};

const SLOT_STYLE = {
    free: { card: 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400 hover:scale-110 cursor-pointer shadow-emerald-200', icon: '✓', label: 'Available' },
    reserved: { card: 'bg-amber-400 border-amber-300 text-white cursor-not-allowed shadow-amber-200', icon: '⏳', label: 'Reserved' },
    occupied: { card: 'bg-red-500 border-red-400 text-white cursor-not-allowed shadow-red-200', icon: '✗', label: 'Occupied' },
    visitor: { card: 'bg-blue-500 border-blue-400 text-white cursor-not-allowed shadow-blue-200', icon: '🅿', label: 'Visitor' },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold pointer-events-auto animate-toast-in
                ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}>
                <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️'}</span>
                {t.message}
            </div>
        ))}
    </div>
);

// ── Countdown helpers ─────────────────────────────────────────────────────────
const useCountdown = (target) => {
    const [ms, setMs] = useState(() => new Date(target) - Date.now());
    useEffect(() => {
        const id = setInterval(() => setMs(new Date(target) - Date.now()), 1000);
        return () => clearInterval(id);
    }, [target]);
    return ms;
};

const fmtMs = (ms) => {
    const abs = Math.abs(ms);
    const m = Math.floor(abs / 60000);
    const s = Math.floor((abs % 60000) / 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const fmtTime = (date) =>
    new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const EXIT_BUFFER_MS = 10 * 60 * 1000;

// ── My Active Reservation Banner ──────────────────────────────────────────────
const ReservationBanner = ({ booking, onCancel, loading }) => {
    const msToStart  = useCountdown(booking.startTime);
    const graceTarget = booking.graceDeadline || new Date(new Date(booking.startTime).getTime() + 10 * 60 * 1000).toISOString();
    const msGrace    = useCountdown(graceTarget);
    const msParking  = useCountdown(booking.endTime);

    const isOccupied   = booking.status === 'occupied';
    const beforeStart  = msToStart > 0 && !isOccupied;          // waiting — booking hasn't started yet
    const inGrace      = !beforeStart && msGrace > 0 && !isOccupied; // grace window is open
    const graceExpired = !beforeStart && msGrace <= 0 && !isOccupied;
    const inExitBuffer = isOccupied && msParking <= 0 && msParking > -EXIT_BUFFER_MS;
    const isOverstay   = isOccupied && msParking <= -EXIT_BUFFER_MS;
    const isExtended   = booking.isExtended;

    const start  = new Date(booking.startTime);
    const end    = new Date(booking.endTime);
    const exitBy = new Date(end.getTime() + EXIT_BUFFER_MS);

    let statusLabel, statusBadgeCls, headerGrad, topBarCls;
    if (isOverstay) {
        statusLabel = 'Overstay — Please Exit';
        statusBadgeCls = 'bg-red-100 text-red-700 border-red-300';
        headerGrad = 'from-red-600 to-rose-700'; topBarCls = 'bg-red-600';
    } else if (inExitBuffer) {
        statusLabel = 'Exit Buffer Active';
        statusBadgeCls = 'bg-orange-100 text-orange-700 border-orange-300';
        headerGrad = 'from-orange-500 to-red-500'; topBarCls = 'bg-orange-500';
    } else if (isOccupied) {
        statusLabel = 'Active · Parked';
        statusBadgeCls = 'bg-emerald-100 text-emerald-700 border-emerald-300';
        headerGrad = 'from-emerald-500 to-teal-600'; topBarCls = 'bg-emerald-500';
    } else if (graceExpired) {
        statusLabel = 'Grace Period Expired';
        statusBadgeCls = 'bg-red-100 text-red-700 border-red-300';
        headerGrad = 'from-red-500 to-rose-600'; topBarCls = 'bg-red-500';
    } else if (isExtended) {
        statusLabel = 'Grace Extended by Guard';
        statusBadgeCls = 'bg-purple-100 text-purple-700 border-purple-300';
        headerGrad = 'from-purple-600 to-indigo-700'; topBarCls = 'bg-purple-500';
    } else if (inGrace && msGrace < 3 * 60 * 1000) {
        statusLabel = 'Grace Ending Soon!';
        statusBadgeCls = 'bg-orange-100 text-orange-700 border-orange-300';
        headerGrad = 'from-orange-500 to-red-500'; topBarCls = 'bg-orange-500';
    } else if (inGrace) {
        statusLabel = 'Arrive Now — Grace Period';
        statusBadgeCls = 'bg-amber-100 text-amber-700 border-amber-300';
        headerGrad = 'from-amber-500 to-orange-500'; topBarCls = 'bg-amber-500';
    } else {
        // beforeStart
        statusLabel = 'Booking Confirmed';
        statusBadgeCls = 'bg-blue-100 text-blue-700 border-blue-300';
        headerGrad = 'from-blue-500 to-indigo-600'; topBarCls = 'bg-blue-500';
    }

    const slotNum  = booking.slot?.slotNumber;
    const zoneName = booking.slot?.zoneName;

    return (
        <div className="mb-8 group">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80
                hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white">

                <div className={`h-1.5 w-full ${topBarCls} transition-colors duration-500`} />

                <div className={`bg-gradient-to-br ${headerGrad} px-6 py-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Slot</span>
                                <span className="text-xl font-black text-white leading-tight">
                                    {slotNum?.split('-')[1] || slotNum || '—'}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-wide ${statusBadgeCls}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {statusLabel}
                                    </span>
                                    {isExtended && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-[11px] font-extrabold">
                                            ⏳ +5 min grace by Guard
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-extrabold text-white tracking-tight">
                                    {zoneName} Block — Slot {slotNum?.split('-')[1] || slotNum}
                                </h3>
                                <p className="text-white/70 text-sm font-medium mt-0.5">{booking.vehicleNumber} · {booking.vehicleType || 'Car'}</p>
                            </div>
                        </div>

                        {beforeStart ? (
                            <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center min-w-[140px] border border-white/20 shadow-inner">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Starts at</p>
                                <p className="text-2xl font-black text-white">{fmtTime(start)}</p>
                                <p className="text-[10px] font-semibold text-white/60 mt-1">Until {fmtTime(end)}</p>
                            </div>
                        ) : isOccupied ? (
                            <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center min-w-[120px] border border-white/20 shadow-inner">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
                                    {isOverstay ? 'Overstay' : inExitBuffer ? 'Exit buffer' : 'Parking ends'}
                                </p>
                                <p className={`text-3xl font-black tabular-nums tracking-tight ${isOverstay ? 'text-red-300 animate-pulse' : (msParking < 60000 ? 'text-red-200 animate-pulse' : 'text-white')}`}>
                                    {fmtMs(Math.abs(msParking))}
                                </p>
                                <p className="text-[10px] font-semibold text-white/70 mt-1">
                                    {isOverstay ? 'Please exit now' : inExitBuffer ? `Exit by ${fmtTime(exitBy)}` : `Until ${fmtTime(end)}`}
                                </p>
                            </div>
                        ) : (
                            <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm rounded-2xl px-5 py-3 text-center min-w-[120px] border border-white/20 shadow-inner">
                                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-0.5">
                                    {graceExpired ? 'Expired' : 'Grace ends'}
                                </p>
                                <p className={`text-3xl font-black tabular-nums tracking-tight ${graceExpired ? 'text-red-300 animate-pulse' : (msGrace < 60000 ? 'text-red-200 animate-pulse' : 'text-white')}`}>
                                    {graceExpired ? '00:00' : fmtMs(msGrace)}
                                </p>
                                <p className="text-[10px] font-semibold text-white/70 mt-1">
                                    {graceExpired ? 'Slot released' : 'Arrive & get verified'}
                                </p>
                            </div>
                        )}


                        <div className="flex flex-col gap-2">
                            {isOccupied && !isOverstay && onExtend && (
                                <button onClick={() => onExtend(booking)} disabled={loading}
                                    className="flex-shrink-0 bg-white/20 hover:bg-white/30 active:bg-white/10
                                        text-white font-bold px-4 py-2.5 rounded-xl transition-all
                                        flex items-center justify-center gap-2 text-sm border border-white/30
                                        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full">
                                    <Icons.Clock />
                                    Extend Booking
                                </button>
                            )}
                            {!isOccupied && (
                                <button onClick={onCancel} disabled={loading}
                                    className="flex-shrink-0 bg-white/20 hover:bg-white/30 active:bg-white/10
                                        text-white font-bold px-4 py-2.5 rounded-xl transition-all
                                        flex items-center justify-center gap-2 text-sm border border-white/30
                                        disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full">
                                    {loading
                                        ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : <Icons.Close />
                                    }
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-5">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Slot</p>
                            <p className="text-lg font-extrabold text-slate-800">{slotNum || '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Block / Zone</p>
                            <p className="text-lg font-extrabold text-slate-800">{zoneName || '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Vehicle No.</p>
                            <p className="text-base font-extrabold text-slate-800 tracking-wider">{booking.vehicleNumber}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                {isOccupied ? 'Entry Time' : 'Booking Start'}
                            </p>
                            <p className="text-base font-extrabold text-slate-800">
                                {isOccupied && booking.actualEntryTime
                                    ? fmtTime(booking.actualEntryTime)
                                    : fmtTime(start)
                                }
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        {isOverstay ? (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold">
                                <Icons.Alert />
                                <span>Your parking time has ended. Please exit immediately. The guard will mark your exit.</span>
                            </div>
                        ) : inExitBuffer ? (
                            <div className="flex items-start gap-3 bg-orange-50 border border-orange-300 text-orange-800 px-4 py-3 rounded-2xl text-sm font-semibold">
                                <Icons.Alert />
                                <span><strong>Parking ended at {fmtTime(end)}.</strong> You have until <strong>{fmtTime(exitBy)}</strong> to exit (10-min exit buffer).</span>
                            </div>
                        ) : isOccupied ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-semibold">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                    <span>Verified by guard. <strong>Parking valid until {fmtTime(end)}.</strong></span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 text-slate-500 px-4 py-3 rounded-2xl text-xs font-semibold">
                                    <Icons.Clock />
                                    <span>10-min exit buffer after {fmtTime(end)} — exit by <strong>{fmtTime(exitBy)}</strong>.</span>
                                </div>
                            </div>
                        ) : graceExpired ? (
                            <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-2xl text-sm font-semibold">
                                <Icons.Alert />
                                <span>Grace period has expired. Your slot has been auto-released. Please cancel this booking and make a new one if needed.</span>
                            </div>
                        ) : isExtended ? (
                            <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 text-purple-800 px-4 py-3 rounded-2xl text-sm font-semibold">
                                <Icons.Clock />
                                <span><strong>Grace extended +5 min by Guard.</strong> Proceed to your slot immediately and get verified.</span>
                            </div>
                        ) : beforeStart ? (
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-2xl text-sm font-semibold">
                                <Icons.Clock />
                                <span>Your slot is reserved. <strong>Arrive at {fmtTime(start)}</strong> — you will have a <strong>10-minute grace period</strong> to get verified by the guard.</span>
                            </div>
                        ) : (
                            <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl text-sm border font-semibold ${
                                msGrace < 3 * 60000 ? 'bg-orange-50 border-orange-300 text-orange-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}>
                                <Icons.Alert />
                                <span>{msGrace < 3 * 60000
                                    ? `⚠️ Less than 3 minutes left! Find the guard immediately to get verified.`
                                    : `Your booking started at ${fmtTime(start)}. Please arrive at your slot and get verified by the guard before the grace period ends.`
                                }</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Availability bar ──────────────────────────────────────────────────────────
const AvailBar = ({ available, total, barClass }) => {
    const pct = total > 0 ? Math.round((available / total) * 100) : 0;
    const color = pct > 60 ? barClass : pct > 30 ? 'bg-amber-400' : 'bg-red-400';
    return (
        <div className="mt-3">
            <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-500">
                <span>{available} available</span><span>{total - available} occupied</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="text-right text-xs text-slate-400 mt-1">{pct}% free</p>
        </div>
    );
};

// ── Reservation Modal ─────────────────────────────────────────────────────────
const ReservationModal = ({ slot, zone, onClose, onConfirm, loading, defaultVehicleNumber, defaultStartTime, defaultEndTime }) => {
    const [minStart] = useState(() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 5);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    });

    useEffect(() => {
        // Prevent background scrolling while modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const [vehicleNumber, setVehicleNumber] = useState(defaultVehicleNumber || '');
    const [vehicleType, setVehicleType] = useState('Car');
    const [arrivalTime, setArrivalTime] = useState(() => defaultStartTime || minStart);
    const [endTime, setEndTime] = useState(() => {
        if (defaultEndTime) return defaultEndTime;
        const d = new Date(defaultStartTime || minStart);
        d.setHours(d.getHours() + 1);
        return d.toISOString().slice(0, 16);
    });
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!vehicleNumber.trim() || !arrivalTime || !endTime) {
            setErrorMsg('Please fill in all required fields.');
            return;
        }
        const parsedEnd = new Date(endTime);
        const parsedStart = new Date(arrivalTime);
        if (parsedEnd <= parsedStart) {
            setErrorMsg('Booking End time must be after the Start time.');
            return; // end must be after start
        }
        onConfirm({
            vehicleNumber: vehicleNumber.toUpperCase(),
            vehicleType,
            startTime: arrivalTime,
            endTime: parsedEnd.toISOString()
        });
    };

    const slotNum = slot?.slotNumber?.split('-')[1] || slot?.slotNumber;

    // Input field base style
    const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 focus:bg-white transition-all duration-200 placeholder:text-slate-300 placeholder:font-medium';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-modal-in overflow-hidden border border-slate-100">

                {/* ── Gradient Header ── */}
                <div className={`bg-gradient-to-br ${zone?.color?.bg} px-6 pt-6 pb-8 relative overflow-hidden flex-shrink-0`}>
                    {/* Decorative circles */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
                                📍 Reserve Slot
                            </span>
                            <h3 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                                {zone?.name}
                            </h3>
                            <p className="text-white/70 text-sm font-semibold mt-0.5">{zone?.type}</p>
                        </div>
                        {/* Slot number badge */}
                        <div className="flex flex-col items-center mr-1">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex flex-col items-center justify-center border border-white/30 shadow-inner">
                                <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider">Slot</span>
                                <span className="text-xl font-black text-white leading-tight">{slotNum}</span>
                            </div>
                        </div>
                    </div>

                    {/* Close button */}
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-50">
                        <Icons.Close />
                    </button>
                </div>

                {/* ── Form body (pulls up over header) ── */}
                <div className="-mt-4 bg-white rounded-t-3xl px-6 pt-6 pb-6 space-y-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] overflow-y-auto flex-1 relative z-10 custom-scrollbar">

                    {/* Vehicle Number */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
                            Vehicle Number <span className="text-red-400 normal-case">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={15}
                            value={vehicleNumber}
                            onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. BA 2 PA 1234"
                            className={inputCls + ' tracking-widest uppercase'}
                        />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Vehicle Type */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                            Vehicle Type
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { value: 'Car',    icon: <Icons.Car />,  label: 'Car' },
                                { value: 'Bike',   icon: <Icons.Bike />, label: 'Bike' },
                                { value: 'Scooter',icon: <Icons.Bike />, label: 'Scooter' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setVehicleType(opt.value)}
                                    className={`relative flex flex-col items-center gap-2 py-3.5 rounded-2xl border-2 font-bold text-sm transition-all duration-200
                                        ${vehicleType === opt.value
                                            ? 'border-blue-500 bg-gradient-to-b from-blue-50 to-indigo-50 text-blue-600 shadow-md shadow-blue-100'
                                            : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:text-slate-600 hover:bg-white'
                                        }`}
                                >
                                    <span className="text-xl">{opt.icon}</span>
                                    <span className="text-xs font-extrabold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Arrival Time (booking start) */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                            Booking Start <span className="text-red-400 normal-case">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            required
                            min={minStart}
                            value={arrivalTime}
                            onChange={e => {
                                setArrivalTime(e.target.value);
                                // Auto-suggest end = start + 1 hr
                                const newEnd = new Date(e.target.value);
                                newEnd.setHours(newEnd.getHours() + 1);
                                setEndTime(newEnd.toISOString().slice(0, 16));
                            }}
                            className={inputCls}
                        />
                    </div>

                    {/* Booking End Time */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                            Booking End <span className="text-red-400 normal-case">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            required
                            min={arrivalTime}
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            className={inputCls}
                        />
                    </div>

                    {/* Grace period info box */}
                    <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3.5">
                        <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-sky-600">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-extrabold text-sky-700 uppercase tracking-wider mb-0.5">Booking Rules</p>
                            <p className="text-xs text-sky-700 font-medium leading-relaxed">
                                <strong>10-min grace</strong> to arrive after start time.
                                End time is <strong>fixed</strong> — a 10-min exit buffer applies after.
                            </p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="bg-red-50 text-red-600 text-[11px] font-bold px-4 py-3 rounded-2xl border border-red-200 flex items-center gap-2 animate-fade-in shadow-sm">
                            <FaExclamationTriangle className="text-[12px] flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    {/* CTA Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all duration-200
                            shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                            bg-gradient-to-r ${zone?.color?.bg} text-white
                            hover:shadow-xl hover:-translate-y-0.5 hover:brightness-110
                            active:translate-y-0 active:shadow-md`}
                    >
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Reserving…</>
                            : <><Icons.Pin /> Confirm Reservation</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};


// ── Extend Booking Modal ────────────────────────────────────────────────────────
const ExtendBookingModal = ({ booking, onClose, onConfirm, loading }) => {
    const [extraMinutes, setExtraMinutes] = useState(30);

    // Lock body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    const handleSubmit = () => {
        onConfirm(extraMinutes);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in border border-slate-200">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        <Icons.Clock /> Extend Parking
                    </h3>
                    <button onClick={onClose} className="p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <Icons.Close />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div>
                        <p className="text-sm text-slate-600 mb-4">Select how much extra time you need. Your current parking ends at <strong className="text-slate-800">{new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</strong>.</p>
                        
                        <div className="grid grid-cols-3 gap-3">
                            {[30, 60, 120].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setExtraMinutes(mins)}
                                    className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                        extraMinutes === mins 
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm' 
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    +{mins >= 60 ? `${mins / 60} hr` : `${mins} min`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
                        <Icons.Alert />
                        <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                            Extensions are subject to slot availability. Maximum total extension is 2 hours.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all
                            bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 disabled:opacity-50"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icons.Clock />}
                        Confirm Extension
                    </button>
                </div>
            </div>
        </div>
    );
};


// ── Main Dashboard ────────────────────────────────────────────────────────────
const StudentDashboard = () => {
    const { user } = useAuth();

    // Zone stats
    const [zoneStats, setZoneStats] = useState({});
    const [statsLoading, setStatsLoading] = useState(true);

    // Active reservation
    const [activeBooking, setActiveBooking] = useState(null);
    const [bookingActionLoading, setBookingActionLoading] = useState(false);

    // Modal state
    const [activeModal, setActiveModal] = useState(null);
    const [slots, setSlots] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);

    // Slot info + reservation modal
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showReserveModal, setShowReserveModal] = useState(false);
    const [reserveLoading, setReserveLoading] = useState(false);

    // Extension modal
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [extendLoading, setExtendLoading] = useState(false);

    // Time filter for zone modal
    const [timeFilter, setTimeFilter] = useState({ start: '', end: '' });
    const [timeFilterActive, setTimeFilterActive] = useState(false);

    // Search / filter
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    // Refs for scrolling
    const zonesRef = useRef(null);
    const reservationRef = useRef(null);

    // Toast
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);
    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    // Live clock
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []); // 1s for live clock

    // ── Fetch active booking ──────────────────────────────────────────────────
    const fetchActiveBooking = useCallback(async () => {
        try {
            const { data } = await api.get('/bookings/myactive');
            setActiveBooking(data || null);
        } catch { setActiveBooking(null); }
    }, []);

    // ── Load zone stats ───────────────────────────────────────────────────────
    const loadZoneStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const results = await Promise.all(ZONES.map(z => api.get(`/slots/zone/${z.id}`).then(r => ({ id: z.id, data: r.data }))));
            const stats = {};
            results.forEach(({ id, data }) => {
                const slots = Array.isArray(data) ? data : [];
                stats[id] = {
                    total: slots.length,
                    free: slots.filter(s => getSlotStatus(s) === 'free').length,
                    reserved: slots.filter(s => getSlotStatus(s) === 'reserved').length,
                    occupied: slots.filter(s => getSlotStatus(s) === 'occupied').length,
                };
            });
            setZoneStats(stats);
        } catch { setZoneStats({}); }
        finally { setStatsLoading(false); }
    }, []);

    // ── Cleanup expired reservations ──────────────────────────────────────────
    const runCleanup = useCallback(async () => {
        try { await api.post('/bookings/cleanup'); } catch { /* silent */ }
    }, []);

    useEffect(() => {
        loadZoneStats();
        fetchActiveBooking();
        runCleanup();
    }, [loadZoneStats, fetchActiveBooking, runCleanup]);

    // ── Open zone modal ───────────────────────────────────────────────────────
    const fetchZoneSlots = useCallback(async (zoneId, start, end) => {
        try {
            const params = new URLSearchParams();
            if (start) params.set('startTime', new Date(start).toISOString());
            if (end)   params.set('endTime',   new Date(end).toISOString());
            const query = params.toString() ? `?${params.toString()}` : '';
            const { data } = await api.get(`/slots/zone/${zoneId}${query}`);
            return data.sort((a, b) => {
                const nA = parseInt(a.slotNumber.split('-')[1]) || 0;
                const nB = parseInt(b.slotNumber.split('-')[1]) || 0;
                return nA - nB;
            });
        } catch { return []; }
    }, []);

    const openZoneModal = async (zoneId) => {
        setActiveModal(zoneId);
        setSearch('');
        setFilter('All');
        setSelectedSlot(null);
        setModalLoading(true);
        setTimeFilter({ start: '', end: '' });
        setTimeFilterActive(false);
        const data = await fetchZoneSlots(zoneId);
        setSlots(data);
        setModalLoading(false);
    };

    const closeModal = () => { setActiveModal(null); setSlots([]); setSelectedSlot(null); setTimeFilter({ start: '', end: '' }); setTimeFilterActive(false); };

    // ── Apply time filter ─────────────────────────────────────────────────────
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
        setModalLoading(true);
        const data = await fetchZoneSlots(activeModal, timeFilter.start, timeFilter.end);
        setSlots(data);
        setModalLoading(false);
    };

    const clearTimeFilter = async () => {
        setTimeFilter({ start: '', end: '' });
        setTimeFilterActive(false);
        setModalLoading(true);
        const data = await fetchZoneSlots(activeModal);
        setSlots(data);
        setModalLoading(false);
    };

    // ── 10-second polling ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!activeModal) return;
        const id = setInterval(async () => {
            const data = await fetchZoneSlots(
                activeModal,
                timeFilterActive ? timeFilter.start : undefined,
                timeFilterActive ? timeFilter.end   : undefined
            );
            setSlots(data);
            await fetchActiveBooking();
            await runCleanup();
            await loadZoneStats();
        }, 10000);
        return () => clearInterval(id);
    }, [activeModal, fetchZoneSlots, fetchActiveBooking, runCleanup, loadZoneStats, timeFilterActive, timeFilter]);

    // Also poll active booking outside modal every 15s
    useEffect(() => {
        const id = setInterval(async () => {
            await runCleanup();
            await fetchActiveBooking();
            await loadZoneStats();
        }, 15000);
        return () => clearInterval(id);
    }, [fetchActiveBooking, runCleanup, loadZoneStats]);

    // ── Handle slot click ─────────────────────────────────────────────────────
    const handleSlotClick = (slot) => {
        const status = getSlotStatus(slot);
        // When time filter is active, check availabilityStatus instead
        if (timeFilterActive && slot.availabilityStatus === 'unavailable') {
            const from = slot.conflictStart ? new Date(slot.conflictStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
            const to   = slot.conflictEnd   ? new Date(slot.conflictEnd).toLocaleTimeString('en-US',   { hour: '2-digit', minute: '2-digit' }) : '';
            addToast(`This slot is booked ${from}–${to}. Try a different time or slot.`, 'error');
            return;
        }
        if (status === 'free' || (timeFilterActive && slot.availabilityStatus === 'available')) {
            if (activeBooking) {
                addToast('You already have an active reservation. Cancel it first to book a different slot.', 'info');
                return;
            }
            setSelectedSlot(slot);
            setShowReserveModal(true);
        } else if (status === 'reserved' && activeBooking?.slot?._id === slot._id) {
            if (window.confirm('You have reserved this slot. Would you like to cancel your reservation?')) {
                handleCancel();
            }
        }
    };

    // ── Create booking ────────────────────────────────────────────────────────
    const handleReserve = async ({ vehicleNumber, vehicleType, startTime, endTime }) => {
        setReserveLoading(true);
        try {
            await api.post('/bookings', {
                slotId: selectedSlot._id,
                vehicleNumber,
                vehicleType,
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });
            addToast(`Slot ${selectedSlot.slotNumber} booked successfully! ⏳`, 'info');
            setShowReserveModal(false);
            setSelectedSlot(null);
            await fetchActiveBooking();
            const data = await fetchZoneSlots(activeModal);
            setSlots(data);
            await loadZoneStats();
        } catch (e) {
            addToast(e.response?.data?.message || 'Booking failed', 'error');
        } finally { setReserveLoading(false); }
    };



    // ── Cancel booking ────────────────────────────────────────────────────────
    const handleCancel = async () => {
        if (!activeBooking) return;
        setBookingActionLoading(true);
        try {
            await api.put(`/bookings/${activeBooking._id}/cancel`);
            setActiveBooking(null);
            addToast('Reservation cancelled. Slot is now free.', 'success');
            await loadZoneStats();
            if (activeModal) { const d = await fetchZoneSlots(activeModal); setSlots(d); }
        } catch (e) {
            addToast(e.response?.data?.message || 'Cancellation failed', 'error');
        } finally { setBookingActionLoading(false); }
    };

    // ── Extend booking ────────────────────────────────────────────────────────
    const handleExtendSubmit = async (extraMinutes) => {
        if (!activeBooking) return;
        setExtendLoading(true);
        try {
            const { data } = await api.put(`/bookings/${activeBooking._id}/student-extend`, { extraMinutes });
            setActiveBooking(data);
            addToast(`Booking extended successfully by ${extraMinutes >= 60 ? extraMinutes / 60 + ' hr' : extraMinutes + ' mins'}`, 'success');
            setShowExtendModal(false);
            if (activeModal) { const d = await fetchZoneSlots(activeModal); setSlots(d); }
        } catch (e) {
            addToast(e.response?.data?.message || 'Extension failed', 'error');
        } finally { setExtendLoading(false); }
    };

    // ── Filtered slots ────────────────────────────────────────────────────────
    const filteredSlots = slots.filter(slot => {
        const num = slot.slotNumber.split('-')[1] || slot.slotNumber;
        const matchSearch = search === '' || num.includes(search) || slot.slotNumber.toLowerCase().includes(search.toLowerCase());
        const st = getSlotStatus(slot);
        const matchFilter =
            filter === 'All' ||
            (filter === 'Available' && st === 'free') ||
            (filter === 'Reserved' && st === 'reserved') ||
            (filter === 'Occupied' && st === 'occupied') ||
            (filter === 'Visitor' && st === 'visitor');
        return matchSearch && matchFilter;
    });

    const activeZone = ZONES.find(z => z.id === activeModal);
    const freeCount = slots.filter(s => getSlotStatus(s) === 'free').length;
    const reservedCount = slots.filter(s => getSlotStatus(s) === 'reserved').length;
    const occupiedCount = slots.filter(s => getSlotStatus(s) === 'occupied').length;

    const totalFree = Object.values(zoneStats).reduce((a, z) => a + z.free, 0);
    const totalSlots = Object.values(zoneStats).reduce((a, z) => a + z.total, 0);
    const totalReserved = Object.values(zoneStats).reduce((a, z) => a + (z.reserved || 0), 0);
    const totalOccupied = Object.values(zoneStats).reduce((a, z) => a + z.occupied, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 pt-8 pb-20 px-4">
            <Toast toasts={toasts} />

            {/* Reservation Modal */}
            {showReserveModal && selectedSlot && (
                <ReservationModal
                    slot={selectedSlot}
                    zone={activeZone}
                    onClose={() => { setShowReserveModal(false); setSelectedSlot(null); }}
                    onConfirm={handleReserve}
                    loading={reserveLoading}
                    defaultVehicleNumber={user?.vehicleNumber}
                    defaultStartTime={timeFilterActive ? timeFilter.start : undefined}
                    defaultEndTime={timeFilterActive ? timeFilter.end : undefined}
                />
            )}

            {/* Extend Booking Modal */}
            {showExtendModal && activeBooking && (
                <ExtendBookingModal
                    booking={activeBooking}
                    onClose={() => setShowExtendModal(false)}
                    onConfirm={handleExtendSubmit}
                    loading={extendLoading}
                />
            )}

            <div className="max-w-6xl mx-auto">

                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <p className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-1">Smart Parking</p>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                            Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] ?? 'Student'}</span> 👋
                        </h1>
                        <p className="text-slate-400 mt-1 font-medium">Select a zone to view and reserve parking slots.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm self-start md:self-auto">
                        <Icons.Clock />
                        <div>
                            <p className="text-xs text-slate-400 font-medium">Current Time</p>
                            <p className="text-base font-bold text-slate-700 tabular-nums">
                                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Active Reservation Banner ── */}
                {activeBooking && (
                    <div ref={reservationRef}>
                        <ReservationBanner
                            booking={activeBooking}
                            onCancel={handleCancel}
                            onExtend={() => setShowExtendModal(true)}
                            loading={bookingActionLoading}
                        />
                    </div>
                )}

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: 'Total Slots', value: totalSlots, icon: <Icons.Stats />, color: 'text-indigo-600 bg-indigo-50',
                            action: () => zonesRef.current?.scrollIntoView({ behavior: 'smooth' })
                        },
                        {
                            label: 'Available', value: totalFree, icon: <Icons.Check />, color: 'text-emerald-600 bg-emerald-50',
                            action: () => zonesRef.current?.scrollIntoView({ behavior: 'smooth' })
                        },
                        {
                            label: 'Reserved', value: totalReserved, icon: <Icons.Clock />, color: 'text-amber-500 bg-amber-50',
                            action: () => reservationRef.current?.scrollIntoView({ behavior: 'smooth' })
                        },
                        {
                            label: 'Occupied', value: totalOccupied, icon: <Icons.Parking />, color: 'text-red-500 bg-red-50',
                            action: () => reservationRef.current?.scrollIntoView({ behavior: 'smooth' })
                        },
                    ].map((s, i) => (
                        <div key={i}
                            onClick={s.action}
                            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-95`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>{s.icon}</div>
                            <div>
                                <p className="text-2xl font-extrabold text-slate-800">{statsLoading ? <span className="text-slate-300 animate-pulse">…</span> : s.value}</p>
                                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Zone Cards ── */}
                <div ref={zonesRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ZONES.map((zone) => {
                        const stats = zoneStats[zone.id] || { total: 0, free: 0, reserved: 0, occupied: 0 };
                        const VehicleIcon = Icons[zone.vehicleIcon];
                        return (
                            <div key={zone.id} onClick={() => openZoneModal(zone.id)}
                                className="group bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                                <div className={`bg-gradient-to-br ${zone.color.bg} p-6 relative overflow-hidden`}>
                                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                                    <div className="relative z-10">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white mb-3">
                                            <VehicleIcon />{zone.type}
                                        </span>
                                        <h2 className="text-2xl font-extrabold text-white">{zone.name}</h2>
                                        <p className="text-white/70 text-sm font-medium">{zone.label}</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="flex gap-2 mb-4">
                                        <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
                                            <p className="text-xl font-extrabold text-emerald-600">{statsLoading ? '…' : stats.free}</p>
                                            <p className="text-xs font-semibold text-emerald-500">Free</p>
                                        </div>
                                        <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                                            <p className="text-xl font-extrabold text-amber-500">{statsLoading ? '…' : stats.reserved || 0}</p>
                                            <p className="text-xs font-semibold text-amber-400">Reserved</p>
                                        </div>
                                        <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                                            <p className="text-xl font-extrabold text-red-500">{statsLoading ? '…' : stats.occupied}</p>
                                            <p className="text-xs font-semibold text-red-400">Booked</p>
                                        </div>
                                    </div>
                                    <AvailBar available={stats.free} total={stats.total} barClass={zone.color.bar} />
                                    <button className={`mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all duration-300
                                        text-slate-600 bg-slate-50 border border-slate-200
                                        group-hover:bg-gradient-to-r group-hover:${zone.color.bg} group-hover:text-white group-hover:border-transparent group-hover:shadow-lg`}>
                                        View Slots →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Legend ── */}
                <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm font-semibold text-slate-500">
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500 block" />Available</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-amber-400 block" />Reserved</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500 block" />Occupied</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-500 block" />Visitor</span>
                </div>
            </div>

            {/* ══════ ZONE MODAL ══════ */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
                    onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
                    <div className="bg-white/95 backdrop-blur-md w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-white/60 flex flex-col animate-modal-in overflow-hidden">

                        {/* Modal Header */}
                        <div className={`bg-gradient-to-r ${activeZone?.color?.bg} px-6 py-5 flex items-center justify-between flex-shrink-0`}>
                            <div className="text-white">
                                <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-0.5">{activeZone?.label}</p>
                                <h3 className="text-xl font-extrabold">{activeZone?.name}</h3>
                                <p className="text-sm text-white/70">{activeZone?.type}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-4 bg-white/20 rounded-2xl px-4 py-2">
                                    {[['Free', freeCount, 'text-emerald-200'], ['Reserved', reservedCount, 'text-amber-200'], ['Booked', occupiedCount, 'text-red-200'], ['Total', slots.length, 'text-white']].map(([l, v, c]) => (
                                        <div key={l} className="text-center">
                                            <p className={`text-lg font-extrabold text-white`}>{v}</p>
                                            <p className={`text-xs font-semibold ${c}`}>{l}</p>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={closeModal} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                                    <Icons.Close />
                                </button>
                            </div>
                        </div>

                        {/* Progress bar */}
                        {!modalLoading && slots.length > 0 && (
                            <div className="px-6 pt-3 pb-1 flex-shrink-0 bg-white border-b border-slate-100">
                                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                                    <span>{freeCount} / {slots.length} slots available</span>
                                    <span className="flex items-center gap-1 text-slate-400"><Icons.Refresh /><span>Auto-refresh 10s</span></span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-700 ${activeZone?.color?.bar}`}
                                        style={{ width: `${slots.length > 0 ? (freeCount / slots.length) * 100 : 0}%` }} />
                                </div>
                            </div>
                        )}

                        {/* ── Time Range Availability Picker ── */}
                        <div className="px-6 py-3 flex-shrink-0 bg-white border-b border-slate-100">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Icons.Clock /> Check availability for a specific time
                            </p>
                            <div className="flex flex-wrap gap-2 items-end">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={timeFilter.start}
                                        onChange={e => setTimeFilter(f => ({ ...f, start: e.target.value }))}
                                        className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={timeFilter.end}
                                        min={timeFilter.start}
                                        onChange={e => setTimeFilter(f => ({ ...f, end: e.target.value }))}
                                        className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={applyTimeFilter}
                                    disabled={!timeFilter.start || !timeFilter.end}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-blue-500/20"
                                >
                                    Check Slots
                                </button>
                                {timeFilterActive && (
                                    <button
                                        onClick={clearTimeFilter}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-xl transition-all border border-slate-200"
                                    >
                                        Clear Filter
                                    </button>
                                )}
                            </div>
                            {timeFilterActive && (
                                <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-xl">
                                    <Icons.Clock />
                                    <span>
                                        Showing availability for{' '}
                                        <strong>{new Date(timeFilter.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                                        {' → '}
                                        <strong>{new Date(timeFilter.end).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>.
                                        {' '}Green = free for this time. Red = already booked.
                                    </span>
                                </div>
                            )}
                        </div>


                        {/* Search + Filter */}
                        <div className="px-6 py-3 flex flex-wrap gap-3 items-center border-b border-slate-100 bg-slate-50 flex-shrink-0">
                            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[160px] max-w-xs shadow-sm">
                                <Icons.Search />
                                <input type="text" placeholder="Search slot no..." value={search} onChange={e => setSearch(e.target.value)}
                                    className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-300 bg-transparent" />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {FILTERS.map(f => (
                                    <button key={f} onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border
                                        ${filter === f ? 'bg-slate-800 text-white border-slate-800 shadow' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div className="ml-auto flex items-center gap-4 text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 block" />Free</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 block" />Reserved</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 block" />Booked</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-500 block" />Visitor</span>
                            </div>
                        </div>

                        {/* Slot Grid */}
                        <div className="flex-1 p-5 overflow-y-auto bg-slate-50">
                            {modalLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-3">
                                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-400 font-medium">Loading slots...</p>
                                </div>
                            ) : filteredSlots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                                    <Icons.Parking />
                                    <p className="text-sm font-medium">No slots match your search/filter</p>
                                </div>
                            ) : (
                                <div>
                                    {/* Info tip */}
                                    {!activeBooking && (
                                        <div className="mb-4 flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-2.5 rounded-xl">
                                            <Icons.Alert />
                                            Click a <span className="font-extrabold text-emerald-600">green slot</span> to make an arrival-based reservation.
                                        </div>
                                    )}
                                    {activeBooking && (
                                        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-semibold px-4 py-2.5 rounded-xl">
                                            <Icons.Alert />
                                            You already have an active reservation. Cancel it first to book a different slot.
                                        </div>
                                    )}
                                    <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-9 gap-2.5">
                                        {filteredSlots.map(slot => {
                                            const status = getSlotStatus(slot);
                                            const numPart = slot.slotNumber.split('-')[1] || slot.slotNumber;
                                            const isSelected = selectedSlot?._id === slot._id;
                                            const isMySlot = activeBooking?.slot?._id === slot._id;

                                            // When time filter is ON, override colours based on availabilityStatus
                                            let cardCls, icon, tooltipLabel, isClickable;
                                            if (timeFilterActive) {
                                                const avail = slot.availabilityStatus;
                                                if (avail === 'available' && !activeBooking) {
                                                    cardCls = 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400 hover:scale-110 cursor-pointer shadow-emerald-200';
                                                    icon = '✓'; tooltipLabel = 'Available for your time'; isClickable = true;
                                                } else if (avail === 'available' && activeBooking) {
                                                    cardCls = 'bg-emerald-500 border-emerald-400 text-white opacity-40 cursor-not-allowed shadow-emerald-200';
                                                    icon = '✓'; tooltipLabel = 'Available (cancel current booking first)'; isClickable = false;
                                                } else {
                                                    // unavailable for this time
                                                    const from = slot.conflictStart ? new Date(slot.conflictStart).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                                                    const to   = slot.conflictEnd   ? new Date(slot.conflictEnd).toLocaleTimeString('en-US',   { hour: '2-digit', minute: '2-digit' }) : '';
                                                    cardCls = 'bg-red-100 border-red-300 text-red-500 cursor-not-allowed';
                                                    icon = '✗'; tooltipLabel = `Booked ${from}–${to}`; isClickable = false;
                                                }
                                            } else {
                                                const style = SLOT_STYLE[status];
                                                cardCls = style.card; icon = style.icon; tooltipLabel = style.label;
                                                const canBook = status === 'free' && !activeBooking;
                                                isClickable = canBook || (isMySlot && (status === 'reserved' || status === 'occupied'));
                                                if (!isClickable && status === 'free') cardCls += ' opacity-40 cursor-not-allowed';
                                            }

                                            return (
                                                <div key={slot._id}
                                                    onClick={() => (timeFilterActive || isClickable) && handleSlotClick(slot)}
                                                    title={`${slot.slotNumber} — ${tooltipLabel}`}
                                                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border-2
                                                        text-xs font-extrabold shadow-sm transition-all duration-200 select-none
                                                        ${cardCls}
                                                        ${isMySlot ? 'ring-4 ring-blue-500 ring-offset-2 animate-pulse z-10 scale-105' : ''}
                                                        ${isSelected ? `ring-4 ${activeZone?.color?.ring} ring-offset-2 scale-110 z-10` : ''}`}>
                                                    <span className="text-[10px] opacity-60 mb-0.5">{icon}</span>
                                                    <span className="text-sm">{numPart}</span>
                                                    {isMySlot && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap z-20">
                                                            YOUR SLOT
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
