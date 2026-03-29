import React from 'react';

const institutes = [
    {
        name: "Herald College Kathmandu",
        type: "University Campus",
        slots: "150+ Slots Managed",
        bg: "bg-blue-500",
        img: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Wolverhampton University",
        type: "International Branch",
        slots: "85 VIP Slots",
        bg: "bg-indigo-600",
        img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "ING Business School",
        type: "Corporate Institute",
        slots: "300+ Automated Slots",
        bg: "bg-emerald-600",
        img: "https://images.unsplash.com/photo-1592289128526-7bc47971acda?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

const MultiInstituteSection = () => {
    return (
        <section className="py-10 bg-slate-900 text-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-7 gap-4">
                    <div className="max-w-2xl">
                        <span className="text-blue-400 font-bold tracking-wider uppercase text-xs mb-2 block">Scalable Infrastructure</span>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                            Built for campuses of all sizes.
                        </h2>
                        <p className="text-slate-400 text-base font-light leading-relaxed">
                            Whether you're managing a single building parking lot or multiple university campuses spread across a city, SoloPark adapts beautifully to your scale.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {institutes.map((inst, idx) => (
                        <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800">
                            <div className="absolute inset-0 bg-slate-900/60 z-10 transition-opacity duration-300 group-hover:bg-slate-900/40"></div>
                            <img 
                                src={inst.img} 
                                alt={inst.name} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                            />
                            
                            <div className="absolute inset-0 z-20 p-4 flex flex-col justify-end">
                                <div className="transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-md mb-2 ${inst.bg}`}>
                                        {inst.type}
                                    </span>
                                    <h3 className="text-lg font-bold mb-1">{inst.name}</h3>
                                    <p className="text-slate-300 flex items-center text-sm font-medium">
                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {inst.slots}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MultiInstituteSection;
