import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    FaUser, FaShieldAlt, FaEnvelope, FaCrown, FaIdBadge,
    FaCalendarAlt, FaHistory, FaClock, FaInfoCircle, FaChevronRight,
    FaEye, FaEyeSlash, FaLock
} from 'react-icons/fa';

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const getRoleDescription = (role) => {
    if (role === 'super_admin') return 'Full system access and administrator management.';
    if (role === 'admin') return 'Can manage users, slots, and view all reports.';
    return 'Standard user access to parking features.';
};

/* ------------------------------------------------------------------ */
/*  Sub‑components                                                      */
/* ------------------------------------------------------------------ */

/** Labelled read-only field with icon */
const Field = ({ label, value, icon: Icon }) => (
    <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm">
            {Icon && <Icon className="text-slate-400 shrink-0" />}
            <span className="truncate">{value || '—'}</span>
        </div>
    </div>
);

/** Password field with show/hide toggle */
const PasswordField = ({ label, value, onChange, hint }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
            <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <FaLock className="text-sm" />
                </div>
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-300"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {show ? <FaEye className="text-sm" /> : <FaEyeSlash className="text-sm" />}
                </button>
            </div>
            {hint && <p className="text-[11px] text-slate-400 mt-1.5 ml-1">{hint}</p>}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Personal Info Tab                                                   */
/* ------------------------------------------------------------------ */
const PersonalInfoTab = ({ profile, user }) => {
    const u = profile || user || {};
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
                <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <FaUser />
                </span>
                <div>
                    <h2 className="font-bold text-slate-800 text-base">Personal Information</h2>
                    <p className="text-xs text-slate-400">Your basic profile details</p>
                </div>
            </div>

            <hr className="my-4 border-slate-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Full Name" value={u.name} icon={FaUser} />
                <Field
                    label="User Type"
                    value={u.userType ? u.userType.toUpperCase() : (u.role === 'admin' || u.role === 'super_admin' ? 'ADMIN' : '—')}
                    icon={FaIdBadge}
                />
            </div>
            <div className="mt-5">
                <Field label="Email Address" value={u.email} icon={FaEnvelope} />
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Security Tab                                                        */
/* ------------------------------------------------------------------ */
const SecurityTab = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }
        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!regex.test(newPassword)) {
            setError('Password must be at least 8 chars, include a letter, number, and symbol.');
            return;
        }
        setLoading(true);
        try {
            await api.put('/users/password', { oldPassword, newPassword });
            setMessage('Password updated successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-1">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                    <FaShieldAlt />
                </span>
                <div>
                    <h2 className="font-bold text-slate-800 text-base">Security</h2>
                    <p className="text-xs text-slate-400">Manage your password and security</p>
                </div>
            </div>

            <hr className="my-4 border-slate-100" />

            {message && (
                <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm">
                    {message}
                </div>
            )}
            {error && (
                <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <PasswordField
                    label="Current Password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                />
                <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    hint="Min 8 chars, 1 letter, 1 number, 1 symbol."
                />
                <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />

                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:opacity-60 cursor-pointer"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Updating…
                            </>
                        ) : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Right Sidebar                                                       */
/* ------------------------------------------------------------------ */
const RightSidebar = ({ profile, user }) => {
    const u = profile || user || {};
    const role = u.role || '—';
    const userType = u.userType;

    const roleColors = {
        super_admin: 'bg-rose-100 text-rose-700 border-rose-200',
        admin: 'bg-purple-100 text-purple-700 border-purple-200',
        user: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    const roleClass = roleColors[role] || roleColors.user;

    const userTypeColors = {
        student: 'bg-blue-600 text-white',
        teacher: 'bg-emerald-600 text-white',
        guard: 'bg-orange-500 text-white',
    };
    const utClass = userTypeColors[userType?.toLowerCase()] || 'bg-slate-600 text-white';

    const roleIcons = {
        super_admin: FaCrown,
        admin: FaShieldAlt,
        user: FaUser,
    };
    const RoleIcon = userType?.toLowerCase() === 'guard' ? FaIdBadge : (roleIcons[role] || FaUser);

    const roleIconStyles = {
        super_admin: 'bg-rose-50 text-rose-500',
        admin: 'bg-purple-50 text-purple-500',
        user: 'bg-indigo-50 text-indigo-500',
    };
    const roleIconStyle = userType?.toLowerCase() === 'guard'
        ? 'bg-orange-50 text-orange-500'
        : (roleIconStyles[role] || roleIconStyles.user);

    return (
        <div className="space-y-4">
            {/* Access Level */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${roleIconStyle}`}>
                        <RoleIcon />
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">Access Level</h3>
                </div>

                {/* System Role */}
                <div className="bg-slate-50 rounded-xl p-4 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">System Role</p>
                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${roleClass}`}>
                        {role.replace('_', ' ')}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{getRoleDescription(role)}</p>
                </div>

                {/* User Type (only for user role) */}
                {userType && (
                    <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">User Type</p>
                        <span className={`inline-block px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-widest ${utClass}`}>
                            {userType}
                        </span>
                    </div>
                )}
            </div>

            {/* Account Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center text-sm">
                        <FaInfoCircle />
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">Account Summary</h3>
                </div>

                <div className="space-y-3 divide-y divide-slate-100">
                    <div className="flex items-center justify-between py-2">
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                            <FaCalendarAlt className="text-slate-300" />
                            Member Since
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{formatDate(u.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                            <FaHistory className="text-slate-300" />
                            Total Bookings
                        </span>
                        <span className="text-xs font-bold text-blue-600">{u.totalBookings ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="flex items-center gap-2 text-xs text-slate-500">
                            <FaClock className="text-slate-300" />
                            Last Login
                        </span>
                        <span className="text-xs font-bold text-slate-700">Today</span>
                    </div>
                </div>
            </div>

            {/* Need a different role? */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div className="flex items-start gap-2.5">
                    <FaInfoCircle className="text-blue-400 mt-0.5 shrink-0 text-sm" />
                    <div>
                        <p className="text-xs font-bold text-slate-700 mb-1">Need a different role?</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Roles and User Types can only be modified by system administrators.
                            Please contact support if your access level is incorrect.
                        </p>
                        <button className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer">
                            Contact Support <FaChevronRight className="text-[9px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */
const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('personal');

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setProfile(data);
            } catch (err) {
                setError('Failed to load profile data.');
                if (err.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user, logout]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-400">
                <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-6 mt-6">
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            </div>
        );
    }

    const u = profile || user || {};
    const initials = getInitials(u.name);

    const tabs = [
        { key: 'personal', label: 'Personal Info', icon: FaUser },
        { key: 'security', label: 'Security', icon: FaShieldAlt },
    ];

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">

                {/* ── Profile Header Card ── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">

                    {/* Dark Cover Banner */}
                    <div
                        className="relative h-32 overflow-hidden"
                        style={{
                            background: 'linear-gradient(110deg, #060c18 0%, #0d1b35 45%, #0e2248 75%, #112960 100%)',
                        }}
                    >
                        {/* Large decorative circle — top right */}
                        <div
                            className="absolute -right-10 -top-10 w-52 h-52 rounded-full"
                            style={{ background: 'rgba(15, 35, 80, 0.7)' }}
                        />
                        {/* Medium inner circle */}
                        <div
                            className="absolute right-4 -top-4 w-36 h-36 rounded-full"
                            style={{ background: 'rgba(20, 50, 110, 0.5)' }}
                        />
                        {/* Bright green dot */}
                        <div className="absolute right-4 top-5 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
                        {/* Tiny accent dots */}
                        <div className="absolute right-14 top-10 w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                        <div className="absolute right-24 top-5 w-1 h-1 rounded-full bg-blue-300/30" />
                    </div>

                    {/* Avatar + Name — white area below banner */}
                    <div className="px-6 pb-5">
                        {/* Avatar overlaps banner */}
                        <div className="flex items-end gap-5 -mt-10 mb-3">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-4 border-white shrink-0 select-none z-10">
                                {initials}
                            </div>

                            <div className="pb-1 pt-11">
                                <h1 className="text-lg font-extrabold text-slate-800 leading-tight">{u.name || 'User'}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                                        {u.userType?.toUpperCase() || u.role?.replace('_', ' ').toUpperCase() || 'USER'}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tab Bar */}
                        <div className="flex items-center gap-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                                        activeTab === tab.key
                                            ? 'bg-white shadow-sm border-slate-200 text-slate-800'
                                            : 'text-slate-400 border-transparent hover:text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <tab.icon className={`text-xs ${activeTab === tab.key ? 'text-blue-500' : 'text-slate-400'}`} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Two-column content ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-8">
                    <div className="lg:col-span-2">
                        {activeTab === 'personal' && <PersonalInfoTab profile={profile} user={user} />}
                        {activeTab === 'security' && <SecurityTab />}
                    </div>
                    <div className="lg:col-span-1">
                        <RightSidebar profile={profile} user={user} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
