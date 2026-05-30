import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    FaUser, FaEnvelope, FaLock, FaCar, FaEye, FaEyeSlash,
    FaCheckCircle, FaTimesCircle, FaArrowRight, FaShieldAlt,
    FaTerminal
} from 'react-icons/fa';
import SoloParkLogo from '../components/landing/SoloParkLogo';

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
    const [step, setStep] = useState('form'); // 'form', 'otp', 'success'
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(60);
    const [submitting, setSubmitting] = useState(false);
    const { register, verifyOtp, resendOtp, user } = useAuth();
    const navigate = useNavigate();
    const otpRefs = useRef([]);

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

    useEffect(() => {
        let interval;
        if (step === 'otp' && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer]);

    // ── Form submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) { setError('Passwords do not match'); return; }
        setError(''); setSubmitting(true);
        try {
            await register(name, email.toLowerCase().trim(), password, vehicleNumber, userType);
            setStep('otp');
            setResendTimer(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^[0-9]*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter a complete 6-digit OTP');
            return;
        }
        setError(''); setSubmitting(true);
        try {
            await verifyOtp(email.toLowerCase().trim(), otpValue);
            setStep('success');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Invalid or expired OTP.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setError(''); setSubmitting(true);
        try {
            await resendOtp(email.toLowerCase().trim());
            setResendTimer(60);
            setError(''); // clear error if any
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
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

                    <Link to="/" className="relative z-10 flex items-center">
                        <SoloParkLogo showText={true} className="w-11 h-11" textClass="text-3xl" lightText={true} />
                    </Link>

                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3.5 py-1.5 text-blue-400">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                            <span className="text-[10px] font-bold tracking-wider uppercase">Live Campus Parking System</span>
                        </div>
                        <h1 className="text-3xl xl:text-[40px] font-extrabold text-white leading-[1.2] tracking-tight">
                            Smart Access.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Seamless</span> Parking.
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed font-normal max-w-sm">
                            Experience the future of campus mobility. Secure your spot, manage your vehicle, and save time.
                        </p>
                    </div>

                    <div className="relative z-10 grid grid-cols-1 gap-3.5">
                        {[
                            { icon: <FaCheckCircle className="text-emerald-500 text-xs" />, text: 'Instant slot availability updates' },
                            { icon: <FaCheckCircle className="text-emerald-500 text-xs" />, text: 'One-click role-based registration' },
                            { icon: <FaCheckCircle className="text-emerald-500 text-xs" />, text: 'Integrated student & guard portals' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-slate-300 text-xs font-semibold bg-white/5 backdrop-blur-sm border border-white/5 px-4 py-2.5 rounded-xl transition-transform hover:translate-x-2">
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

                    {step === 'success' ? (
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
                    ) : step === 'otp' ? (
                        /* OTP STATE */
                        <div className="w-full max-w-md space-y-8 py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-2">
                                <FaEnvelope className="text-blue-500 text-3xl" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                    Check your email
                                </h2>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-[300px]">
                                    We've sent a 6-digit verification code to <span className="font-bold text-slate-800">{email}</span>.
                                </p>
                            </div>

                            {/* Global error */}
                            {error && (
                                <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm shadow-sm animate-in fade-in zoom-in duration-300 w-full text-left">
                                    <FaTimesCircle className="mt-0.5 flex-shrink-0 text-red-500" />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="w-full space-y-6">
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => otpRefs.current[idx] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                            className="w-12 h-14 text-center text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        />
                                    ))}
                                </div>

                                <button type="submit" disabled={otp.join('').length !== 6 || submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl transition-all duration-300 font-black shadow-xl shadow-blue-500/20 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-3">
                                    {submitting ? <><Spinner color="white" /> Verifying...</> : 'Verify Email'}
                                </button>
                            </form>

                            <div className="pt-6 border-t border-slate-100 w-full">
                                <p className="text-slate-500 text-sm font-medium mb-3">Didn't receive the code?</p>
                                <button 
                                    onClick={handleResendOtp}
                                    disabled={resendTimer > 0 || submitting}
                                    className="text-blue-600 font-bold hover:text-blue-700 disabled:text-slate-400 transition-colors"
                                >
                                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* FORM STATE */
                        <div className="w-full max-w-[400px] space-y-4">
                            {/* Header */}
                            <div className="space-y-1.5">
                                <div className="lg:hidden flex items-center gap-2.5 mb-6">
                                    <SoloParkLogo showText={true} className="w-8 h-8" textClass="text-xl" lightText={false} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
                                    Create Your <span className="text-blue-600">Account.</span>
                                </h2>
                                <p className="text-sm text-slate-400 font-normal">
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

                            <form onSubmit={handleSubmit} className="space-y-4 pb-0">
                                {/* Role Selection */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2.5 uppercase tracking-wider ml-1">I am registering as a...</label>
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {[
                                            { id: 'student', label: 'Student', icon: <FaShieldAlt className="rotate-180 text-lg" /> },
                                            { id: 'teacher', label: 'Teacher', icon: <FaShieldAlt className="scale-110 text-lg" /> },
                                            { id: 'guard', label: 'Guard', icon: <FaShieldAlt className="text-lg" /> }
                                        ].map((role) => (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => setUserType(role.id)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 gap-1.5 cursor-pointer ${userType === role.id
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/5'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                                    }`}
                                            >
                                                <div className={`${userType === role.id ? 'text-white' : 'text-slate-400'}`}>
                                                    {role.icon}
                                                </div>
                                                <span className="text-[9px] font-black tracking-widest uppercase">{role.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3.5">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <FaUser className="text-sm" />
                                            </div>
                                            <input type="text" required
                                                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm"
                                                value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">Email Address</label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors text-sm ${emailStatus === 'available' ? 'text-emerald-500' :
                                                    emailStatus === 'invalid' || emailStatus === 'taken' ? 'text-red-500' :
                                                        'text-slate-400 group-focus-within:text-blue-500'
                                                }`}><FaEnvelope /></div>
                                            <input type="email" required
                                                className={`w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 transition-all font-semibold text-slate-800 focus:bg-white placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm ${emailBorderClass}`}
                                                value={email} onChange={handleEmailChange}
                                                placeholder="you@email.com" />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                {emailStatus === 'loading' && <Spinner />}
                                                {emailStatus === 'available' && <FaCheckCircle className="text-emerald-500" />}
                                                {(emailStatus === 'taken' || emailStatus === 'invalid') && <FaTimesCircle className="text-red-500" />}
                                            </div>
                                        </div>
                                        {emailMsg && (
                                            <p className={`text-[10px] mt-1.5 ml-2 font-bold ${emailStatus === 'available' ? 'text-emerald-600' :
                                                    emailStatus === 'taken' || emailStatus === 'invalid' ? 'text-red-500' :
                                                        'text-slate-400'
                                                }`}>{emailMsg}</p>
                                        )}
                                    </div>


                                    {/* Vehicle Number */}
                                    {userType !== 'guard' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">
                                                Vehicle Number <span className="text-slate-400 font-normal ml-1 lowercase italic">(optional)</span>
                                            </label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                    <FaCar className="text-sm" />
                                                </div>
                                                <input type="text"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal uppercase tracking-widest shadow-sm text-sm"
                                                    value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                                                    placeholder="BA 1 PA 1234" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <FaLock className="text-sm" />
                                            </div>
                                            <input type={showPassword ? "text" : "password"} required minLength={6}
                                                className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm"
                                                value={password} onChange={(e) => setPassword(e.target.value)}
                                                placeholder="At least 6 characters" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative group">
                                            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors text-sm ${passwordsMatch ? 'text-emerald-500' : passwordMismatch ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-500'
                                                }`}><FaLock /></div>
                                            <input type={showConfirm ? "text" : "password"} required
                                                className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 transition-all focus:bg-white font-semibold text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm text-sm ${passwordsMatch ? 'border-emerald-400 focus:ring-emerald-500/10' :
                                                        passwordMismatch ? 'border-red-400 focus:ring-red-500/10' :
                                                            'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                                                    }`}
                                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Repeat password" />
                                            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                                {showConfirm ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                                            </button>
                                        </div>
                                        {passwordMismatch && <p className="text-[10px] text-red-500 font-bold mt-1.5 ml-2">Passwords do not match</p>}
                                        {passwordsMatch && <p className="text-[10px] text-emerald-600 font-bold mt-1.5 ml-2">✓ Passwords match</p>}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button type="submit" disabled={!canSubmit || submitting}
                                        className="w-full bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl transition-all duration-300 font-bold text-sm shadow-lg shadow-slate-900/10 focus:ring-4 focus:ring-slate-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer">
                                        {submitting ? (
                                            <><Spinner color="white" /> Sending Code...</>
                                        ) : (
                                            <>Register Now <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-60 text-xs" /></>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 text-center pb-12 lg:pb-0 border-t border-slate-100 pt-4">
                                <p className="text-slate-400 font-normal text-sm">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline underline-offset-4 transition-colors">
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
