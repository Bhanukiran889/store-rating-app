
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user, token } = useAuth();
    const [myStores, setMyStores] = useState([]);
    const [myRatings, setMyRatings] = useState([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingRatings, setLoadingRatings] = useState(false);
    const [errorStores, setErrorStores] = useState('');
    const [errorRatings, setErrorRatings] = useState('');
    const navigate = useNavigate();

    const API_BASE_URL = 'https://store-rating-app-mysqlhost.up.railway.app';

    useEffect(() => {
        if (user && token) {
            if (user.role === 'Store Owner') {
                setLoadingStores(true);
                axios.get(`${API_BASE_URL}/api/stores`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(response => {
                    const ownedStores = response.data.stores.filter(store => store.owner_id === user.id);
                    setMyStores(ownedStores);
                    setLoadingStores(false);
                })
                .catch(err => {
                    setErrorStores('Failed to fetch your shops.');
                    setLoadingStores(false);
                    console.error('Error fetching stores:', err);
                });
            }

            setLoadingRatings(true);
            axios.get(`${API_BASE_URL}/api/ratings`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                const userRatings = response.data.ratings ? response.data.ratings.filter(rating => rating.user_id === user.id) : [];
                setMyRatings(userRatings);
                setLoadingRatings(false);
            })
            .catch(err => {
                setErrorRatings('Failed to fetch your ratings.');
                setLoadingRatings(false);
                console.error('Error fetching ratings:', err);
            });
        }
    }, [user, token]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <p className="text-slate-700 dark:text-slate-300 text-lg">Please log in to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">Welcome, {user.name}!</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">This is your personalized dashboard. Here you can view your profile details, manage your registered shops (if you are a store owner), and review the ratings you've submitted.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* My Profile Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">My Profile</h3>
                    <p className="text-slate-700 dark:text-slate-300 mb-1"><span className="font-medium">Email:</span> {user.email}</p>
                    <p className="text-slate-700 dark:text-slate-300 mb-1"><span className="font-medium">Address:</span> {user.address}</p>
                    <p className="text-slate-700 dark:text-slate-300"><span className="font-medium">Role:</span> {user.role}</p>
                </div>

                {/* My Stores Card */}
                {user.role === 'Store Owner' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">My Shops</h3>
                        {loadingStores ? (
                            <p className="text-slate-600 dark:text-slate-400">Loading your shops...</p>
                        ) : errorStores ? (
                            <p className="text-red-600 dark:text-red-400">{errorStores}</p>
                        ) : myStores.length > 0 ? (
                            <ul className="space-y-2">
                                {myStores.map(store => (
                                    <li key={store.id} className="text-slate-700 dark:text-slate-300">
                                        <Link to={`/stores/${store.id}`} className="text-sky-600 hover:underline dark:text-sky-400">
                                            {store.name}
                                        </Link> ({store.address})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-600 dark:text-slate-400">You haven't registered any shops yet.</p>
                        )}
                        <button
                            onClick={() => navigate('/register-shop')}
                            className="mt-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
                        >
                            Register New Shop
                        </button>
                    </div>
                )}

                {/* My Ratings Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">My Submitted Ratings</h3>
                    {loadingRatings ? (
                        <p className="text-slate-600 dark:text-slate-400">Loading your ratings...</p>
                    ) : errorRatings ? (
                        <p className="text-red-600 dark:text-red-400">{errorRatings}</p>
                    ) : myRatings.length > 0 ? (
                        <ul className="space-y-2">
                            {myRatings.map(rating => (
                                <li key={rating.id} className="text-slate-700 dark:text-slate-300">
                                    Rating for <Link to={`/stores/${rating.store_id}`} className="text-sky-600 hover:underline dark:text-sky-400">Store ID {rating.store_id}</Link>: {rating.rating} ⭐ - "{rating.comment}"
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-400">You haven't submitted any ratings yet.</p>
                    )}
                    <Link to="/stores" className="mt-4 inline-block text-sky-600 hover:underline dark:text-sky-400 transition-colors duration-200">
                        Find shops to rate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
