import React, { useState } from 'react';
import { generateSlotsForMonth } from '../../api/adminService';
import toast from 'react-hot-toast';

const AdminSlotGenerationPage = () => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await generateSlotsForMonth(year, month);
            toast.success(response.message || "Slots generated successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to generate slots.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Time Slots</h1>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <p className="text-sm text-gray-600">
                        Select a month and year to generate available 30-minute appointment slots. This process will skip any slots that already exist.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
                            <input 
                                type="number" 
                                id="year" 
                                value={year} 
                                onChange={e => setYear(parseInt(e.target.value))} 
                                required 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                min={today.getFullYear()}
                            />
                        </div>
                        <div>
                            <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
                            <select 
                                id="month" 
                                value={month} 
                                onChange={e => setMonth(parseInt(e.target.value))} 
                                required 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>
                                        {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                     <button type="submit" disabled={isLoading} className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-red-300 font-semibold">
                        {isLoading ? 'Generating...' : `Generate Slots for ${new Date(0, month - 1).toLocaleString('default', { month: 'long' })} ${year}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSlotGenerationPage;
