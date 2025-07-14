import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterShop = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', address: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_BASE_URL = 'https://store-rating-app-mysqlhost.up.railway.app';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.name || !form.address) {
            setError('Store name and address are required.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/stores`, form, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess('Shop registered successfully!');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            console.error('Error registering shop:', err);
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    if (!user || user.role !== 'Store Owner') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <p className="text-slate-700 dark:text-slate-300 text-lg">Only Store Owners can register shops.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4">
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Register New Shop</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-slate-700 dark:text-slate-300">Shop Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-slate-700 dark:text-slate-300">Email (optional)</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-slate-700 dark:text-slate-300">Address *</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
                    {success && <p className="text-green-600 dark:text-green-400">{success}</p>}

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
                    >
                        Register Shop
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterShop;
