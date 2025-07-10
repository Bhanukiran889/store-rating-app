// backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const protect = async (req, res, next) => {
    let token;

    // Check if token is present in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (e.g., "Bearer TOKEN_STRING")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the database based on the ID in the token payload
            // Select only necessary fields, not password
            req.user = await User.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found.' });
            }

            // Proceed to the next middleware/route handler
            next();
        } catch (error) {
            console.error('Token verification error:', error.message);
            // Handle token expiration or invalid token
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Not authorized, token expired.' });
            }
            return res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

// Middleware to authorize specific roles
const authorize = (roles = []) => {
    // roles can be a single role string or an array of role strings
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: 'Not authorized, user data not available.' });
        }

        // Check if the user's role is included in the allowed roles
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Not authorized, role '${req.user.role}' is not permitted for this action.` });
        }
        next();
    };
};

module.exports = { protect, authorize };