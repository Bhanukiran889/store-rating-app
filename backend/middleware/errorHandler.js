
// backend/middleware/errorHandler.js

const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
    // Default values for error response
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    // Specific handling for common database errors (MySQL)
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409; // Conflict
        message = "Duplicate entry error.";
        if (err.sqlMessage && err.sqlMessage.includes('email')) {
            message = "User with this email already exists.";
        } else if (err.sqlMessage && err.sqlMessage.includes('name')) {
            message = "A resource with this name already exists.";
        }
        errors = [{ field: 'database', message: err.sqlMessage }]; // Include specific SQL error message for debug
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
        statusCode = 400; // Bad Request
        message = "Related resource not found (Foreign Key Constraint).";
        errors = [{ field: 'database', message: err.sqlMessage }];
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401; // Unauthorized
        message = "Access token expired. Please log in again.";
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401; // Unauthorized
        message = "Invalid access token. Please log in again.";
    } else if (err instanceof ApiError) {
        // Already an ApiError, use its properties
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    // For other unhandled errors, just use the default 500 and generic message

    // Log the error for server-side debugging (excluding client-side errors)
    if (statusCode === 500) {
        console.error(err.stack || err); // Log full stack trace for 500 errors
    } else {
        console.warn(`Handled Error (${statusCode}): ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors,
        // Only send stack trace in development
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorHandler;