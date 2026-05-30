import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const CTASection = () => {
    return (
        <section className="pt-16 pb-36 bg-gradient-to-b from-slate-50 via-indigo-50/10 to-white relative overflow-hidden border-t border-slate-100/50">
            {/* Subtle decorative background gradients/orbs */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-80 h-80 bg-blue-200/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-purple-200/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
                {/* Upper Subtitle label */}
                <span className="text-blue-600 font-semibold text-[11px] tracking-widest uppercase mb-4 block">
                    GET STARTED TODAY
                </span>

                {/* Heading */}
                <h2 className="text-4xl md:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.2] mb-6">
                    Ready to transform your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        campus
                    </span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
                        parking
                    </span>
                    ?
                </h2>

                {/* Subtitle description */}
                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8 font-light">
                    Join 50+ institutions already using SoloPark to eliminate parking
                    <br className="hidden sm:inline" />
                    chaos and create a better experience for everyone on campus.
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-[14px] shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                        Start Free  <FaArrowRight className="text-[11px]" />
                    </Link>
                    <Link
                        to="/register"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-full font-semibold text-[14px] border border-slate-200 shadow-sm transition-all duration-300"
                    >
                        <svg
                            className="w-4 h-4 text-slate-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        Schedule a Demo
                    </Link>
                </div>

                {/* Footnote */}
                <p className="text-[12px] text-slate-400 font-normal tracking-wide mt-6">
                    Smart parking management at your fingertips.
                </p>
            </div>
        </section>
    );
};

export default CTASection;
