// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError'); // Keep this import for the new 404 handler

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://store-rating-6j49s2564-bhanukiran-reddys-projects.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Roxiler Systems Backend is Running!');
});

// Use authentication routes
app.use('/api/auth', authRoutes);
// Use store routes
app.use('/api/stores', storeRoutes);
// Use rating routes
app.use('/api/ratings', ratingRoutes);
// Use user profile routes
app.use('/api/users', userRoutes);
// Use admin routes
app.use('/api/admin', adminRoutes);

// 404 Not Found Handler (MUST BE AFTER ALL ROUTES)
app.use((req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Centralized Error Handling Middleware (MUST BE LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; 

app.listen(PORT, HOST, () => { 
    console.log(`Server running on http://${HOST}:${PORT}`); // Optional: update log message
});