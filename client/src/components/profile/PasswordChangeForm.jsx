import React, { useState } from 'react';
import api from '../../utils/api';

const PasswordChangeForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setError('Password must be at least 8 characters long and include a letter, number, and special character (e.g., @, !, %, #, ?).');
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
            setError(err.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 text-sm">
                    🔒
                </span>
                Security
            </h3>

            {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm border border-emerald-100">{message}</div>}
            {error && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">{error}</div>}

            <form onSubmit={submitHandler} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        minLength="8"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-2 ml-1">
                        Min 8 chars, 1 letter, 1 number, 1 symbol.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        minLength="8"
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 focus:ring-4 focus:ring-slate-200 transition-all focus:outline-none disabled:opacity-70 flex items-center"
                    >
                         {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                Updating...
                            </>
                        ) : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChangeForm;
