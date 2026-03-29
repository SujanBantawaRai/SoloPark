const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingSlot = require('./models/ParkingSlot');
const connectDB = require('./config/db');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        await User.deleteMany();
        await ParkingSlot.deleteMany();

        const users = [
            {
                name: 'Admin User',
                email: 'admin@solopark.com',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Guard One',
                email: 'guard@solopark.com',
                password: 'password123',
                role: 'guard'
            },
            {
                name: 'Student One',
                email: 'student@solopark.com',
                password: 'password123',
                role: 'student'
            },
            {
                name: 'Staff One',
                email: 'staff@solopark.com',
                password: 'password123',
                role: 'staff'
            }
        ];

        await User.create(users);

        const slots = [];
        // Create 10 slots for Zone A (Student)
        for (let i = 1; i <= 10; i++) {
            slots.push({
                slotNumber: `A-${i}`,
                zone: 'Zone A',
                slotType: 'student',
                status: 'free'
            });
        }

        // Create 5 slots for Zone B (Staff)
        for (let i = 1; i <= 5; i++) {
            slots.push({
                slotNumber: `B-${i}`,
                zone: 'Zone B',
                slotType: 'staff',
                status: 'free'
            });
        }

        // Create 5 slots for Zone C (Visitor)
        for (let i = 1; i <= 5; i++) {
            slots.push({
                slotNumber: `C-${i}`,
                zone: 'Zone C',
                slotType: 'visitor',
                status: 'free'
            });
        }

        await ParkingSlot.create(slots);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // destroyData(); // Not implemented for safety
} else {
    importData();
}
