import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-extrabold text-indigo-600 tracking-wider">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mt-4">{t('not_found.title')}</h2>
      <p className="text-gray-600 mt-2">
        {t('not_found.description')}
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300"
      >
        {t('not_found.button_home')}
      </Link>
    </div>
  );
};

export default NotFoundPage;

