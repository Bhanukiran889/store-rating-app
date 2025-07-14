// frontend/src/pages/RatingSubmission.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const RatingSubmission = () => {
    const [formData, setFormData] = useState({
        store_id: '',
        rating: '',
        comment: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!isAuthenticated) {
            setError('You must be logged in to submit a rating.');
            return;
        }

        const payload = {
            store_id: formData.store_id,
            user_id: user.id,
            rating: parseInt(formData.rating),
            comment: formData.comment,
        };

        try {
            const response = await api.post('/api/ratings', payload);
            setMessage(response.data.message || 'Rating submitted successfully!');
            setFormData({ store_id: '', rating: '', comment: '' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit rating.');
            console.error('Rating submission error:', err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Submit a Rating</h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="store_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store ID</label>
                        <input
                            type="text"
                            id="store_id"
                            name="store_id"
                            required
                            value={formData.store_id}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white py-2.5 px-3 transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="rating" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1-5)</label>
                        <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="1"
                            max="5"
                            required
                            value={formData.rating}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white py-2.5 px-3 transition-colors duration-200"
                        />
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Comment</label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows="3"
                            value={formData.comment}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white py-2.5 px-3 transition-colors duration-200"
                        />
                    </div>
                    {message && <p className="text-green-600 dark:text-green-400 text-sm text-center">{message}</p>}
                    {error && <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                        >
                            Submit Rating
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RatingSubmission;
