import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle, FaShieldAlt, FaMagic, FaKey } from 'react-icons/fa';
import SoloParkLogo from '../components/landing/SoloParkLogo';

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
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(msg);
            if (err.response?.status === 403 && msg.toLowerCase().includes('pending')) {
                setError('Account Pending Approval: Your registration is currently being reviewed by an administrator. Please check back later.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ── Forgot Password state ─────────────────────────────────────────────────
    const [fpOpen, setFpOpen]         = useState(false);
    const [fpStep, setFpStep]         = useState(1);   // 1=email, 2=otp, 3=newpw
    const [fpEmail, setFpEmail]       = useState('');
    const [fpOtp, setFpOtp]           = useState('');
    const [fpNewPw, setFpNewPw]       = useState('');
    const [fpConfirmPw, setFpConfirmPw] = useState('');
    const [fpShowPw, setFpShowPw]     = useState(false);
    const [fpShowConfirmPw, setFpShowConfirmPw] = useState(false);
    const [fpLoading, setFpLoading]   = useState(false);
    const [fpError, setFpError]       = useState('');
    const [fpSuccess, setFpSuccess]   = useState('');

    const openFp = () => { setFpOpen(true); setFpStep(1); setFpEmail(''); setFpOtp(''); setFpNewPw(''); setFpConfirmPw(''); setFpShowPw(false); setFpShowConfirmPw(false); setFpError(''); setFpSuccess(''); };
    const closeFp = () => setFpOpen(false);

    const handleFpSendOtp = async (e) => {
        e.preventDefault();
        setFpError(''); setFpLoading(true);
        try {
            await api.post('/auth/forgot-password', { email: fpEmail.trim().toLowerCase() });
            setFpStep(2);
        } catch (err) {
            setFpError(err.response?.data?.message || 'Failed to send OTP.');
        } finally { setFpLoading(false); }
    };

    const handleFpVerifyOtp = async (e) => {
        e.preventDefault();
        setFpError(''); setFpLoading(true);
        try {
            // Lightweight check — just move to step 3; real verify happens on submit
            if (!fpOtp.trim()) { setFpError('Please enter the OTP.'); setFpLoading(false); return; }
            setFpStep(3);
        } finally { setFpLoading(false); }
    };

    const handleFpReset = async (e) => {
        e.preventDefault();
        setFpError(''); setFpLoading(true);
        try {
            await api.post('/auth/reset-password', {
                email: fpEmail.trim().toLowerCase(),
                otp: fpOtp.trim(),
                newPassword: fpNewPw
            });
            setFpSuccess('Password reset! You can now sign in with your new password.');
            setFpStep(4);
        } catch (err) {
            setFpError(err.response?.data?.message || 'Reset failed. Please try again.');
        } finally { setFpLoading(false); }
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
                    <Link to="/" className="relative z-10 flex items-center">
                        <SoloParkLogo showText={true} className="w-11 h-11" textClass="text-3xl" lightText={true} />
                    </Link>
                </div>

                {/* Main Content */}
                <div className="relative z-10 p-10 mb-auto max-w-lg mt-2">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-3.5 py-1.5 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold text-blue-300 tracking-wider uppercase">Live Parking Intelligence</span>
                    </div>
                    <h1 className="text-3xl xl:text-[40px] font-extrabold mb-5 leading-[1.2]">
                        <span className="text-white">Welcome back to</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Seamless Campus Parking</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed font-normal">
                        Access your dashboard to manage reservations, track live slots, and update your profile instantly.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {[
                            { icon: <FaShieldAlt className="text-indigo-400 text-xs" />, label: 'Secure Login' },
                            { icon: <FaCheckCircle className="text-emerald-400 text-xs" />, label: 'Verified Access' },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10 backdrop-blur-md shadow-sm hover:bg-white/10 transition-colors">
                                {feature.icon}
                                <span className="text-xs font-semibold text-slate-200">{feature.label}</span>
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
                    <Link to="/" className="inline-flex items-center group">
                        <SoloParkLogo showText={true} className="w-8 h-8" textClass="text-xl" lightText={false} />
                    </Link>
                </div>

                <div className="w-full max-w-[400px] pt-16 lg:pt-0">
                    <div className="mb-6 text-center lg:text-left">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-1.5">Sign In</h2>
                        <p className="text-sm text-slate-400 font-normal">Please enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl mb-4 text-sm flex items-start gap-3 shadow-sm animate-fade-in font-medium">
                            <FaShieldAlt className="mt-0.5 flex-shrink-0 text-red-500" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Quick-fill helper (Premium Style) */}
                        <div className="relative group">
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 flex items-center gap-1.5 uppercase tracking-wider">
                                <FaMagic className="text-blue-500 text-[10px]" /> Quick Fill
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
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
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
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Password</label>
                                <button type="button" onClick={openFp} className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors">
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
                            <label htmlFor="remember" className="text-sm font-semibold text-slate-400 cursor-pointer select-none">
                                Keep me signed in
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm shadow-lg shadow-blue-500/25 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-80 text-xs" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center pb-12 lg:pb-0">
                        <p className="text-slate-400 font-normal text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 transition-colors">
                                Register now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Forgot Password Modal ── */}
            {fpOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

                        {/* Header */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <FaKey className="text-white text-base" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">SoloPark</p>
                                    <h3 className="text-lg font-extrabold text-white">
                                        {fpStep === 1 && 'Forgot Password'}
                                        {fpStep === 2 && 'Enter OTP'}
                                        {fpStep === 3 && 'New Password'}
                                        {fpStep === 4 && 'All Done!'}
                                    </h3>
                                </div>
                            </div>
                            <button onClick={closeFp} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors text-lg font-bold">×</button>
                        </div>

                        {/* Step indicator */}
                        {fpStep < 4 && (
                            <div className="flex gap-1.5 px-6 pt-4">
                                {[1,2,3].map(s => (
                                    <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${fpStep >= s ? 'bg-blue-600' : 'bg-slate-100'}`} />
                                ))}
                            </div>
                        )}

                        <div className="px-6 py-5">
                            {/* Error */}
                            {fpError && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-2xl flex items-center gap-2">
                                    <FaShieldAlt className="flex-shrink-0" /> {fpError}
                                </div>
                            )}

                            {/* Step 1 — Email */}
                            {fpStep === 1 && (
                                <form onSubmit={handleFpSendOtp} className="space-y-4">
                                    <p className="text-sm text-slate-500 font-medium">Enter the email address linked to your account. We'll send you a one-time password.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                            <input type="email" required autoFocus value={fpEmail} onChange={e => setFpEmail(e.target.value)} placeholder="name@university.edu"
                                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={fpLoading}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {fpLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <>Send OTP <FaArrowRight className="text-xs" /></>}
                                    </button>
                                </form>
                            )}

                            {/* Step 2 — OTP */}
                            {fpStep === 2 && (
                                <form onSubmit={handleFpVerifyOtp} className="space-y-4">
                                    <p className="text-sm text-slate-500 font-medium">A 6-digit OTP was sent to <strong className="text-slate-700">{fpEmail}</strong>. Enter it below. Check your spam folder if you don't see it.</p>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">One-Time Password</label>
                                        <input type="text" required autoFocus maxLength={6} value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g, ''))} placeholder="______"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-xl font-black text-slate-800 text-center tracking-[0.4em] focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all" />
                                    </div>
                                    <button type="submit" disabled={fpLoading || fpOtp.length < 6}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {fpLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</> : <>Verify OTP <FaArrowRight className="text-xs" /></>}
                                    </button>
                                    <button type="button" onClick={() => { setFpStep(1); setFpOtp(''); setFpError(''); }} className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors">
                                        ← Use a different email
                                    </button>
                                </form>
                            )}

                            {/* Step 3 — New Password */}
                            {fpStep === 3 && (
                                <form onSubmit={handleFpReset} className="space-y-4">
                                    <p className="text-sm text-slate-500 font-medium">Choose a strong new password for your account.</p>
                                    
                                    {/* New Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">New Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                            <input type={fpShowPw ? 'text' : 'password'} required autoFocus minLength={6} value={fpNewPw} onChange={e => setFpNewPw(e.target.value)} placeholder="At least 6 characters"
                                                className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all" />
                                            <button type="button" onClick={() => setFpShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {fpShowPw ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {fpNewPw && fpNewPw.length < 6 && <p className="text-xs text-red-500 font-semibold mt-1.5 ml-1">Must be at least 6 characters</p>}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                                            <input type={fpShowConfirmPw ? 'text' : 'password'} required minLength={6} value={fpConfirmPw} onChange={e => setFpConfirmPw(e.target.value)} placeholder="Re-enter your new password"
                                                className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all" />
                                            <button type="button" onClick={() => setFpShowConfirmPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                                {fpShowConfirmPw ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {/* Real-time Matching Feedback */}
                                        {fpNewPw && fpConfirmPw && (
                                            fpNewPw === fpConfirmPw ? (
                                                <p className="text-xs text-emerald-600 font-semibold mt-1.5 ml-1 flex items-center gap-1">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                                    Passwords match
                                                </p>
                                            ) : (
                                                <p className="text-xs text-red-500 font-semibold mt-1.5 ml-1 flex items-center gap-1">
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                                    Passwords do not match
                                                </p>
                                            )
                                        )}
                                    </div>

                                    <button type="submit" disabled={fpLoading || fpNewPw.length < 6 || fpNewPw !== fpConfirmPw}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                        {fpLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</> : <>Reset Password <FaCheckCircle className="text-xs" /></>}
                                    </button>
                                </form>
                            )}

                            {/* Step 4 — Success */}
                            {fpStep === 4 && (
                                <div className="text-center py-4 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                                        <FaCheckCircle className="text-3xl text-emerald-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-extrabold text-slate-800 mb-1">Password Reset!</h4>
                                        <p className="text-sm text-slate-500 font-medium">{fpSuccess}</p>
                                    </div>
                                    <button onClick={closeFp}
                                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all">
                                        Back to Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

};

export default Login;
