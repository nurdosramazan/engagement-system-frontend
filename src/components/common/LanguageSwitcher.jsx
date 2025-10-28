import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2 items-center">
            <button
                onClick={() => changeLanguage('en')}
                disabled={i18n.language.startsWith('en')}
                className="text-sm font-medium disabled:text-gray-900 text-gray-500 disabled:font-bold"
            >
                EN
            </button>
            <span className="text-gray-300">|</span>
            <button
                onClick={() => changeLanguage('kz')}
                disabled={i18n.language.startsWith('kz')}
                className="text-sm font-medium disabled:text-gray-900 text-gray-500 disabled:font-bold"
            >
                KZ
            </button>
        </div>
    );
};

export default LanguageSwitcher;