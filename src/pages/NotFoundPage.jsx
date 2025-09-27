import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-extrabold text-indigo-600 tracking-wider">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">
        Sorry, the page you are looking for does not exist or you don't have permission to view it.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;

