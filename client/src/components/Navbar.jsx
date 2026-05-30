import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import SoloParkLogo from './landing/SoloParkLogo';
import {
    FaSignOutAlt, FaThLarge, FaBars, FaTimes,
    FaChevronLeft, FaChevronRight, FaCar, FaUsers, FaChartLine, FaHistory
} from 'react-icons/fa';

// Inline zone icon (calendar/grid style)
const ZoneIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M4 5h2v2H4zm0 4h2v2H4zm0 4h2v2H4zm4-8h2v2H8zm0 4h2v2H8zm0 4h2v2H8zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zm4-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zM2 3v18h20V3H2zm18 16H4V5h16v14z" />
    </svg>
);

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    
    // Persistent sidebar collapse state
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar-collapsed', String(next));
            return next;
        });
    };

    if (!user) return null;

    // Define menu items dynamically based on roles
    const getMenuItems = () => {
        if (user.role === 'admin' || user.role === 'super_admin') {
            const items = [
                { name: 'Dashboard', path: '/admin?tab=overview', tabKey: 'overview', icon: <FaThLarge className="text-lg" /> },
                { name: 'Analytics', path: '/admin?tab=analytics', tabKey: 'analytics', icon: <FaChartLine className="text-lg" /> },
                { name: 'Slots', path: '/admin?tab=slots', tabKey: 'slots', icon: <FaCar className="text-lg" /> },
                { name: 'Users', path: '/admin?tab=users', tabKey: 'users', icon: <FaUsers className="text-lg" /> },
            ];
            if (user.role === 'super_admin') {
                items.push({ name: 'System Logs', path: '/admin?tab=logs', tabKey: 'logs', icon: <FaHistory className="text-lg" /> });
            }
            return items;
        } else if (user.userType === 'guard') {
            return [
                { name: 'Bookings', path: '/guard?tab=bookings', tabKey: 'bookings', icon: <FaThLarge className="text-lg" /> },
                { name: 'Slots', path: '/guard?tab=slots', tabKey: 'slots', icon: <FaCar className="text-lg" /> },
                { name: 'Logs', path: '/guard?tab=logs', tabKey: 'logs', icon: <FaHistory className="text-lg" /> },
            ];
        } else {
            // Student / Teacher / User — includes zone navigation links
            return [
                { name: 'Dashboard',  path: '/student',          tabKey: '', icon: <FaThLarge className="text-lg" /> },
                { name: 'HCK Block',  path: '/student/zone/HCK', tabKey: '', icon: <ZoneIcon /> },
                { name: 'WLV Block',  path: '/student/zone/WLV', tabKey: '', icon: <ZoneIcon /> },
                { name: 'ING Block',  path: '/student/zone/ING', tabKey: '', icon: <ZoneIcon /> },
            ];
        }
    };

    const menuItems = getMenuItems();

    const isPathActive = (path, tabKey) => {
        const basePath = path.split('?')[0];
        if (location.pathname !== basePath) return false;
        if (tabKey) {
            const currentTab = new URLSearchParams(location.search).get('tab') || 'overview';
            // Guard dashboard default tab is bookings
            const defaultTab = basePath === '/guard' ? 'bookings' : 'overview';
            return (currentTab === tabKey) || (currentTab === '' && tabKey === defaultTab);
        }
        return true;
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-slate-300 font-sans relative select-none">
            {/* Collapse Toggle Button (Desktop Only) */}
            <button
                onClick={toggleCollapse}
                className="hidden lg:flex absolute right-0 top-12 translate-x-1/2 w-6 h-6 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-md items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer z-50"
            >
                {isCollapsed ? <FaChevronRight className="text-[10px]" /> : <FaChevronLeft className="text-[10px]" />}
            </button>

            {/* Logo Section */}
            <div className={`h-14 px-4 border-b border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <Link to="/" className="flex items-center group" onClick={() => setIsOpen(false)}>
                    <SoloParkLogo showText={!isCollapsed} className="w-8 h-8" textClass="text-[15px]" lightText={true} />
                </Link>
            </div>

            {/* Menu Links Section */}
            <div className="flex-grow px-2 py-5 space-y-0.5">
                {menuItems.map((item) => {
                    const active = isPathActive(item.path, item.tabKey);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center transition-all duration-200 group relative ${
                                isCollapsed
                                    ? 'justify-center w-10 h-10 mx-auto rounded-xl'
                                    : 'space-x-2.5 px-3 py-2 rounded-lg'
                            } ${
                                active
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400'
                            }`}
                        >
                            <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 transition-colors'}>
                                {item.icon}
                            </span>
                            {!isCollapsed && (
                                <span className="text-sm font-semibold animate-fade-in">{item.name}</span>
                            )}
                            {!isCollapsed && active && (
                                <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                            )}
                            
                            {/* Hover Tooltip in Collapsed State */}
                            {isCollapsed && (
                                <div className="absolute left-16 hidden group-hover:block bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-800 z-50 pointer-events-none animate-fade-in">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* User Info / Role Badge */}
            <div className="border-t border-slate-800/80 bg-slate-950/40">
                <div className={`p-4 ${isCollapsed ? 'flex flex-col items-center' : 'block'}`}>
                    <Link to="/profile" className={`flex items-center transition-colors ${
                        isCollapsed 
                            ? 'justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-slate-700/50 text-white font-extrabold shadow-md hover:scale-105 group relative' 
                            : 'space-x-3 p-2 bg-slate-800/20 border border-slate-800/40 hover:bg-slate-800/35 rounded-xl'
                    }`}>
                        {isCollapsed ? (
                            <>
                                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-slate-900 animate-pulse"></span>
                                
                                {/* Avatar Tooltip in Collapsed State */}
                                <div className="absolute left-16 hidden group-hover:block bg-slate-950 text-white text-xs p-3 rounded-xl border border-slate-800 shadow-xl z-50 pointer-events-none animate-fade-in">
                                    <p className="font-bold whitespace-nowrap">{user.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider mt-0.5">{user.role}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
                                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate leading-snug">{user.name}</p>
                                    <div className="flex items-center mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{user.role.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </Link>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`mt-3 flex items-center bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 transition-all text-sm font-semibold cursor-pointer ${
                            isCollapsed
                                ? 'w-10 h-10 justify-center rounded-xl relative group'
                                : 'w-full space-x-2 py-2.5 px-4 rounded-xl'
                        }`}
                    >
                        <FaSignOutAlt className={isCollapsed ? "text-lg" : "text-base"} />
                        {!isCollapsed && <span>Logout</span>}
                        
                        {/* Logout Tooltip in Collapsed State */}
                        {isCollapsed && (
                            <div className="absolute left-16 hidden group-hover:block bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-slate-800 z-50 pointer-events-none animate-fade-in">
                                Logout
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Left side) */}
            <aside className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-slate-800 bg-slate-900 shrink-0 z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-52'}`}>
                <SidebarContent />
            </aside>

            {/* Mobile Top Header */}
            <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800 w-full fixed top-0 left-0 z-40">
                <Link to="/" className="flex items-center group">
                    <SoloParkLogo showText={true} className="w-7 h-7" textClass="text-[15px]" lightText={true} />
                </Link>

                <div className="flex items-center space-x-3">
                    {user.userType !== 'guard' && <NotificationBell dark={true} />}
                    <div className="flex items-center px-2 py-0.5 bg-slate-800 rounded-full border border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase text-slate-300">{user.role}</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 cursor-pointer"
                    >
                        {isOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer Drawer Backdrop */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Mobile Drawer (Left sliding menu) */}
            <div className={`lg:hidden fixed inset-y-0 left-0 w-64 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
                {/* Mobile views are always expanded for touch targets */}
                <div className="w-full h-full bg-slate-900 text-slate-300 font-sans relative">
                    <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
                        <Link to="/" className="flex items-center group" onClick={() => setIsOpen(false)}>
                            <SoloParkLogo showText={true} className="w-8 h-8" textClass="text-[17px]" lightText={true} />
                        </Link>
                    </div>

                    <div className="flex-grow px-4 py-6 space-y-2">
                        {menuItems.map((item) => {
                            const active = isPathActive(item.path, item.tabKey);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                                        active
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                            : 'hover:bg-slate-800/50 hover:text-slate-100 text-slate-400'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span className="text-sm font-semibold">{item.name}</span>
                                    {active && (
                                        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="absolute bottom-0 left-0 w-full border-t border-slate-800/80 bg-slate-950/40 p-4">
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 p-2 bg-slate-800/20 border border-slate-800/40 hover:bg-slate-800/35 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shrink-0">
                                {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <p className="text-sm font-bold text-white truncate leading-snug">{user.name}</p>
                                <div className="flex items-center mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">{user.role.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-3 flex items-center justify-center space-x-2 bg-slate-800/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 py-2.5 px-4 rounded-xl border border-slate-800 hover:border-red-500/20 transition-all text-sm font-semibold cursor-pointer"
                        >
                            <FaSignOutAlt className="text-base" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
