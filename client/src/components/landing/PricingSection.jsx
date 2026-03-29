import React from 'react';
import { FaCheck } from 'react-icons/fa';

const plans = [
    {
        name: "Starter",
        price: "Free",
        desc: "Perfect for single buildings or small lots.",
        features: ["Up to 50 parking slots", "Basic user roles (Student/Guard)", "Real-time slot availability", "Standard email support"],
        buttonProps: "bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300",
        popular: false
    },
    {
        name: "Campus Pro",
        price: "$299",
        period: "/mo",
        desc: "Ideal for growing colleges and universities.",
        features: ["Up to 500 parking slots", "Advanced RBAC management", "Multi-institute portal access", "Detailed analytics & reporting", "Priority 24/7 support"],
        buttonProps: "bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700",
        popular: true
    },
    {
        name: "Enterprise",
        price: "Custom",
        desc: "For massive unversity networks.",
        features: ["Unlimited parking slots", "Custom integrations (ERP/SSO)", "Dedicated success manager", "White-labeled application", "On-premise deployment option"],
        buttonProps: "bg-slate-900 text-white hover:bg-slate-800",
        popular: false
    }
];

const PricingSection = () => {
    return (
        <section className="py-10 bg-white relative">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-7">
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-base text-slate-600 font-light">
                        No hidden fees. Choose the plan that scales with your institution's needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto items-center">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx} 
                            className={`rounded-2xl p-5 relative transition-all duration-300 hover:-translate-y-1
                                ${plan.popular ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' : 'bg-white border text-slate-800 border-slate-100 shadow-sm'}
                            `}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider py-0.5 px-3 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            
                            <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>{plan.name}</h3>
                            <p className={`text-xs mb-4 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                            
                            <div className="mb-4 flex items-end">
                                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                                {plan.period && <span className={`text-base ml-1.5 mb-0.5 font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>}
                            </div>
                            
                            <button className={`w-full py-2.5 rounded-lg font-bold transition-all mb-4 ${plan.buttonProps}`}>
                                Get Started
                            </button>
                            
                            <div className="space-y-2">
                                {plan.features.map((feat, i) => (
                                    <div key={i} className="flex items-start">
                                        <div className={`mt-0.5 mr-2.5 flex-shrink-0 ${plan.popular ? 'text-blue-400' : 'text-blue-600'}`}>
                                            <FaCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-xs ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
