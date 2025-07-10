// backend/models/Store.js

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Store = {};

// Create a new store
Store.create = async (name, email, address, owner_id) => {
    const id = uuidv4();
    const query = `
        INSERT INTO stores (id, name, email, address, owner_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [id, name, email, address, owner_id];
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 1) {
            return { id, name, email, address, owner_id };
        }
        return null;
    } catch (error) {
        console.error('Error creating store:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Store name already exists.');
        }
        throw error;
    }
};

// Get all stores
Store.findAll = async () => {
    const query = `
        SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
               u.name AS owner_name, u.email AS owner_email
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
    `;
    try {
        const [rows] = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error fetching all stores:', error.message);
        throw error;
    }
};

// Get a single store by ID
Store.findById = async (id) => {
    const query = `
        SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
               u.name AS owner_name, u.email AS owner_email
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.id = ?
    `;
    try {
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching store by ID:', error.message);
        throw error;
    }
};

// Update a store
Store.update = async (id, name, email, address) => {
    const query = `
        UPDATE stores
        SET name = ?, email = ?, address = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const values = [name, email, address, id];
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            return null; // No store found with that ID or no changes
        }
        return { id, name, email, address }; // Return updated fields
    } catch (error) {
        console.error('Error updating store:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Store name already exists.');
        }
        throw error;
    }
};

// Delete a store
Store.delete = async (id) => {
    const query = `DELETE FROM stores WHERE id = ?`;
    try {
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0; // True if deleted, false otherwise
    } catch (error) {
        console.error('Error deleting store:', error.message);
        throw error;
    }
};

module.exports = Store;