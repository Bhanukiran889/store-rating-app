// frontend/src/pages/StoreDetail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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

    const API_BASE_URL = '[https://store-rating-app-mysqlhost.up.railway.app](https://store-rating-app-mysqlhost.up.railway.app)';

    const fetchStoreData = async () => {
        setLoading(true);
        setError('');
        try {
            const storeRes = await axios.get(`${API_BASE_URL}/api/stores/${id}`);
            setStore(storeRes.data.store);

            const ratingsRes = await axios.get(`${API_BASE_URL}/api/ratings/store/${id}`);
            setRatings(ratingsRes.data.ratings || []);

            const avgRatingRes = await axios.get(`${API_BASE_URL}/api/ratings/store/${id}/average`);
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
                        'rgba(255, 99, 132, 0.7)', // Red
                        'rgba(255, 159, 64, 0.7)', // Orange
                        'rgba(255, 205, 86, 0.7)', // Yellow
                        'rgba(75, 192, 192, 0.7)', // Green
                        'rgba(54, 162, 235, 0.7)'  // Blue
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
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
                            font: {
                                family: 'Inter'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Rating Distribution',
                        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
                        font: {
                            size: 16,
                            family: 'Inter'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const label = context[0].label;
                                return label.length > 16 ? label.split(' ').join('\n') : label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
                            font: {
                                family: 'Inter'
                            }
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)'
                        }
                    },
                    y: {
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
                            font: {
                                family: 'Inter'
                            },
                            beginAtZero: true,
                            precision: 0
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)'
                        }
                    }
                }
            };

            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            chartInstance.current = new Chart(chartRef.current, {
                type: 'bar',
                data: data,
                options: options
            });
        } else if (chartInstance.current) {
            chartInstance.current.destroy();
            chartInstance.current = null;
        }
    }, [ratings]);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && chartInstance.current) {
                    // Update chart options for dark mode
                    chartInstance.current.options.plugins.legend.labels.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
                    chartInstance.current.options.plugins.title.color = document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b';
                    chartInstance.current.options.scales.x.ticks.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
                    chartInstance.current.options.scales.x.grid.color = document.documentElement.classList.contains('dark') ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)';
                    chartInstance.current.options.scales.y.ticks.color = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
                    chartInstance.current.options.scales.y.grid.color = document.documentElement.classList.contains('dark') ? 'rgba(71,85,105,0.3)' : 'rgba(203,213,225,0.3)';
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
            const response = await axios.post(`${API_BASE_URL}/api/ratings`, payload, {
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
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-slate-700 dark:text-slate-300">Loading shop details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-slate-700 dark:text-slate-300">Shop not found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">{store.name}</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">Here you can find detailed information about {store.name}, view what other users have rated it, and submit your own review to help others.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Store Info Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Shop Details</h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-1"><span className="font-medium">Address:</span> {store.address}</p>
                    <p className="text-slate-700 dark:text-slate-300 mb-1"><span className="font-medium">Contact:</span> {store.contact_number}</p>
                    <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Owner ID:</span> {store.owner_id}</p>
                    <p className="mt-4 text-2xl font-bold text-sky-600 dark:text-sky-400 flex items-center">
                        Average Rating: {averageRating ? parseFloat(averageRating).toFixed(2) : 'N/A'}
                        <span className="ml-1 text-amber-500">⭐</span>
                    </p>
                </div>

                {/* Rating Distribution Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Rating Distribution</h3>
                    <div className="chart-container w-full max-w-xl mx-auto h-64 sm:h-80 md:h-96 max-h-[400px]">
                        <canvas ref={chartRef}></canvas>
                    </div>
                    {ratings.length === 0 && <p className="text-slate-600 dark:text-slate-400 mt-4">No ratings yet. Be the first to rate this shop!</p>}
                </div>
            </div>

            {/* Submit a Rating Form */}
            <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Submit Your Rating</h3>
                {isAuthenticated ? (
                    <form onSubmit={handleRatingSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="rating" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1-5 Stars)</label>
                            <input
                                type="number"
                                id="rating"
                                name="rating"
                                min="1"
                                max="5"
                                required
                                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white py-2.5 px-3 transition-colors duration-200"
                                value={newRating.rating}
                                onChange={handleRatingChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comment (Optional)</label>
                            <textarea
                                id="comment"
                                name="comment"
                                rows="3"
                                className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white py-2.5 px-3 transition-colors duration-200"
                                value={newRating.comment}
                                onChange={handleRatingChange}
                            ></textarea>
                        </div>
                        {ratingMessage && <p className="text-green-600 dark:text-green-400 text-sm text-center">{ratingMessage}</p>}
                        {ratingError && <p className="text-red-600 dark:text-red-400 text-sm text-center">{ratingError}</p>}
                        <div>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                            >
                                Submit Rating
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-slate-600 dark:text-slate-400">Please <Link to="/login" className="text-sky-600 hover:underline dark:text-sky-400 transition-colors duration-200">log in</Link> to submit a rating.</p>
                )}
            </div>

            {/* All Ratings Section */}
            <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">All Reviews</h3>
                {ratings.length > 0 ? (
                    <ul className="space-y-4">
                        {ratings.map(rating => (
                            <li key={rating.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-b-0">
                                <p className="text-slate-700 dark:text-slate-300 text-lg font-medium flex items-center">{rating.rating} <span className="ml-1 text-amber-500">⭐</span></p>
                                <p className="text-slate-600 dark:text-slate-400 mt-1 italic">"{rating.comment}"</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                    By User ID: {rating.user_id} on {new Date(rating.createdAt).toLocaleDateString()}
                                </p>
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