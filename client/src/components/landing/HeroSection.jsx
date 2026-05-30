import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaSignInAlt } from 'react-icons/fa';
import { HiChevronDown } from 'react-icons/hi';

const HeroSection = ({ user }) => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-[68px] pb-16 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/40">
            {/* Subtle grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(to right, #c7d2fe18 1px, transparent 1px), linear-gradient(to bottom, #c7d2fe18 1px, transparent 1px)',
                    backgroundSize: '52px 52px',
                }}
            />

            {/* Soft blurred gradient orbs */}
            <div className="absolute top-[-5%] left-[-5%] w-[420px] h-[420px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[350px] h-[350px] bg-indigo-200/25 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm px-4 py-1.5 rounded-full mb-7">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[11px] font-semibold tracking-widest text-slate-600 uppercase">
                        Now Supporting Multiple Institutions
                    </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-[72px] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-5">
                    The Future of{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                        Smart
                    </span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700">
                        Campus
                    </span>{' '}
                    Parking.
                </h1>

                {/* Subheadline */}
                <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto leading-relaxed">
                    Say goodbye to parking chaos. Real-time availability, seamless
                    booking, and automated tracking for{' '}
                    <strong className="text-slate-700 font-semibold">Users</strong>.
                </p>

                {/* CTAs */}
                {user ? (
                    <Link
                        to={
                            (user.role === 'admin' || user.role === 'super_admin')
                                ? '/admin'
                                : user.userType === 'guard'
                                ? '/guard'
                                : '/student'
                        }
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-[15px] shadow-lg shadow-blue-500/25 transition-all duration-200"
                    >
                        Enter Dashboard <FaArrowRight className="text-sm" />
                    </Link>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-[15px] shadow-lg shadow-blue-500/25 transition-all duration-200"
                        >
                            Get Started for Free <FaArrowRight className="text-sm" />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-[15px] border border-slate-200 shadow-sm transition-all duration-200"
                        >
                            <FaSignInAlt className="text-slate-400 text-sm" />
                            Login to Account
                        </Link>
                    </div>
                )}

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-3xl mx-auto">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">
                        Trusted by Forward-Thinking Institutions
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2">
                        {[
                            'Tech International',
                            "St. John's University",
                            'WLV Academy',
                            'Northfield College',
                            'Greenfield State',
                            'Metro University',
                        ].map((name) => (
                            <span
                                key={name}
                                className="text-[13px] font-medium text-slate-400 italic"
                            >
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-slate-400 animate-bounce">
                <HiChevronDown className="text-2xl" />
            </div>
        </section>
    );
};

export default HeroSection;
