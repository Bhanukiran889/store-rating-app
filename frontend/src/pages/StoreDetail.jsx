import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Chart from "chart.js/auto";

const StoreDetail = () => {
  const { id } = useParams();
  const { user, token, isAuthenticated } = useAuth();

  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRating, setNewRating] = useState({ rating: "", comment: "" });
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [ratingMessage, setRatingMessage] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchStoreData = async () => {
    console.log("ratings:", ratings);
    console.log("sortOrder:", sortOrder);
    setLoading(true);
    setError("");
    try {
      const storeRes = await api.get(`/api/stores/${id}`);
      setStore(storeRes.data);

      const ratingsRes = await api.get(`/api/ratings/store/${id}`);
      const sorted = sortRatings(ratingsRes.data);
      setRatings(sorted);

      const avgRatingRes = await api.get(`/api/ratings/store/${id}/average`);
      setAverageRating(avgRatingRes.data.average_rating);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load store details.");
      console.error("Error fetching store data:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortRatings = (ratingsArr) => {
    if (sortOrder === "highest") {
      return [...ratingsArr].sort((a, b) => b.rating - a.rating);
    }
    return [...ratingsArr].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  };

  useEffect(() => {
    fetchStoreData();
  }, [id, sortOrder]);

  useEffect(() => {
    if (ratings.length > 0 && chartRef.current) {
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach((r) => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingCounts[r.rating]++;
        }
      });

      const data = {
        labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
        datasets: [
          {
            label: "Number of Ratings",
            data: [
              ratingCounts[1],
              ratingCounts[2],
              ratingCounts[3],
              ratingCounts[4],
              ratingCounts[5],
            ],
            backgroundColor: [
              "#ef4444",
              "#f97316",
              "#eab308",
              "#22c55e",
              "#3b82f6",
            ],
            borderColor: [
              "#b91c1c",
              "#c2410c",
              "#a16207",
              "#15803d",
              "#1d4ed8",
            ],
            borderWidth: 1,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: document.documentElement.classList.contains("dark")
                ? "#cbd5e1"
                : "#475569",
            },
          },
          title: {
            display: true,
            text: "Rating Distribution",
            color: document.documentElement.classList.contains("dark")
              ? "#e2e8f0"
              : "#1e293b",
          },
        },
        scales: {
          x: {
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#cbd5e1"
                : "#475569",
            },
            grid: { color: "rgba(203,213,225,0.3)" },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: document.documentElement.classList.contains("dark")
                ? "#cbd5e1"
                : "#475569",
            },
            grid: { color: "rgba(203,213,225,0.3)" },
          },
        },
      };

      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, {
        type: "bar",
        data,
        options,
      });
    } else if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  }, [ratings]);

  const handleRatingChange = (e) => {
    setNewRating({ ...newRating, [e.target.name]: e.target.value });
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingMessage("");
    setRatingError("");

    if (!isAuthenticated) {
      setRatingError("You must be logged in to submit a rating.");
      return;
    }

    if (!newRating.rating || newRating.rating < 1 || newRating.rating > 5) {
      setRatingError("Please provide a rating between 1 and 5 stars.");
      return;
    }

    try {
      const payload = {
        store_id: id,
        rating: parseInt(newRating.rating),
        comment: newRating.comment,
      };

      if (editingRatingId) {
        await api.put(`/api/ratings/${editingRatingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatingMessage("Rating updated successfully.");
      } else {
        await api.post("/api/ratings", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRatingMessage("Rating submitted successfully.");
      }

      setNewRating({ rating: "", comment: "" });
      setEditingRatingId(null);
      fetchStoreData();
    } catch (err) {
      setRatingError(err.response?.data?.message || "Failed to submit rating.");
      console.error("Rating submission error:", err);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm("Are you sure you want to delete this rating?")) return;
    try {
      await api.delete(`/api/ratings/${ratingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStoreData();
    } catch (err) {
      console.error("Error deleting rating:", err);
      alert("Failed to delete rating.");
    }
  };

  const handleEdit = (r) => {
    setNewRating({ rating: r.rating, comment: r.comment });
    setEditingRatingId(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
        {store.name}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Store Info */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Shop Details
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-1">
            <strong>Address:</strong> {store.address}
          </p>
          <p className="text-slate-700 dark:text-slate-300 mb-1">
            <strong>Email:</strong> {store.email}
          </p>
          <p className="text-slate-700 dark:text-slate-300 mb-1">
            <strong>Owner:</strong> {store.owner_name} ({store.owner_email})
          </p>
          <p className="mt-4 text-xl font-bold text-sky-600 dark:text-sky-400">
            Average Rating:{" "}
            {averageRating ? parseFloat(averageRating).toFixed(2) : "N/A"} ⭐
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            Rating Distribution
          </h3>
          <div className="w-full h-80">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Submit/Update Rating */}
      {isAuthenticated && (
        <div className="mt-4 bg-white dark:bg-slate-800 p-6 rounded-lg shadow border mb-6">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            {editingRatingId ? "Update Your Rating" : "Submit a Rating"}
          </h3>
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-300">
                Rating (1–5)
              </label>
              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                value={newRating.rating}
                onChange={handleRatingChange}
                className="w-full px-3 py-2 border rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1 text-slate-700 dark:text-slate-300">
                Comment
              </label>
              <textarea
                name="comment"
                rows="3"
                value={newRating.comment}
                onChange={handleRatingChange}
                className="w-full px-3 py-2 border rounded bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
              ></textarea>
            </div>
            {ratingMessage && (
              <p className="text-green-600 dark:text-green-400">
                {ratingMessage}
              </p>
            )}
            {ratingError && (
              <p className="text-red-600 dark:text-red-400">{ratingError}</p>
            )}
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded"
            >
              {editingRatingId ? "Update Rating" : "Submit Rating"}
            </button>
          </form>
        </div>
      )}
      <div className="m-4">
        <label className="text-sm text-slate-700 dark:text-slate-300 mr-2">
          Sort Ratings:
        </label>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="latest">Latest First</option>
          <option value="highest">Highest Rated</option>
        </select>
      </div>
      {/* All Ratings */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border">
        <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
          Ratings
        </h3>
        {ratings.length > 0 ? (
          <ul className="space-y-4">
            {ratings.map((r) => (
              <li key={r.id} className="border-b pb-3">
                <p className="text-lg font-medium text-slate-800 dark:text-white">
                  {r.rating} ⭐
                </p>
                <p className="text-slate-600 dark:text-slate-400 italic">
                  "{r.comment}"
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  By{" "}
                  <span className="font-medium">
                    {r.user_name || `User ID ${r.user_id}`}
                  </span>{" "}
                  on {new Date(r.created_at).toLocaleDateString()}
                </p>
                {r.user_id === user?.id && (
                  <div className="mt-2 space-x-2">
                    <button
                      onClick={() => handleEdit(r)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRating(r.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;
