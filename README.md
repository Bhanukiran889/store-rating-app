# Roxiler Systems Store Rating Application (Frontend)

## Project Overview

This is the frontend component of the Roxiler Systems Store Rating Application. It's built with React.js, providing the user interface for interacting with the backend API to manage users, stores, and ratings.

## Technologies Used (Frontend)

* **React.js**: JavaScript library for building user interfaces.
* **Vite**: Next-generation frontend tooling for fast development.
* **npm / Yarn**: Package manager.
* **Axios** (Planned): For making HTTP requests to the backend API.

## Setup and Local Development (Frontend)

Follow these steps to set up and run the frontend locally.

### Prerequisites

* Node.js (v14 or higher recommended) and npm (or Yarn)
* Ensure the [Backend server is running](link-to-backend-readme-section-if-available).

### 1. Clone the Repository (if applicable)

If you haven't already, clone this repository (assuming the frontend is in a `frontend` subdirectory):

```bash
git clone <your-repository-url>
cd store-rating-app/frontend
```
## 2. Install Dependencies
Navigate into the backend directory and install all required Node.js packages:
 

```bash 
cd backend
npm install
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