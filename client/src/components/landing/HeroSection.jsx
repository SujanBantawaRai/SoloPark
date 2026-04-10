import React from 'react';
import { Link } from 'react-router-dom';
import { FaParking, FaArrowRight } from 'react-icons/fa';

const HeroSection = ({ user }) => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
            {/* ── Fixed Top Header ── */}
            <div className="absolute top-0 left-0 w-full px-6 py-6 lg:px-10 lg:py-8 z-50 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="inline-flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-all">
                        S
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-800">SoloPark</span>
                </Link>

                {/* Right CTA Button (Reference Style) */}
                <Link 
                    to={user ? ((user.role === 'admin' || user.role === 'super_admin') ? '/admin' : (user.userType === 'guard') ? '/guard' : '/student') : '/register'} 
                    className="group relative inline-flex items-center justify-center h-[48px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:-translate-y-0.5"
                    style={{ minWidth: "185px" }}
                >
                    {/* Layer 1: Default State with Spinning Border */}
                    <div className="absolute inset-0 rounded-full overflow-hidden opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                        <div className="absolute w-[200%] h-[500%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(168,85,247,0.5)_20%,rgba(168,85,247,1)_50%,transparent_80%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A] ring-1 ring-inset ring-white/5"></div>
                    </div>

                    {/* Layer 2: Hover State Full-Bleed Luminous Gradient */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out bg-gradient-to-r from-[#d8b4fe] via-[#a855f7] to-[#6366f1]"></div>

                    {/* Layer 3: Content Shell */}
                    <div className="relative flex items-center justify-center px-4 font-bold text-[11px] tracking-[0.15em] text-white z-10 w-full h-full pointer-events-none">
                        {user ? (
                            <span className="w-full text-center uppercase tracking-[0.15em]">GO TO DASHBOARD</span>
                        ) : (
                            <span className="grid items-center justify-items-center w-full h-full">
                                {/* Default Text */}
                                <span className="col-start-1 row-start-1 flex items-center transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-6 group-hover:opacity-0 uppercase">
                                    PARK YOUR CAR
                                </span>
                            
                                {/* Hover Text */}
                                <span className="col-start-1 row-start-1 flex items-center gap-2 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 uppercase">
                                    <span>REGISTER</span>
                                    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                    </svg>
                                </span>
                            </span>
                        )}
                    </div>
                </Link>
            </div>
            {/* Animated Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-400/30 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-400/20 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm px-3 py-1.5 rounded-full transform transition hover:scale-105 cursor-default">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-semibold tracking-wide text-slate-800 uppercase">
                            Now supporting multiple institutes
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mt-3 mb-3">
                        The Future of <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Smart Campus Parking.
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-slate-600 mb-4 max-w-2xl mx-auto font-light leading-relaxed">
                        Say goodbye to parking chaos. Real-time availability, seamless booking, and automated tracking for
                        <strong className="font-semibold text-slate-800"> Users</strong>.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {user ? (
                            <Link
                                to={(user.role === 'admin' || user.role === 'super_admin') ? '/admin' : (user.userType === 'guard') ? '/guard' : '/student'}
                                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-1 flex items-center justify-center group"
                            >
                                Enter Dashboard
                                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="w-full sm:w-auto px-8 py-3.5 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-2xl font-bold text-[15px] tracking-wide shadow-[0_12px_35px_-10px_rgba(37,99,235,0.7)] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.9)] transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                                >
                                    Get Started for Free
                                </Link>
                                <Link
                                    to="/login"
                                    className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold text-base shadow-sm transition-all hover:-translate-y-1 flex items-center justify-center"
                                >
                                    Login to Account
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-6 pt-4 border-t border-slate-200/60 max-w-2xl mx-auto">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">Trusted by Forward-Thinking Institutions</p>
                        <div className="flex justify-center items-center gap-6 md:gap-12 opacity-50 grayscale">
                            <div className="text-lg font-black italic tracking-tighter">TECH INTL.</div>
                            <div className="text-lg font-bold font-serif">St. John's Uni</div>
                            <div className="text-lg font-mono font-bold tracking-tight">/WLV ACADEMY/</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
