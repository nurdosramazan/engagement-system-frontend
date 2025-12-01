import React, { useState, useEffect } from 'react';
import * as superAdminService from '../../api/superAdminService';
import toast from 'react-hot-toast';

const DownloadIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const SuperAdminPage = () => {
  const [logFiles, setLogFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const files = await superAdminService.listLogFiles();
        setLogFiles(files);
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Failed to fetch log files.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleDownload = async (fileName) => {
    await superAdminService.downloadLogFile(fileName);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Application Logs</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-sm text-gray-600 mb-4">
          Select a log file to download server logs for debugging purposes.
        </p>
        {isLoading ? (
          <p>Loading log files...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    File Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logFiles.map((fileName) => (
                  <tr key={fileName}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDownload(fileName)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                      >
                        <DownloadIcon />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {logFiles.length === 0 && !isLoading && (
          <p className="text-center text-gray-500 py-4">No log files found.</p>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPage;