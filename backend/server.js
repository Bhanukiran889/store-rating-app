// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db'); // Database connection
const authRoutes = require('./routes/authRoutes'); // <--- ADD THIS LINE

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

// Use authentication routes
app.use('/api/auth', authRoutes); // <--- ADD THIS LINE: all routes in authRoutes will be prefixed with /api/auth

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});