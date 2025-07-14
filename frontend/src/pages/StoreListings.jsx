// frontend/src/pages/StoreListings.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api'; // Using shared axios instance with baseURL

const StoreListings = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await api.get('/api/stores/with-ratings');
                setStores(response.data.stores || []);
            } catch (err) {
                setError('Failed to fetch shops.');
                console.error('Error fetching stores:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStores();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-slate-700 dark:text-slate-300">Loading shops...</p>
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">All Shops</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-6">
                Explore a list of all registered shops. Click on any shop to view its details, read reviews, and submit your own rating.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.length > 0 ? (
                    stores.map((store) => (
                        <Link to={`/stores/${store.id}`} key={store.id} className="block group">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300 border border-slate-200 dark:border-slate-700">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
                                    {store.name}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{store.address}</p>
                                <p className="text-slate-700 dark:text-slate-300">Contact: {store.contact_number}</p>
                                <div className="mt-3 text-slate-800 dark:text-slate-200 font-medium text-lg flex items-center">
                                    Average Rating: {store.average_rating ? parseFloat(store.average_rating).toFixed(2) : 'N/A'}
                                    <span className="ml-1 text-amber-500">⭐</span>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-slate-600 dark:text-slate-400 col-span-full text-center py-12">
                        No shops found. Be the first to register one!
                    </p>
                )}
            </div>
        </div>
    );
};

export default StoreListings;
