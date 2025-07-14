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
const ApiError = require('./utils/ApiError');

// Load environment variables
dotenv.config();

const app = express();

//  CORS configuration with allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://store-rating-app-kappa.vercel.app',
  'https://store-rating-6j49s2564-bhanukiran-reddys-projects.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//  Handle preflight requests
// app.options('*', cors());

// Parse JSON bodies
app.use(bodyParser.json());

// Health check route
app.get('/', (req, res) => {
  res.send('Roxiler Systems Backend is Running!');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler (after all routes)
app.use((req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

//  Centralized error handler
app.use(errorHandler);

//  Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Ensure it works on Railway or other cloud platforms

app.listen(PORT, HOST, () => {
  console.log(` Server running at http://${HOST}:${PORT}`);
});
