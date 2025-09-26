import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointmentsByStatus,
  approveAdminAppointment,
  rejectAdminAppointment,
  completeAdminAppointment,
} from '../../features/admin/adminSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// A reusable Modal component for entering the rejection reason
const RejectionModal = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.trim()) {
            onSubmit(reason);
        } else {
            toast.error('Rejection reason cannot be blank.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Reject Appointment</h2>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="Please provide a reason for rejection..."
                        rows="4"
                        required
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
                            Submit Rejection
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminDashboard = () => {
    const dispatch = useDispatch();
    // This line will now work because `state.admin` will exist
    const { appointments, status } = useSelector((state) => state.admin);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    useEffect(() => {
        dispatch(fetchAppointmentsByStatus(selectedStatus));
    }, [dispatch, selectedStatus]);

    const handleApprove = (id) => {
        dispatch(approveAdminAppointment(id));
        toast.success('Appointment approved!');
    };

    const handleReject = (reason) => {
        dispatch(rejectAdminAppointment({ id: selectedAppointmentId, reason }));
        toast.error('Appointment rejected.');
        setIsModalOpen(false);
        setSelectedAppointmentId(null);
    };

    const handleComplete = (id) => {
        dispatch(completeAdminAppointment(id));
        toast.success('Appointment marked as complete!');
    };

    const openRejectModal = (id) => {
        setSelectedAppointmentId(id);
        setIsModalOpen(true);
    };

    const renderStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'PENDING': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'APPROVED': return `${baseClasses} bg-green-100 text-green-800`;
            case 'REJECTED': return `${baseClasses} bg-red-100 text-red-800`;
            case 'COMPLETED': return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'CANCELLED': return `${baseClasses} bg-gray-100 text-gray-800`;
            default: return baseClasses;
        }
    }

    return (
        <div className="p-6">
            <RejectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleReject} />
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="mb-4">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="p-2 border rounded-md">
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>
            
            {status === 'loading' && <p>Loading appointments...</p>}
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(appointments || []).map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.applicantPhoneNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {app.groomFirstName} & {app.brideFirstName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(app.startTime), 'PPpp')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={renderStatusBadge(app.status)}>{app.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    {app.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(app.id)} className="text-indigo-600 hover:text-indigo-900">Approve</button>
                                            <button onClick={() => openRejectModal(app.id)} className="text-red-600 hover:text-red-900">Reject</button>
                                        </>
                                    )}
                                    {app.status === 'APPROVED' && (
                                        <button onClick={() => handleComplete(app.id)} className="text-green-600 hover:text-green-900">Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {status === 'succeeded' && appointments && appointments.length === 0 && <p className="text-center mt-4">No appointments found for this status.</p>}
        </div>
    );
};

export default AdminDashboard;

