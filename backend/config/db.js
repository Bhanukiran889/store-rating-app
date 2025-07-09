// backend/config/db.js

const mysql = require('mysql2/promise'); 
const dotenv = require('dotenv');

dotenv.config(); 

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, 
    queueLimit: 0
});

// Test the database connection
async function testDbConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the MySQL database!');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('MySQL database connection error:', err.stack);
    }
}

testDbConnection(); // Call the test function when the app starts

module.exports = pool;