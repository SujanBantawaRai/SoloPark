import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden bg-slate-50 pt-16">
            {/* Background Blur Shapes */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/30 hero-shape" style={{ right: '-10%', top: '-10%', animationDelay: '0s' }}></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-300/30 hero-shape" style={{ left: '-15%', bottom: '-20%', animationDuration: '8s', animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-cyan-300/20 hero-shape" style={{ transform: 'translateY(-50%)', animationDuration: '7s', animationDelay: '1s' }}></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    
                    {/* Left Content */}
                    <div className="text-left max-w-2xl animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-medium text-sm mb-6 hover:shadow-md transition">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Welcome to the future of parking
                        </div>
                        
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-800 tracking-tight leading-[1.1] mb-6">
                            Smart Campus <br />
                            <span className="gradient-text">Parking System</span>
                        </h1>
                        
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-light">
                            Real-time parking availability, seamless booking, and hassle-free entry for students, staff, and visitors. Experience parking without the pain.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            {user ? (
                                <Link
                                    to={user.role === 'admin' ? '/admin' : user.role === 'guard' ? '/guard' : '/dashboard'}
                                    className="bg-slate-900 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-800 transition-all hover-lift flex items-center gap-2 shadow-lg shadow-slate-900/20"
                                >
                                    Go to Dashboard
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-700 transition-all hover-lift flex items-center gap-2 shadow-lg shadow-blue-600/25">
                                        Get Started Now
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                                    </Link>
                                    <Link to="/register" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-50 hover:border-slate-300 transition-all hover-lift">
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                        
                        <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                No hidden fees
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                Real-time sync
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Dashboard Preview */}
                    <div className="relative animate-slide-in-right hidden lg:block" style={{ animationDelay: '0.1s' }}>
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-[2rem] blur-3xl opacity-20 transform -rotate-6"></div>
                        
                        <div className="glass-panel rounded-[2rem] border border-white/60 p-6 shadow-2xl relative z-10 transform transition-transform hover:scale-[1.02] duration-500">
                            {/* Dashboard Header Mockup */}
                            <div className="flex items-center justify-between mb-8 border-b border-slate-200/50 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">SP</div>
                                    <div>
                                        <div className="h-2 w-24 bg-slate-200 rounded mb-2"></div>
                                        <div className="h-2 w-16 bg-slate-100 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                                    <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                                </div>
                            </div>
                            
                            {/* Dashboard Stats Mockup */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white/60 rounded-xl p-4 border border-white">
                                    <div className="h-2 w-12 bg-blue-200 rounded mb-3"></div>
                                    <div className="flex items-end gap-2">
                                        <div className="text-3xl font-bold text-slate-800">124</div>
                                        <div className="text-sm text-green-500 font-medium pb-1">+12%</div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Available Spots</div>
                                </div>
                                <div className="bg-white/60 rounded-xl p-4 border border-white">
                                    <div className="h-2 w-16 bg-purple-200 rounded mb-3"></div>
                                    <div className="flex items-end gap-2">
                                        <div className="text-3xl font-bold text-slate-800">85<span className="text-lg">%</span></div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Occupancy Rate</div>
                                </div>
                            </div>
                            
                            {/* Chart Mockup */}
                            <div className="bg-white/60 rounded-xl p-4 border border-white h-32 flex items-end gap-2 px-6">
                                {[40, 70, 45, 90, 65, 80, 50, 100].map((h, i) => (
                                    <div key={i} className="w-full bg-blue-500/20 rounded-t-sm" style={{ height: `${h}%` }}>
                                        <div className="w-full bg-blue-500 rounded-t-sm transition-all duration-1000 ease-out" style={{ height: `${Math.max(20, h - 20)}%` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Floating Element */}
                        <div className="absolute -right-8 -bottom-8 glass-panel border border-white/60 p-4 rounded-2xl shadow-xl animate-toast-in" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">Spot confirmed</div>
                                    <div className="text-xs text-slate-500">Zone A, Bay 12</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="glass-panel p-8 rounded-2xl hover-lift border border-white/50">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🚗</div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">Real-time Availability</h3>
                        <p className="text-slate-600 leading-relaxed">Check free slots instantly from your device before you even arrive on campus.</p>
                    </div>
                    <div className="glass-panel p-8 rounded-2xl hover-lift border border-white/50">
                        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">📅</div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">Seamless Booking</h3>
                        <p className="text-slate-600 leading-relaxed">Reserve your parking spot in advance with a single click to save time and reduce stress.</p>
                    </div>
                    <div className="glass-panel p-8 rounded-2xl hover-lift border border-white/50">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-inner">🛡️</div>
                        <h3 className="text-xl font-bold mb-3 text-slate-800">Secure & Managed</h3>
                        <p className="text-slate-600 leading-relaxed">24/7 monitoring, automated entry gates, and role-based access control for safety.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
