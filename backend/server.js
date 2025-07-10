// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db'); // Database connection
const authRoutes = require('./routes/authRoutes'); 
const { protect, authorize } = require('./middleware/authMiddleware'); 
// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Basic route for testing server
app.get('/', (req, res) => {
    res.send('Roxiler Systems Backend is Running!');
});

// TEMPORARY PROTECTED ROUTE - REMOVE LATER!
app.get('/api/protected', protect, (req, res) => {
    res.json({
        message: 'You accessed a protected route!',
        user: req.user // This will contain user data from the token
    });
});

// TEMPORARY ROLE-SPECIFIC ROUTE - REMOVE LATER!
app.get('/api/admin-only', protect, authorize('System Administrator'), (req, res) => {
    res.json({
        message: 'Welcome, System Administrator!',
        user: req.user
    });
});

// TEMPORARY MULTI-ROLE ROUTE - REMOVE LATER!
app.get('/api/owner-or-admin', protect, authorize(['Store Owner', 'System Administrator']), (req, res) => {
    res.json({
        message: 'Welcome, Store Owner or System Administrator!',
        user: req.user
    });
});


// Use authentication routes
app.use('/api/auth', authRoutes); // all routes in authRoutes will be prefixed with /api/auth

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});