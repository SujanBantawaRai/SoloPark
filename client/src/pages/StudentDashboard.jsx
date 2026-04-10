import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

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

// ── Removed countdown/fmtMs ───────────────────────────────────────────────────

// ── My Active Reservation Banner ──────────────────────────────────────────────
const ReservationBanner = ({ booking, onCancel, loading }) => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 5000); // Check every 5s
        return () => clearInterval(t);
    }, []);

    if (!booking) return null;

    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const isOccupied = booking.status === 'occupied';

    let statusText, cardTheme, headerTheme, statusIcon;
    if (isOccupied) {
        statusText = 'Verified / Parked'; cardTheme = 'border-emerald-200 bg-emerald-50'; headerTheme = 'bg-emerald-500'; statusIcon = '🟢';
    } else if (now > end) {
        statusText = 'Expired'; cardTheme = 'border-red-200 bg-red-50'; headerTheme = 'bg-red-500'; statusIcon = '🔴';
    } else if (now >= start && now <= end) {
        statusText = 'Awaiting Verification'; cardTheme = 'border-amber-200 bg-amber-50'; headerTheme = 'bg-amber-500'; statusIcon = '🟡';
    } else {
        statusText = 'Booked — Upcoming'; cardTheme = 'border-blue-200 bg-blue-50'; headerTheme = 'bg-blue-500'; statusIcon = '🔵';
    }

    return (
        <div className={`mb-8 rounded-3xl overflow-hidden shadow-xl border ${cardTheme}`}>
            <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 ${headerTheme}`}>
                <div className="text-white">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-0.5">
                        {statusIcon} {statusText}
                    </p>
                    <h3 className="text-xl font-extrabold">
                        Slot {booking.slot?.slotNumber} — {booking.slot?.zoneName} Block
                    </h3>
                    <p className="text-sm opacity-80">Vehicle: {booking.vehicleNumber} ({booking.vehicleType || 'Car'})</p>
                </div>
                {!isOccupied && (
                    <div className="flex items-center gap-3">
                        <button onClick={onCancel} disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all border border-red-400 flex items-center gap-2 shadow-sm shadow-red-500/50">
                            {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icons.Close />}
                            Cancel Reservation
                        </button>
                    </div>
                )}
            </div>

            <div className="px-6 py-4">
                <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Expected Arrival</p>
                        <p className="font-bold text-slate-700">{start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Grace Period</p>
                        <p className="font-bold text-amber-600">60 Minutes</p>
                    </div>
                    {isOccupied && (
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Verified At</p>
                            <p className="font-bold text-emerald-600">
                                {new Date(booking.verifiedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    )}
                </div>
                {!isOccupied && now >= start && now <= end && (
                    <div className="mt-4 flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-xs font-bold font-semibold">
                        <Icons.Alert /> Guard verification required. Park and wait for the guard.
                    </div>
                )}
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
const ReservationModal = ({ slot, zone, onClose, onConfirm, loading, defaultVehicleNumber }) => {
    const [minStart] = useState(() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 5);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    });

    const [vehicleNumber, setVehicleNumber] = useState(defaultVehicleNumber || '');
    const [vehicleType, setVehicleType] = useState('Car');
    const [arrivalTime, setArrivalTime] = useState(minStart);
    const [endTime, setEndTime] = useState(() => {
        const d = new Date(minStart);
        d.setHours(d.getHours() + 1);
        return d.toISOString().slice(0, 16);
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!vehicleNumber.trim() || !arrivalTime) return;

        // Internalize end time calculation to ensure it's always valid
        const start = new Date(arrivalTime);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // Exactly 1 hour grace

        onConfirm({
            vehicleNumber: vehicleNumber.toUpperCase(),
            vehicleType,
            startTime: arrivalTime,
            endTime: end.toISOString()
        });
    };

    const slotNum = slot?.slotNumber?.split('-')[1] || slot?.slotNumber;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-modal-in overflow-hidden">
                {/* Header */}
                <div className={`bg-gradient-to-r ${zone?.color?.bg} px-6 py-5 flex items-center justify-between`}>
                    <div className="text-white">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70">Reserve Slot</p>
                        <h3 className="text-2xl font-extrabold">{zone?.name} — Slot {slotNum}</h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
                        <Icons.Close />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Vehicle number */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Vehicle Number</label>
                        <input type="text" required maxLength={15} value={vehicleNumber}
                            onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. BA 2 PA 1234"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                    </div>

                    {/* Vehicle type */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Vehicle Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'Car', icon: <Icons.Car />, label: 'Car' },
                                { value: 'Bike', icon: <Icons.Bike />, label: 'Bike' },
                                { value: 'Scooter', icon: <Icons.Bike />, label: 'Scooter' },
                            ].map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setVehicleType(opt.value)}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 font-bold text-sm transition-all ${vehicleType === opt.value
                                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                        : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
                                        }`}
                                >
                                    <span className="text-xl">{opt.icon}</span>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Time Window (Arrival Time Only) */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Arrival Time</label>
                        <input type="datetime-local" required min={minStart} value={arrivalTime}
                            onChange={e => {
                                setArrivalTime(e.target.value);
                                // Auto-set end time to 1 hour after arrival
                                const newEnd = new Date(e.target.value);
                                newEnd.setHours(newEnd.getHours() + 1);
                                setEndTime(newEnd.toISOString().slice(0, 16));
                            }}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition" />
                        <p className="text-[10px] text-slate-400 font-medium mt-1.5 ml-1">
                            * Entry must be confirmed within 1 hour of this time.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                        <p className="text-xs text-blue-800">
                            Slot will be held for <strong className="font-bold">60 minutes</strong> after your arrival time. Please ensure you are verified by a guard within this window.
                        </p>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-blue-300/50 disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Reserving...</> : <><Icons.Pin /> Confirm Reservation</>}
                    </button>
                </form>
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
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    // ── Fetch active booking ──────────────────────────────────────────────────
    const fetchActiveBooking = useCallback(async () => {
        try {
            const { data } = await api.get('/bookings/myactive');
            setActiveBooking(data);
        } catch { /* silent */ }
    }, []);

    // ── Load zone stats ───────────────────────────────────────────────────────
    const loadZoneStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const results = await Promise.all(ZONES.map(z => api.get(`/slots/zone/${z.id}`).then(r => ({ id: z.id, data: r.data }))));
            const stats = {};
            results.forEach(({ id, data }) => {
                stats[id] = {
                    total: data.length,
                    free: data.filter(s => getSlotStatus(s) === 'free').length,
                    reserved: data.filter(s => getSlotStatus(s) === 'reserved').length,
                    occupied: data.filter(s => getSlotStatus(s) === 'occupied').length,
                };
            });
            setZoneStats(stats);
        } catch { /* silent */ }
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
    const fetchZoneSlots = useCallback(async (zoneId) => {
        try {
            const { data } = await api.get(`/slots/zone/${zoneId}`);
            return data.sort((a, b) => {
                const nA = parseInt(a.slotNumber.split('-')[1]) || 0;
                const nB = parseInt(b.slotNumber.split('-')[1]) || 0;
                return nA - nB;
            });
        } catch { return []; }
    }, []);

    const openZoneModal = async (zoneId) => {
        setActiveModal(zoneId); setSearch(''); setFilter('All'); setSelectedSlot(null); setModalLoading(true);
        const data = await fetchZoneSlots(zoneId);
        setSlots(data); setModalLoading(false);
    };

    const closeModal = () => { setActiveModal(null); setSlots([]); setSelectedSlot(null); };

    // ── 10-second polling ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!activeModal) return;
        const id = setInterval(async () => {
            const data = await fetchZoneSlots(activeModal);
            setSlots(data);
            await fetchActiveBooking();
            await runCleanup();
            await loadZoneStats();
        }, 10000);
        return () => clearInterval(id);
    }, [activeModal, fetchZoneSlots, fetchActiveBooking, runCleanup, loadZoneStats]);

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
        if (status === 'free') {
            if (activeBooking) {
                addToast('You already have an active reservation. Cancel it first to book a different slot.', 'info');
                return;
            }
            setSelectedSlot(slot);
            setShowReserveModal(true);
        } else if (status === 'reserved' && activeBooking?.slot?._id === slot._id) {
            if (window.confirm("You have reserved this slot. Would you like to cancel your reservation?")) {
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
                                            const style = SLOT_STYLE[status];
                                            const numPart = slot.slotNumber.split('-')[1] || slot.slotNumber;
                                            const isSelected = selectedSlot?._id === slot._id;
                                            const isMySlot = activeBooking?.slot?._id === slot._id;
                                            const canBook = status === 'free' && !activeBooking;
                                            const canClick = canBook || (isMySlot && (status === 'reserved' || status === 'occupied'));

                                            return (
                                                <div key={slot._id}
                                                    onClick={() => canClick && handleSlotClick(slot)}
                                                    title={`${slot.slotNumber} — ${style.label}`}
                                                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl border-2
                                                        text-xs font-extrabold shadow-sm transition-all duration-200 select-none
                                                        ${style.card}
                                                        ${isMySlot ? 'ring-4 ring-blue-500 ring-offset-2 animate-pulse z-10 scale-105' : ''}
                                                        ${!canClick && status === 'free' ? 'opacity-40 cursor-not-allowed' : (canClick ? 'cursor-pointer hover:scale-110 active:scale-95' : 'opacity-40 cursor-default')}
                                                        ${isSelected ? `ring-4 ${activeZone?.color?.ring} ring-offset-2 scale-110 z-10` : ''}`}>
                                                    <span className="text-[10px] opacity-60 mb-0.5">{style.icon}</span>
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
