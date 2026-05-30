import { useState, useEffect, useRef, useCallback, Component } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import {
    FaShieldAlt, FaPlusCircle, FaSignOutAlt, FaHistory, FaCar,
    FaCheckCircle, FaMotorcycle, FaUser, FaClock, FaMapMarkerAlt,
    FaSyncAlt, FaClipboardList, FaSearch, FaSortAmountDown,
    FaTimes, FaIdCard, FaAlignLeft, FaCarSide, FaEdit,
    FaExclamationTriangle
} from 'react-icons/fa';

// ── Error Boundary ─────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(error) { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 40, fontFamily: 'monospace', background: '#fff3f3', minHeight: '100vh' }}>
                    <h2 style={{ color: '#dc2626', fontSize: 20 }}>⚠️ Guard Dashboard Crashed</h2>
                    <p style={{ color: '#7f1d1d', marginTop: 8 }}>{this.state.error?.message}</p>
                    <pre style={{ marginTop: 16, fontSize: 12, color: '#450a0a', whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Scooter SVG ───────────────────────────────────────────────────────────────
const ScooterIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M19 8h-1.26c-.19-.73-.51-1.4-.92-2H17c.55 0 1-.45 1-1s-.45-1-1-1h-2.74C12.79 2.82 11.46 2 10 2C7.24 2 5 4.24 5 7c0 .34.04.67.1 1H3c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h.28c-.18.46-.28.95-.28 1.5C3 15.43 4.57 17 6.5 17c1.76 0 3.22-1.3 3.46-3H13v1c0 .55.45 1 1 1h1c0 1.11.89 2 2 2s2-.89 2-2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z" />
    </svg>
);

const VehicleIcon = ({ type }) => {
    if (type === 'Bike') return <FaMotorcycle className="text-base" />;
    if (type === 'Scooter') return <ScooterIcon />;
    return <FaCar className="text-base" />;
};

// ── Zone config ───────────────────────────────────────────────────────────────
const ZONES = [
    { id: 'HCK', label: 'Zone 1', name: 'HCK Block', type: 'Cars & Bikes', vehicleIcon: <FaCar />, color: { bg: 'from-blue-600 to-indigo-700', bar: 'bg-blue-500', ring: 'ring-blue-400' } },
    { id: 'WLV', label: 'Zone 2', name: 'WLV Block', type: 'Cars Only', vehicleIcon: <FaCar />, color: { bg: 'from-violet-600 to-purple-700', bar: 'bg-violet-500', ring: 'ring-violet-400' } },
    { id: 'ING', label: 'Zone 3', name: 'ING Block', type: 'Scooters & Bikes', vehicleIcon: <FaMotorcycle />, color: { bg: 'from-emerald-500 to-teal-600', bar: 'bg-emerald-500', ring: 'ring-emerald-400' } },
];

// ── Slot helpers ──────────────────────────────────────────────────────────────
const getSlotStatus = (slot) => {
    if (slot.status === 'occupied' || slot.isBooked) return 'occupied';
    if (slot.status === 'reserved') return 'reserved';
    if (slot.slotType === 'Visitor') return 'visitor';
    return 'free';
};

const SLOT_STYLE = {
    free: { card: 'bg-emerald-500 border-emerald-400 text-white hover:bg-emerald-400 hover:scale-110 cursor-pointer shadow-sm shadow-emerald-200', icon: '✓', label: 'Available' },
    reserved: { card: 'bg-amber-400 border-amber-300 text-white cursor-pointer shadow-sm shadow-amber-200', icon: '⏳', label: 'Reserved' },
    occupied: { card: 'bg-red-500 border-red-400 text-white cursor-pointer shadow-sm shadow-red-200', icon: '✗', label: 'Occupied' },
    visitor: { card: 'bg-blue-500 border-blue-400 text-white cursor-not-allowed shadow-sm shadow-blue-200', icon: '🅿', label: 'Visitor' },
};

// ── Urgency thresholds (ms) ───────────────────────────────────────────────────
const URGENCY_SAFE     =  5 * 60 * 1000;
const URGENCY_WARN     =  2 * 60 * 1000;
const URGENCY_CRIT     =  0;
const EXTEND_WINDOW    = 10 * 60 * 1000;
const EXTEND_GRACE     = -3 * 60 * 1000;
const EXIT_BUFFER_MS   = 10 * 60 * 1000;

const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const fmtMs = (ms) => {
    const abs = Math.abs(ms);
    const m = Math.floor(abs / 60000);
    const s = Math.floor((abs % 60000) / 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const fieldCls = (err) => `w-full pl-9 pr-3 py-2.5 bg-white border ${err ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-indigo-100'} rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:border-indigo-400 transition-all duration-200 placeholder:text-slate-300 placeholder:font-medium`;

// ── Countdown hook ────────────────────────────────────────────────────────────
const useCountdown = (target) => {
    const [ms, setMs] = useState(() => new Date(target) - Date.now());
    useEffect(() => {
        const id = setInterval(() => setMs(new Date(target) - Date.now()), 1000);
        return () => clearInterval(id);
    }, [target]);
    return ms;
};

const getUrgencyClass = (ms, isActive) => {
    if (!isActive) return '';
    if (ms > URGENCY_SAFE) return 'bg-emerald-50/40';
    if (ms > URGENCY_WARN) return 'bg-amber-50/50';
    if (ms > URGENCY_CRIT) return 'bg-red-50/50';
    return 'bg-slate-50/60';
};

// ── Grace Countdown Chip (for active/unverified bookings) ─────────────────────
const GraceChip = ({ ms, isExtended }) => {
    const abs = Math.abs(ms);
    const min = Math.floor(abs / 60000);
    const sec = Math.floor((abs % 60000) / 1000).toString().padStart(2, '0');
    const expired = ms <= 0;
    const color = isExtended
        ? (ms > 0 ? 'text-purple-700 bg-purple-50 border-purple-200' : 'text-red-600 bg-red-50 border-red-200 animate-pulse')
        : expired
            ? 'text-red-500 bg-red-50 border-red-200 animate-pulse'
            : ms > URGENCY_SAFE ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : ms > URGENCY_WARN ? 'text-amber-600 bg-amber-50 border-amber-200'
            : 'text-red-600 bg-red-50 border-red-200 animate-pulse';
    return (
        <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold border px-2 py-0.5 rounded-full ${color}`}>
            <FaClock className="text-[8px]" />
            {expired ? `Grace exp ${min}m ago` : `Verify: ${min}:${sec}`}
        </span>
    );
};

// ── Parking Countdown Chip (for occupied bookings) ────────────────────────────
const ParkingChip = ({ ms, endTime }) => {
    const EXIT_MS = EXIT_BUFFER_MS;
    if (ms > 0) {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
        const color = ms > URGENCY_SAFE ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : ms > URGENCY_WARN ? 'text-amber-600 bg-amber-50 border-amber-200'
            : 'text-red-600 bg-red-50 border-red-200 animate-pulse';
        return (
            <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold border px-2 py-0.5 rounded-full ${color}`}>
                <FaClock className="text-[8px]" /> Until {fmtTime(endTime)}: {min}:{sec}
            </span>
        );
    }
    if (ms > -EXIT_MS) {
        const abs = Math.abs(ms);
        const min = Math.floor(abs / 60000);
        const sec = Math.floor((abs % 60000) / 1000).toString().padStart(2, '0');
        return (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold border px-2 py-0.5 rounded-full text-orange-600 bg-orange-50 border-orange-200 animate-pulse">
                <FaExclamationTriangle className="text-[8px]" /> Exit buf: {min}:{sec}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold border px-2 py-0.5 rounded-full text-red-600 bg-red-50 border-red-200 animate-pulse">
            <FaExclamationTriangle className="text-[8px]" /> Overstay
        </span>
    );
};

// ── Toast system ──────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onDismiss }) => (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(t => (
            <div
                key={t.id}
                className={`flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold pointer-events-auto
                    transition-all duration-300 animate-[slideIn_0.3s_ease-out]
                    ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                        : t.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500'
                            : t.type === 'info' ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                style={{ backdropFilter: 'blur(10px)', minWidth: '240px' }}
            >
                <span className="text-base">
                    {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : t.type === 'info' ? '🔄' : '⚠️'}
                </span>
                <span className="flex-1">{t.message}</span>
                <button onClick={() => onDismiss(t.id)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                    <FaTimes className="text-xs" />
                </button>
            </div>
        ))}
    </div>
);

// ── Too Early Chip ────────────────────────────────────────────────────────────
const TooEarlyChip = ({ msUntil }) => {
    const abs = Math.abs(msUntil);
    const min = Math.floor(abs / 60000);
    const sec = Math.floor((abs % 60000) / 1000).toString().padStart(2, '0');
    return (
        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold border px-2 py-0.5 rounded-full text-slate-500 bg-slate-50 border-slate-200">
            <FaClock className="text-[8px]" /> Early in {min}:{sec}
        </span>
    );
};

// ── Animated count-up number ──────────────────────────────────────────────────
const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(0);
    const prev = useRef(0);
    useEffect(() => {
        const target = Number(value);
        const start = prev.current;
        const diff = target - start;
        if (diff === 0) return;
        let frame = 0;
        const step = () => {
            frame++;
            const ease = 1 - Math.pow(1 - frame / 20, 3);
            setDisplay(Math.round(start + diff * ease));
            if (frame < 20) requestAnimationFrame(step);
            else { setDisplay(target); prev.current = target; }
        };
        requestAnimationFrame(step);
    }, [value]);
    return <span>{display}</span>;
};

// ── Status Badge (urgency-aware) ──────────────────────────────────────────────
const StatusBadge = ({ booking, timeLeft, isOcc, msParking, tooEarly }) => {
    if (isOcc) {
        if (msParking > 0) return (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-blue-100">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Occupied
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-red-100 animate-pulse">
                <FaExclamationTriangle className="text-[9px]" /> Overstay
            </span>
        );
    }
    const isActive = booking.status === 'active';
    if (!isActive) return null;
    if (tooEarly) return (
        <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <FaClock className="text-[9px]" /> Too Early
        </span>
    );
    if (booking.isExtended) return (
        <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-purple-100">
            <FaClock className="text-[9px]" /> Extended
        </span>
    );
    if (timeLeft > URGENCY_SAFE) return (
        <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-sky-100">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" /> Early Entry Allowed
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm shadow-amber-100 animate-pulse">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Grace Ending Soon
        </span>
    );
};

// ── Manual Badge ──────────────────────────────────────────────────────────────
const ManualBadge = () => (
    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        <FaEdit className="text-[8px]" /> Manual
    </span>
);

// ── Extended Badge (Guard) ────────────────────────────────────────────────────
const ExtendedBadge = () => (
    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        <FaClock className="text-[8px]" /> Extended
    </span>
);

// ── Student Extended Badge ────────────────────────────────────────────────────
const StudentExtendedBadge = () => (
    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 border border-indigo-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        <FaClock className="text-[8px]" /> Time Added
    </span>
);

// ── Ripple Button ─────────────────────────────────────────────────────────────
const RippleButton = ({ onClick, className, children, disabled }) => {
    const ref = useRef(null);
    const handleClick = (e) => {
        if (disabled) return;
        const btn = ref.current;
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        const rect = btn.getBoundingClientRect();
        circle.style.cssText = `
            width:${diameter}px;height:${diameter}px;
            left:${e.clientX - rect.left - radius}px;
            top:${e.clientY - rect.top - radius}px;
            position:absolute;border-radius:50%;
            background:rgba(255,255,255,0.35);
            transform:scale(0);animation:ripple 0.55s linear;
            pointer-events:none;
        `;
        setTimeout(() => circle.remove(), 700);
        btn.appendChild(circle);
        if (onClick) onClick(e);
    };
    return (
        <button ref={ref} onClick={handleClick} disabled={disabled}
            className={`relative overflow-hidden select-none ${className}`}>
            {children}
        </button>
    );
};

// ── Booking Row ──────────────────────────────────────────────────────────────
const BookingRow = ({ booking, idx, verifyingId, extendingId, onVerify, onExit, onExtend }) => {
    const isActive  = booking.status === 'active';
    const isOcc     = booking.status === 'occupied';

    // For active: countdown grace deadline. For occupied: countdown endTime.
    const graceTarget = booking.graceDeadline || (booking.startTime 
        ? new Date(new Date(booking.startTime).getTime() + 10 * 60 * 1000).toISOString()
        : new Date().toISOString());
    const msGrace    = useCountdown(graceTarget);
    const msParking  = useCountdown(booking.endTime);
    const timeLeft   = isOcc ? msParking : msGrace;

    // Early arrival: allow entry only from (startTime - 15 min)
    const EARLY_WINDOW = 15 * 60 * 1000;
    const msUntilEarlyWindow = useCountdown(
        new Date(new Date(booking.startTime).getTime() - EARLY_WINDOW).toISOString()
    );
    // tooEarly = before the 15-min early window AND before startTime
    const tooEarly = isActive && msUntilEarlyWindow > 0;

    const rowBg = isOcc ? '' : getUrgencyClass(msGrace, isActive);

    // Show extend button: only for active, not extended, within grace window
    const showExtend = isActive && !booking.isExtended && msGrace < EXTEND_WINDOW && msGrace > EXTEND_GRACE;

    const ownerName    = booking.isManual ? (booking.manualOwnerName || 'Unknown') : (booking.user?.name || '—');
    const userTypeLabel = booking.isManual ? (booking.manualUserType || 'Visitor') : (booking.user?.userType || 'user');

    return (
        <div
            className={`booking-row grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1.4fr_1.4fr] gap-3 md:gap-4 px-5 py-4
                transition-colors duration-500 items-center border-b border-slate-50 last:border-0 ${rowBg}
                ${isOcc ? 'hover:bg-blue-50/30' : ''}`}
            style={{ animationDelay: `${idx * 30}ms` }}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm
                    ${booking.isManual ? 'bg-gradient-to-br from-purple-400 to-fuchsia-500' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>
                    {ownerName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="font-bold text-slate-800 text-sm leading-tight truncate">{ownerName}</div>
                        {booking.isManual && <ManualBadge />}
                        {booking.isExtended && <ExtendedBadge />}
                        {booking.isStudentExtended && <StudentExtendedBadge />}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize font-medium">{userTypeLabel}</div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex-shrink-0 shadow-sm">
                    <VehicleIcon type={booking.vehicleType} />
                </div>
                <div>
                    <div className="font-black text-slate-800 text-sm tracking-wider uppercase leading-tight">{booking.vehicleNumber}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{booking.vehicleType || 'Car'}</div>
                </div>
            </div>

            <div>
                <span className="inline-block bg-gradient-to-r from-slate-700 to-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    {booking.slot?.slotNumber || '—'}
                </span>
            </div>

            <div>
                <span className="inline-block bg-gradient-to-br from-indigo-50 to-blue-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">
                    {booking.slot?.zoneName || '—'}
                </span>
            </div>

            <div className="text-xs text-slate-500 font-medium">
                <div className="text-[10px] text-slate-400">{new Date(booking.startTime).toLocaleDateString([], { day: 'numeric', month: 'short' })}</div>
                <div className="font-bold text-slate-700">
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span className="text-slate-400 font-normal"> → </span>
                    {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {isActive && tooEarly && <TooEarlyChip msUntil={msUntilEarlyWindow} />}
                {isActive && !tooEarly && <GraceChip ms={msGrace} isExtended={booking.isExtended} />}
                {isOcc && <ParkingChip ms={msParking} endTime={booking.endTime} />}
            </div>

            <div className="flex flex-col gap-1.5">
                <StatusBadge booking={booking} timeLeft={timeLeft} isOcc={isOcc} msParking={msParking} tooEarly={tooEarly} />

                {isOcc ? (
                    <RippleButton
                        onClick={() => onExit(booking._id, booking.vehicleNumber)}
                        disabled={verifyingId === booking._id}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                        {verifyingId === booking._id ? <FaSyncAlt className="animate-spin" /> : <FaSignOutAlt />}
                        Mark Exit
                    </RippleButton>
                ) : (
                    <>
                        <RippleButton
                            onClick={() => onVerify(booking._id, booking.vehicleNumber)}
                            disabled={verifyingId === booking._id || tooEarly}
                            title={tooEarly ? `Entry opens at ${fmtTime(new Date(new Date(booking.startTime).getTime() - 15 * 60 * 1000))}` : ''}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-sm
                                ${tooEarly
                                    ? 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white'
                                }`}
                        >
                            {verifyingId === booking._id ? <FaSyncAlt className="animate-spin" /> : <FaCheckCircle />}
                            {tooEarly ? 'Too Early' : 'Confirm Vehicle'}
                        </RippleButton>

                        {showExtend && (
                            <RippleButton
                                onClick={() => onExtend(booking._id, booking.vehicleNumber)}
                                disabled={extendingId === booking._id}
                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 shadow-sm
                                    ${msGrace > URGENCY_WARN
                                        ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                                        : 'bg-orange-50 text-orange-700 border border-orange-300 hover:bg-orange-500 hover:text-white hover:border-orange-500 animate-pulse'
                                    }`}
                            >
                                {extendingId === booking._id
                                    ? <FaSyncAlt className="animate-spin" />
                                    : <FaClock className="text-[10px]" />
                                }
                                Extend 5 Min
                            </RippleButton>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ── Manual Entry Panel ────────────────────────────────────────────────────────
const ManualEntryPanel = ({ open, onClose, onSuccess, addToast }) => {
    const [form, setForm] = useState({
        ownerName: '', vehicleNumber: '', userType: 'Student', zoneId: '', slotId: '', remarks: ''
    });
    const [zoneSlots, setZoneSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setForm({ ownerName: '', vehicleNumber: '', userType: 'Student', zoneId: '', slotId: '', remarks: '' });
                setZoneSlots([]); setErrors({});
            }, 300);
        }
    }, [open]);

    useEffect(() => {
        if (!form.zoneId) { setZoneSlots([]); return; }
        setLoadingSlots(true);
        setForm(f => ({ ...f, slotId: '' }));
        api.get(`/slots/zone/${form.zoneId}`)
            .then(({ data }) => {
                const free = data.filter(s => s.status === 'free').sort((a, b) => {
                    const nA = parseInt(a.slotNumber.split('-')[1]) || 0;
                    const nB = parseInt(b.slotNumber.split('-')[1]) || 0;
                    return nA - nB;
                });
                setZoneSlots(free);
            })
            .catch(() => setZoneSlots([]))
            .finally(() => setLoadingSlots(false));
    }, [form.zoneId]);

    const validate = () => {
        const e = {};
        if (!form.ownerName.trim()) e.ownerName = 'Required';
        if (!form.vehicleNumber.trim()) e.vehicleNumber = 'Required';
        if (!form.zoneId) e.zoneId = 'Select a zone';
        if (!form.slotId) e.slotId = 'Select a slot';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const { data } = await api.post('/bookings/manual', {
                ownerName: form.ownerName.trim(),
                vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
                userType: form.userType,
                slotId: form.slotId,
                remarks: form.remarks.trim() || undefined
            });
            addToast(`Slot ${data.slot?.slotNumber} assigned to ${form.ownerName}!`, 'success');
            onSuccess(data);
            onClose();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to assign slot', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const fieldCls = (err) =>
        `w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium text-slate-700 outline-none transition-all duration-200 bg-white
        ${err ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'}`;

    return (
        <>
            <div
                className={`fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                className={`fixed top-0 right-0 h-full z-[401] w-full sm:w-[420px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.12)' }}
            >
                <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl"><FaPlusCircle className="text-lg" /></div>
                            <div>
                                <h2 className="text-lg font-extrabold leading-tight">Manual Entry</h2>
                                <p className="text-indigo-200 text-xs font-medium">Guard-assigned parking slot</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200">
                            <FaTimes className="text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <form id="manual-entry-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Owner / Driver Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                <input type="text" placeholder="e.g. Ram Bahadur" value={form.ownerName}
                                    onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))}
                                    className={fieldCls(errors.ownerName)} />
                            </div>
                            {errors.ownerName && <p className="text-red-400 text-xs mt-1 font-medium">{errors.ownerName}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Vehicle Number <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <FaCarSide className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                <input type="text" placeholder="e.g. BA 1 JA 2345" value={form.vehicleNumber}
                                    onChange={e => setForm(f => ({ ...f, vehicleNumber: e.target.value.toUpperCase() }))}
                                    className={fieldCls(errors.vehicleNumber) + ' uppercase tracking-wider font-black'} />
                            </div>
                            {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1 font-medium">{errors.vehicleNumber}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">User Type</label>
                            <div className="relative">
                                <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                <select value={form.userType} onChange={e => setForm(f => ({ ...f, userType: e.target.value }))}
                                    className={fieldCls(false) + ' appearance-none cursor-pointer'}>
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Visitor">Visitor</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xs">▾</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Zone / Block <span className="text-red-400">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {ZONES.map(z => (
                                    <button key={z.id} type="button"
                                        onClick={() => setForm(f => ({ ...f, zoneId: z.id, slotId: '' }))}
                                        className={`relative py-2.5 px-2 rounded-xl border-2 text-xs font-bold transition-all duration-200 flex flex-col items-center gap-1
                                            ${form.zoneId === z.id
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                                                : 'border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                        <span className="text-base">{z.vehicleIcon}</span>
                                        <span className="leading-tight text-center">{z.name}</span>
                                        {form.zoneId === z.id && (
                                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <FaCheckCircle className="text-white text-[8px]" />
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {errors.zoneId && <p className="text-red-400 text-xs mt-1 font-medium">{errors.zoneId}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Available Slot <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                {loadingSlots ? (
                                    <div className="flex items-center gap-2 pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-400 bg-white">
                                        <FaSyncAlt className="animate-spin text-indigo-400" /> Loading slots…
                                    </div>
                                ) : (
                                    <select value={form.slotId}
                                        onChange={e => setForm(f => ({ ...f, slotId: e.target.value }))}
                                        disabled={!form.zoneId || zoneSlots.length === 0}
                                        className={fieldCls(errors.slotId) + ' appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}>
                                        <option value="">
                                            {!form.zoneId ? 'Select a zone first' : zoneSlots.length === 0 ? 'No free slots in this zone' : `Select slot (${zoneSlots.length} free)`}
                                        </option>
                                        {zoneSlots.map(s => (
                                            <option key={s._id} value={s._id}>{s.slotNumber} — {s.slotType}</option>
                                        ))}
                                    </select>
                                )}
                                {!loadingSlots && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-xs">▾</span>}
                            </div>
                            {errors.slotId && <p className="text-red-400 text-xs mt-1 font-medium">{errors.slotId}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                Remarks <span className="text-slate-300">(optional)</span>
                            </label>
                            <div className="relative">
                                <FaAlignLeft className="absolute left-3 top-3 text-slate-300 text-sm" />
                                <textarea rows={3} placeholder="Any additional notes…" value={form.remarks}
                                    onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none resize-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 bg-white" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex gap-3">
                    <button type="button" onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 hover:border-slate-300 transition-all duration-200">
                        Cancel
                    </button>
                    <RippleButton onClick={handleSubmit} disabled={submitting}
                        className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold text-sm
                            hover:from-indigo-700 hover:to-purple-800 hover:shadow-lg hover:shadow-indigo-200 hover:-translate-y-0.5
                            disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                            transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
                        {submitting ? <><FaSyncAlt className="animate-spin" /> Assigning…</> : <><FaCheckCircle /> Assign Slot</>}
                    </RippleButton>
                </div>
            </div>
        </>
    );
};

// ── Skeleton Row (loading placeholder) ───────────────────────────────────────
const SkeletonRow = () => (
    <div className="px-5 py-4 flex items-center gap-4 animate-pulse border-b border-slate-50">
        <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-100 rounded-full w-1/3" />
            <div className="h-2.5 bg-slate-100 rounded-full w-1/4" />
        </div>
        <div className="w-20 h-8 bg-slate-100 rounded-xl" />
        <div className="w-24 h-8 bg-slate-100 rounded-xl" />
    </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
const GuardDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [activeBookings, setActiveBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(true);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'bookings';
    const setActiveTab = (tab) => setSearchParams({ tab });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [verifyingId, setVerifyingId] = useState(null);
    const [extendingId, setExtendingId] = useState(null);
    const [manualPanelOpen, setManualPanelOpen] = useState(false);

    // Live Map
    const [activeZoneId, setActiveZoneId] = useState(null);
    const [zoneSlots, setZoneSlots] = useState([]);
    const [zoneLoading, setZoneLoading] = useState(false);
    const [selectedMapSlot, setSelectedMapSlot] = useState(null);
    const [slotDetail, setSlotDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [zoneStats, setZoneStats] = useState({});

    // Filter / sort
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('latest');

    // Toasts
    const [toasts, setToasts] = useState([]);
    const toastId = useRef(0);
    const addToast = useCallback((message, type = 'success') => {
        const id = ++toastId.current;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);
    const dismissToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

    // ── Fetch helpers ─────────────────────────────────────────────────────────
    const fetchLogs = async (silent = false) => {
        if (!silent) setLogsLoading(true);
        try { const { data } = await api.get('/logs'); setLogs(Array.isArray(data) ? data : []); } catch { setLogs([]); }
        finally { setLogsLoading(false); }
    };

    const fetchActiveBookings = async (silent = false) => {
        if (!silent) setBookingsLoading(true);
        try { const { data } = await api.get('/bookings/active'); setActiveBookings(Array.isArray(data) ? data : []); } catch { setActiveBookings([]); }
        finally { setBookingsLoading(false); }
    };

    const fetchZoneSlots = async (zoneId, silent = false) => {
        if (!silent) setZoneLoading(true);
        try {
            const { data } = await api.get(`/slots/zone/${zoneId}`);
            const slots = Array.isArray(data) ? data : [];
            setZoneSlots(slots.sort((a, b) => {
                const nA = parseInt(a.slotNumber?.split('-')[1]) || 0;
                const nB = parseInt(b.slotNumber?.split('-')[1]) || 0;
                return nA - nB;
            }));
        } catch { setZoneSlots([]); }
        finally { setZoneLoading(false); }
    };

    const loadZoneStats = useCallback(async () => {
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
    }, []);

    const fetchSlotDetail = async (slotId) => {
        setDetailLoading(true);
        try { const { data } = await api.get(`/slots/${slotId}/detail`); setSlotDetail(data); }
        catch { setSlotDetail(null); }
        finally { setDetailLoading(false); }
    };

    const fetchSlots = async () => {
        try {
            const { data } = await api.get('/slots');
            setAvailableSlots(data.filter(s => s.status === 'free' || s.status === 'reserved'));
        } catch { /**/ }
    };

    useEffect(() => {
        fetchLogs(); fetchSlots(); fetchActiveBookings(); loadZoneStats();
        const interval = setInterval(() => {
            fetchLogs(true); fetchActiveBookings(true); loadZoneStats();
            setLastRefresh(new Date());
        }, 10000);
        return () => clearInterval(interval);
    }, [loadZoneStats]);

    useEffect(() => {
        if (activeTab !== 'slots' || !activeZoneId) return;
        fetchZoneSlots(activeZoneId, true);
        const id = setInterval(() => fetchZoneSlots(activeZoneId, true), 10000);
        return () => clearInterval(id);
    }, [activeTab, activeZoneId]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([fetchLogs(true), fetchActiveBookings(true)]);
        setLastRefresh(new Date());
        setIsRefreshing(false);
        addToast('Data refreshed', 'info');
    };

    const handleVerifyBooking = async (id, vehicleNum) => {
        setVerifyingId(id);
        try {
            await api.put(`/bookings/${id}/verify`);
            fetchActiveBookings(true);
            addToast(`Vehicle ${vehicleNum} verified & occupied!`, 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Verification Failed', 'error');
        } finally { setVerifyingId(null); }
    };

    const handleMarkExit = async (id, vehicleNum) => {
        if (!window.confirm(`Mark exit for vehicle ${vehicleNum}? This will release the slot.`)) return;
        setVerifyingId(id);
        try {
            const { data } = await api.put(`/bookings/${id}/exit`);
            fetchActiveBookings(true); loadZoneStats();
            if (activeZoneId) fetchZoneSlots(activeZoneId, true);
            addToast(data?.message || `Vehicle exited successfully. Slot released for other users.`, 'success');
        } catch (error) {
            addToast(error.response?.data?.message || 'Exit Failed', 'error');
        } finally { setVerifyingId(null); }
    };

    const handleExtendBooking = async (id, vehicleNum) => {
        setExtendingId(id);
        try {
            const { data } = await api.put(`/bookings/${id}/extend`);
            // Optimistic update — patch graceDeadline (NOT endTime) in state
            setActiveBookings(prev => prev.map(b => b._id === id
                ? { ...b, graceDeadline: data.graceDeadline, isExtended: true, extendedAt: data.extendedAt }
                : b));
            addToast(`+5 min grace granted for ${vehicleNum}`, 'warning');
        } catch (error) {
            addToast(error.response?.data?.message || 'Extend Failed', 'error');
        } finally { setExtendingId(null); }
    };

    const handleLogExit = async (logId, vehicleNum) => {
        if (!window.confirm('Confirm Vehicle Exit?')) return;
        try {
            await api.put(`/logs/exit/${logId}`);
            fetchLogs(true); fetchSlots();
            addToast(`${vehicleNum} exited — slot released`, 'success');
        } catch { addToast('Exit Failed', 'error'); }
    };

    const handleManualSuccess = (newBooking) => {
        setActiveBookings(prev => [newBooking, ...prev]);
        fetchLogs(true); loadZoneStats();
        if (activeZoneId) fetchZoneSlots(activeZoneId, true);
        setActiveTab('bookings');
    };

    // ── Derived data ──────────────────────────────────────────────────────────
    const now = new Date();
    const occupiedCount  = activeBookings.filter(b => b.status === 'occupied').length;
    // awaiting = active bookings whose grace deadline hasn't passed
    const awaitingCount  = activeBookings.filter(b => {
        if (b.status !== 'active') return false;
        const start = b.startTime ? new Date(b.startTime).getTime() : now.getTime();
        const grace = b.graceDeadline ? new Date(b.graceDeadline) : new Date(start + 10 * 60 * 1000);
        return grace >= now;
    }).length;

    const filteredBookings = activeBookings
        .filter(b => {
            const ownerName = b.isManual ? (b.manualOwnerName || '') : (b.user?.name || '');
            const q = search.toLowerCase();
            const matchSearch = !q ||
                b.vehicleNumber?.toLowerCase().includes(q) ||
                ownerName.toLowerCase().includes(q) ||
                b.slot?.slotNumber?.toLowerCase().includes(q);
            const isExpired = (() => {
                const start = b.startTime ? new Date(b.startTime).getTime() : now.getTime();
                const grace = b.graceDeadline ? new Date(b.graceDeadline) : new Date(start + 10 * 60 * 1000);
                return grace < now;
            })();
            const matchFilter =
                statusFilter === 'All' ||
                (statusFilter === 'Occupied' && b.status === 'occupied') ||
                (statusFilter === 'Awaiting' && b.status === 'active' && !isExpired) ||
                (statusFilter === 'Extended' && b.isExtended) ||
                (statusFilter === 'Expired' && b.status === 'active' && isExpired);
            return matchSearch && matchFilter;
        })
        .sort((a, b) =>
            sortOrder === 'latest'
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );

    const statCards = [
        {
            label: 'Active Bookings', value: activeBookings.length,
            icon: <FaClipboardList />,
            gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50',
            iconBg: 'bg-blue-100 text-blue-600', border: 'border-blue-100'
        },
        {
            label: 'Occupied', value: occupiedCount,
            icon: <FaCheckCircle />,
            gradient: 'from-blue-500 to-indigo-600', bg: 'from-blue-50 to-indigo-50',
            iconBg: 'bg-blue-100 text-blue-600', border: 'border-blue-100'
        },
        {
            label: 'Awaiting Arrival', value: awaitingCount,
            icon: <FaClock />,
            gradient: 'from-amber-400 to-orange-500', bg: 'from-amber-50 to-orange-50',
            iconBg: 'bg-amber-100 text-amber-600', border: 'border-amber-100'
        },
    ];

    return (
        <>
            <style>{`
                @keyframes ripple { to { transform: scale(4); opacity: 0; } }
                @keyframes slideIn { from { transform: translateX(110%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                @keyframes fadeInRow { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .booking-row { animation: fadeInRow 0.25s ease-out; }
            `}</style>

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            <ManualEntryPanel open={manualPanelOpen} onClose={() => setManualPanelOpen(false)} onSuccess={handleManualSuccess} addToast={addToast} />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 pt-4 md:pt-5 lg:pt-6 pb-14 px-4 md:px-6 lg:px-8">
                <div className="max-w-full mx-auto px-4 md:px-10">

                    {/* ── Header ───────────────────────────────────────────── */}
                    <div className="backdrop-blur-sm bg-white/70 border border-white/80 rounded-2xl px-5 py-4 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-0.5">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                                    <FaShieldAlt className="text-white text-base" />
                                </div>
                                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Guard Station</h1>
                            </div>
                            <div className="flex items-center gap-2 ml-11">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <p className="text-xs text-slate-400 font-medium animate-pulse">
                                    Live · Auto-refreshes every 10s · Last: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <RippleButton
                                onClick={() => setManualPanelOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl font-semibold text-sm
                                    hover:from-indigo-700 hover:to-purple-800 hover:scale-[1.03] hover:shadow-lg hover:shadow-indigo-200
                                    transition-all duration-200 shadow-md shadow-indigo-200 whitespace-nowrap"
                            >
                                <FaPlusCircle className="text-sm" /> Manual Entry
                            </RippleButton>
                            <RippleButton
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 hover:scale-[1.03] hover:shadow-md transition-all duration-200 text-sm shadow-sm disabled:opacity-60"
                            >
                                <FaSyncAlt className={isRefreshing ? 'animate-spin' : ''} />
                                {isRefreshing ? 'Refreshing…' : 'Refresh'}
                            </RippleButton>
                        </div>
                    </div>

                    {/* ── Stat Cards ───────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                        {statCards.map((card, i) => (
                            <div key={i} onClick={() => setActiveTab('bookings')}
                                className={`bg-gradient-to-br ${card.bg} border ${card.border} rounded-xl p-3 flex items-center gap-3
                                    hover:shadow-lg hover:scale-[1.03] active:scale-95 cursor-pointer transition-all duration-300 group`}>
                                <div className={`p-2 rounded-lg ${card.iconBg} text-base shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <div className="text-xl font-extrabold text-slate-800 tabular-nums">
                                        <AnimatedNumber value={card.value} />
                                    </div>
                                    <div className="text-xs text-slate-500 font-semibold mt-0.5">{card.label}</div>
                                </div>
                                <div className={`ml-auto w-1 h-7 rounded-full bg-gradient-to-b ${card.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-300`} />
                            </div>
                        ))}
                    </div>

                    {/* ── Tab Switcher ─────────────────────────────────────── */}
                    <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl mb-5 w-fit backdrop-blur-sm">
                        {[
                            { id: 'bookings', label: 'Active Bookings', icon: <FaClipboardList /> },
                            { id: 'slots',    label: 'Live Map',        icon: <FaMapMarkerAlt /> },
                            { id: 'logs',     label: 'Entry / Exit Log',icon: <FaHistory /> },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
                                    ${activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}>
                                {tab.icon} {tab.label}
                                {tab.id === 'bookings' && activeBookings.length > 0 && (
                                    <span className="ml-0.5 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {activeBookings.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ══ ACTIVE BOOKINGS PANEL ══════════════════════════════ */}
                    {activeTab === 'bookings' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">

                            {/* Toolbar */}
                            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 min-w-[180px] max-w-xs shadow-sm hover:border-blue-300 transition-colors">
                                    <FaSearch className="text-slate-300 text-sm flex-shrink-0" />
                                    <input type="text" placeholder="Search vehicle / name…" value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="flex-1 text-xs outline-none text-slate-700 placeholder:text-slate-300 bg-transparent" />
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                    {['All', 'Occupied', 'Awaiting', 'Extended', 'Expired'].map(f => (
                                        <button key={f} onClick={() => setStatusFilter(f)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                                                ${statusFilter === f
                                                    ? f === 'Occupied' ? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
                                                        : f === 'Expired' ? 'bg-red-500 text-white shadow-sm shadow-red-200'
                                                            : f === 'Awaiting' ? 'bg-amber-400 text-white shadow-sm shadow-amber-200'
                                                                : f === 'Extended' ? 'bg-purple-500 text-white shadow-sm shadow-purple-200'
                                                                    : 'bg-slate-800 text-white shadow-sm'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setSortOrder(s => s === 'latest' ? 'oldest' : 'latest')}
                                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:border-slate-300 transition-all">
                                    <FaSortAmountDown className={`transition-transform duration-200 ${sortOrder === 'oldest' ? 'rotate-180' : ''}`} />
                                    {sortOrder === 'latest' ? 'Newest' : 'Oldest'}
                                </button>
                            </div>

                            {/* Legend for row colors */}
                            <div className="px-5 py-2 bg-slate-50/40 border-b border-slate-100 flex items-center gap-4 flex-wrap text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200 flex-shrink-0" /> &gt;5 min</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200 flex-shrink-0" /> 2–5 min</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200 flex-shrink-0" /> &lt;2 min</span>
                                <span className="flex items-center gap-1.5"><FaClock className="text-purple-400 text-[9px]" /> Extended</span>
                            </div>

                            {/* Column headers */}
                            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1.4fr_1.4fr] gap-4 px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><FaUser className="text-[9px]" /> Owner / Student</span>
                                <span className="flex items-center gap-1.5"><FaCar className="text-[9px]" /> Vehicle</span>
                                <span className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-[9px]" /> Slot</span>
                                <span>Zone</span>
                                <span className="flex items-center gap-1.5"><FaClock className="text-[9px]" /> Time / Countdown</span>
                                <span>Status & Actions</span>
                            </div>

                            {/* Rows */}
                            <div>
                                {bookingsLoading ? (
                                    [1, 2, 3].map(i => <SkeletonRow key={i} />)
                                ) : filteredBookings.length === 0 ? (
                                    <div className="py-16 text-center flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                                            <FaClipboardList className="text-3xl text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-semibold text-sm">
                                            {search || statusFilter !== 'All' ? 'No bookings match your filter.' : 'No active bookings yet.'}
                                        </p>
                                        <p className="text-xs text-slate-300">Bookings will appear here in real-time as students reserve slots.</p>
                                    </div>
                                ) : (
                                    filteredBookings.map((booking, idx) => (
                                        <BookingRow
                                            key={booking._id}
                                            booking={booking}
                                            idx={idx}
                                            verifyingId={verifyingId}
                                            extendingId={extendingId}
                                            onVerify={handleVerifyBooking}
                                            onExit={handleMarkExit}
                                            onExtend={handleExtendBooking}
                                        />
                                    ))
                                )}
                            </div>

                            {!bookingsLoading && filteredBookings.length > 0 && (
                                <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                                    Showing {filteredBookings.length} of {activeBookings.length} active booking{activeBookings.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ LIVE MAP PANEL ════════════════════════════════════ */}
                    {activeTab === 'slots' && (
                        <div className="space-y-6">
                            {!activeZoneId ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {ZONES.map((zone) => {
                                        const stats = zoneStats[zone.id] || { total: 0, free: 0, reserved: 0, occupied: 0 };
                                        const pct = stats.total > 0 ? Math.round((stats.free / stats.total) * 100) : 0;
                                        return (
                                            <div key={zone.id} onClick={() => setActiveZoneId(zone.id)}
                                                className="group bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                                                <div className={`bg-gradient-to-br ${zone.color.bg} p-6 relative overflow-hidden`}>
                                                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                                                    <div className="relative z-10">
                                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white mb-3">
                                                            {zone.vehicleIcon}{zone.type}
                                                        </span>
                                                        <h2 className="text-2xl font-extrabold text-white">{zone.name}</h2>
                                                        <p className="text-white/70 text-sm font-medium">{zone.label}</p>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <div className="flex gap-2 mb-4">
                                                        <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
                                                            <p className="text-xl font-extrabold text-emerald-600">{stats.free}</p>
                                                            <p className="text-xs font-semibold text-emerald-500">Free</p>
                                                        </div>
                                                        <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                                                            <p className="text-xl font-extrabold text-amber-500">{stats.reserved || 0}</p>
                                                            <p className="text-xs font-semibold text-amber-400">Reserved</p>
                                                        </div>
                                                        <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                                                            <p className="text-xl font-extrabold text-red-500">{stats.occupied}</p>
                                                            <p className="text-xs font-semibold text-red-400">Occupied</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-700 ${zone.color.bar}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <button className="mt-4 w-full py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-50 border border-slate-200 text-center">View Grid →</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                                    <div className={`bg-gradient-to-r ${ZONES.find(z => z.id === activeZoneId)?.color.bg} px-6 py-5 flex items-center justify-between`}>
                                        <div className="text-white flex items-center gap-4">
                                            <button onClick={() => setActiveZoneId(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors mr-2">
                                                <FaTimes className="rotate-45" />
                                            </button>
                                            <div>
                                                <h3 className="text-xl font-extrabold">{ZONES.find(z => z.id === activeZoneId)?.name}</h3>
                                                <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{ZONES.find(z => z.id === activeZoneId)?.type} · Real-time</p>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-4 bg-white/20 rounded-2xl px-5 py-2.5">
                                            {[['Free', zoneSlots.filter(s => getSlotStatus(s) === 'free').length, 'text-emerald-300'],
                                            ['Active', zoneSlots.filter(s => getSlotStatus(s) !== 'free').length, 'text-red-300']].map(([l, v, c]) => (
                                                <div key={l} className="text-center">
                                                    <p className="text-xl font-black text-white leading-tight">{v}</p>
                                                    <p className={`text-[10px] font-bold uppercase tracking-wider ${c}`}>{l}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-100 flex flex-wrap gap-4 items-center">
                                        <div className="flex items-center gap-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Free</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Reserved</span>
                                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Occupied</span>
                                        </div>
                                        <p className="ml-auto text-[10px] text-slate-400 font-bold italic animate-pulse">Click slot to view occupant detail</p>
                                    </div>
                                    <div className="p-8">
                                        {zoneLoading ? (
                                            <div className="py-20 flex flex-col items-center gap-4">
                                                <FaSyncAlt className="text-4xl text-blue-200 animate-spin" />
                                                <p className="text-slate-400 font-bold text-sm">Syncing Lot...</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                                {zoneSlots.map(slot => {
                                                    const status = getSlotStatus(slot);
                                                    const style = SLOT_STYLE[status];
                                                    const num = slot.slotNumber.split('-')[1] || slot.slotNumber;
                                                    return (
                                                        <div key={slot._id}
                                                            onClick={() => {
                                                                if (status !== 'free' && status !== 'visitor') {
                                                                    setSelectedMapSlot(slot); fetchSlotDetail(slot._id);
                                                                }
                                                            }}
                                                            className={`aspect-square flex flex-col items-center justify-center rounded-xl border-2 text-[11px] font-black transition-all duration-200 cursor-pointer group relative
                                                                ${style.card} ${selectedMapSlot?._id === slot._id ? 'ring-4 ring-blue-400 ring-offset-2 scale-110 z-10' : ''}`}>
                                                            <span className="opacity-50 text-[9px] group-hover:scale-125 transition-transform">{style.icon}</span>
                                                            <span className="text-sm">{num}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ ENTRY/EXIT LOG PANEL ═══════════════════════════════ */}
                    {activeTab === 'logs' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
                            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                                <FaHistory className="text-slate-400 text-sm" />
                                <span className="font-extrabold text-slate-700 uppercase tracking-widest text-xs">Recent Activity Log</span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {logsLoading ? (
                                    [1, 2].map(i => (
                                        <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-100 rounded w-1/3" />
                                                <div className="h-3 bg-slate-100 rounded w-1/4" />
                                            </div>
                                            <div className="w-28 h-9 bg-slate-100 rounded-xl" />
                                        </div>
                                    ))
                                ) : logs.length === 0 ? (
                                    <div className="py-16 text-center flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                                            <FaHistory className="text-3xl text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-semibold text-sm">No recent vehicle logs found.</p>
                                    </div>
                                ) : (
                                    logs.map(log => (
                                        <div key={log._id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-slate-50/50 transition-colors duration-150 gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-3.5 rounded-2xl shadow-sm ${log.status === 'parked' ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400 opacity-60'}`}>
                                                    <FaCar className="text-xl" />
                                                </div>
                                                <div className="space-y-1.5 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-black text-xl text-slate-800 tracking-tight uppercase leading-tight">{log.vehicleNumber}</h3>
                                                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                            {log.booking?.vehicleType || 'Vehicle'}
                                                        </span>
                                                        {log.booking?.isManual ? (
                                                            <>
                                                                <ManualBadge />
                                                                {log.booking?.manualOwnerName && (
                                                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                                                        👤 {log.booking.manualOwnerName}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            log.booking?.user && (
                                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                                                    👤 {log.booking.user.name}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slot</span>
                                                            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{log.slot?.slotNumber || '—'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry</span>
                                                            <span className="text-xs font-bold text-slate-600">{new Date(log.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        {log.exitTime && (
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exit</span>
                                                                <span className="text-xs font-bold text-slate-600">{new Date(log.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guard</span>
                                                            <span className="text-xs font-medium text-slate-500 italic">{log.guard?.name || 'System'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-auto flex flex-col items-end gap-2">
                                                {log.status === 'parked' ? (
                                                    <RippleButton
                                                        onClick={() => handleLogExit(log._id, log.vehicleNumber)}
                                                        className="w-full md:w-auto bg-red-50 text-red-500 border-2 border-red-200 px-6 py-2.5 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-lg hover:shadow-red-200 hover:-translate-y-0.5 transition-all duration-200 font-black flex items-center justify-center gap-2 text-sm shadow-sm"
                                                    >
                                                        <FaSignOutAlt /> Release Slot
                                                    </RippleButton>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 font-black px-4 py-2 rounded-xl text-xs border border-emerald-100 shadow-sm">
                                                            <FaCheckCircle /> Stay Completed
                                                        </span>
                                                        {log.exitTime && (
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                Duration: {Math.round((new Date(log.exitTime) - new Date(log.entryTime)) / (1000 * 60))} mins
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ── Slot Detail Modal ── */}
            {selectedMapSlot && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => { setSelectedMapSlot(null); setSlotDetail(null); }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100"
                        onClick={e => e.stopPropagation()}>
                        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Slot Occupant Info</p>
                                <h4 className="text-xl font-black">Slot {selectedMapSlot.slotNumber}</h4>
                            </div>
                            <button onClick={() => { setSelectedMapSlot(null); setSlotDetail(null); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="p-6">
                            {detailLoading ? (
                                <div className="flex flex-col items-center py-8 gap-3">
                                    <FaSyncAlt className="text-3xl text-blue-500 animate-spin" />
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading Records…</p>
                                </div>
                            ) : slotDetail ? (
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
                                            <FaCar />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plate Number</p>
                                            <p className="text-xl font-black text-slate-800 tracking-tight">{slotDetail.vehicleNumber}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Owner</p>
                                            <p className="text-sm font-black text-slate-700 truncate">{slotDetail.user?.name || slotDetail.manualOwnerName || '—'}</p>
                                        </div>
                                        <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                                            <p className="text-sm font-black text-slate-700">{slotDetail.vehicleType || 'Car'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold px-2">
                                            <span className="text-slate-400">Status</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${slotDetail.status === 'occupied' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {slotDetail.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold px-2">
                                            <span className="text-slate-400">Expires At</span>
                                            <span className="text-slate-700">{slotDetail.endTime ? new Date(slotDetail.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <RippleButton onClick={() => { setSelectedMapSlot(null); setSlotDetail(null); }}
                                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all">
                                            Close
                                        </RippleButton>
                                        {slotDetail.status === 'occupied' && (
                                            <RippleButton
                                                onClick={() => {
                                                    const bookingId = activeBookings.find(b => b.slot?._id === selectedMapSlot._id && b.status === 'occupied')?._id;
                                                    if (bookingId) { handleMarkExit(bookingId, slotDetail.vehicleNumber); setSelectedMapSlot(null); setSlotDetail(null); }
                                                    else addToast('Booking reference not found', 'error');
                                                }}
                                                className="flex-[1.5] py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg">
                                                Release Slot
                                            </RippleButton>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-slate-400 font-bold text-sm">No active record found for this slot.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const GuardDashboardWithBoundary = () => (
    <ErrorBoundary>
        <GuardDashboard />
    </ErrorBoundary>
);

export default GuardDashboardWithBoundary;
