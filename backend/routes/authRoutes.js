// backend/routes/authRoutes.js

const express = require('express');
const { body, validationResult } = require('express-validator'); // <--- ADD THIS LINE
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs'); // For login password comparison
const ApiError = require('../utils/ApiError'); // For custom errors
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        // Validation rules
        body('name').trim().notEmpty().withMessage('Name is required.'),
        body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('address').trim().notEmpty().withMessage('Address is required.'),
        body('role')
            .isIn(['System Administrator', 'Normal User', 'Store Owner'])
            .withMessage('Invalid user role. Must be System Administrator, Normal User, or Store Owner.'),
    ],
    async (req, res, next) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Map errors to a more readable format for ApiError
            const formattedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));
            return next(new ApiError(400, 'Validation failed', formattedErrors));
        }

        const { name, email, password, address, role } = req.body;

        try {
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return next(new ApiError(400, 'User with this email already exists.'));
            }

            const newUser = await User.create(name, email, password, address, role);
            const token = generateToken(newUser);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
            });

        } catch (error) {
            // The centralized errorHandler will handle specific database errors (e.g., ER_DUP_ENTRY for email)
            next(error);
        }
    }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please enter a valid email address.'),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));
            return next(new ApiError(400, 'Validation failed', formattedErrors));
        }

        const { email, password } = req.body;

        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return next(new ApiError(400, 'Invalid credentials.'));
            }

            const isMatch = await User.comparePassword(password, user.password);
            if (!isMatch) {
                return next(new ApiError(400, 'Invalid credentials.'));
            }

            const token = generateToken(user);
            res.status(200).json({
                message: 'Logged in successfully',
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });

        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;