// frontend/src/pages/Register.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Register Account</h2>
                <p className="text-center text-sm text-slate-600">
                    This is the Register page. Form will go here.
                </p>
                <div className="text-center">
                    <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
                        Already have an account? Login here.
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;