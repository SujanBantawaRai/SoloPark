import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
    {
        number: '01',
        title: 'Find Your Spot',
        description:
            'Open the website and see real-time availability across all campus parking lots. Filter by proximity, permit type, or accessibility.',
        image:
            'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
    },
    {
        number: '02',
        title: 'Book Your Space',
        description:
            'Reserve your preferred spot in seconds. Receive an booking confirmation with everything you need to park with confidence.',
        image:
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
    },
    {
        number: '03',
        title: 'Park & Verify',
        description:
            'Arrive at your reserved spot, get verified by the smart gate system, and enjoy a completely stress-free parking experience.',
        image:
            'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80',
    },
];

const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="py-24 bg-white border-t border-slate-100 scroll-mt-[68px]">
            <div className="max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <div className="mb-20">
                    <span className="text-blue-600 font-semibold text-[11px] tracking-widest uppercase mb-3 block">
                        How It Works
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4 max-w-2xl">
                        Park smarter in{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            three simple steps
                        </span>
                    </h2>
                    <p className="text-slate-500 text-base max-w-sm leading-relaxed">
                        No complex setup. No training required. Just open website, find, and park.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-24">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className={`flex flex-col ${
                                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                            } items-center gap-12 lg:gap-20`}
                        >
                            {/* Image */}
                            <div className="w-full lg:w-1/2">
                                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 shadow-sm">
                                    <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="w-full lg:w-1/2">
                                <span className="text-[80px] font-extrabold leading-none text-blue-100 block mb-1 select-none">
                                    {step.number}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 -mt-2">
                                    {step.title}
                                </h3>
                                <p className="text-base text-slate-500 leading-relaxed max-w-sm">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 pt-12 border-t border-slate-100 text-center">
                    <p className="text-slate-500 text-base mb-5">Ready to transform your campus parking?</p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-[15px] shadow-lg shadow-blue-500/20 transition-all duration-200"
                    >
                        Get Started for Free
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
