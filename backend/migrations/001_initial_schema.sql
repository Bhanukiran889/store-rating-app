-- backend/migrations/001_initial_schema.sql

-- Drop tables if they exist to allow for easy re-creation during development
-- In a production environment, be very careful with DROP TABLE!
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- Table: users
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY NOT NULL, -- Using CHAR(36) for UUIDs
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    role ENUM('System Administrator', 'Normal User', 'Store Owner') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);

-- Table: stores
CREATE TABLE stores (
    id CHAR(36) PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    address TEXT NOT NULL,
    owner_id CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stores_name (name),
    INDEX idx_stores_address (address(255)), -- MODIFIED THIS LINE
    INDEX idx_stores_owner_id (owner_id),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table: ratings
CREATE TABLE ratings (
    id CHAR(36) PRIMARY KEY NOT NULL, -- Using CHAR(36) for UUIDs
    user_id CHAR(36) NOT NULL,
    store_id CHAR(36) NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ratings_user_id (user_id),
    INDEX idx_ratings_store_id (store_id),
    INDEX idx_ratings_rating (rating),
    -- Ensure a user can only rate a store once
    UNIQUE (user_id, store_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
);