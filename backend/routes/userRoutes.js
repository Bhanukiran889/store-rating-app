// backend/routes/userRoutes.js

const express = require('express');
const User = require('../models/User'); // Import the User model
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current authenticated user's profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        // req.user is populated by the protect middleware
        const user = req.user; // It already has id, name, email, address, role (without password)
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update current authenticated user's profile (name, address)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    const { name, address } = req.body;
    const userId = req.user.id; // ID of the authenticated user

    if (!name || !address) {
        return res.status(400).json({ message: 'Name and address are required to update profile.' });
    }

    try {
        const updatedUser = await User.updateProfile(userId, name, address);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or no changes applied.' });
        }
        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error updating user profile.' });
    }
});

// @route   PUT /api/users/profile/password
// @desc    Update current authenticated user's password
// @access  Private
router.put('/profile/password', protect, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // ID of the authenticated user

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    try {
        // Get only the hashed password for comparison
        const hashedPasswordFromDb = await User.getHashedPasswordById(userId);

        if (!hashedPasswordFromDb) {
            // This scenario should theoretically not happen if protect middleware works,
            // but it's a good safeguard.
            return res.status(404).json({ message: 'User not found for password change.' });
        }

        // Verify current password against the one fetched from DB
        const isMatch = await User.comparePassword(currentPassword, hashedPasswordFromDb);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        // Update password
        const updated = await User.updatePassword(userId, newPassword);
        if (updated) {
            res.status(200).json({ message: 'Password updated successfully.' });
        } else {
            res.status(500).json({ message: 'Failed to update password.' });
        }
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Server error updating password.' });
    }
});

module.exports = router;