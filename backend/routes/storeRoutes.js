// backend/routes/storeRoutes.js

const express = require('express');
const Store = require('../models/Store'); // Import the Store model
const { protect, authorize } = require('../middleware/authMiddleware'); // Import auth middleware
const router = express.Router();



// @route   GET /api/stores
// @desc    Get all stores
// @access  Public

router.get('/', async (req, res) => {
    try {
        const stores = await Store.findAll();
        res.status(200).json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Server error fetching stores.' });
    }
});


// @route   GET /api/stores/with-ratings
// @desc    Get all stores with their average ratings and total number of ratings
// @access  Public
router.get('/with-ratings', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const sortBy = req.query.sortBy || 'name'; // Default sort by name
    const sortOrder = req.query.order || 'ASC'; // Default order ascending

    try {
        const result = await Store.findAllWithAvgRating(page, limit, searchQuery, sortBy, sortOrder);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching paginated/filtered stores:', error);
        res.status(500).json({ message: 'Server error fetching stores with average ratings.' });
    }
});



// @route   POST /api/stores
// @desc    Create a new store (only for Store Owners)
// @access  Private (Store Owner)
router.post('/', protect, authorize('Store Owner'), async (req, res) => {
    const { name, email, address } = req.body;
    const owner_id = req.user.id; // Get owner_id from authenticated user

    if (!name || !address) {
        return res.status(400).json({ message: 'Store name and address are required.' });
    }

    try {
        const newStore = await Store.create(name, email, address, owner_id);
        res.status(201).json({
            message: 'Store created successfully',
            store: newStore
        });
    } catch (error) {
        console.error('Store creation error:', error);
        if (error.message === 'Store name already exists.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during store creation.' });
    }
});



// @route   GET /api/stores
// @desc    Get all stores
// @access  Public
router.get('/', async (req, res) => {
    try {
        const stores = await Store.findAll();
        res.status(200).json(stores);
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Server error fetching stores.' });
    }
});




// @route   GET /api/stores/:id
// @desc    Get a single store by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }
        res.status(200).json(store);
    } catch (error) {
        console.error('Error fetching store by ID:', error);
        res.status(500).json({ message: 'Server error fetching store.' });
    }
});

// @route   PUT /api/stores/:id
// @desc    Update a store (only by its owner or System Administrator)
// @access  Private (Store Owner, System Administrator)
router.put('/:id', protect, authorize(['Store Owner', 'System Administrator']), async (req, res) => {
    const { name, email, address } = req.body;
    const storeId = req.params.id;

    // Fetch the store to check ownership
    const store = await Store.findById(storeId);
    if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if the authenticated user is the owner or an admin
    if (req.user.role !== 'System Administrator' && store.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this store.' });
    }

    try {
        const updatedStore = await Store.update(storeId, name, email, address);
        if (!updatedStore) {
             return res.status(404).json({ message: 'Store not found or no changes applied.' });
        }
        res.status(200).json({
            message: 'Store updated successfully',
            store: updatedStore
        });
    } catch (error) {
        console.error('Error updating store:', error);
        if (error.message === 'Store name already exists.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error updating store.' });
    }
});

// @route   DELETE /api/stores/:id
// @desc    Delete a store (only by its owner or System Administrator)
// @access  Private (Store Owner, System Administrator)
router.delete('/:id', protect, authorize(['Store Owner', 'System Administrator']), async (req, res) => {
    const storeId = req.params.id;

    const store = await Store.findById(storeId);
    if (!store) {
        return res.status(404).json({ message: 'Store not found.' });
    }

    // Check if the authenticated user is the owner or an admin
    if (req.user.role !== 'System Administrator' && store.owner_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this store.' });
    }

    try {
        const deleted = await Store.delete(storeId);
        if (deleted) {
            res.status(200).json({ message: 'Store deleted successfully.' });
        } else {
            res.status(404).json({ message: 'Store not found.' });
        }
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Server error deleting store.' });
    }
});




module.exports = router;