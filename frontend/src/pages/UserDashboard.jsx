// frontend/src/pages/UserDashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user } = useAuth();
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Welcome to your Dashboard, {user ? user.name : 'Guest'}!</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-slate-700">This is your personalized dashboard. You can view your profile, manage your shops (if you're a store owner), and see your ratings here.</p>
                <p className="mt-4 text-slate-600">Explore the navigation to find store listings and more.</p>
            </div>
        </div>
    );
};

export default UserDashboard;