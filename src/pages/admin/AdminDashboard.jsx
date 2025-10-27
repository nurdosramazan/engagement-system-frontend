import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAppointmentsByStatus,
    approveAdminAppointment,
    rejectAdminAppointment,
    completeAdminAppointment,
    cancelAdminAppointment,
} from '../../features/admin/adminSlice';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { getAppointmentDocument } from '../../api/appointmentService';

const AlertTriangleIcon = () => <svg className="w-5 h-5 inline-block ml-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const formatHistory = (history) => {
    if (!history) return 'N/A';
    const parts = [`Total: ${history.totalSubmissions}`];
    if (history.approvedCount > 0) parts.push(`Approved: ${history.approvedCount}`);
    if (history.rejectedCount > 0) parts.push(`Rejected: ${history.rejectedCount}`);
    if (history.cancelledCount > 0) parts.push(`Cancelled: ${history.cancelledCount}`);
    if (history.completedCount > 0) parts.push(`Completed: ${history.completedCount}`);
    return parts.join(', ');
};

const AppointmentDetails = ({ app }) => (
    <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div><strong className="font-semibold text-gray-900">Applicant Phone:</strong> {app.applicantPhoneNumber}</div>
            <div>
                <strong className="font-semibold text-gray-900">Applicant History:</strong>
                <span className="ml-1">{formatHistory(app.applicantHistory)}</span>
                {app.applicantHistory?.totalSubmissions > 1 && <AlertTriangleIcon />}
            </div>
            <div><strong className="font-semibold text-gray-900">Groom:</strong> {app.groomFirstName} {app.groomLastName}</div>
            <div><strong className="font-semibold text-gray-900">Bride:</strong> {app.brideFirstName} {app.brideLastName}</div>
        </div>
        <hr />
        <div><strong className="font-semibold text-gray-900">Witnesses:</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
                <li>{app.witness1FirstName} {app.witness1LastName}</li>
                <li>{app.witness2FirstName} {app.witness2LastName}</li>
                {app.witness3FirstName && <li>{app.witness3FirstName} {app.witness3LastName}</li>}
            </ul>
        </div>
        <hr />
        {app.notes && <div><strong className="font-semibold text-gray-900">User Notes:</strong><p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded break-words">{app.notes}</p></div>}
        <div className="space-y-1 mt-3 pt-3 border-t">
            <h4 className="font-semibold text-gray-900 mb-2">History & Status</h4>
            <div><strong className="w-28 inline-block whitespace-nowrap">Submitted:</strong>{format(new Date(app.createdAt), 'PPpp')}</div>
            {app.processedAt && app.processedByName && (
                <div className={app.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                    <strong className="w-28 inline-block whitespace-nowrap">{app.status === 'REJECTED' ? 'Rejected By:' : 'Approved By:'}</strong>
                    {app.processedByName} ({format(new Date(app.processedAt), 'PPpp')})
                </div>
            )}
            {app.rejectionReason && <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700 break-words"><strong className="font-semibold">Rejection Reason:</strong> {app.rejectionReason}</div>}

            {app.completedAt && app.completedByName && (
                <div className="text-blue-600">
                    <strong className="w-28 inline-block whitespace-nowrap">Completed By:</strong>
                    {app.completedByName} ({format(new Date(app.completedAt), 'PPpp')})
                </div>
            )}
            {app.adminNotes && <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 break-words"><strong className="font-semibold">Admin Notes:</strong> {app.adminNotes}</div>}

            {app.cancelledAt && app.cancelledByName && (
                <div className="text-gray-600">
                    <strong className="w-28 inline-block whitespace-nowrap">Cancelled By:</strong>
                    {app.cancelledByName} ({format(new Date(app.cancelledAt), 'PPpp')})
                </div>
            )}
            {app.cancellationReason && <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 break-words"><strong className="font-semibold">Cancellation Reason:</strong> {app.cancellationReason}</div>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { appointments, status } = useSelector((state) => state.admin);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [reason, setReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        dispatch(fetchAppointmentsByStatus(selectedStatus));
    }, [dispatch, selectedStatus]);

    const openDetailsModal = (app) => {
        setSelectedApp(app);
        setIsDetailsModalOpen(true);
    };

    const openRejectionModal = (app) => {
        setSelectedApp(app);
        setReason('');
        setFormErrors({});
        setIsRejectionModalOpen(true);
    };

    const openCancelModal = (app) => {
        setSelectedApp(app);
        setReason('');
        setFormErrors({});
        setIsCancelModalOpen(true);
    };

    const openCompleteModal = (app) => {
        setSelectedApp(app);
        setAdminNotes('');
        setFormErrors({});
        setIsCompleteModalOpen(true);
    };

    const handleApprove = (id) => {
        dispatch(approveAdminAppointment(id))
            .unwrap()
            .then((result) => {
                toast.success(result.data.message);
            })
            .catch((err) => toast.error(err.message || 'Failed to approve.'));
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (!reason.trim()) {
            setFormErrors({ reason: 'Reason cannot be empty.' });
            return;
        }
        if (reason.length > 255) {
            setFormErrors({ reason: 'Reason cannot exceed 255 characters.' });
            return;
        }
        dispatch(rejectAdminAppointment({ id: selectedApp.id, reason }))
            .unwrap()
            .then((result) => {
                toast.error(result.data.message);
                setIsRejectionModalOpen(false);
            })
            .catch((err) => toast.error(err.message || 'Failed to reject.'));
    };

    const handleCompleteSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (adminNotes.length > 500) {
            setFormErrors({ notes: 'Admin notes cannot exceed 500 characters.' });
            return;
        }
        dispatch(completeAdminAppointment({ id: selectedApp.id, adminNotes }))
            .unwrap()
            .then((result) => {
                toast.success(result.data.message);
                setIsCompleteModalOpen(false);
            })
            .catch((err) => toast.error(err.message || 'Failed to complete.'));
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (!reason.trim()) {
            setFormErrors({ reason: 'Reason for cancellation cannot be empty.' });
            return;
        }
        if (reason.length > 255) {
            setFormErrors({ reason: 'Reason cannot exceed 255 characters.' });
            return;
        }
        dispatch(cancelAdminAppointment({ id: selectedApp.id, reason }))
            .unwrap()
            .then((result) => {
                toast.success(result.data.message);
                setIsCancelModalOpen(false);
            })
            .catch((err) => toast.error(err.message || 'Failed to cancel.'));
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
    const MAX_NOTES_LENGTH = 500;

    return (
        <div className="p-6">
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Details for Appointment #${selectedApp?.id}`}>
                {selectedApp && <AppointmentDetails app={selectedApp} />}
            </Modal>

            <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)} title={`Reject Appointment #${selectedApp?.id}`}>
                <form onSubmit={handleRejectSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`w-full p-2 border rounded-md ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Provide a reason..."
                        rows="4"
                        maxLength={MAX_REASON_LENGTH}
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.reason && <p className="text-red-500 text-xs">{formErrors.reason}</p>}
                        <p className={`text-xs ml-auto ${reason.length >= MAX_REASON_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {MAX_REASON_LENGTH - reason.length} characters remaining
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsRejectionModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md">Submit Rejection</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title={`Cancel Appointment #${selectedApp?.id}`}>
                <form onSubmit={handleCancelSubmit}>
                    <p> Are you sure you want to cancel this appointment? Please provide a reason.</p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-4 ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Reason for cancellation..."
                        rows="4"
                        maxLength={MAX_REASON_LENGTH}
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.reason && <p className="text-red-500 text-xs">{formErrors.reason}</p>}
                        <p className={`text-xs ml-auto ${reason.length >= MAX_REASON_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {MAX_REASON_LENGTH - reason.length} characters remaining
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Back</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md">Yes, Cancel Appointment</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title={`Complete Appointment #${selectedApp?.id}`}>
                <form onSubmit={handleCompleteSubmit}>
                    <p>Enter administrative notes (optional).</p>
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-4 ${formErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Admin notes..."
                        rows="4"
                        maxLength={MAX_NOTES_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.notes && <p className="text-red-500 text-xs">{formErrors.notes}</p>}
                        <p className={`text-xs ml-auto ${adminNotes.length >= MAX_NOTES_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {MAX_NOTES_LENGTH - adminNotes.length} characters remaining
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Back</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Mark as Complete</button>
                    </div>
                </form>
            </Modal>

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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {(appointments || []).map((app) => (
                            <tr key={app.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {app.applicantPhoneNumber}
                                    {app.applicantHistory?.totalSubmissions > 1 && <AlertTriangleIcon />}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(app.startTime), 'PPpp')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{renderStatusBadge(app.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                    <button onClick={() => openDetailsModal(app)} className="text-indigo-600 hover:text-indigo-900">Details</button>
                                    <button onClick={() => handleDownloadDocument(app)} className="text-gray-600 hover:text-gray-900">Document</button>
                                    {app.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(app.id)} className="text-green-600 hover:text-green-900">Approve</button>
                                            <button onClick={() => openRejectionModal(app)} className="text-red-600 hover:text-red-900">Reject</button>
                                        </>
                                    )}
                                    {app.status === 'APPROVED' && (
                                        <>
                                            <button onClick={() => openCompleteModal(app)} className="text-blue-600 hover:text-blue-900">Complete</button>
                                            <button onClick={() => openCancelModal(app)} className="text-red-600 hover:text-red-900">Cancel</button>
                                        </>
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
