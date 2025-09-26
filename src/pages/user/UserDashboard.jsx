import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments, cancelUserAppointment } from '../../features/appointment/appointmentSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full";
    const statusClasses = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        COMPLETED: "bg-blue-100 text-blue-800",
        CANCELLED: "bg-gray-100 text-gray-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || ''}`}>{status}</span>;
};

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { appointments, status } = useSelector((state) => state.appointments);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchMyAppointments());
        }
    }, [status, dispatch]);
    
    const handleCancel = (id) => {
        if(window.confirm('Are you sure you want to cancel this appointment?')) {
            dispatch(cancelUserAppointment(id))
                .unwrap()
                .then(() => toast.success("Appointment cancelled successfully!"))
                .catch(() => toast.error("Failed to cancel appointment."));
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>
            {status === 'loading' && <p>Loading appointments...</p>}
            {status === 'succeeded' && appointments.length === 0 && (
                <p className="text-gray-600">You have no appointments scheduled.</p>
            )}
            {status === 'succeeded' && appointments.length > 0 && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spouse</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {appointments.map((app) => (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {format(new Date(app.startTime), 'MMMM d, yyyy @ h:mm a')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {app.groomFirstName} & {app.brideFirstName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={app.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                                            <button onClick={() => handleCancel(app.id)} className="text-red-600 hover:text-red-900">
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
