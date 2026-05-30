import { useState, useEffect, useRef } from 'react';
import { FaBell, FaTrash, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Utility: format relative time
const fmtRelTime = (isoStr) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
};

const NotificationBell = ({ dark = false }) => {
    const { user } = useAuth();
    const userId = user?._id || user?.email || 'guest';
    const storageKey = `solopark_notifications_v3_${userId}`;

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem(`solopark_notifications_v3_${userId}`);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Sync state when userId changes (account switch)
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            setNotifications(saved ? JSON.parse(saved) : []);
        } catch {
            setNotifications([]);
        }
    }, [userId, storageKey]);

    // Save to localStorage on change
    useEffect(() => {
        if (userId && userId !== 'guest') {
            if (notifications.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(notifications));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [notifications, storageKey, userId]);

    // Listen for dispatched notifications from anywhere in the app
    useEffect(() => {
        const handlePush = (e) => {
            const { title, message, type } = e.detail;
            const newNotif = {
                id: Date.now() + Math.random(),
                title,
                message,
                type: type || 'info',
                time: new Date().toISOString(),
                read: false
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 50));
        };
        window.addEventListener('solopark:notify', handlePush);
        return () => window.removeEventListener('solopark:notify', handlePush);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleOpen = () => setIsOpen(prev => !prev);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-emerald-500 text-base flex-shrink-0 mt-0.5" />;
            case 'warning':
                return <FaExclamationTriangle className="text-amber-500 text-base flex-shrink-0 mt-0.5" />;
            case 'error':
                return <FaTimesCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />;
            default:
                return <FaInfoCircle className="text-blue-500 text-base flex-shrink-0 mt-0.5" />;
        }
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                onClick={toggleOpen}
                className={`relative p-2.5 rounded-xl transition-all duration-200 shadow-sm border focus:outline-none cursor-pointer flex items-center justify-center
                    ${dark 
                        ? 'bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700' 
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                title="Notifications"
            >
                <FaBell className={unreadCount > 0 ? "animate-swing" : ""} />
                
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-bounce shadow-md">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Container */}
            {isOpen && (
                <div 
                    className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-fade-in
                        ${dark 
                            ? 'bg-slate-900 border-slate-800 text-slate-200' 
                            : 'bg-white border-slate-100 text-slate-700'
                        }`}
                >
                    {/* Header */}
                    <div className={`px-4.5 py-3 border-b flex items-center justify-between
                        ${dark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'}`}>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm uppercase tracking-wider">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-extrabold text-[10px] rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[11px] font-bold text-blue-500 hover:text-blue-600 hover:underline transition-colors focus:outline-none cursor-pointer"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center gap-2.5">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg
                                    ${dark ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>
                                    <FaBell />
                                </div>
                                <div>
                                    <p className="font-semibold text-xs text-slate-400">All caught up!</p>
                                    <p className="text-[10px] text-slate-400/70 mt-0.5">No new notifications at this time.</p>
                                </div>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => markAsRead(n.id)}
                                    className={`p-3.5 flex gap-3 transition-colors cursor-pointer select-none
                                        ${n.read 
                                            ? 'opacity-65 hover:opacity-100 bg-transparent' 
                                            : dark ? 'bg-blue-950/10' : 'bg-blue-50/10'
                                        } hover:bg-slate-50/30 dark:hover:bg-slate-800/30`}
                                >
                                    {getIcon(n.type)}
                                    <div className="flex-grow space-y-0.5">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>{n.title}</p>
                                            <span className="text-[9px] font-semibold text-slate-400">
                                                {typeof n.time === 'string' && n.time.includes('T') ? fmtRelTime(n.time) : n.time}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium leading-normal">{n.message}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 self-center" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className={`px-4 py-2 border-t flex justify-end
                            ${dark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-100 bg-slate-50/30'}`}>
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors focus:outline-none cursor-pointer"
                            >
                                <FaTrash className="text-[9px]" /> Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
