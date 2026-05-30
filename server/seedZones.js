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

        // HCK Block (50 slots: 1-50. 5 Visitor, 45 Student)
        for (let i = 1; i <= 50; i++) {
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

        // WLV Block (60 slots total. B1: 1-8 Car, B2: 9-48 Bike/Scooter, B3: 49-60 Car)
        for (let i = 1; i <= 60; i++) {
            let vType = 'Car';
            if (i >= 9 && i <= 48) vType = 'Scooter';

            slots.push({
                slotNumber: `WLV-${i}`,
                zoneName: 'WLV',
                zone: 'WLV Block',
                vehicleType: vType,
                slotType: 'Student',
                status: 'free',
                isBooked: false
            });
        }

        // ING Block (110 slots: C4=1-20, C1=21-50, C3=51-70, C2=71-110. All Scooter/Bike)
        for (let i = 1; i <= 110; i++) {
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
