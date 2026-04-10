import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import SlotCard from '../components/SlotCard';
import BookingModal from '../components/BookingModal';

const UserDashboard = () => {
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [slotsRes, bookingsRes] = await Promise.all([
                api.get('/slots'),
                api.get('/bookings/mybookings')
            ]);
            setSlots(slotsRes.data);
            setBookings(bookingsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setLoading(false);
        }
    };

    const handleBookSlot = (slot) => {
        setSelectedSlot(slot);
        setError('');
        setSuccessMessage('');
    };

    const confirmBooking = async (bookingData) => {
        try {
            await api.post('/bookings', bookingData);
            setSuccessMessage('Booking successful!');
            setSelectedSlot(null);
            fetchData(); // Refresh data immediately
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            await api.put(`/bookings/${id}/cancel`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Cancellation failed');
        }
    };

    // Filter slots based on user role preferred zones/types, or just show all
    // For simplicity, showing all but highlighting compatible ones could be better.
    // Let's filter visually or sort.
    const filteredSlots = slots.filter(slot => slot.isActive);

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}</h1>
                <p className="text-gray-600">Select an available parking slot to book.</p>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}
            {successMessage && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">{successMessage}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Slots */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Live Parking Status</h2>

                    {['Zone A', 'Zone B', 'Zone C'].map(zone => (
                        <div key={zone} className="mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">{zone}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredSlots.filter(s => s.zone === zone).map(slot => (
                                    <SlotCard key={slot._id} slot={slot} onBook={handleBookSlot} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column: Active Bookings / History */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
                        {bookings.length === 0 ? (
                            <p className="text-gray-500">No active bookings found.</p>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map(booking => (
                                    <div key={booking._id} className="border-b pb-4 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg">{booking.slot.slotNumber}</h4>
                                                <p className="text-sm text-gray-600 font-mono">{booking.vehicleNumber}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs capitalize ${booking.status === 'active' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <p>From: {new Date(booking.startTime).toLocaleString()}</p>
                                            <p>To: {new Date(booking.endTime).toLocaleString()}</p>
                                        </div>
                                        {booking.status === 'active' && (
                                            <button
                                                onClick={() => cancelBooking(booking._id)}
                                                className="mt-2 text-red-600 text-sm hover:underline"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedSlot && (
                <BookingModal
                    slot={selectedSlot}
                    onClose={() => setSelectedSlot(null)}
                    onConfirm={confirmBooking}
                    defaultVehicleNumber={user?.vehicleNumber}
                />
            )}
        </div>
    );
};

export default UserDashboard;
