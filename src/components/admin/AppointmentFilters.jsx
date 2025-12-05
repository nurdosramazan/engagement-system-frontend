import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const AppointmentFilters = ({ onFilterChange }) => {
    const { t } = useTranslation();

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ search, status, startDate, endDate });
        }, 1000);
        return () => clearTimeout(timer);
    }, [search, status, startDate, endDate]);

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

                <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{t('admin_dashboard.filters.search_label')}</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5 transition-shadow"
                            placeholder={t('admin_dashboard.filters.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{t('admin_dashboard.filters.status')}</label>
                    <select
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">{t('admin_dashboard.filters.all_statuses')}</option>
                        <option value="PENDING">{t('admin_dashboard.filters.pending')}</option>
                        <option value="APPROVED">{t('admin_dashboard.filters.approved')}</option>
                        <option value="REJECTED">{t('admin_dashboard.filters.rejected')}</option>
                        <option value="COMPLETED">{t('admin_dashboard.filters.completed')}</option>
                        <option value="CANCELLED">{t('admin_dashboard.filters.cancelled')}</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{t('admin_dashboard.filters.date_from')}</label>
                    <input
                        type="date"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">{t('admin_dashboard.filters.date_to')}</label>
                    <input
                        type="date"
                        className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2.5"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>

                <div className="md:col-span-2 flex justify-end">
                    {(search || status || startDate || endDate) && (
                        <button
                            onClick={handleReset}
                            className="flex items-center px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full justify-center transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4 mr-2" />
                            {t('buttons.reset')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentFilters;