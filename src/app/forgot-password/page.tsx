import React from 'react';

const ForgotPassword = () => {
    return (
        <div className="min-h-screen text-white flex items-center justify-center relative">
            <div
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
                style={{ backgroundImage: 'url(/signup-bg.jpg)' }}
            ></div>
            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Phone Tracking App</h1>
                </div>
                <div className="bg-pink-600 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-center mb-4 text-white">Forgot Password</h2>
                    <p className="text-center text-gray-200 mb-6">Enter your email to reset your password.</p>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg">
                        SEND RESET LINK
                    </button>
                </div>
                <div className="text-center mt-4 text-sm text-gray-400">
                    <a href="/auth/login" className="text-purple-400 hover:underline">Back to Login</a>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;