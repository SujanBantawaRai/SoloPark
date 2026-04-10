import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
    FaUsers, FaCar, FaClock, FaPlus, FaTrash, FaChartLine,
    FaUserShield, FaUserMinus, FaSync, FaCheckCircle, FaTimesCircle,
    FaTimes, FaHistory, FaExclamationTriangle, FaLock,
    FaCalendarDay, FaBolt, FaHourglass, FaMapMarkerAlt, FaChartBar, FaFire
} from 'react-icons/fa';

// ── Analytics Components ───────────────────────────────────────────────────
import StatCard             from '../components/dashboard/StatCard';
import OccupancyChart       from '../components/dashboard/OccupancyChart';
import SlotStatusDonut      from '../components/dashboard/SlotStatusDonut';
import BookingTrendChart    from '../components/dashboard/BookingTrendChart';
import EntryExitChart       from '../components/dashboard/EntryExitChart';
import UserDistributionChart from '../components/dashboard/UserDistributionChart';
import ActivityFeed         from '../components/dashboard/ActivityFeed';
import LiveVehiclesTable    from '../components/dashboard/LiveVehiclesTable';
import PendingRequestsPanel from '../components/dashboard/PendingRequestsPanel';
import PeakHoursChart       from '../components/dashboard/PeakHoursChart';
import TopSlotsPanel        from '../components/dashboard/TopSlotsPanel';

/* ─── Badge maps (unchanged colours) ──────────────────────────────────────── */
const ROLE_BADGE = {
    super_admin: 'bg-rose-50 text-rose-600 border-rose-200',
    admin: 'bg-purple-50 text-purple-600 border-purple-200',
    user: 'bg-slate-100 text-slate-600 border-slate-200'
};
const TYPE_BADGE = {
    student: 'bg-blue-50 text-blue-600 border-blue-200',
    teacher: 'bg-teal-50 text-teal-600 border-teal-200',
    guard: 'bg-orange-50 text-orange-600 border-orange-200',
    null: 'bg-gray-50 text-gray-400 border-gray-200'
};

/* ─── Toast helper component ───────────────────────────────────────────────── */
const Toast = ({ toasts }) => (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all pointer-events-auto
                    ${t.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                    ${t.type === 'error'   ? 'bg-red-50 text-red-700 border border-red-200'     : ''}
                    ${t.type === 'info'    ? 'bg-blue-50 text-blue-700 border border-blue-200'   : ''}`}>
                {t.type === 'success' && <FaCheckCircle className="text-green-500 flex-shrink-0" />}
                {t.type === 'error'   && <FaTimesCircle className="text-red-500 flex-shrink-0" />}
                {t.type === 'info'    && <FaExclamationTriangle className="text-blue-500 flex-shrink-0" />}
                {t.message}
            </div>
        ))}
    </div>
);

/* ─── Confirm Dialog ───────────────────────────────────────────────────────── */
const ConfirmDialog = ({ open, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-slate-200">
                <div className="flex items-start gap-3 mb-5">
                    <FaExclamationTriangle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                    <p className="text-slate-700 font-semibold text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Slot Detail Modal ────────────────────────────────────────────────────── */
const SlotDetailModal = ({ slot, onClose, onStatusUpdate, isSuperAdmin, addToast, addActivity }) => {
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [confirm, setConfirm] = useState(null);

    useEffect(() => {
        if (slot.status !== 'free') {
            setDetailLoading(true);
            api.get(`/slots/${slot._id}/detail`)
                .then(r => setDetail(r.data))
                .catch(() => setDetail(null))
                .finally(() => setDetailLoading(false));
        }
    }, [slot]);

    const formatDuration = (start, end) => {
        if (!start) return '—';
        const diff = ((end ? new Date(end) : new Date()) - new Date(start)) / 1000;
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const doAction = async (label, fn) => {
        setActionLoading(label);
        try {
            await fn();
            addToast('success', `${label} successful`);
            addActivity(`Slot ${slot.slotNumber} — ${label}`);
            onStatusUpdate();
            onClose();
        } catch (err) {
            addToast('error', err.response?.data?.message || `${label} failed`);
        } finally {
            setActionLoading(null);
        }
    };

    const askConfirm = (message, action) => setConfirm({ message, action });

    const StatusBadge = ({ status }) => (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
            ${status === 'free'     ? 'bg-green-50 text-green-600 border-green-200'   : ''}
            ${status === 'occupied' ? 'bg-red-50 text-red-600 border-red-200'         : ''}
            ${status === 'reserved' ? 'bg-yellow-50 text-yellow-600 border-yellow-200': ''}`}>
            {status}
        </span>
    );

    return (
        <>
            <ConfirmDialog
                open={!!confirm}
                message={confirm?.message}
                onConfirm={() => { confirm.action(); setConfirm(null); }}
                onCancel={() => setConfirm(null)}
            />

            <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-200"
                    onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Slot Detail</p>
                            <h2 className="text-2xl font-black text-slate-800">{slot.slotNumber}</h2>
                        </div>
                        <button onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wide mb-1">Slot ID</p>
                                <p className="font-bold text-slate-700 truncate text-xs">{slot._id}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wide mb-1">Status</p>
                                <StatusBadge status={slot.status} />
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wide mb-1">Zone</p>
                                <p className="font-bold text-slate-700">{slot.zone}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-slate-400 font-semibold text-xs uppercase tracking-wide mb-1">Type</p>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold text-xs uppercase">
                                    {slot.slotType}
                                </span>
                            </div>
                        </div>

                        {slot.status !== 'free' && (
                            detailLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
                                </div>
                            ) : detail ? (
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Booking Info</p>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div>
                                            <p className="text-slate-400 text-xs font-semibold">User</p>
                                            <p className="font-bold text-slate-700">{detail.studentName || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-semibold">Vehicle</p>
                                            <p className="font-bold text-slate-700">{detail.vehicleNumber || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-semibold">Entry Time</p>
                                            <p className="font-semibold text-slate-600 text-xs">
                                                {detail.startTime ? new Date(detail.startTime).toLocaleString() : '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-xs font-semibold">Exit Time</p>
                                            <p className="font-semibold text-slate-600 text-xs">
                                                {detail.endTime ? new Date(detail.endTime).toLocaleString() : 'Still Parked'}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-slate-400 text-xs font-semibold">Duration</p>
                                            <p className="font-bold text-slate-700">
                                                {formatDuration(detail.startTime, detail.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-400 text-sm text-center py-3">No active booking data found.</p>
                            )
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                            {slot.status !== 'free' && (
                                <button
                                    disabled={!!actionLoading}
                                    onClick={() => askConfirm(
                                        `Mark slot "${slot.slotNumber}" as Available? This will release any active reservation.`,
                                        () => doAction('Mark Available', () => api.put(`/slots/${slot._id}`, { status: 'free' }))
                                    )}
                                    className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50">
                                    {actionLoading === 'Mark Available' ? '…' : '✓ Mark Available'}
                                </button>
                            )}
                            {slot.status !== 'occupied' && (
                                <button
                                    disabled={!!actionLoading}
                                    onClick={() => askConfirm(
                                        `Mark slot "${slot.slotNumber}" as Occupied?`,
                                        () => doAction('Mark Occupied', () => api.put(`/slots/${slot._id}`, { status: 'occupied' }))
                                    )}
                                    className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50">
                                    {actionLoading === 'Mark Occupied' ? '…' : '⊘ Mark Occupied'}
                                </button>
                            )}
                            {(isSuperAdmin || slot.status !== 'free') && (
                                <button
                                    disabled={!!actionLoading}
                                    onClick={() => askConfirm(
                                        `Force release slot "${slot.slotNumber}"? This overrides any active booking.`,
                                        () => doAction('Force Release', () => api.put(`/slots/${slot._id}`, { status: 'free' }))
                                    )}
                                    className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50">
                                    {actionLoading === 'Force Release' ? '…' : '⚡ Force Release'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ─── User Detail Modal ────────────────────────────────────────────────────── */
const UserDetailModal = ({ user, onClose }) => (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-800">{user.name}</h2>
                <button onClick={onClose}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <FaTimes size={18} />
                </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
                {[
                    ['Email', user.email],
                    ['Role', user.role.replace('_', ' ')],
                    ['Identity Type', user.userType || '—'],
                ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50">
                        <span className="text-slate-400 font-semibold text-xs uppercase tracking-wide">{label}</span>
                        <span className="font-bold text-slate-700">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const { user: currentUser } = useAuth();

    /* ── Core Data ─────────────────────────────────────────────────────────── */
    const [stats, setStats]   = useState(null);
    const [slots, setSlots]   = useState([]);
    const [users, setUsers]   = useState([]);
    const [logs,  setLogs]    = useState([]);

    /* ── Analytics Data ────────────────────────────────────────────────────── */
    const [analytics, setAnalytics]     = useState(null);
    const [liveVehicles, setLiveVehicles] = useState([]);
    const [activeBookings, setActiveBookings] = useState([]);
    const [peakHours, setPeakHours]     = useState([]);
    const [topSlots,  setTopSlots]      = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    /* ── UI ────────────────────────────────────────────────────────────────── */
    const [activeTab, setActiveTab]         = useState('overview');
    const [loading, setLoading]             = useState(true);
    const [lastUpdated, setLastUpdated]     = useState(null);

    /* ── Filters ───────────────────────────────────────────────────────────── */
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState('all');

    /* ── Toasts ────────────────────────────────────────────────────────────── */
    const [toasts, setToasts] = useState([]);
    const toastCounter = useRef(0);

    /* ── Activity feed ─────────────────────────────────────────────────────── */
    const [activities, setActivities] = useState([]);

    /* ── Modals ────────────────────────────────────────────────────────────── */
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [globalConfirm, setGlobalConfirm] = useState(null);

    /* ── Slot form ─────────────────────────────────────────────────────────── */
    const [newSlotNumber, setNewSlotNumber] = useState('');
    const [newSlotZone, setNewSlotZone]     = useState('Zone A');
    const [newSlotType, setNewSlotType]     = useState('student');

    /* ── User type state ───────────────────────────────────────────────────── */
    const [assigningType, setAssigningType] = useState({});
    const [savingType, setSavingType]       = useState({});
    const [promotingId, setPromotingId]     = useState(null);
    const [demotingId, setDemotingId]       = useState(null);
    const [approvingId, setApprovingId]     = useState(null);

    const isSuperAdmin = currentUser?.role === 'super_admin';

    /* ── Toast helpers ─────────────────────────────────────────────────────── */
    const addToast = useCallback((type, message) => {
        const id = ++toastCounter.current;
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    /* ── Activity feed ─────────────────────────────────────────────────────── */
    const addActivity = useCallback((msg) => {
        setActivities(prev => [
            { msg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            ...prev.slice(0, 14)
        ]);
    }, []);

    /* ── Fetch core data ───────────────────────────────────────────────────── */
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const requests = [
                api.get('/reports/stats'),
                api.get('/slots'),
                api.get('/users'),
            ];
            if (isSuperAdmin) requests.push(api.get('/logs').catch(() => ({ data: [] })));

            const results = await Promise.all(requests);
            setStats(results[0].data);
            setSlots(results[1].data);
            setUsers(results[2].data);
            if (isSuperAdmin && results[3]) setLogs(results[3].data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching admin data', error);
            addToast('error', 'Failed to refresh data');
        } finally {
            setLoading(false);
        }
    }, [isSuperAdmin, addToast]);

    /* ── Fetch analytics data ──────────────────────────────────────────────── */
    const fetchAnalyticsData = useCallback(async () => {
        setAnalyticsLoading(true);
        try {
            const analyticsReq = [
                api.get('/reports/analytics').catch(() => ({ data: null })),
                api.get('/reports/live').catch(() => ({ data: [] })),
                api.get('/bookings/active').catch(() => ({ data: [] })),
            ];
            if (isSuperAdmin) {
                analyticsReq.push(api.get('/reports/peak-hours').catch(() => ({ data: [] })));
                analyticsReq.push(api.get('/reports/top-slots').catch(() => ({ data: null })));
            }
            const res = await Promise.all(analyticsReq);
            setAnalytics(res[0].data);
            setLiveVehicles(res[1].data || []);
            setActiveBookings(res[2].data || []);
            if (isSuperAdmin) {
                setPeakHours(res[3]?.data || []);
                setTopSlots(res[4]?.data || null);
            }
        } catch (err) {
            console.error('Analytics fetch error', err);
        } finally {
            setAnalyticsLoading(false);
        }
    }, [isSuperAdmin]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);
    useEffect(() => { fetchAnalyticsData(); }, [fetchAnalyticsData]);

    /* ── Combined refresh ──────────────────────────────────────────────────── */
    const handleRefresh = useCallback(() => {
        fetchDashboardData();
        fetchAnalyticsData();
    }, [fetchDashboardData, fetchAnalyticsData]);

    /* ── Slot handlers ─────────────────────────────────────────────────────── */
    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post('/slots', { slotNumber: newSlotNumber, zone: newSlotZone, slotType: newSlotType });
            addToast('success', `Slot "${newSlotNumber}" created`);
            addActivity(`Slot ${newSlotNumber} (${newSlotZone}) created`);
            fetchDashboardData();
            setNewSlotNumber('');
        } catch (error) {
            addToast('error', error.response?.data?.message || 'Failed to create slot');
        }
    };

    const handleDeleteSlot = (id, slotNumber) => {
        setGlobalConfirm({
            message: `Permanently delete slot "${slotNumber}"? This action cannot be undone.`,
            action: async () => {
                try {
                    await api.delete(`/slots/${id}`);
                    addToast('success', `Slot "${slotNumber}" deleted`);
                    addActivity(`Slot ${slotNumber} deleted`);
                    fetchDashboardData();
                } catch (error) {
                    addToast('error', error.message);
                }
            }
        });
    };

    /* ── User handlers ─────────────────────────────────────────────────────── */
    const handleAssignUserType = async (userId) => {
        const userType = assigningType[userId] !== undefined ? assigningType[userId] : null;
        setSavingType(prev => ({ ...prev, [userId]: true }));
        try {
            await api.patch(`/users/${userId}/usertype`, { userType: userType === 'null' ? null : userType });
            addToast('success', 'User type updated');
            addActivity(`User type assigned: ${userType}`);
            await fetchDashboardData();
        } catch (err) {
            addToast('error', err.response?.data?.message || 'Failed to assign user type');
        } finally {
            setSavingType(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handlePromoteToAdmin = (userId, userName) => {
        setGlobalConfirm({
            message: `Promote "${userName}" to Admin? This action is logged.`,
            action: async () => {
                setPromotingId(userId);
                try {
                    await api.patch(`/users/${userId}/promote-admin`);
                    addToast('success', `${userName} promoted to Admin`);
                    addActivity(`${userName} promoted to Admin`);
                    await fetchDashboardData();
                } catch (err) {
                    addToast('error', err.response?.data?.message || 'Failed to promote user');
                } finally {
                    setPromotingId(null);
                }
            }
        });
    };

    const handleDemoteToUser = (userId, userName) => {
        setGlobalConfirm({
            message: `Demote "${userName}" back to User?`,
            action: async () => {
                setDemotingId(userId);
                try {
                    await api.patch(`/users/${userId}/demote`);
                    addToast('success', `${userName} demoted to User`);
                    addActivity(`${userName} demoted to User`);
                    await fetchDashboardData();
                } catch (err) {
                    addToast('error', err.response?.data?.message || 'Failed to demote user');
                } finally {
                    setDemotingId(null);
                }
            }
        });
    };

    const handleApproveUser = async (userId, userName) => {
        setApprovingId(userId);
        try {
            await api.patch(`/users/${userId}/approve`);
            addToast('success', `User "${userName}" approved!`);
            addActivity(`User approved: ${userName}`);
            await fetchDashboardData();
        } catch (err) {
            addToast('error', err.response?.data?.message || 'Approval failed');
        } finally {
            setApprovingId(null);
        }
    };

    const handleDeleteUser = (userId, userName) => {
        setGlobalConfirm({
            message: `Permanently delete user "${userName}"? This action cannot be undone.`,
            action: async () => {
                try {
                    await api.delete(`/users/${userId}`);
                    addToast('success', `User "${userName}" deleted`);
                    addActivity(`User ${userName} deleted`);
                    await fetchDashboardData();
                } catch (err) {
                    addToast('error', err.response?.data?.message || 'Failed to delete user');
                }
            }
        });
    };

    /* ── Filtered Users ────────────────────────────────────────────────────── */
    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            (u.vehicleNumber && u.vehicleNumber.toLowerCase().includes(userSearchTerm.toLowerCase()));
        const matchesType =
            userTypeFilter === 'all' ||
            (userTypeFilter === 'none' && !u.userType) ||
            u.userType === userTypeFilter;
        return matchesSearch && matchesType;
    });

    /* ── Tabs ──────────────────────────────────────────────────────────────── */
    const tabs = isSuperAdmin
        ? ['overview', 'analytics', 'slots', 'users', 'logs']
        : ['overview', 'analytics', 'slots', 'users'];

    const pendingCount = users.filter(u => (!u.isApproved && u.role === 'user')).length;
    const cardHover = 'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg';

    /* ── Loading screen ────────────────────────────────────────────────────── */
    if (loading && !stats) return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );

    return (
        <>
            {/* Global confirm dialog */}
            <ConfirmDialog
                open={!!globalConfirm}
                message={globalConfirm?.message}
                onConfirm={() => { globalConfirm.action(); setGlobalConfirm(null); }}
                onCancel={() => setGlobalConfirm(null)}
            />

            {/* Slot detail modal */}
            {selectedSlot && (
                <SlotDetailModal
                    slot={selectedSlot}
                    isSuperAdmin={isSuperAdmin}
                    onClose={() => setSelectedSlot(null)}
                    onStatusUpdate={fetchDashboardData}
                    addToast={addToast}
                    addActivity={addActivity}
                />
            )}

            {/* User detail modal */}
            {selectedUser && (
                <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}

            {/* Toast notifications */}
            <Toast toasts={toasts} />

            <div className="min-h-screen bg-slate-50 pt-8 pb-16 px-4">
                <div className="max-w-7xl mx-auto">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                <FaChartLine className="text-3xl" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                                    {isSuperAdmin ? 'Super Admin Console' : 'Admin Console'}
                                </h1>
                                <p className="text-slate-500 font-medium mt-1">
                                    Full system overview and resource management.
                                    {lastUpdated && (
                                        <span className="text-slate-400 text-xs ml-2">
                                            · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm transition-all disabled:opacity-50">
                                <FaSync className={loading ? 'animate-spin' : ''} size={13} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setActiveTab('slots')}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all">
                                <FaPlus size={12} /> Add Slot
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all">
                                <FaUsers size={12} /> Users
                            </button>
                        </div>
                    </div>

                    {/* ── Pending Approvals Banner ────────────────────────── */}
                    {pendingCount > 0 && activeTab === 'overview' && (
                        <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-5 rounded-3xl flex items-center justify-between shadow-sm animate-fade-in group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-100/80 flex items-center justify-center text-red-500 shadow-inner group-hover:scale-110 transition-transform">
                                    <FaUsers size={20} />
                                </div>
                                <div>
                                    <h3 className="text-red-900 font-black text-sm uppercase tracking-wider mb-0.5">Action Required</h3>
                                    <p className="text-red-700 text-xs font-semibold">There {pendingCount === 1 ? 'is' : 'are'} <span className="text-red-900 font-black text-sm">{pendingCount}</span> new user registration{pendingCount === 1 ? '' : 's'} waiting for your manual approval.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setActiveTab('users')}
                                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-200 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-red-500/20 transition-all hover:-translate-y-0.5 whitespace-nowrap">
                                Review Now
                            </button>
                        </div>
                    )}

                    {/* ── Mini Activity Feed ──────────────────────────────── */}
                    {activities.length > 0 && (
                        <details className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <summary className="px-5 py-3 text-sm font-bold text-slate-600 cursor-pointer flex items-center gap-2 select-none list-none hover:bg-slate-50 transition-colors">
                                <FaHistory className="text-slate-400" size={14} />
                                Recent Activity
                                <span className="ml-auto text-xs text-slate-400 font-normal">click to expand</span>
                            </summary>
                            <div className="divide-y divide-slate-50 max-h-40 overflow-y-auto">
                                {activities.map((a, i) => (
                                    <div key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                                        <span className="w-14 text-xs text-slate-400 font-mono flex-shrink-0">{a.time}</span>
                                        <span className="text-slate-600">{a.msg}</span>
                                    </div>
                                ))}
                            </div>
                        </details>
                    )}

                    {/* ── Tabs ────────────────────────────────────────────── */}
                    <div className="flex space-x-1 bg-slate-200/50 p-1.5 rounded-2xl mb-8 w-fit backdrop-blur-sm flex-wrap gap-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative px-5 py-2.5 rounded-xl font-bold capitalize transition-all duration-300 text-sm ${activeTab === tab
                                    ? 'bg-white text-blue-600 shadow-md transform scale-105'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }`}>
                                {tab === 'logs' ? 'System Logs' : tab === 'analytics' ? '📊 Analytics' : tab.replace('-', ' ')}
                                {tab === 'users' && pendingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-black items-center justify-center text-white">{pendingCount}</span>
                                    </span>
                                )}
                                {tab === 'logs' && isSuperAdmin && (
                                    <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black">SA</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ══════════════════════════════════════════════════════
                        OVERVIEW TAB
                       ══════════════════════════════════════════════════════ */}
                    {activeTab === 'overview' && stats && (
                        <div className="space-y-6">
                            {/* ── Original 4 cards (unchanged) ─────────── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                {/* Total Slots */}
                                <div
                                    onClick={() => setActiveTab('slots')}
                                    title="Click to manage slots"
                                    className={`glass-panel p-5 rounded-2xl border-l-4 border-l-blue-500 hover-lift ${cardHover}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1 opacity-70">Total Slots</p>
                                            <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.slots.total}</p>
                                        </div>
                                        <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl shadow-sm"><FaCar size={18} /></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-bold">{stats.slots.free} Free</span>
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-bold">{stats.slots.occupied} Occupied</span>
                                        {stats.slots.reserved > 0 && (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-bold">{stats.slots.reserved} Reserved</span>
                                        )}
                                    </div>
                                </div>

                                {/* Live Parkings */}
                                <div
                                    onClick={() => setActiveTab('slots')}
                                    title="Click to view active slots"
                                    className={`glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 hover-lift ${cardHover}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Live Parkings</p>
                                            <p className="text-3xl font-black text-slate-800">{stats.activeParkings}</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><FaClock size={20} /></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <span className="text-slate-400 text-xs font-medium">Currently occupied vehicles</span>
                                    </div>
                                </div>

                                {/* Total Logged */}
                                <div
                                    onClick={() => isSuperAdmin ? setActiveTab('logs') : setActiveTab('slots')}
                                    title={isSuperAdmin ? 'Click to view system logs' : 'Click to view slots'}
                                    className={`glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 hover-lift ${cardHover}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Total Logged</p>
                                            <p className="text-3xl font-black text-slate-800">{stats.bookings.total}</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 text-purple-500 rounded-xl"><FaChartLine size={20} /></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <span className="text-purple-600 font-bold">{stats.bookings.today}</span>{' '}
                                        <span className="text-slate-500 text-sm font-medium">recorded today</span>
                                    </div>
                                </div>

                                {/* Platform Users */}
                                <div
                                    onClick={() => setActiveTab('users')}
                                    title="Click to manage users"
                                    className={`glass-panel p-6 rounded-2xl border-l-4 border-l-orange-500 hover-lift ${cardHover}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Platform Users</p>
                                            <p className="text-3xl font-black text-slate-800">{stats.users}</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><FaUsers size={20} /></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <span className="text-slate-400 text-xs font-medium">
                                            {users.filter(u => u.role === 'admin').length} admin(s) ·{' '}
                                            {users.filter(u => u.role === 'user').length} regular user(s)
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ── New Smart Summary Cards ───────────────── */}
                            <div>
                                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 opacity-70">Today's Insights</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard
                                        label="Bookings Today"
                                        value={stats.bookings.today}
                                        icon={<FaCalendarDay size={20} />}
                                        accent="border-l-indigo-500"
                                        bg="bg-indigo-50"
                                        iconColor="text-indigo-500"
                                        sub={`${stats.bookings.total} total all-time`}
                                        subColor="text-indigo-400"
                                        onClick={() => setActiveTab('analytics')}
                                    />
                                    <StatCard
                                        label="Active Vehicles"
                                        value={stats.activeParkings}
                                        icon={<FaBolt size={20} />}
                                        accent="border-l-emerald-500"
                                        bg="bg-emerald-50"
                                        iconColor="text-emerald-500"
                                        sub="Currently parked on campus"
                                        subColor="text-emerald-600"
                                        onClick={() => setActiveTab('analytics')}
                                    />
                                    <StatCard
                                        label="Pending Approvals"
                                        value={pendingCount}
                                        icon={<FaUsers size={20} />}
                                        accent={pendingCount > 0 ? 'border-l-red-500' : 'border-l-slate-300'}
                                        bg={pendingCount > 0 ? 'bg-red-50' : 'bg-slate-50'}
                                        iconColor={pendingCount > 0 ? 'text-red-500' : 'text-slate-400'}
                                        sub={pendingCount > 0 ? 'Awaiting manual review' : 'All users approved'}
                                        subColor={pendingCount > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}
                                        onClick={() => setActiveTab('users')}
                                    />
                                    <StatCard
                                        label="Reserved Slots"
                                        value={stats.slots.reserved}
                                        icon={<FaMapMarkerAlt size={20} />}
                                        accent="border-l-amber-500"
                                        bg="bg-amber-50"
                                        iconColor="text-amber-500"
                                        sub={`${stats.slots.free} currently free`}
                                        subColor="text-amber-600"
                                    />
                                    <StatCard
                                        label="Peak Hour Today"
                                        value={stats.peakHour || '—'}
                                        icon={<FaFire size={20} />}
                                        accent="border-l-rose-500"
                                        bg="bg-rose-50"
                                        iconColor="text-rose-500"
                                        sub="Busiest arrival time"
                                        subColor="text-rose-400"
                                    />
                                    <StatCard
                                        label="Avg Duration"
                                        value={stats.avgDuration ? `${stats.avgDuration}m` : '—'}
                                        icon={<FaHourglass size={20} />}
                                        accent="border-l-sky-500"
                                        bg="bg-sky-50"
                                        iconColor="text-sky-500"
                                        sub="Average parking time today"
                                        subColor="text-sky-400"
                                    />
                                </div>
                            </div>

                            {/* ── Super Admin Overview ──────────────────── */}
                            {isSuperAdmin && (
                                <div className="glass-panel p-6 rounded-3xl border border-blue-200 border-l-4 border-l-blue-400 bg-blue-50/30">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaUserShield className="text-blue-500" />
                                        <h3 className="font-black text-slate-800 text-lg">Admin Management Overview</h3>
                                        <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black border border-blue-200">Super Admin Only</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        {[
                                            { label: 'Super Admins', value: users.filter(u => u.role === 'super_admin').length, color: 'text-blue-600' },
                                            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600' },
                                            { label: 'Students', value: users.filter(u => u.userType === 'student').length, color: 'text-blue-600' },
                                            { label: 'Guards', value: users.filter(u => u.userType === 'guard').length, color: 'text-orange-600' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                                                <p className={`text-3xl font-black ${color}`}>{value}</p>
                                                <p className="text-slate-500 font-semibold text-xs mt-1 uppercase tracking-wide">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Quick Charts Preview ──────────────────── */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analytics Snapshot</h2>
                                    <button
                                        onClick={() => setActiveTab('analytics')}
                                        className="text-xs font-bold text-blue-600 hover:underline">
                                        View full analytics →
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <SlotStatusDonut slots={stats.slots} loading={analyticsLoading} />
                                    <OccupancyChart data={analytics?.occupancyTrend} loading={analyticsLoading} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        ANALYTICS TAB
                       ══════════════════════════════════════════════════════ */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <OccupancyChart data={analytics?.occupancyTrend} loading={analyticsLoading} />
                                <SlotStatusDonut slots={stats?.slots} loading={loading} />
                                <BookingTrendChart data={analytics?.bookingTrend} loading={analyticsLoading} />
                                <EntryExitChart data={analytics?.entryExitTrend} loading={analyticsLoading} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <UserDistributionChart data={analytics?.userDistribution} loading={analyticsLoading} />
                                </div>
                                <div className="lg:col-span-2">
                                    <ActivityFeed activities={activities} />
                                </div>
                            </div>

                            {/* ── Live System Section ───────────────────── */}
                            <div>
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Live System</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                                    <div className="lg:col-span-2">
                                        <LiveVehiclesTable data={liveVehicles} loading={analyticsLoading} />
                                    </div>
                                    <div>
                                        <PendingRequestsPanel
                                            bookings={activeBookings}
                                            onRefresh={handleRefresh}
                                            addToast={addToast}
                                            addActivity={addActivity}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── Super Admin Advanced Section ─────────── */}
                            {isSuperAdmin && (
                                <div>
                                    <div className="flex items-center gap-2 mb-5">
                                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Advanced Analytics</h2>
                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-black border border-blue-200">Super Admin Only</span>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <PeakHoursChart data={peakHours} loading={analyticsLoading} />
                                        <TopSlotsPanel data={topSlots} loading={analyticsLoading} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        SLOTS TAB (unchanged)
                       ══════════════════════════════════════════════════════ */}
                    {activeTab === 'slots' && (
                        <div className="space-y-8">
                            {/* Create slot form */}
                            <div className="glass-panel p-8 rounded-3xl border border-slate-200">
                                <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <FaPlus className="text-blue-500" /> Create New Slot
                                </h3>
                                <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Identifier</label>
                                        <input type="text" required
                                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all uppercase"
                                            placeholder="e.g. A-101"
                                            value={newSlotNumber}
                                            onChange={(e) => setNewSlotNumber(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Zone</label>
                                        <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all"
                                            value={newSlotZone} onChange={(e) => setNewSlotZone(e.target.value)}>
                                            <option>Zone A</option><option>Zone B</option><option>Zone C</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Assigned Role</label>
                                        <select className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all"
                                            value={newSlotType} onChange={(e) => setNewSlotType(e.target.value)}>
                                            <option value="student">Student</option>
                                            <option value="faculty">Faculty</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>
                                    <button type="submit"
                                        className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-slate-300 h-[52px]">
                                        Provision Slot
                                    </button>
                                </form>
                            </div>

                            {/* Slot count summary */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-slate-500 text-sm font-semibold">{slots.length} total slots —</span>
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">{slots.filter(s => s.status === 'free').length} free</span>
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold border border-red-200">{slots.filter(s => s.status === 'occupied').length} occupied</span>
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold border border-yellow-200">{slots.filter(s => s.status === 'reserved').length} reserved</span>
                                <span className="ml-auto text-xs text-slate-400">Click any row to see details</span>
                            </div>

                            {/* Slots table */}
                            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100/50 border-b border-slate-200">
                                            <tr>
                                                {['Slot Number', 'Zone', 'Type', 'Live Status', 'Actions'].map(h => (
                                                    <th key={h} className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white/50">
                                            {slots.map(slot => (
                                                <tr
                                                    key={slot._id}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className="hover:bg-blue-50/50 transition-colors cursor-pointer hover:scale-[1.005] hover:shadow-sm">
                                                    <td className="p-5 font-black text-slate-800 text-lg">{slot.slotNumber}</td>
                                                    <td className="p-5 font-semibold text-slate-600">{slot.zone}</td>
                                                    <td className="p-5">
                                                        <span className="bg-slate-100 px-3 py-1 rounded-md text-slate-600 font-bold text-xs uppercase">
                                                            {slot.slotType}
                                                        </span>
                                                    </td>
                                                    <td className="p-5">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                            ${slot.status === 'free'     ? 'bg-green-50 text-green-600 border-green-200'   : ''}
                                                            ${slot.status === 'occupied' ? 'bg-red-50 text-red-600 border-red-200'         : ''}
                                                            ${slot.status === 'reserved' ? 'bg-yellow-50 text-yellow-600 border-yellow-200': ''}`}>
                                                            {slot.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-5" onClick={e => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot._id, slot.slotNumber)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <FaTrash size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        USERS TAB (unchanged)
                       ══════════════════════════════════════════════════════ */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            {isSuperAdmin ? (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-semibold">
                                    <FaUserShield className="text-blue-500 flex-shrink-0" />
                                    You are logged in as <span className="font-black">Super Admin</span>. You can promote users to Admin and manage all accounts.
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-semibold">
                                    <FaLock className="text-blue-400 flex-shrink-0" />
                                    Admin view — you can assign user types. Only Super Admin can promote/demote Admins.
                                </div>
                            )}

                            {/* User search & filter */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                <div className="md:col-span-2 relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <FaUsers size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or vehicle..."
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all font-medium text-slate-700 text-sm shadow-sm"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                    {userSearchTerm && (
                                        <button
                                            onClick={() => setUserSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                                            <FaTimes size={14} />
                                        </button>
                                    )}
                                </div>
                                <select
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 transition-all font-bold text-slate-600 text-sm shadow-sm"
                                    value={userTypeFilter}
                                    onChange={(e) => setUserTypeFilter(e.target.value)}>
                                    <option value="all">All Account Types</option>
                                    <option value="student">Students</option>
                                    <option value="teacher">Teachers</option>
                                    <option value="guard">Guards</option>
                                    <option value="none">Unassigned</option>
                                </select>
                            </div>

                            {/* User count summary */}
                            <div className="flex items-center gap-3 flex-wrap px-1">
                                <span className="text-slate-500 text-sm font-semibold">{filteredUsers.length} users found —</span>
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold border border-purple-200">
                                    {filteredUsers.filter(u => u.role === 'admin').length} admin(s)
                                </span>
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">
                                    {filteredUsers.filter(u => u.userType === 'student').length} student(s)
                                </span>
                                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    Click a name to view profile
                                </span>
                            </div>

                            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100/50 border-b border-slate-200">
                                            <tr>
                                                {['Full Name', 'Email', 'Status', 'Role', 'User Type', 'Assign Type', 'Actions'].map(h => (
                                                    <th key={h} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white/50">
                                            {filteredUsers.map(u => {
                                                const currentTypeValue = assigningType[u._id] !== undefined
                                                    ? assigningType[u._id]
                                                    : (u.userType ?? 'null');
                                                return (
                                                    <tr key={u._id} className="hover:bg-blue-50/50 transition-colors">
                                                        <td
                                                            className="p-4 font-bold text-slate-800 cursor-pointer hover:text-blue-600 transition-colors"
                                                            onClick={() => setSelectedUser(u)}>
                                                            {u.name}
                                                        </td>
                                                        <td className="p-4 font-medium text-slate-500 text-sm">{u.email}</td>
                                                        <td className="p-4">
                                                            {u.isApproved || u.role === 'super_admin' || u.role === 'admin' ? (
                                                                <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                                                    <FaCheckCircle className="text-[10px]" /> Approved
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                                                    <FaClock className="text-[10px]" /> Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase border ${ROLE_BADGE[u.role] || ROLE_BADGE.user}`}>
                                                                {u.role.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase border ${TYPE_BADGE[u.userType] || TYPE_BADGE.null}`}>
                                                                {u.userType ?? '—'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4">
                                                            {u.role === 'user' ? (
                                                                isSuperAdmin ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <select
                                                                            className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 bg-white focus:border-blue-400 focus:outline-none"
                                                                            value={currentTypeValue}
                                                                            onChange={e => setAssigningType(prev => ({ ...prev, [u._id]: e.target.value }))}>
                                                                            <option value="null">— none —</option>
                                                                            <option value="student">Student</option>
                                                                            <option value="teacher">Teacher</option>
                                                                            <option value="guard">Guard</option>
                                                                        </select>
                                                                        <button
                                                                            onClick={() => handleAssignUserType(u._id)}
                                                                            disabled={savingType[u._id]}
                                                                            className="px-2 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                                                                            {savingType[u._id] ? '…' : 'Save'}
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm font-semibold text-slate-700 capitalize">{u.userType || 'Student'}</span>
                                                                )
                                                            ) : (
                                                                <span className="text-xs text-slate-400 italic">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                {!u.isApproved && u.role === 'user' && (
                                                                    <button
                                                                        onClick={() => handleApproveUser(u._id, u.name)}
                                                                        disabled={approvingId === u._id}
                                                                        title="Approve User"
                                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-lg shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50">
                                                                        {approvingId === u._id ? '…' : <><FaCheckCircle size={10} /> Approve</>}
                                                                    </button>
                                                                )}
                                                                {isSuperAdmin && u.role === 'user' && (
                                                                    <button
                                                                        onClick={() => handlePromoteToAdmin(u._id, u.name)}
                                                                        disabled={promotingId === u._id}
                                                                        title="Promote to Admin"
                                                                        className="p-1.5 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50">
                                                                        {promotingId === u._id ? '…' : <FaUserShield size={16} />}
                                                                    </button>
                                                                )}
                                                                {isSuperAdmin && u.role === 'admin' && (
                                                                    <button
                                                                        onClick={() => handleDemoteToUser(u._id, u.name)}
                                                                        disabled={demotingId === u._id}
                                                                        title="Demote to User"
                                                                        className="p-1.5 text-orange-500 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50">
                                                                        {demotingId === u._id ? '…' : <FaUserMinus size={16} />}
                                                                    </button>
                                                                )}
                                                                {u.role !== 'super_admin' && (
                                                                    <button
                                                                        onClick={() => handleDeleteUser(u._id, u.name)}
                                                                        title="Delete User"
                                                                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                                        <FaTrash size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════
                        SYSTEM LOGS TAB — Super Admin Only (unchanged)
                       ══════════════════════════════════════════════════════ */}
                    {activeTab === 'logs' && isSuperAdmin && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm font-semibold">
                                <FaUserShield className="text-blue-500 flex-shrink-0" />
                                <span><span className="font-black">System Logs</span> — Full audit trail of all vehicle entries and exits. Super Admin only.</span>
                            </div>

                            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-100/50 border-b border-slate-200">
                                            <tr>
                                                {['Vehicle', 'Entry Time', 'Exit Time', 'Duration', 'Slot', 'Status'].map(h => (
                                                    <th key={h} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white/50">
                                            {logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="p-12 text-center text-slate-400 font-semibold">
                                                        No system logs available yet.
                                                    </td>
                                                </tr>
                                            ) : logs.map(log => {
                                                const duration = log.entryTime && log.exitTime
                                                    ? `${Math.floor((new Date(log.exitTime) - new Date(log.entryTime)) / 60000)}m`
                                                    : log.entryTime ? 'Active' : '—';
                                                return (
                                                    <tr key={log._id} className="hover:bg-blue-50/50 transition-colors">
                                                        <td className="p-4 font-black text-slate-800">{log.vehicleNumber}</td>
                                                        <td className="p-4 text-sm font-semibold text-slate-600">
                                                            {log.entryTime ? new Date(log.entryTime).toLocaleString() : '—'}
                                                        </td>
                                                        <td className="p-4 text-sm font-semibold text-slate-600">
                                                            {log.exitTime ? new Date(log.exitTime).toLocaleString() : '—'}
                                                        </td>
                                                        <td className="p-4 font-bold text-slate-700">{duration}</td>
                                                        <td className="p-4 font-semibold text-slate-600">{log.slot?.slotNumber || '—'}</td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border
                                                                ${log.status === 'parked' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default AdminDashboard;
