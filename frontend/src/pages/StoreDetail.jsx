// frontend/src/pages/StoreDetail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Chart from 'chart.js/auto';

const StoreDetail = () => {
  const { id } = useParams();
  const { user, token, isAuthenticated } = useAuth();

  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newRating, setNewRating] = useState({ rating: '', comment: '' });
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratingError, setRatingError] = useState('');

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const fetchStoreData = async () => {
    setLoading(true);
    setError('');
    try {
      const storeRes = await api.get(`/api/stores/${id}`);
      setStore(storeRes.data.store);

      const ratingsRes = await api.get(`/api/ratings/store/${id}`);
      setRatings(ratingsRes.data.ratings || []);

      const avgRatingRes = await api.get(`/api/ratings/store/${id}/average`);
      setAverageRating(avgRatingRes.data.average_rating);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load store details.');
      console.error('Error fetching store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  useEffect(() => {
    if (ratings.length > 0 && chartRef.current) {
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingCounts[r.rating]++;
        }
      });

      const data = {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [{
          label: 'Number of Ratings',
          data: [ratingCounts[1], ratingCounts[2], ratingCounts[3], ratingCounts[4], ratingCounts[5]],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 205, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(54, 162, 235, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)'
          ],
          borderWidth: 1
        }]
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569'
            }
          },
          title: {
            display: true,
            text: 'Rating Distribution',
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
            font: { size: 16 }
          }
        },
        scales: {
          x: {
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)'
            }
          },
          y: {
            ticks: {
              beginAtZero: true,
              precision: 0,
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569'
            },
            grid: {
              color: document.documentElement.classList.contains('dark') ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)'
            }
          }
        }
      };

      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new Chart(chartRef.current, { type: 'bar', data, options });
    } else if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  }, [ratings]);

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(m => {
        if (m.attributeName === 'class' && chartInstance.current) {
          chartInstance.current.options.plugins.legend.labels.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
          chartInstance.current.options.plugins.title.color = document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b';
          chartInstance.current.options.scales.x.ticks.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
          chartInstance.current.options.scales.y.ticks.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
          chartInstance.current.update();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleRatingChange = (e) => {
    setNewRating({ ...newRating, [e.target.name]: e.target.value });
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingMessage('');
    setRatingError('');

    if (!isAuthenticated) {
      setRatingError('You must be logged in to submit a rating.');
      return;
    }

    if (!newRating.rating || newRating.rating < 1 || newRating.rating > 5) {
      setRatingError('Please provide a rating between 1 and 5 stars.');
      return;
    }

    try {
      const payload = {
        store_id: parseInt(id),
        user_id: user.id,
        rating: parseInt(newRating.rating),
        comment: newRating.comment
      };

      const response = await api.post('/api/ratings', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRatingMessage(response.data.message);
      setNewRating({ rating: '', comment: '' });
      fetchStoreData();
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
      console.error('Rating submission error:', err);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8"><p className="text-slate-700 dark:text-slate-300">Loading shop details...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8"><p className="text-red-600 dark:text-red-400">{error}</p></div>;
  }

  if (!store) {
    return <div className="container mx-auto px-4 py-8"><p className="text-slate-700 dark:text-slate-300">Shop not found.</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">{store.name}</h2>
      <p className="text-slate-700 dark:text-slate-300 mb-6">
        View shop details, check ratings, and share your feedback.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Shop Details</h3>
          <p className="text-slate-700 dark:text-slate-300 mb-1"><strong>Address:</strong> {store.address}</p>
          <p className="text-slate-700 dark:text-slate-300 mb-1"><strong>Contact:</strong> {store.contact_number}</p>
          <p className="text-slate-700 dark:text-slate-300"><strong>Owner ID:</strong> {store.owner_id}</p>
          <p className="mt-4 text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center">
            Average Rating: {averageRating ? parseFloat(averageRating).toFixed(2) : 'N/A'}
            <span className="ml-1 text-amber-500">⭐</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Rating Distribution</h3>
          <div className="w-full h-64 sm:h-80 md:h-96 max-h-[400px]">
            <canvas ref={chartRef}></canvas>
          </div>
          {ratings.length === 0 && <p className="text-slate-600 dark:text-slate-400 mt-4">No ratings yet.</p>}
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Submit Your Rating</h3>
        {isAuthenticated ? (
          <form onSubmit={handleRatingSubmit} className="space-y-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1–5)</label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="1"
                max="5"
                required
                value={newRating.rating}
                onChange={handleRatingChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comment</label>
              <textarea
                id="comment"
                name="comment"
                rows="3"
                value={newRating.comment}
                onChange={handleRatingChange}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md"
              ></textarea>
            </div>
            {ratingMessage && <p className="text-green-600 dark:text-green-400 text-sm text-center">{ratingMessage}</p>}
            {ratingError && <p className="text-red-600 dark:text-red-400 text-sm text-center">{ratingError}</p>}
            <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white py-2.5 px-4 rounded-md">
              Submit Rating
            </button>
          </form>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">
            Please <Link to="/login" className="text-sky-600 hover:underline dark:text-sky-400">log in</Link> to rate.
          </p>
        )}
      </div>

      <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">All Reviews</h3>
        {ratings.length > 0 ? (
          <ul className="space-y-4">
            {ratings.map(rating => (
              <li key={rating.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{rating.rating} <span className="text-amber-500">⭐</span></p>
                <p className="text-slate-600 dark:text-slate-400 italic">"{rating.comment}"</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">By User ID {rating.user_id} on {new Date(rating.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No reviews yet for this shop.</p>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;
