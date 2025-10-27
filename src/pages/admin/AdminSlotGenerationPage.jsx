import React, { useState } from 'react';
import { generateSlotsForMonth } from '../../api/adminService';
import toast from 'react-hot-toast';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

const AdminSlotGenerationPage = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentActualMonth = today.getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentActualMonth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);

    if (isNaN(selectedYear) || isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
      setError('Please enter a valid year and month (1-12).');
      return;
    }

    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentActualMonth)) {
      setError('Cannot generate slots for a past month.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await generateSlotsForMonth(selectedYear, selectedMonth);
      toast.success(response.data.message || 'Slots generated successfully!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to generate slots.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(0, i), 'MMMM'),
  }));

  return (
    <div className="p-0 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Generate Time Slots
      </h1>
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-sm text-gray-600">
            Select a month and year to generate available 30-minute appointment
            slots. This process will skip any slots that already exist.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
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
              ? 'Generating...'
              : `Generate Slots for ${new Date(0, month - 1).toLocaleString(
                'default',
                { month: 'long' }
              )} ${year}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSlotGenerationPage;