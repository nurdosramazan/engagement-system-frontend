import React, { useState } from 'react';
import { downloadReport } from '../../api/adminService';
import toast from 'react-hot-toast';

const AdminReportsPage = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [format, setFormat] = useState('pdf');
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async (e) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            toast.error("Please select both a start and end date.");
            return;
        }
        setIsLoading(true);
        try {
            const blob = await downloadReport(format, startDate, endDate);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `appointments-report_${startDate}_to_${endDate}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Report download started!");
        } catch (error) {
            toast.error("Failed to generate report.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Reports</h1>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleDownload} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
                        </div>
                    </div>

                    <div>
                        <span className="block text-sm font-medium text-gray-700">Format</span>
                        <div className="mt-2 flex space-x-4">
                            <label className="inline-flex items-center">
                                <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="form-radio h-4 w-4 text-red-600"/>
                                <span className="ml-2">PDF</span>
                            </label>
                             <label className="inline-flex items-center">
                                <input type="radio" name="format" value="excel" checked={format === 'excel'} onChange={() => setFormat('excel')} className="form-radio h-4 w-4 text-red-600"/>
                                <span className="ml-2">Excel (XLSX)</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-red-300 font-semibold">
                        {isLoading ? 'Generating...' : 'Download Report'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminReportsPage;
