// backend/server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db'); // <--- ADD THIS LINE

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(bodyParser.json()); // Parse JSON request bodies

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Roxiler Systems Backend is Running!');
});

const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});