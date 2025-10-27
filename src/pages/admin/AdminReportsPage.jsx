import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';

const AdminReportsPage = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [reportFormat, setReportFormat] = useState('PDF');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const startDateString = format(startDate, 'yyyy-MM-dd');
        const endDateString = format(endDate, 'yyyy-MM-dd');

        try {
            const response = await adminService.getReport(
                reportFormat.toLowerCase(),
                startDateString,
                endDateString
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const fileExtension = reportFormat === 'EXCEL' ? 'xlsx' : 'pdf';
            const fileName = `appointments-report_${startDateString}_to_${endDateString}.${fileExtension}`;

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Report downloaded successfully!');
        } catch (error) {
            toast.error('Failed to download report.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Generate Reports</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-gray-600">
                        Select a date range and format to download.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Range
                        </label>
                        <div className="flex gap-4 justify-center">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                className="w-full px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                className="w-full px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format
                        </label>
                        <div className="flex gap-4">
                            <motion.button
                                type="button"
                                onClick={() => setReportFormat('PDF')}
                                className={`relative w-32 p-1 border-2 rounded-xl text-center cursor-pointer transition-all ${reportFormat === 'PDF'
                                    ? 'border-red-600 shadow-lg'
                                    : 'border-gray-300'
                                    }`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <span className="font-semibold text-gray-800">PDF</span>
                                <AnimatePresence>
                                    {reportFormat === 'PDF' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute top-2 right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-md"
                                        ></motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setReportFormat('EXCEL')}
                                className={`relative w-32 p-1 border-2 rounded-xl text-center cursor-pointer transition-all ${reportFormat === 'EXCEL'
                                    ? 'border-green-600 shadow-lg'
                                    : 'border-gray-300'
                                    }`}
                                whileHover={{ scale: 1.03 }}
                            >
                                <span className="font-semibold text-gray-800">Excel</span>
                                <AnimatePresence>
                                    {reportFormat === 'EXCEL' && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute top-2 right-2 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center shadow-md"
                                        ></motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                        {isLoading ? 'Generating...' : 'Download Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminReportsPage;