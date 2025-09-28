import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="relative text-white min-h-screen flex flex-col items-center justify-center text-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-landing-background bg-cover bg-center z-0"></div>
            <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
            
            <div className="relative z-20 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
                    Astana grand mosque's engagement registration portal
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 drop-shadow-md">
                    Welcome! You can schedule your ceremony with this platform. Login to proceed.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/login"
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-lg"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
