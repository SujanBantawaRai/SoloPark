import React from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const testimonials = [
    {
        name: "Nawal Ghimire",
        role: "Computer Science Student",
        content: "SoloPark completely eliminated my stress of finding a parking spot before my 8 AM lectures. The real-time slot checking is a lifesaver.",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
        name: "Prof. Michael Chen",
        role: "Faculty Member",
        content: "The reserved VIP section for teachers ensures I never have to worry about parking when arriving for back-to-back classes.",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=11"
    },
    {
        name: "David Ross",
        role: "Chief Security Officer",
        content: "Managing multiple gates across three different campus zones used to be a nightmare. Now, the Guard Dashboard handles it flawlessly.",
        rating: 5,
        avatar: "https://i.pravatar.cc/150?img=33"
    }
];

const TestimonialsSection = () => {
    return (
        <section className="py-10 bg-slate-50 relative">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-7">
                    <span className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-2 block">Trusted by the Community</span>
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                        Don't just take our word for it.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                    {testimonials.map((testial, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative group">
                            <FaQuoteLeft className="text-3xl text-blue-100 absolute top-5 left-5 -z-10 group-hover:scale-110 transition-transform" />
                            
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(testial.rating)].map((_, i) => (
                                    <FaStar key={i} className="w-4 h-4" />
                                ))}
                            </div>
                            
                            <p className="text-sm text-slate-600 leading-relaxed font-light mb-3 italic relative z-10">
                                "{testial.content}"
                            </p>
                            
                            <div className="flex items-center gap-3 mt-auto">
                                <img 
                                    src={testial.avatar} 
                                    alt={testial.name} 
                                    className="w-10 h-10 rounded-full ring-2 ring-blue-50"
                                />
                                <div>
                                    <h4 className="font-bold text-sm text-slate-800">{testial.name}</h4>
                                    <p className="text-xs text-slate-500">{testial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
