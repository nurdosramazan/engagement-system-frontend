import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments, cancelUserAppointment } from '../../features/appointment/appointmentSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { getAppointmentDocument } from '../../api/appointmentService';
import { fetchUserProfile } from '../../features/user/userSlice';

const AppointmentDetails = ({ app }) => (
    <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-2 gap-4">
            <div><strong className="font-semibold text-gray-900">Groom:</strong> {app.groomFirstName} {app.groomLastName}</div>
            <div><strong className="font-semibold text-gray-900">Bride:</strong> {app.brideFirstName} {app.brideLastName}</div>
        </div>
        <hr />
        <div className="grid grid-cols-2 gap-4">
            <div><strong className="font-semibold text-gray-900">Witness 1:</strong> {app.witness1FirstName} {app.witness1LastName}</div>
            <div><strong className="font-semibold text-gray-900">Witness 2:</strong> {app.witness2FirstName} {app.witness2LastName}</div>
            {app.witness3FirstName && <div><strong className="font-semibold text-gray-900">Witness 3:</strong> {app.witness3FirstName} {app.witness3LastName}</div>}
        </div>
        {app.notes && <div><strong className="font-semibold text-gray-900 break-words">Notes:</strong><p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">{app.notes}</p></div>}
        <hr className="my-3" />
        <h4 className="font-semibold text-gray-900 mb-2">Status & History</h4>
        <div className="space-y-1 text-sm text-gray-600">
            <p><strong className="w-28 inline-block">Submitted:</strong>{format(new Date(app.createdAt), 'PPpp')}</p>
            {app.processedAt && (app.status === 'APPROVED' || app.status === 'REJECTED') && (
                <p className={app.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                    <strong className="w-28 inline-block">{app.status === 'REJECTED' ? 'Rejected:' : 'Approved:'}</strong>
                    {format(new Date(app.processedAt), 'PPpp')}
                </p>
            )}
            {app.rejectionReason && app.status === 'REJECTED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md break-words"><strong className="font-medium text-red-700">Rejection Reason:</strong> <span className="text-red-700">{app.rejectionReason}</span></div>
            )}
            {app.completedAt && app.status === 'COMPLETED' && (
                <p className="text-blue-600">
                    <strong className="w-28 inline-block">Completed:</strong>
                    {format(new Date(app.completedAt), 'PPpp')}
                </p>
            )}
            {app.cancelledAt && app.status === 'CANCELLED' && (
                <p>
                    <strong className="w-28 inline-block">Cancelled:</strong>
                    {format(new Date(app.cancelledAt), 'PPpp')}
                </p>
            )}
            {app.cancellationReason && app.status === 'CANCELLED' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md break-words"><strong className="font-medium text-gray-700">Cancellation Reason:</strong> <span className="text-gray-700">{app.cancellationReason}</span></div>
            )}
        </div>
    </div>
);

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { myAppointments, status } = useSelector((state) => state.appointments);
    const { user } = useSelector((state) => state.auth);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const { profile } = useSelector((state) => state.user);


    useEffect(() => {
        dispatch(fetchMyAppointments());
        dispatch(fetchUserProfile());
    }, [dispatch]);

    const handleViewDetails = (app) => {
        setSelectedApp(app);
        setIsDetailsModalOpen(true);
    };

    const handleCancelClick = (app) => {
        setSelectedApp(app);
        setCancellationReason('');
        setFormErrors({});
        setIsCancelModalOpen(true);
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (!cancellationReason.trim()) {
            setFormErrors({ reason: 'A reason for cancellation is required.' });
            return;
        }
        if (cancellationReason.length > MAX_REASON_LENGTH) {
            setFormErrors({ reason: `Reason cannot exceed ${MAX_REASON_LENGTH} characters.` });
            return;
        }
        if (!selectedApp) return;

        dispatch(cancelUserAppointment({ id: selectedApp.id, reason: cancellationReason }))
            .unwrap()
            .then((result) => {
                setIsCancelModalOpen(false);
            })
            .catch((err) => {
                toast.error(err.message || 'Failed to cancel appointment.');
            });
    };

    const handleDownloadDocument = async (app) => {
        toast.loading('Downloading document...');
        try {
            const response = await getAppointmentDocument(app.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const filename = app.documentPath.split('/').pop();
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.dismiss();
            toast.success('Document downloaded!');
        } catch (error) {
            toast.dismiss();
            toast.error('Could not download document.');
        }
    };

    const renderStatusBadge = (status) => {
        const styles = {
            PENDING: "bg-yellow-100 text-yellow-800",
            APPROVED: "bg-green-100 text-green-800",
            REJECTED: "bg-red-100 text-red-800",
            COMPLETED: "bg-blue-100 text-blue-800",
            CANCELLED: "bg-gray-100 text-gray-800",
        };
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };
    const MAX_REASON_LENGTH = 255;
    const upcomingAppointment = myAppointments?.find(app => app.status === 'APPROVED');
    const pendingCount = myAppointments?.filter(app => app.status === 'PENDING').length || 0;
    const welcomeMessage = profile?.firstName
        ? `Welcome, ${profile.firstName}!`
        : "Welcome!";

    return (
        <div className="p-6">
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={selectedApp ? `Appointment Details (${format(new Date(selectedApp.startTime), 'MMM d, yyyy')})` : 'Details'}>
                {selectedApp && <AppointmentDetails app={selectedApp} />}
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title={selectedApp ? `Cancel Appointment (${format(new Date(selectedApp.startTime), 'MMM d, yyyy')})` : 'Cancel Appointment'}>
                <form onSubmit={handleCancelSubmit} noValidate>
                    <p className="text-sm mb-4">Please provide a reason for cancelling this appointment.</p>
                    <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-1 ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Reason..."
                        rows="4"
                        maxLength={MAX_REASON_LENGTH}
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.reason && <p className="text-red-500 text-xs">{formErrors.reason}</p>}
                        <p className={`text-xs ml-auto ${cancellationReason.length >= MAX_REASON_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {MAX_REASON_LENGTH - cancellationReason.length} characters remaining
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Back
                        </button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            Confirm Cancellation
                        </button>
                    </div>
                </form>
            </Modal>

            <div className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-lg shadow-lg">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{welcomeMessage}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Upcoming ceremony</h3>
                    {upcomingAppointment ? (
                        <p className="text-2xl font-bold text-indigo-600 mt-2">{format(new Date(upcomingAppointment.startTime), 'MMMM d, yyyy')}</p>
                    ) : (
                        <p className="text-gray-500 mt-2">No upcoming approved appointments.</p>
                    )}
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700">Pending applications</h3>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Appointments</h1>
                <Link to="/book-appointment" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold">
                    + Book new appointment
                </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ceremony date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(myAppointments || []).map((app) => (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {format(new Date(app.startTime), 'PPpp')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {renderStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleViewDetails(app)} className="text-indigo-600 hover:text-indigo-900">Details</button>
                                        <button onClick={() => handleDownloadDocument(app)} className="text-blue-600 hover:text-gray-900">Document</button>
                                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                                            <button onClick={() => handleCancelClick(app)} className="text-red-600 hover:text-red-900">Cancel</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {status === 'succeeded' && (!myAppointments || myAppointments.length === 0) &&
                <div className="text-center mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-lg">
                    <h3 className="text-lg font-medium text-gray-700">No appointments found.</h3>
                    <p className="text-gray-500 mt-1">Ready to book your special day?</p>
                </div>
            }
        </div>
    );
};

export default UserDashboard;