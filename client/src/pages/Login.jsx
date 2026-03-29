import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle, FaCar, FaShieldAlt, FaMagic } from 'react-icons/fa';

const Login = () => {
    const [quickRole, setQuickRole] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Redirect based on role + userType after login
    useEffect(() => {
        if (user) {
            if (user.role === 'super_admin' || user.role === 'admin') {
                navigate('/admin');
            } else if (user.userType === 'guard') {
                navigate('/guard');
            } else {
                navigate('/student');
            }
        }
    }, [user, navigate]);

    // Quick-fill demo credentials (for development convenience )
    const handleQuickRoleChange = (e) => {
        const selected = e.target.value;
        setQuickRole(selected);
        if (selected === 'super_admin') {
            setEmail('superadmin@solopark.com');
            setPassword('SuperSecure@2025!');
        } else if (selected === 'admin') {
            setEmail('admin@solopark.com');
            setPassword('password123');
        } else if (selected === 'guard') {
            setEmail('guard@solopark.com');
            setPassword('password123');
        } else if (selected === 'student') {
            setEmail('student@solopark.com');
            setPassword('password123');
        } else {
            setEmail('');
            setPassword('');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email.toLowerCase().trim(), password);
            // navigate('/') happens in Login's useEffect if user exists
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
            
            // Check if it's the specific "Pending Approval" error from our backend
            if (err.response?.status === 403 && msg.toLowerCase().includes('pending')) {
                setError('Account Pending Approval: Your registration is currently being reviewed by an administrator. Please check back later.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans tracking-tight overflow-hidden">
            {/* ── Left Branding Panel ── */}
            <div className="hidden lg:flex lg:w-[45%] bg-slate-900 relative overflow-hidden flex-col justify-between">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/50 via-transparent to-transparent opacity-80" />
                <div className="absolute -bottom-64 -left-64 w-[600px] h-[600px] bg-blue-500/15 rounded-full mix-blend-screen filter blur-[120px]" />
                <div className="absolute top-1/4 -right-32 w-80 h-80 bg-indigo-400/15 rounded-full mix-blend-screen filter blur-[80px]" />

                {/* Top Branding */}
                <div className="relative z-10 p-10">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            S
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white/90">SoloPark</span>
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 p-10 mb-auto max-w-lg mt-2">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-8">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-blue-300 tracking-wider uppercase">Live Parking Intelligence</span>
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold mb-6 leading-[1.1]">
                        <span className="text-white">Welcome back to</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Seamless Campus Parking</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                        Access your dashboard to manage reservations, track live slots, and update your profile instantly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: <FaShieldAlt className="text-indigo-400" />, label: 'Secure Login' },
                            { icon: <FaCheckCircle className="text-emerald-400" />, label: 'Verified Access' },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-2xl px-5 py-3 border border-white/10 backdrop-blur-md shadow-sm hover:bg-white/10 transition-colors">
                                {feature.icon}
                                <span className="text-sm font-semibold text-slate-200">{feature.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Footer Area */}
                <div className="relative z-10 p-12 border-t border-white/5">
                    <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">© {new Date().getFullYear()} SoloPark Systems. All rights reserved.</p>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="w-full lg:w-[55%] flex flex-col items-center justify-start py-12 px-6 sm:px-12 md:px-20 lg:px-24 xl:px-32 overflow-y-auto h-screen bg-white relative custom-scrollbar">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 lg:hidden">
                    <Link to="/" className="inline-flex items-center gap-2.5 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                            S
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-800">SoloPark</span>
                    </Link>
                </div>

                <div className="w-full max-w-[420px] pt-16 lg:pt-0">
                    <div className="mb-4 text-center lg:text-left">
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-1">Sign In</h2>
                        <p className="text-slate-500 font-medium">Please enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl mb-3 text-sm flex items-start gap-3 shadow-sm animate-fade-in font-medium">
                            <FaShieldAlt className="mt-0.5 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-3">
                        {/* Quick-fill helper (Premium Style) */}
                        <div className="relative group">
                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1 flex items-center gap-1.5">
                                <FaMagic className="text-blue-500 text-xs" /> Quick Fill
                            </label>
                            <select
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-semibold text-slate-700 text-sm appearance-none cursor-pointer"
                                value={quickRole}
                                onChange={handleQuickRoleChange}
                            >
                                <option value="">— Select an account —</option>
                                <option value="super_admin">Super Admin</option>
                                <option value="admin">Admin</option>
                                <option value="guard">Guard</option>
                                <option value="student">Student (User)</option>
                            </select>
                            <div className="absolute right-4 bottom-3.5 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaEnvelope className="text-sm" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@university.edu"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1 ml-1">
                                <label className="block text-sm font-bold text-slate-700">Password</label>
                                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <FaLock className="text-sm" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me UI */}
                        <div className="flex items-center gap-2 ml-1">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm font-semibold text-slate-500 cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-extrabold text-base shadow-xl shadow-blue-500/20 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-80 text-sm" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-10 text-center pb-12 lg:pb-0">
                        <p className="text-slate-500 font-medium text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 transition-colors">
                                Register now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
