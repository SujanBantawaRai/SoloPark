import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaParking, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const isDashboard = location.pathname.includes('/student') || location.pathname.includes('/guard') || location.pathname.includes('/admin');

    return (
        <nav className="glass-nav sticky top-0 z-50 text-white w-full transition-all duration-300">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-2 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                            <FaParking className="text-2xl text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                            SoloPark
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        {user ? (
                            <div className="flex items-center space-x-6">
                                {/* Role Badge */}
                                <div className="hidden sm:flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/10">
                                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                    <span className="text-sm font-medium capitalize text-slate-200">{user.role}</span>
                                </div>

                                {!isDashboard && (
                                    <Link
                                        to={(user.role === 'admin' || user.role === 'super_admin') ? '/admin' : (user.userType === 'guard') ? '/guard' : '/student'}
                                        className="text-slate-300 hover:text-white font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                <div className="flex items-center space-x-3 pl-4 border-l border-white/20">
                                    <div className="flex flex-col items-end hidden sm:flex">
                                        <span className="text-sm font-semibold">{user.name}</span>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-2 bg-white/10 hover:bg-blue-500/20 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all border border-transparent hover:border-blue-500/30"
                                        title="Profile"
                                    >
                                        <FaUserCircle />
                                        <span className="font-medium hidden sm:inline">Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-300 px-4 py-2 rounded-lg transition-all border border-transparent hover:border-red-500/30"
                                        title="Logout"
                                    >
                                        <FaSignOutAlt />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-0.5">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
