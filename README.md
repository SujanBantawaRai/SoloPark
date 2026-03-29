# SoloPark - Campus Parking Management System

SoloPark is a MERN stack web application designed to manage parking spaces on a college campus efficiently. It allows students, staff, and visitors to view availability and book slots, while guards and admins manage the system.

## Features
- **Real-time Slot Availability**: Visual indicators for free, occupied, and reserved slots.
- **Role-Based Access**:
  - **Student/Staff/Visitor**: Book slots, view history.
  - **Guard**: Log vehicle entry/exit, view live status.
  - **Admin**: Manage slots, users, and view reports.
- **Booking System**: Reserve slots for specific durations.
- **Entry/Exit Logging**: Digital logs replacing manual registers.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express, Mongoose (MongoDB)
- **Auth**: JWT (HttpOnly Cookies)

## Installation Guide

### Prerequisites
- Node.js installed
- MongoDB installed locally or MongoDB Atlas URI

### 1. Setup Backend
```bash
cd SoloPark/server
npm install
# Create a .env file with:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/solopark
# JWT_SECRET=your_secret_key

# Run Data Seeder (Optional - Creates Admin, Guard, Slots)
npm run data:import

# Start Server
npm run dev
```

### 2. Setup Frontend
```bash
cd SoloPark/client
npm install
npm run dev
```

### 3. Login Credentials (from Seeder)
- **Admin**: `admin@solopark.com` / `password123`
- **Guard**: `guard@solopark.com` / `password123`
- **Student**: `student@solopark.com` / `password123`

## Project Structure
- `/server` - API & Database logic
- `/client` - React Frontend interface

## Academic Note
This project demonstrates Full Stack Development concepts including REST API design, Authentication, State Management, and Database modeling suited for a final year project.
