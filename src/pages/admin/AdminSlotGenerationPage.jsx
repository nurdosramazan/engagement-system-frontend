import React, { useState, useMemo } from 'react';
import { generateSlotsForMonth } from '../../api/adminService';
import toast from 'react-hot-toast';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { enUS, kk, ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

const getLocale = (lang) => {
  const langCode = lang.split('-')[0];
  if (langCode === 'kk' || langCode === 'kz') return kk;
  if (langCode === 'ru') return ru;
  return enUS;
};

const AdminSlotGenerationPage = () => {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentActualMonth = today.getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentActualMonth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentLocale = getLocale(i18n.language);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(0, i), 'MMMM', { locale: currentLocale }),
  })), [currentLocale]);

  const years = useMemo(() => Array.from({ length: 3 }, (_, i) => currentYear + i), [currentYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);

    if (isNaN(selectedYear) || isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      setError(t('admin_slots.validation.invalid_input'));
      return;
    }

    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentActualMonth)) {
      setError(t('errors.SLOTS_PAST_MONTH'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateSlotsForMonth(selectedYear, selectedMonth);
      const messageKey = response.data.data.messageKey;
      const params = response.data.data.params;
      toast.success(t(messageKey, params));
    } catch (err) {
      const errorKey = err.response?.data?.message || 'admin_slots.toasts.generate_fail';
      if (errorKey === 'SLOTS_TOO_FAR_FUTURE' || errorKey === 'SLOTS_PAST_MONTH') {
        setError(t(`errors.${errorKey}`));
        toast.error(t(`errors.${errorKey}`));
      } else {
        toast.error(t(errorKey));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMonthLabel = months.find(m => m.value === month)?.label || '';

  return (
    <div className="p-0 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {t('admin_slots.title')}
      </h1>
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-gray-600">
            {t('admin_slots.description')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin_slots.year_label')}</label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-10" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin_slots.month_label')}</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-md bg-white appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-3 top-10" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-red-300 font-semibold"
          >
            {isLoading
              ? t('admin_slots.button_loading')
              : t('admin_slots.button_submit', { month: selectedMonthLabel, year: year })}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSlotGenerationPage;