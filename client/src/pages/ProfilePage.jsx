import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ProfileForm from '../components/profile/ProfileForm';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';
import RoleView from '../components/profile/RoleView';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setProfile(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load profile data.');
                if (err.response?.status === 401) {
                    logout();
                }
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfile();
        }
    }, [user, logout]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500">
                <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Loading profile...
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 mt-8">
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Profile</h1>
                <p className="text-slate-500 mt-2">Manage your personal information, security settings, and view your access level.</p>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Personal Info */}
                <div className="lg:col-span-2 space-y-8">
                    <ProfileForm user={profile || user} />
                    <PasswordChangeForm />
                </div>

                {/* Right Column - Role View */}
                <div className="lg:col-span-1">
                    <RoleView role={profile?.role || user?.role} userType={profile?.userType || user?.userType} />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
