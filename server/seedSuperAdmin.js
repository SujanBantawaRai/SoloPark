/**
 * seedSuperAdmin.js
 * -----------------
 * Run ONCE during initial system setup to create the super_admin account.
 * Usage: node server/seedSuperAdmin.js
 *
 * Required .env keys:
 *   SUPER_ADMIN_NAME     (optional, defaults to "Super Admin")
 *   SUPER_ADMIN_EMAIL
 *   SUPER_ADMIN_PASSWORD
 *   MONGO_URI
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const run = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('❌  MONGO_URI not set in .env');
        process.exit(1);
    }

    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';

    if (!email || !password) {
        console.error('❌  SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('✅  Connected to MongoDB');

    // Safety: never create a second super_admin
    const existing = await User.findOne({ role: 'super_admin' });
    if (existing) {
        console.log(`ℹ️   A super_admin already exists: ${existing.email}. Skipping.`);
        await mongoose.disconnect();
        return;
    }

    // Also check if an account with this email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
        // Promote it to super_admin instead of creating a duplicate
        emailExists.role = 'super_admin';
        emailExists.userType = null;
        await emailExists.save();
        console.log(`✅  Existing account '${email}' promoted to super_admin.`);
    } else {
        await User.create({ name, email, password, role: 'super_admin', userType: null });
        console.log(`✅  super_admin created: ${email}`);
    }

    await mongoose.disconnect();
    console.log('✅  Done. Disconnected from MongoDB.');
};

run().catch((err) => {
    console.error('❌  Error:', err.message);
    process.exit(1);
});
