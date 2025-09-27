import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import { format } from 'date-fns';

const AdminReportsPage = () => {
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [formatType, setFormatType] = useState('pdf');
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await adminService.getReport(formatType, startDate, endDate);
            
            // Create a link to download the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // FIX: Use the correct file extension based on formatType
            const fileExtension = formatType === 'excel' ? 'xlsx' : 'pdf';
            const fileName = `appointments-report_${startDate}_to_${endDate}.${fileExtension}`;
            
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
            <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Format</label>
                        <select value={formatType} onChange={(e) => setFormatType(e.target.value)} className="mt-1 block w-full p-2 border rounded-md">
                            <option value="pdf">PDF</option>
                            <option value="excel">Excel</option>
                        </select>
                    </div>
                    <button onClick={handleDownload} disabled={isLoading} className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                        {isLoading ? 'Generating...' : 'Download Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminReportsPage;

