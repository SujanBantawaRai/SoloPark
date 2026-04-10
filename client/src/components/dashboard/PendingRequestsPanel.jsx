import React, { useState } from 'react';
import api from '../../utils/api';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const MOCK = [
    { _id: 'm1', slot: { slotNumber: 'A-07' }, user: { name: 'Dipesh Karki', email: 'dipesh@example.com' }, vehicleNumber: 'BA 2 DA 3344', startTime: new Date(), endTime: new Date(Date.now() + 2 * 3600000) },
    { _id: 'm2', slot: { slotNumber: 'C-02' }, user: { name: 'Nisha Tamang', email: 'nisha@example.com' }, vehicleNumber: 'BA 1 GA 5566', startTime: new Date(), endTime: new Date(Date.now() + 3 * 3600000) },
    { _id: 'm3', slot: { slotNumber: 'B-08' }, user: { name: 'Suresh Magar', email: 'suresh@example.com' }, vehicleNumber: 'BA 3 BA 7788', startTime: new Date(), endTime: new Date(Date.now() + 1 * 3600000) },
];

const PendingRequestsPanel = ({ bookings, onRefresh, addToast, addActivity }) => {
    const [loadingId, setLoadingId] = useState(null);
    const pending = bookings ? bookings.filter(b => b.status === 'active') : MOCK;

    const handleVerify = async (id, slotNum) => {
        setLoadingId(`v-${id}`);
        try {
            await api.put(`/bookings/${id}/verify`);
            if (addToast) addToast('success', `Booking for ${slotNum} approved`);
            if (addActivity) addActivity(`Guard approved entry at Slot ${slotNum}`);
            if (onRefresh) onRefresh();
        } catch (e) {
            if (addToast) addToast('error', e.response?.data?.message || 'Approval failed');
        } finally {
            setLoadingId(null);
        }
    };

    const handleCancel = async (id, slotNum) => {
        setLoadingId(`c-${id}`);
        try {
            await api.put(`/bookings/${id}/cancel`);
            if (addToast) addToast('success', `Booking for ${slotNum} rejected`);
            if (addActivity) addActivity(`Booking rejected for Slot ${slotNum}`);
            if (onRefresh) onRefresh();
        } catch (e) {
            if (addToast) addToast('error', e.response?.data?.message || 'Rejection failed');
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="glass-panel rounded-3xl border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="font-black text-slate-800 text-base">Pending Requests</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Bookings awaiting approval</p>
                </div>
                {pending.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {pending.length} pending
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 max-h-72 pr-1 -mr-1">
                {pending.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <FaCheckCircle className="text-emerald-400 text-3xl mb-2" />
                        <p className="text-slate-500 font-semibold text-sm">All clear!</p>
                        <p className="text-slate-400 text-xs">No pending booking requests</p>
                    </div>
                ) : pending.map(b => (
                    <div key={b._id} className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl hover:border-amber-200 transition-colors">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-black text-slate-800 text-sm">{b.slot?.slotNumber || '—'}</p>
                                <span className="text-xs text-slate-400">·</span>
                                <p className="font-semibold text-slate-600 text-xs truncate">{b.user?.name || '—'}</p>
                            </div>
                            <p className="font-mono text-xs font-bold text-slate-500">{b.vehicleNumber}</p>
                            {b.startTime && (
                                <p className="text-xs text-slate-400 mt-1">
                                    {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →{' '}
                                    {b.endTime ? new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '?'}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                                onClick={() => handleVerify(b._id, b.slot?.slotNumber)}
                                disabled={!!loadingId}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-emerald-500/20"
                            >
                                {loadingId === `v-${b._id}` ? '…' : <><FaCheckCircle size={10} /> Approve</>}
                            </button>
                            <button
                                onClick={() => handleCancel(b._id, b.slot?.slotNumber)}
                                disabled={!!loadingId}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loadingId === `c-${b._id}` ? '…' : <><FaTimesCircle size={10} /> Reject</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingRequestsPanel;
