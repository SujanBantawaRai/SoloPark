import React from 'react';

const RoleView = ({ role, userType }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm">
                    🛡️
                </span>
                Access Level
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">
                        System Role
                    </label>
                    <div className="flex items-center">
                        <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${
                            role === 'super_admin' ? 'bg-rose-100 text-rose-700' :
                            role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-100 text-slate-700'
                        }`}>
                            {role}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                        {role === 'super_admin' ? 'Full system access and administrator management.' :
                         role === 'admin' ? 'Can manage users, slots, and view all reports.' :
                         'Standard user access to parking features.'}
                    </p>
                </div>

                {role === 'user' && (
                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">
                            User Type
                        </label>
                        <div className="flex items-center">
                            {userType ? (
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase border ${
                                    userType === 'student' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    userType === 'teacher' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    userType === 'guard' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                    {userType}
                                </span>
                            ) : (
                                <span className="text-slate-400 italic">Not Assigned</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-8 bg-blue-50 text-blue-700 p-4 rounded-xl text-sm leading-relaxed border border-blue-100">
                <span className="font-semibold block mb-1">Need a different role?</span>
                Roles and User Types can only be modified by system administrators. Please contact support if your access level is incorrect.
            </div>
        </div>
    );
};

export default RoleView;
