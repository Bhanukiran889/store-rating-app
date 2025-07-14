import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'Normal User',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await api.post('/api/auth/register', formData);
      setMessage(response.data.message || 'Registration successful!');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-xl">
        <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Register Account
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Password"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <input
              id="address"
              name="address"
              type="text"
              required
              placeholder="Address"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div>
            <select
              id="role"
              name="role"
              required
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="Normal User">Normal User</option>
              <option value="Store Owner">Store Owner</option>
              <option value="System Administrator">System Administrator</option>
            </select>
          </div>

          {message && <p className="text-green-600 text-sm text-center">{message}</p>}
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              Register
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Already have an account? Login here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
