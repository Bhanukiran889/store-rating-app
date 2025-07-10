// backend/utils/generateToken.js

const jwt = require('jsonwebtoken');

// Make sure you have a JWT_SECRET in your .env file
// For example: JWT_SECRET=your_super_secret_jwt_key
// And JWT_EXPIRES_IN=1h (or 1d, 30d etc.)
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role }, // Payload: user ID and role
        process.env.JWT_SECRET, // Secret from environment variables
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Token expiration
        }
    );
};

module.exports = generateToken;