/**
 * migrateUsers.js
 * ---------------
 * One-shot migration: maps old role values to the new role + userType schema.
 *
 * Old → New mapping:
 *   admin      → role: admin,  userType: null
 *   guard      → role: user,   userType: guard
 *   student    → role: user,   userType: student
 *   staff      → role: user,   userType: teacher
 *   visitor    → role: user,   userType: null
 *
 * Usage: node server/migrateUsers.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Raw collection access to avoid Mongoose enum validation rejecting old values
const run = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌  MONGO_URI not set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅  Connected to MongoDB');

    const collection = mongoose.connection.db.collection('users');
    const users = await collection.find({}).toArray();

    console.log(`ℹ️   Found ${users.length} user(s) to evaluate.`);

    let migrated = 0;

    for (const user of users) {
        const oldRole = user.role;
        let newRole, newUserType;

        if (oldRole === 'admin' || oldRole === 'super_admin') {
            newRole = oldRole; // keep as-is
            newUserType = null;
        } else if (oldRole === 'guard') {
            newRole = 'user';
            newUserType = 'guard';
        } else if (oldRole === 'staff') {
            newRole = 'user';
            newUserType = 'teacher';
        } else if (oldRole === 'visitor') {
            newRole = 'user';
            newUserType = null;
        } else {
            // student or already 'user'
            newRole = 'user';
            newUserType = 'student';
        }

        if (oldRole !== newRole || user.userType !== newUserType) {
            await collection.updateOne(
                { _id: user._id },
                { $set: { role: newRole, userType: newUserType } }
            );
            console.log(`  ✔  ${user.email}: role '${oldRole}' → '${newRole}', userType → '${newUserType}'`);
            migrated++;
        } else {
            console.log(`  –  ${user.email}: no change needed`);
        }
    }

    console.log(`\n✅  Migration complete. ${migrated} user(s) updated.`);
    await mongoose.disconnect();
};

run().catch((err) => {
    console.error('❌  Migration error:', err.message);
    process.exit(1);
});
