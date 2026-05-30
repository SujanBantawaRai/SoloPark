import React from 'react';
import { FaCarSide, FaCalendarCheck, FaChartLine, FaBuilding, FaBell, FaChartBar } from 'react-icons/fa';

const features = [
    {
        icon: <FaCarSide />,
        title: 'Real-Time Availability',
        desc: 'See exactly how many spots are open across every campus lot, updated instantly as vehicles enter and exit.',
    },
    {
        icon: <FaCalendarCheck />,
        title: 'Seamless Booking',
        desc: 'Reserve your parking spot in seconds with our intuitive booking system. No more circling the lot hoping for space.',
    },
    {
        icon: <FaChartLine />,
        title: 'Automated Tracking',
        desc: 'Our smart sensors track vehicle entry and exit automatically, giving you accurate data, and it will be handled by guard.',
    },
    {
        icon: <FaBuilding />,
        title: 'Multi-Institute Support',
        desc: 'One platform that scales across multiple campuses and institutions. Centralized management, distributed control.',
    },
    {
        icon: <FaBell />,
        title: 'Instant Notifications',
        desc: 'Get alerts when your spot is ready, when time is running out, or when better options become available.',
    },
    {
        icon: <FaChartBar />,
        title: 'Analytics Dashboard',
        desc: 'Powerful insights into parking patterns, peak hours, and utilization rates to optimize your campus operations.',
    },
];

const FeaturesSection = () => {
    return (
        <section id="features" className="py-24 bg-white scroll-mt-[68px]">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-14">
                    <span className="text-blue-600 font-semibold text-[11px] tracking-widest uppercase mb-3 block">
                        Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
                        Everything you need to
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            transform
                        </span>{' '}
                        campus parking
                    </h2>
                    <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
                        Powerful tools designed specifically for modern educational institutions.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-slate-100 hover:border-blue-100 transition-all duration-300 group cursor-default"
                        >
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-[17px] mb-5 group-hover:bg-blue-100 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-[15px] font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
