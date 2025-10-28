import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { enUS, kk, ru } from 'date-fns/locale';

const getLocale = (lang) => {
    const langCode = lang.split('-')[0];
    if (langCode === 'kk' || langCode === 'kz') return kk;
    if (langCode === 'ru') return ru;
    return enUS;
};

const AdminReportsPage = () => {
    const { t, i18n } = useTranslation();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const [reportFormat, setReportFormat] = useState('PDF');
    const [isLoading, setIsLoading] = useState(false);

    const currentLocale = getLocale(i18n.language);

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

            toast.success(t('admin_reports.toasts.download_success'));
        } catch (error) {
            toast.error(t('admin_reports.toasts.download_fail'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">{t('admin_reports.title')}</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-gray-600">
                        {t('admin_reports.description')}
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('admin_reports.date_range_label')}
                        </label>
                        <div className="flex gap-4 justify-center">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                className="w-full px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center"
                                locale={currentLocale}
                                dateFormat="PP"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                className="w-full px-4 py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center"
                                locale={currentLocale}
                                dateFormat="PP"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin_reports.format_label')}
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
                                <span className="font-semibold text-gray-800">{t('admin_reports.format_pdf')}</span>
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
                                <span className="font-semibold text-gray-800">{t('admin_reports.format_excel')}</span>
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
                        {isLoading ? t('admin_reports.button_loading') : t('admin_reports.button_submit')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminReportsPage;