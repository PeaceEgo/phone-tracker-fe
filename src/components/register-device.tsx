import React from 'react';

const DeviceRegistration = () => {
    return (
        <div className="min-h-screen text-white flex items-center justify-center relative">
            <div
                className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-30"
                style={{ backgroundImage: 'url(/signup-bg.jpg)' }}
            ></div>
            <div className="w-full max-w-md p-8 relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Phone Tracking App</h1>
                    <div className="flex justify-center mt-2">
                        <div className="w-2/3 bg-gray-700 h-1.5 rounded-full">
                            <div className="bg-gradient-to-r from-pink-600 to-purple-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">Step 2 of 2</p>
                </div>
                <div className="bg-pink-600 p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-center mb-4 text-white">Register Device</h2>
                    <p className="text-center text-gray-200 mb-6">Set up your device to start tracking.</p>
                    <select
                        className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    >
                        <option value="" disabled selected>Select Device Type</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Device Name"
                        className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                    />
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            className="mr-2 focus:ring-purple-500 text-purple-600"
                        />
                        <label className="text-gray-200">Allow location access</label>
                    </div>
                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg">
                        REGISTER DEVICE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeviceRegistration;