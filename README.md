# Roxiler Systems Store Rating Application

This is a full-stack web application for rating stores, developed using Node.js, Express, MySQL (for the backend), and React.js (for the frontend). It supports user registration/login, store browsing, rating submission, updating, deletion, and average rating charts via Chart.js.

---
- 📘 Live App: [store_rating-app](https://store-rating-app-kappa.vercel.app/)

## 🔧 Technologies Used

### Backend
- Node.js
- Express.js
- MySQL
- JWT (jsonwebtoken)
- bcryptjs
- dotenv
- cors
- body-parser
- uuid
- nodemon

### Frontend
- React 18+
- Tailwind CSS (dark mode enabled)
- Axios
- Chart.js
- React Router DOM
- Context API
- JWT-based Auth
- PostCSS & Autoprefixer

---

## 📁 Backend Setup – Roxiler Store API

### Prerequisites

- Node.js v14+ and npm
- MySQL Server

### 1. Project Initialization

```bash
mkdir store-rating-app
cd store-rating-app
mkdir backend
cd backend
npm init -y
```

### 2. Install Dependencies

```bash
npm install express mysql2 dotenv cors body-parser bcryptjs jsonwebtoken uuid
npm install --save-dev nodemon
```

### 3. Database Setup

Make sure your MySQL server is running.

#### a. Create the Database

```sql
CREATE DATABASE roxiler_db;
```

#### b. Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
# backend/.env
PORT=5000

DB_USER=root
DB_HOST=localhost
DB_DATABASE=roxiler_db
DB_PASSWORD=your_mysql_password
DB_PORT=3306

JWT_SECRET=your_very_strong_random_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```

### 4. Run Database Migrations

```bash
npm run 001_initial_schema
```

This will create required tables: `users`, `stores`, `ratings`.

### 5. Start the Backend Server

```bash
npm run dev
```

Server will start on: [http://localhost:5000](http://localhost:5000)

---

## 📚 API Documentation

All endpoints are prefixed with `/api`.

### 🔐 Authentication

#### 1. Register User

- **POST** `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "address": "123 Main St",
  "role": "Normal User"
}
```

- Roles: `"System Administrator"`, `"Normal User"`, `"Store Owner"`

**Success Response:**

```json
{
  "message": "User registered successfully",
  "token": "...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Normal User"
  }
}
```

#### 2. Login User

- **POST** `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Success Response:**

```json
{
  "message": "Logged in successfully",
  "token": "...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Normal User"
  }
}
```

---

## 🎨 Frontend Setup – Store Rating System

### 1. Clone the Frontend Repo

```bash
git clone https://github.com/your-username/store-rating-frontend.git
cd store-rating-frontend
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 4. Start Development Server

```bash
npm start
```

App will be available at: [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure (Frontend)

```
src/
├── components/       # Reusable UI
├── context/          # Auth context
├── pages/            # Page components (Home, Register, Login, StoreDetail)
├── utils/            # Axios instance
├── App.js            # Routes
└── index.js          # Entry point
```

---

## 📦 API Integration in Frontend

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register user |
| `POST /api/auth/login` | Login user |
| `GET /api/stores/:id` | Fetch single store |
| `GET /api/ratings/store/:storeId` | Ratings for store |
| `GET /api/ratings/store/:storeId/average` | Average rating |
| `POST /api/ratings` | Submit rating |
| `PUT /api/ratings/:id` | Update rating |
| `DELETE /api/ratings/:id` | Delete rating |

---

## 📊 Charts (Chart.js)

Chart.js is used to render rating distribution.

Install Chart.js if not already:

```bash
npm install chart.js
```

Check:
- Canvas reference is valid.
- Chart is being properly destroyed before re-creating.
- `chart.js/auto` is imported.

---

## 🔐 Auth Context (Frontend)

- Uses React Context API.
- Stores user + JWT after login/registration.
- Sends JWT in Axios headers.

---

## 🌙 Dark Mode

Tailwind dark mode is configured via class strategy.

```js
// tailwind.config.js
darkMode: 'class'
```

Switch OS theme or add `class="dark"` to `html`.

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Chart not rendering | Ensure Chart.js is installed and canvas ref is valid |
| 404 on API | Verify backend is running and route exists |
| CORS Error | Confirm backend allows `http://localhost:3000` |
| Auth token not sent | Ensure token is attached via Axios interceptor |

---

## 📖 Documentation Repositories

For additional docs and usage examples:

- 🔗 API Test Collection: [store_app_API_test](https://github.com/Bhanukiran889/store_app_API_test)
- 📘 Rating Guide: [store_rating_guid](https://github.com/Bhanukiran889/store_rating_guid)

---

## 🤝 Contributing

PRs are welcome! Please fork the repo and open a pull request.

---

## 📝 License

Licensed under the [MIT License](LICENSE).

---
