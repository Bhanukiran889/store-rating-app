// backend/routes/adminRoutes.js

const express = require('express');
const db = require('../config/db'); // Import the database connection pool directly
const User = require('../models/User'); // We'll still need User.findById and User.delete
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// All routes in this file will be protected and require 'System Administrator' role
router.use(protect, authorize('System Administrator'));

// @route   GET /api/admin/users
// @desc    Get all users (Admin Only)
// @access  Private (System Administrator)
router.get('/users', async (req, res) => {
    try {
        // Fetch all users, but exclude their passwords
        const query = `SELECT id, name, email, address, role, created_at, updated_at FROM users`;
        const [users] = await db.query(query); // Using db.query directly
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching all users (Admin):', error);
        res.status(500).json({ message: 'Server error fetching users.' });
    }
});

// @route   GET /api/admin/users/:id
// @desc    Get a specific user by ID (Admin Only)
// @access  Private (System Administrator)
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID (Admin):', error);
        res.status(500).json({ message: 'Server error fetching user.' });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role (Admin Only)
// @access  Private (System Administrator)
router.put('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    const userIdToUpdate = req.params.id;

    if (!role) {
        return res.status(400).json({ message: 'New role is required.' });
    }
    if (!['System Administrator', 'Normal User', 'Store Owner'].includes(role)) {
        return res.status(400).json({ message: 'Invalid user role provided.' });
    }

    try {
        const userExists = await User.findById(userIdToUpdate);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const query = `UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.query(query, [role, userIdToUpdate]); // Using db.query directly

        if (result.affectedRows > 0) {
            const updatedUser = await User.findById(userIdToUpdate);
            res.status(200).json({
                message: 'User role updated successfully',
                user: updatedUser
            });
        } else {
            res.status(500).json({ message: 'Failed to update user role.' });
        }
    } catch (error) {
        console.error('Error updating user role (Admin):', error);
        res.status(500).json({ message: 'Server error updating user role.' });
    }
});


// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (Admin Only)
// @access  Private (System Administrator)
router.delete('/users/:id', async (req, res) => {
    const userIdToDelete = req.params.id;

    // Prevent deleting own account for safety
    if (userIdToDelete === req.user.id) {
        return res.status(403).json({ message: 'You cannot delete your own account via this endpoint.' });
    }

    try {
        const deleted = await User.delete(userIdToDelete); // Assuming User.delete exists
        if (deleted) {
            res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Error deleting user (Admin):', error);
        res.status(500).json({ message: 'Server error deleting user.' });
    }
});

module.exports = router;