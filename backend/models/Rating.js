// backend/models/Rating.js

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Rating = {};

// Submit a new rating
Rating.create = async (user_id, store_id, rating, comment) => {
    const id = uuidv4();
    const query = `
        INSERT INTO ratings (id, user_id, store_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [id, user_id, store_id, rating, comment];
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 1) {
            return { id, user_id, store_id, rating, comment };
        }
        return null;
    } catch (error) {
        console.error('Error creating rating:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('You have already submitted a rating for this store.');
        }
        // Add checks for ER_NO_REFERENCED_ROW_2 (foreign key constraint fails)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
             // Determine if it's user_id or store_id that's invalid
             const isUserInvalid = error.sqlMessage.includes('FOREIGN KEY (`user_id`)');
             const isStoreInvalid = error.sqlMessage.includes('FOREIGN KEY (`store_id`)');

             if (isUserInvalid) throw new Error('Invalid user ID.');
             if (isStoreInvalid) throw new Error('Invalid store ID.');
        }
        throw error;
    }
};

// Get all ratings for a specific store
Rating.findByStoreId = async (store_id) => {
    const query = `
        SELECT r.id, r.user_id, u.name AS user_name, r.store_id, s.name AS store_name,
               r.rating, r.comment, r.created_at, r.updated_at
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        WHERE r.store_id = ?
        ORDER BY r.created_at DESC
    `;
    try {
        const [rows] = await db.query(query, [store_id]);
        return rows;
    } catch (error) {
        console.error('Error fetching ratings for store:', error.message);
        throw error;
    }
};

// Get a single rating by its ID
Rating.findById = async (id) => {
    const query = `
        SELECT r.id, r.user_id, u.name AS user_name, r.store_id, s.name AS store_name,
               r.rating, r.comment, r.created_at, r.updated_at
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        WHERE r.id = ?
    `;
    try {
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching rating by ID:', error.message);
        throw error;
    }
};

// Update an existing rating
Rating.update = async (id, rating, comment) => {
    const query = `
        UPDATE ratings
        SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const values = [rating, comment, id];
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            return null; // No rating found with that ID or no changes
        }
        return { id, rating, comment }; // Return updated fields
    } catch (error) {
        console.error('Error updating rating:', error.message);
        throw error;
    }
};

// Delete a rating
Rating.delete = async (id) => {
    const query = `DELETE FROM ratings WHERE id = ?`;
    try {
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0; // True if deleted, false otherwise
    } catch (error) {
        console.error('Error deleting rating:', error.message);
        throw error;
    }
};

module.exports = Rating;