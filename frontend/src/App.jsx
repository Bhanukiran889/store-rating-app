// frontend/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./index.css"; // Ensure Tailwind CSS is imported
// Import your page components
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
// import RatingSubmission from './pages/RatingSubmission'; 
import StoreListings from "./pages/StoreListings";
import RegisterShop from "./pages/RegisterShop";
import StoreDetail from "./pages/StoreDetail"; 

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-700 dark:text-slate-300 text-lg">
          Loading application...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const { isAuthenticated, user, logout } = useAuth();

  // Dark mode logic based on Tailwind CSS v4 docs
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      // Currently dark or system dark, switch to light
      html.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      // Currently light or system light, switch to dark
      html.classList.add("dark");
      localStorage.theme = "dark";
    }
  };

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    // This ensures the class is set before the page renders
    const html = document.documentElement;
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (!("theme" in localStorage)) {
        // Only react to system if no explicit user choice
        if (e.matches) {
          html.classList.add("dark");
        } else {
          html.classList.remove("dark");
        }
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <nav className="bg-sky-700 dark:bg-sky-900 p-4 shadow-md">
        <div className="container mx-auto flex flex-wrap justify-between items-center">
          <Link to="/" className="text-white text-2xl font-bold mb-2 md:mb-0">
            ShopRating
          </Link>
          <div className="flex items-center space-x-4 flex-wrap justify-end">
            <Link
              to="/stores"
              className="text-white hover:text-sky-200 px-2 py-1 rounded-md"
            >
              Stores
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-white hover:text-sky-200 px-2 py-1 rounded-md"
                >
                  Dashboard
                </Link>
                <span className="text-sky-200 hidden md:inline px-2 py-1">
                  Hello, {user?.name || "User"}
                </span>
                <button
                  onClick={logout}
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1 px-3 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-sky-200 px-2 py-1 rounded-md"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-1 px-3 rounded-md"
                >
                  Register
                </Link>
              </>
            )}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white transition-colors duration-200"
            >
              {/* Sun/Moon Icon - Unicode characters */}
              <span className="block dark:hidden">☀️</span>
              <span className="hidden dark:block">🌙</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/stores" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/stores" element={<StoreListings />} />
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-shop"
            element={
              <ProtectedRoute>
                <RegisterShop  />
              </ProtectedRoute>
            }
          />
          <Route path="/stores/:id" element={<StoreDetail />} />{" "}
          {/* New route for store details */}
          {/* Add more protected routes as needed */}
          <Route
            path="*"
            element={
              <h1 className="text-center text-3xl font-bold mt-20 text-slate-900 dark:text-white">
                404 - Page Not Found
              </h1>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
