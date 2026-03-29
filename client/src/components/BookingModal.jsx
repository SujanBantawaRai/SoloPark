import { useState } from 'react';

const BookingModal = ({ slot, onClose, onConfirm, defaultVehicleNumber }) => {
    const [vehicleNumber, setVehicleNumber] = useState(defaultVehicleNumber || '');
    const [arrivalTime, setArrivalTime] = useState(() => {
        const d = new Date();
        d.setMinutes(d.getMinutes() + 5);
        return d.toISOString().slice(0, 16);
    });

    if (!slot) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const start = new Date(arrivalTime);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour grace

        onConfirm({
            slotId: slot._id,
            vehicleNumber,
            startTime: start.toISOString(),
            endTime: end.toISOString()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Book Slot: <span className="text-blue-600">{slot.slotNumber}</span></h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Vehicle Number</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. AB-12-CD-3456"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-1">Arrival Time</label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                            * Slot will be held for 60 minutes after this time.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
