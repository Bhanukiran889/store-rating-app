// backend/models/User.js

const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid'); // Import v4 as uuidv4

const User = {};

// Function to create a new user
User.create = async (name, email, password, address, role) => {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password with 10 salt rounds
    const id = uuidv4(); // Generate a UUID for the user ID

    const query = `
        INSERT INTO users (id, name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [id, name, email, hashedPassword, address, role];

    try {
        const [result] = await db.query(query, values);
        // For INSERT statements, result.affectedRows indicates success
        if (result.affectedRows === 1) {
            return { id, name, email, role }; // Return relevant user info, not password
        }
        return null;
    } catch (error) {
        console.error('Error creating user:', error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Email already registered.');
        }
        throw error;
    }
};

// Function to find a user by email
User.findByEmail = async (email) => {
    const query = `SELECT id, name, email, password, address, role FROM users WHERE email = ?`;
    try {
        const [rows] = await db.query(query, [email]);
        return rows[0] || null; // Return the first row if found, otherwise null
    } catch (error) {
        console.error('Error finding user by email:', error.message);
        throw error;
    }
};

// Function to find a user by ID
User.findById = async (id) => {
    const query = `SELECT id, name, email, address, role FROM users WHERE id = ?`;
    try {
        const [rows] = await db.query(query, [id]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding user by ID:', error.message);
        throw error;
    }
};
 

// Function to get only the hashed password for a user by ID
User.getHashedPasswordById = async (id) => {
    const query = `SELECT password FROM users WHERE id = ?`;
    try {
        const [rows] = await db.query(query, [id]);
        return rows[0] ? rows[0].password : null; // Return the password string or null
    } catch (error) {
        console.error('Error fetching hashed password by ID:', error.message);
        throw error;
    }
};


// Function to compare a plain password with a hashed password
User.comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};



// Function to update user profile (name, address)
User.updateProfile = async (id, name, address) => {
    const query = `
        UPDATE users
        SET name = ?, address = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const values = [name, address, id];
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            return null; // No user found with that ID or no changes
        }
        // Fetch the updated user to return fresh data (excluding password)
        const updatedUser = await User.findById(id);
        return { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, address: updatedUser.address, role: updatedUser.role };
    } catch (error) {
        console.error('Error updating user profile:', error.message);
        throw error;
    }
};

// Function to update user password
User.updatePassword = async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
        UPDATE users
        SET password = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    const values = [hashedPassword, id];
    try {
        const [result] = await db.query(query, values);
        return result.affectedRows > 0; // True if updated, false otherwise
    } catch (error) {
        console.error('Error updating user password:', error.message);
        throw error;
    }
};



module.exports = User;