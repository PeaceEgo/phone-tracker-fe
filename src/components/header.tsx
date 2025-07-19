import React from 'react';

const Header = () => {
    return (
        <header className="bg-gray-900 p-4 flex justify-between items-center relative z-20 sticky top-0">
            <div className="text-2xl font-bold text-white">Phone Tracking App</div>
            <div className="space-x-4">
                <a href="/auth/login" className="text-gray-200 hover:text-white">Login</a>
                <a href="/auth/signup" className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg">Get Started</a>
            </div>
        </header>
    );
};

export default Header;