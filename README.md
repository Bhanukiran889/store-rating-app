# Roxiler Systems Store Rating Application (Backend)

## Project Overview

This is the backend component of the Roxiler Systems Store Rating Application. It's built with Node.js and Express.js, using MySQL as the database. The backend is responsible for handling all business logic, data storage, and API endpoints, starting with user authentication and authorization.

## Technologies Used (Backend)

* Node.js
* Express.js
* MySQL Database
* `mysql2` (MySQL client for Node.js)
* `dotenv` (for environment variables)
* `cors` (for Cross-Origin Resource Sharing)
* `body-parser` (for parsing request bodies)
* `bcryptjs` (for password hashing)
* `jsonwebtoken` (for JWT authentication)
* `uuid` (for generating UUIDs)
* `nodemon` (development utility)

## Setup and Local Development (Backend)

Follow these steps to get the backend up and running on your local machine.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js**: Version 14 or higher is recommended.
* **npm**: Node Package Manager, which comes with Node.js.
* **MySQL Server**: A running instance of MySQL database.

### 1. Project Initialization

If you're starting from scratch, create your project structure:

```bash
mkdir store-rating-app
cd store-rating-app
mkdir backend
cd backend
npm init -y
```
## 3. Database Setup
Ensure your MySQL server is running.

### a. Create the Database
Log in to your MySQL client (e.g., mysql -u root -p) and create the database:

```SQL
CREATE DATABASE roxiler_db;
```


### b. Configure Environment Variables
Create a .env file in the backend directory (backend/.env) and add your database and JWT configuration. Replace placeholder values with your actual MySQL credentials and a strong secret key.

```bash
# backend/.env
PORT=5000

DB_USER=root # Your MySQL username
DB_HOST=localhost
DB_DATABASE=roxiler_db
DB_PASSWORD=your_mysql_password # Your MySQL password
DB_PORT=3306

JWT_SECRET=your_very_strong_random_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

## 4. Run Database Migrations
This step will create the necessary tables (users, stores, ratings) in your roxiler_db database.

```bash

npm run 001_inital_schema
```
You should see output confirming successful execution of 001_initial_schema.sql.

## 5. Start the Backend Server
Once all dependencies are installed and the database is migrated, you can start the backend server in development mode:

```Bash

npm run dev
```

The server will run on http://localhost:5000 (or the PORT specified in your .env file). You should see "Connected to the MySQL database!" in your console.

# API Documentation (Current Endpoints)
All API endpoints are prefixed with /api.

## Authentication Endpoints
### 1. Register User
- URL: /api/auth/register
- Method: POST
- Access: Public
- Description: Registers a new user account.
* Request Body (JSON): 
    ```JSON

    {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "StrongPassword123",
        "address": "123 Main St, Anytown",
        "role": "Normal User"
    }
    ``` 
    * role can be "System Administrator", "Normal User", or "Store Owner".
* Success Response (201 Created):
    ``` json
    {
        "message": "User registered successfully",
        "token": "eyJhbGciOiJIUzI1Ni...",
        "user": {
            "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "Normal User"
        }
    }
    ```

* Error Responses (400 Bad Request):

    * {"message": "Please enter all required fields."}
    * {"message": "Invalid user role."}
    * {"message": "User with this email already exists."}

## 2. Login User
* URL: /api/auth/login
* Method: POST
* Access: Public
* Description: Authenticates a user and returns a JWT token.
* Request Body (JSON):
    ```JSON

    {
        "email": "john.doe@example.com",
        "password": "StrongPassword123"
    }
    ```

* Success Response (200 OK):

    ```JSON

    {
        "message": "Logged in successfully",
        "token": "eyJhbGciOiJIUzI1Ni...",
        "user": {
            "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "Normal User"
        }
    }
    ```
* Error Responses (400 Bad Request):
    * {"message": "Please enter all fields."}
    * {"message": "Invalid credentials."}



