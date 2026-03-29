const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(cookieParser());

const connectDB = require('./config/db');

// Database Connection
// connectDB() called at bottom

const authRoutes = require('./routes/authRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const entryExitRoutes = require('./routes/entryExitRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/logs', entryExitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('SoloPark API is running...');
});

// Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
