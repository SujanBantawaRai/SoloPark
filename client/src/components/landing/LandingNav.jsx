import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SoloParkLogo from './SoloParkLogo';

const LandingNav = ({ user }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 bg-white transition-all duration-300 ${
                scrolled ? 'border-b border-slate-200 shadow-sm' : 'border-b border-slate-100'
            }`}
        >
            <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-6 h-[68px] grid grid-cols-2 md:grid-cols-3 items-center">
                {/* Logo */}
                <div className="flex justify-start">
                    <Link to="/">
                        <SoloParkLogo showText={true} textClass="text-[17px]" />
                    </Link>
                </div>

                {/* Center Nav Links */}
                <nav className="hidden md:flex items-center justify-center gap-8">
                    {[
                        { id: 'features', label: 'Features' },
                        { id: 'how-it-works', label: 'How It Works' },
                        { id: 'testimonials', label: 'Testimonials' },
                    ].map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => scrollToSection(id)}
                            className="text-[14px] font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center justify-end gap-3">
                    {!user && (
                        <Link
                            to="/login"
                            className="hidden sm:inline-flex items-center justify-center h-[40px] px-6 rounded-full border-2 border-slate-900 text-slate-900 font-bold text-[13px] tracking-wider hover:bg-slate-900/5 transition-all duration-300"
                        >
                            LOG IN
                        </Link>
                    )}

                    {/* PARK YOUR CAR – Premium Spinning Border Button */}
                    <Link
                        to={user
                            ? ((user.role === 'admin' || user.role === 'super_admin') ? '/admin' : (user.userType === 'guard') ? '/guard' : '/student')
                            : '/register'
                        }
                        className="group relative inline-flex items-center justify-center h-[40px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                        style={{ minWidth: '160px' }}
                    >
                        {/* Layer 1: Default spinning conic border */}
                        <div className="absolute inset-0 rounded-full overflow-hidden opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                            <div className="absolute w-[200%] h-[500%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(168,85,247,0.5)_20%,rgba(168,85,247,1)_50%,transparent_80%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute inset-[2px] rounded-full bg-[#0A0A0A] ring-1 ring-inset ring-white/5" />
                        </div>

                        {/* Layer 2: Hover gradient fill */}
                        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out bg-gradient-to-r from-[#d8b4fe] via-[#a855f7] to-[#6366f1]" />

                        {/* Layer 3: Text */}
                        <div className="relative flex items-center justify-center px-4 font-bold text-[10px] tracking-[0.15em] text-white z-10 w-full h-full pointer-events-none">
                            {user ? (
                                <span className="uppercase tracking-[0.15em]">GO TO DASHBOARD</span>
                            ) : (
                                <span className="grid items-center justify-items-center w-full h-full">
                                    <span className="col-start-1 row-start-1 flex items-center transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-6 group-hover:opacity-0 uppercase">
                                        PARK YOUR CAR
                                    </span>
                                    <span className="col-start-1 row-start-1 flex items-center gap-1.5 transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 uppercase">
                                        <span>REGISTER</span>
                                        <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </span>
                                </span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default LandingNav;
