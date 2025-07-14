// backend/routes/ratingRoutes.js

const express = require('express');
const Rating = require('../models/Rating'); // Import the Rating model
const Store = require('../models/Store'); // To check if store exists
const { protect, authorize } = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();

// @route   POST /api/ratings
// @desc    Submit a new rating for a store
// @access  Private (Authenticated User - Normal User or Store Owner)
router.post('/', protect, async (req, res) => {
    const { store_id, rating, comment } = req.body;
    const user_id = req.user.id; // Get user_id from authenticated user

    // Basic validation
    if (!store_id || !rating) {
        return res.status(400).json({ message: 'Store ID and rating are required.' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    try {
        // Optional: Verify if the store exists before adding a rating (better user experience)
        const storeExists = await Store.findById(store_id);
        if (!storeExists) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        const newRating = await Rating.create(user_id, store_id, rating, comment);
        res.status(201).json({
            message: 'Rating submitted successfully',
            rating: newRating
        });
    } catch (error) {
        console.error('Rating submission error:', error);
        if (error.message.includes('You have already submitted a rating for this store.')) {
            return res.status(409).json({ message: error.message }); // 409 Conflict
        }
        if (error.message.includes('Invalid store ID.')) { // From model's foreign key check
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during rating submission.' });
    }
});

// @route   GET /api/ratings/store/:storeId
// @desc    Get all ratings for a specific store
// @access  Public
router.get('/store/:storeId', async (req, res) => {
    try {
        const ratings = await Rating.findByStoreId(req.params.storeId);
        if (ratings.length === 0) {
             // Consider if returning 404 for no ratings is appropriate or just an empty array
             // For now, an empty array is fine if no ratings exist for a valid store
             // If the store itself doesn't exist, a previous GET /api/stores/:id check would be better.
            return res.status(200).json([]);
        }
        res.status(200).json(ratings);
    } catch (error) {
        console.error('Error fetching ratings for store:', error);
        res.status(500).json({ message: 'Server error fetching ratings.' });
    }
});
// ✅ Place this BEFORE the router.get('/:id') route
router.get('/my', protect, async (req, res) => {
  const userId = req.user.id;
  try {
    const query = `
      SELECT r.id, r.user_id, u.name AS user_name, r.store_id, s.name AS store_name,
             r.rating, r.comment, r.created_at, r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const [rows] = await require('../config/db').query(query, [userId]);
    res.status(200).json({ ratings: rows });
  } catch (error) {
    console.error('Error fetching user ratings:', error.message);
    res.status(500).json({ message: 'Server error fetching your ratings.' });
  }
});

// @route   GET /api/ratings/:id
// @desc    Get a single rating by its ID
// @access  Public (useful for detailed view)
router.get('/:id', async (req, res) => {
    try {
        const rating = await Rating.findById(req.params.id);
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }
        res.status(200).json(rating);
    } catch (error) {
        console.error('Error fetching rating by ID:', error);
        res.status(500).json({ message: 'Server error fetching rating.' });
    }
});


// @route   PUT /api/ratings/:id
// @desc    Update an existing rating (only by the user who submitted it)
// @access  Private (Authenticated User)
router.put('/:id', protect, async (req, res) => {
    const { rating, comment } = req.body;
    const ratingId = req.params.id;
    const userId = req.user.id; // ID of the authenticated user

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    try {
        const existingRating = await Rating.findById(ratingId);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        // Check if the authenticated user is the one who submitted this rating
        if (existingRating.user_id !== userId) {
            return res.status(403).json({ message: 'Not authorized to update this rating.' });
        }

        const updatedRating = await Rating.update(ratingId, rating, comment);
        if (!updatedRating) {
            return res.status(404).json({ message: 'Rating not found or no changes applied.' });
        }
        res.status(200).json({
            message: 'Rating updated successfully',
            rating: updatedRating
        });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ message: 'Server error updating rating.' });
    }
});

// @route   GET /api/ratings/store/:storeId/average
// @desc    Get average rating and total ratings for a specific store
// @access  Public
router.get('/store/:storeId/average', async (req, res) => {
    try {
        const result = await Rating.getAverageByStoreId(req.params.storeId);

        // If no ratings yet, default to 0
        const average_rating = result.average_rating || 0;
        const total_ratings = result.total_ratings || 0;

        res.status(200).json({ average_rating, total_ratings });
    } catch (error) {
        console.error('Error fetching average rating:', error.message);
        res.status(500).json({ message: 'Server error fetching average rating.' });
    }
});



// @route   DELETE /api/ratings/:id
// @desc    Delete a rating (only by the user who submitted it or System Administrator)
// @access  Private (Authenticated User, System Administrator)
router.delete('/:id', protect, authorize(['Normal User', 'Store Owner', 'System Administrator']), async (req, res) => {
    const ratingId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const existingRating = await Rating.findById(ratingId);
        if (!existingRating) {
            return res.status(404).json({ message: 'Rating not found.' });
        }

        // Check if authenticated user is the owner of the rating OR a System Administrator
        if (existingRating.user_id !== userId && userRole !== 'System Administrator') {
            return res.status(403).json({ message: 'Not authorized to delete this rating.' });
        }

        const deleted = await Rating.delete(ratingId);
        if (deleted) {
            res.status(200).json({ message: 'Rating deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Rating not found.' });
        }
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ message: 'Server error deleting rating.' });
    }
});

module.exports = router;