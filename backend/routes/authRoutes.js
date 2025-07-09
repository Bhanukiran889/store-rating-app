// backend/routes/authRoutes.js

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model
const router = express.Router();

// Utility function to generate a JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, // Payload: user ID and role
        process.env.JWT_SECRET,          // Secret key from .env
        { expiresIn: process.env.JWT_EXPIRES_IN } // Token expiration
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, address, role } = req.body;

    // Basic validation (more robust validation will be added later)
    if (!name || !email || !password || !address || !role) {
        return res.status(400).json({ message: 'Please enter all required fields.' });
    }
    if (!['System Administrator', 'Normal User', 'Store Owner'].includes(role)) {
        return res.status(400).json({ message: 'Invalid user role.' });
    }

    try {
        // Check if user with this email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Create new user
        const newUser = await User.create(name, email, password, address, role);

        // Generate JWT token for the new user
        const token = generateToken(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.message === 'Email already registered.') { // Handle specific error from User.create
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields.' });
    }

    try {
        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Compare provided password with hashed password
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;