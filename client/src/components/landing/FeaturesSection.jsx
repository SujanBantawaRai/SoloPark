import React from 'react';
import { FaCarSide, FaMobileAlt, FaShieldAlt, FaChartPie, FaBuilding } from 'react-icons/fa';

const features = [
    {
        icon: <FaCarSide />,
        title: "Real-time Availability",
        desc: "Never circle the lot again. View instantly updated parking slot availability before arriving on campus.",
        color: "blue"
    },
    {
        icon: <FaMobileAlt />,
        title: "Seamless Booking",
        desc: "Reserve a dedicated parking space in seconds directly from your mobile device or laptop.",
        color: "purple"
    },
    {
        icon: <FaShieldAlt />,
        title: "Secure Verification",
        desc: "Guards easily verify arrivals and departures using the dashboard, maintaining total security.",
        color: "emerald"
    },
    {
        icon: <FaBuilding />,
        title: "Multi-Institute Support",
        desc: "Designed to scale. Manage multiple campuses, buildings, and uniquely configured zones in one place.",
        color: "orange"
    },
    {
        icon: <FaChartPie />,
        title: "Insightful Analytics",
        desc: "Administrators get comprehensive reports on parking utilization, peak hours, and user behavior.",
        color: "rose"
    }
];

const FeaturesSection = () => {
    return (
        <section className="py-10 bg-white relative">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-7">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        Everything you need to <br />manage parking perfectly.
                    </h2>
                    <p className="text-base text-slate-600 leading-relaxed font-light">
                        Built entirely around the needs of educational institutions. SoloPark offers specialized tools for students, teachers, guards, and administrative staff.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 p-5 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 group"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 shadow-sm
                                ${feature.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                                ${feature.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                                ${feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : ''}
                                ${feature.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                                ${feature.color === 'rose' ? 'bg-rose-100 text-rose-600' : ''}
                            `}>
                                {feature.icon}
                            </div>
                            <h3 className="text-base font-bold mb-2 text-slate-800">{feature.title}</h3>
                            <p className="text-sm text-slate-600 leading-relaxed font-light">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
