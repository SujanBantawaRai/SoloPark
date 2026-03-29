const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ParkingSlot = require('./models/ParkingSlot');

dotenv.config();

const seedZones = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Delete existing
        await ParkingSlot.deleteMany({});
        console.log('Slots cleared.');

        const slots = [];

        // HCK Block (35 slots: 1-35. 5 Visitor, 30 Student)
        for (let i = 1; i <= 35; i++) {
            slots.push({
                slotNumber: `HCK-${i}`,
                zoneName: 'HCK',
                zone: 'HCK Block',
                vehicleType: 'Any',
                slotType: i <= 5 ? 'Visitor' : 'Student',
                status: 'free',
                isBooked: false
            });
        }

        // WLV Block (15 slots: 1-15. Car only)
        for (let i = 1; i <= 15; i++) {
            slots.push({
                slotNumber: `WLV-${i}`,
                zoneName: 'WLV',
                zone: 'WLV Block',
                vehicleType: 'Car',
                slotType: 'Student',
                status: 'free',
                isBooked: false
            });
        }

        // ING Block (60 slots: 1-60. Scooter/Bike only) - Using Scooter for enum
        for (let i = 1; i <= 60; i++) {
            slots.push({
                slotNumber: `ING-${i}`,
                zoneName: 'ING',
                zone: 'ING Block',
                vehicleType: 'Scooter',
                slotType: 'Student',
                status: 'free',
                isBooked: false
            });
        }

        await ParkingSlot.insertMany(slots);
        console.log('Slots Seeded!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedZones();
