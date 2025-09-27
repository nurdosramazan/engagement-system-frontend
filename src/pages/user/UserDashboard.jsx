import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments, cancelUserAppointment } from '../../features/appointment/appointmentSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const dispatch = useDispatch();
    // Destructure myAppointments and provide a fallback empty array to prevent the error
    const { myAppointments = [], status } = useSelector((state) => state.appointments);

    useEffect(() => {
        dispatch(fetchMyAppointments());
    }, [dispatch]);

    const handleCancel = (id) => {
        if (window.confirm('Are you sure you want to cancel this appointment?')) {
            dispatch(cancelUserAppointment(id));
            toast.success('Your appointment has been cancelled.');
        }
    };

    const renderStatusBadge = (status) => {
        const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full inline-block";
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
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
                <Link to="/book-appointment" className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                    + Book New Appointment
                </Link>
            </div>

            {status === 'loading' && <p>Loading your appointments...</p>}
            
            {status === 'succeeded' && myAppointments.length === 0 && (
                <div className="text-center bg-white p-10 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700">No Appointments Found</h2>
                    <p className="text-gray-500 mt-2">You haven't booked any appointments yet. Get started now!</p>
                    <Link to="/book-appointment" className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                        Book Your First Appointment
                    </Link>
                </div>
            )}

            {status === 'succeeded' && myAppointments.length > 0 && (
                <div className="space-y-4">
                    {myAppointments.map((app) => (
                        <div key={app.id} className="bg-white p-6 rounded-lg shadow-md flex flex-wrap justify-between items-center">
                            <div className="flex-grow mb-4 md:mb-0">
                                <div className="flex items-center mb-2">
                                    <span className={renderStatusBadge(app.status)}>{app.status}</span>
                                </div>
                                <p className="text-lg font-semibold text-gray-800">
                                    {app.groomFirstName} & {app.brideFirstName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {format(new Date(app.startTime), 'EEEE, MMMM d, yyyy')} at {format(new Date(app.startTime), 'p')}
                                </p>
                                {app.status === 'REJECTED' && app.rejectionReason && (
                                    <p className="text-sm text-red-600 mt-1">
                                        <strong>Reason:</strong> {app.rejectionReason}
                                    </p>
                                )}
                            </div>
                            <div className="flex-shrink-0">
                                {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                                    <button 
                                        onClick={() => handleCancel(app.id)}
                                        className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm"
                                    >
                                        Cancel Appointment
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
