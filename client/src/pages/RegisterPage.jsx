import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    FaUser, FaEnvelope, FaLock, FaCar, FaEye, FaEyeSlash,
    FaCheckCircle, FaTimesCircle, FaArrowRight, FaShieldAlt,
    FaTerminal, FaParking
} from 'react-icons/fa';

// ── Email regex ────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = ({ size = 'sm', color = 'blue' }) => (
    <div className={`${size === 'sm' ? 'w-4 h-4 border-2' : 'w-5 h-5 border-[3px]'} rounded-full border-${color}-300 border-t-${color}-600 animate-spin`} />
);

// ══════════════════════════════════════════════════════════════════════════════
//  RegisterPage
// ══════════════════════════════════════════════════════════════════════════════
const RegisterPage = () => {
    const [name, setName] = useState('');
    const [userType, setUserType] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { register, user } = useAuth();
    const navigate = useNavigate();

    // — Email check logic —
    const [emailStatus, setEmailStatus] = useState(null);
    const [emailMsg, setEmailMsg] = useState('');
    const debounceTimer = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (user) navigate('/student');
    }, [user, navigate]);

    useEffect(() => () => {
        clearTimeout(debounceTimer.current);
    }, []);

    // ── Form submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        setError(''); setSubmitting(true);
        try {
            await register(name, email.toLowerCase().trim(), password, vehicleNumber, userType);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Derived UI state ───────────────────────────────────────────────────────
    const passwordsMatch = confirmPassword && password === confirmPassword;
    const passwordMismatch = confirmPassword && password !== confirmPassword;
    const canSubmit = name.trim() && email && EMAIL_REGEX.test(email) && password.length >= 6 && !passwordMismatch;

    const emailBorderClass =
        emailStatus === 'available' ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/15' :
            emailStatus === 'taken' || emailStatus === 'invalid' ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' :
                'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15';

    // — Email change handler —
    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        clearTimeout(debounceTimer.current);

        if (!val) { setEmailStatus(null); setEmailMsg(''); return; }
        if (!EMAIL_REGEX.test(val)) {
            setEmailStatus('invalid');
            setEmailMsg('Enter a valid email address');
            return;
        }

        setEmailStatus('loading');
        setEmailMsg('Checking...');

        debounceTimer.current = setTimeout(async () => {
            try {
                const { data } = await api.post('/auth/check-email', { email: val });
                if (data.available) {
                    setEmailStatus('available');
                    setEmailMsg('Email available');
                } else {
                    setEmailStatus('taken');
                    setEmailMsg('Email already registered');
                }
            } catch {
                setEmailStatus(null);
                setEmailMsg('');
            }
        }, 700);
    };

    return (
        <div className="min-h-screen bg-white flex overflow-hidden">
            {/* Main Premium Layout */}
            <div className="w-full flex min-h-screen">

                {/* ── Left side: Immersive Branding (Desktop Only) ── */}
                <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-slate-950 overflow-hidden relative p-12 flex-col justify-between group h-screen">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-600/20 animate-pulse" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                    {/* Floating Glows */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-colors duration-700" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/30 transition-colors duration-700" />

                    <Link to="/" className="relative z-10 flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 border border-blue-400/20">
                            <FaParking className="text-white text-xl" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tighter">SoloPark</span>
                    </Link>

                    <div className="relative z-10 space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                            Live Campus Parking System
                        </div>
                        <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                            Smart Access.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Seamless</span> Parking.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed font-light max-w-md">
                            Experience the future of campus mobility. Secure your spot, manage your vehicle, and save time.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 gap-4">
                        {[
                            { icon: <FaCheckCircle className="text-emerald-500" />, text: 'Instant slot availability updates' },
                            { icon: <FaCheckCircle className="text-emerald-500" />, text: 'One-click role-based registration' },
                            { icon: <FaCheckCircle className="text-emerald-500" />, text: 'Integrated student & guard portals' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium bg-white/5 backdrop-blur-sm border border-white/5 p-3 rounded-2xl transition-transform hover:translate-x-2">
                                {f.icon}
                                <span>{f.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 pt-8 border-t border-white/5">
                        <p className="text-slate-500 text-xs font-medium">© {new Date().getFullYear()} SoloPark Systems. Full-stack performance.</p>
                    </div>
                </div>

                {/* ── Right side: Interaction Area ── */}
                <div className="flex-1 flex flex-col items-center justify-start py-12 px-6 sm:px-12 md:px-20 lg:px-24 overflow-y-auto h-screen custom-scrollbar bg-white">

                    {success ? (
                        /* SUCCESS STATE */
                        <div className="w-full max-w-md space-y-8 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center border-4 border-emerald-100 mb-4 shadow-xl shadow-emerald-500/10">
                                <FaCheckCircle className="text-emerald-500 text-5xl" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">
                                    Registration <br /><span className="text-emerald-600">Successful!</span>
                                </h2>
                                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                    Your account for <span className="text-slate-800 font-bold">{email}</span> has been created and is now <span className="text-blue-600 font-black">pending admin approval.</span>
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 w-full text-left flex gap-4 items-start shadow-sm shadow-blue-500/5">
                                <div className="p-2 bg-blue-100 rounded-xl mt-1">
                                    <FaShieldAlt className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-blue-900 font-bold text-sm mb-1 uppercase tracking-wider">What happens next?</p>
                                    <p className="text-blue-700/80 text-sm leading-relaxed">
                                        An administrator will verify your {userType} request. You will be able to log in once your account is confirmed.
                                    </p>
                                </div>
                            </div>
                            <div className="pt-8 w-full">
                                <Link to="/login" className="flex items-center justify-center gap-3 w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 group">
                                    Continue to Log In
                                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* FORM STATE */
                        <div className="w-full max-w-md space-y-4">
                            {/* Header */}
                            <div className="space-y-3">
                                <div className="lg:hidden flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                                        <FaParking className="text-white text-lg" />
                                    </div>
                                    <span className="text-2xl font-black text-slate-900 tracking-tighter">SoloPark</span>
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                                    Create Your <span className="text-blue-600">Account.</span>
                                </h2>
                                <p className="text-slate-500 font-medium tracking-tight">
                                    Join SoloPark to secure your campus parking today.
                                </p>
                            </div>

                            {/* Global error */}
                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm shadow-sm animate-in fade-in zoom-in duration-300">
                                    <FaTimesCircle className="mt-0.5 flex-shrink-0 text-red-500" />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6 pb-0">
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider ml-1">I am registering as a...</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'student', label: 'Student', icon: <FaShieldAlt className="rotate-180" /> },
                                            { id: 'teacher', label: 'Teacher', icon: <FaShieldAlt className="scale-110" /> },
                                            { id: 'guard', label: 'Guard', icon: <FaShieldAlt /> }
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setUserType(role.id)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2 ${userType === role.id
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/5'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`text-xl ${userType === role.id ? 'text-white' : 'text-slate-400'}`}>
                                                    {role.icon}
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest uppercase">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <FaUser className="text-sm" />
                                            </div>
                                            <input type="text" required
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm"
                                                value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Email Address</label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors text-sm ${emailStatus === 'available' ? 'text-emerald-500' :
                                                    emailStatus === 'invalid' || emailStatus === 'taken' ? 'text-red-500' :
                                                        'text-slate-400 group-focus-within:text-blue-500'
                                                }`}><FaEnvelope /></div>
                                            <input type="email" required
                                                className={`w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 transition-all font-semibold text-slate-800 focus:bg-white placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm ${emailBorderClass}`}
                                                value={email} onChange={handleEmailChange}
                                                placeholder="you@email.com" />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                {emailStatus === 'loading' && <Spinner />}
                                                {emailStatus === 'available' && <FaCheckCircle className="text-emerald-500" />}
                                                {(emailStatus === 'taken' || emailStatus === 'invalid') && <FaTimesCircle className="text-red-500" />}
                                            </div>
                                        </div>
                                        {emailMsg && (
                                            <p className={`text-[11px] mt-1.5 ml-2 font-bold ${emailStatus === 'available' ? 'text-emerald-600' :
                                                    emailStatus === 'taken' || emailStatus === 'invalid' ? 'text-red-500' :
                                                        'text-slate-400'
                                                }`}>{emailMsg}</p>
                                        )}
                                    </div>


                                    {/* Vehicle Number */}
                                    {userType !== 'guard' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">
                                                Vehicle Number <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                    <FaCar className="text-sm" />
                                                </div>
                                                <input type="text"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal uppercase tracking-widest shadow-sm text-sm"
                                                    value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                                    placeholder="BA 1 PA 1234" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <FaLock className="text-sm" />
                                            </div>
                                            <input type={showPassword ? "text" : "password"} required minLength={6}
                                                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm"
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                                placeholder="At least 6 characters" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">Confirm Password</label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors text-sm ${passwordsMatch ? 'text-emerald-500' : passwordMismatch ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-500'
                                                }`}><FaLock /></div>
                                            <input type={showConfirm ? "text" : "password"} required
                                                className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 transition-all focus:bg-white font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm ${passwordsMatch ? 'border-emerald-400 focus:ring-emerald-500/10' :
                                                        passwordMismatch ? 'border-red-400 focus:ring-red-500/10' :
                                                            'border-slate-100 focus:border-blue-500 focus:ring-blue-500/10'
                                                    }`}
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repeat password" />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                                {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {passwordMismatch && <p className="text-[11px] text-red-500 font-bold mt-1.5 ml-2">Passwords do not match</p>}
                                        {passwordsMatch && <p className="text-[11px] text-emerald-600 font-bold mt-1.5 ml-2">✓ Passwords match</p>}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button type="submit" disabled={!canSubmit || submitting}
                                        className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl transition-all duration-300 font-black text-base shadow-xl shadow-slate-900/10 focus:ring-4 focus:ring-slate-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3 group">
                                        {submitting ? (
                                            <><Spinner color="white" /> Sending Code...</>
                                        ) : (
                                            <>Register Now <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-60 text-sm" /></>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="pt-2 border-t border-slate-50 text-center">
                                <p className="text-slate-500 font-bold text-sm tracking-tight">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
