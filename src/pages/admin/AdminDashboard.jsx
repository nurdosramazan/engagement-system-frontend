import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAppointmentsByStatus,
  approveAdminAppointment,
  rejectAdminAppointment,
  completeAdminAppointment,
  cancelAdminAppointment,
} from '../../features/admin/adminSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { getAppointmentDocument } from '../../api/appointmentService';

const AppointmentDetails = ({ app }) => (
    <div className="space-y-4 text-sm">
        <div><strong>Applicant Phone:</strong> {app.applicantPhoneNumber}</div>
        <hr/>
        <div><strong>Groom:</strong> {app.groomFirstName} {app.groomLastName}</div>
        <div><strong>Bride:</strong> {app.brideFirstName} {app.brideLastName}</div>
        <hr/>
        <div><strong>Witness 1:</strong> {app.witness1FirstName} {app.witness1LastName}</div>
        <div><strong>Witness 2:</strong> {app.witness2FirstName} {app.witness2LastName}</div>
        {app.witness3FirstName && <div><strong>Witness 3:</strong> {app.witness3FirstName} {app.witness3LastName}</div>}
        <hr/>
        {app.notes && <div><strong>Notes:</strong> <p className="mt-1 text-gray-600">{app.notes}</p></div>}
        {app.rejectionReason && <div className="p-3 bg-red-50 border border-red-200 rounded-md"><strong>Rejection Reason:</strong> <p className="mt-1 text-red-700">{app.rejectionReason}</p></div>}
        <div><strong>Submitted On:</strong> {format(new Date(app.createdAt), 'PPpp')}</div>
    </div>
);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { appointments, status } = useSelector((state) => state.admin);
    const [selectedStatus, setSelectedStatus] = useState('PENDING');

    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        dispatch(fetchAppointmentsByStatus(selectedStatus));
    }, [dispatch, selectedStatus]);

    const openDetailsModal = (app) => {
        setSelectedApp(app);
        setIsDetailsModalOpen(true);
    };

    const openRejectionModal = (app) => {
        setSelectedApp(app);
        setIsRejectionModalOpen(true);
    };
    
    const openCancelModal = (app) => {
        setSelectedApp(app);
        setIsCancelModalOpen(true);
    };

    const handleApprove = (id) => {
        dispatch(approveAdminAppointment(id));
        toast.success('Appointment approved!');
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            toast.error('Reason cannot be empty.');
            return;
        }
        dispatch(rejectAdminAppointment({ id: selectedApp.id, reason: rejectionReason }));
        toast.error('Appointment rejected.');
        setIsRejectionModalOpen(false);
        setRejectionReason('');
    };

    const handleComplete = (id) => {
        dispatch(completeAdminAppointment(id));
        toast.success('Appointment marked as complete!');
    };

    const handleCancelSubmit = () => {
        dispatch(cancelAdminAppointment(selectedApp.id));
        toast.warn('Appointment has been cancelled.');
        setIsCancelModalOpen(false);
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

    return (
        <div className="p-6">
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={`Details for Appointment #${selectedApp?.id}`}>
                {selectedApp && <AppointmentDetails app={selectedApp} />}
            </Modal>
            
            <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)} title={`Reject Appointment #${selectedApp?.id}`}>
                <form onSubmit={handleRejectSubmit}>
                    <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full p-2 border rounded-md" placeholder="Provide a reason..." rows="4" required />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsRejectionModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md">Submit Rejection</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title={`Confirm Cancellation`}>
                <p>Are you sure you want to cancel the appointment for <span className="font-semibold">{selectedApp?.applicantPhoneNumber}</span> on <span className="font-semibold">{selectedApp && format(new Date(selectedApp.startTime), 'PP')}</span>?</p>
                <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Back</button>
                    <button onClick={handleCancelSubmit} className="px-4 py-2 bg-red-600 text-white rounded-md">Yes, Cancel Appointment</button>
                </div>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.applicantPhoneNumber}</td>
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
                                            <button onClick={() => handleComplete(app.id)} className="text-blue-600 hover:text-blue-900">Complete</button>
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

