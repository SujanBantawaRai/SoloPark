import React, { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ProfileForm = ({ user }) => {
    const { name, email } = user || {};

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">
                    👤
                </span>
                Personal Information
            </h3>

            <form className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>


            </form>
        </div>
    );
};

export default ProfileForm;
