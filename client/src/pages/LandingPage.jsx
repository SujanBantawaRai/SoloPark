import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <h1 className="text-5xl font-extrabold text-slate-800 mb-6">
                Smart Campus <span className="text-blue-600">Parking</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                Real-time parking availability, seamless booking, and hassle-free entry for students, staff, and visitors.
            </p>

            <div className="flex space-x-4">
                {user ? (
                    <Link
                        to={user.role === 'admin' ? '/admin' : user.role === 'guard' ? '/guard' : '/dashboard'}
                        className="bg-blue-600  text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                    >
                        Go to Dashboard
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg">
                            Get Started
                        </Link>
                        <Link to="/register" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg">
                            Create Account
                        </Link>
                    </>
                )}
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="text-4xl mb-4">🚗</div>
                    <h3 className="text-xl font-bold mb-2">Real-time Availability</h3>
                    <p className="text-gray-600">Check free slots instantly before you arrive.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
                    <p className="text-gray-600">Reserve your spot in advance to save time.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h3 className="text-xl font-bold mb-2">Secure & Managed</h3>
                    <p className="text-gray-600">24/7 monitoring and role-based access control.</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
