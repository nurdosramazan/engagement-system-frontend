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
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '../../hooks/useDateFormatter';

const AlertTriangleIcon = () => <svg className="w-5 h-5 inline-block ml-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const formatHistory = (history, t) => {
    if (!history) return t('admin_dashboard.history.not_available');
    const parts = [`${t('admin_dashboard.history.total')} ${history.totalSubmissions}`];
    if (history.approvedCount > 0) parts.push(`${t('admin_dashboard.history.approved')} ${history.approvedCount}`);
    if (history.rejectedCount > 0) parts.push(`${t('admin_dashboard.history.rejected')} ${history.rejectedCount}`);
    if (history.cancelledCount > 0) parts.push(`${t('admin_dashboard.history.cancelled')} ${history.cancelledCount}`);
    if (history.completedCount > 0) parts.push(`${t('admin_dashboard.history.completed')} ${history.completedCount}`);
    return parts.join(', ');
};

const AppointmentDetails = ({ app, t, formatDate }) => (
    <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.applicant_phone')}</strong> {app.applicantPhoneNumber}</div>
            <div>
                <strong className="font-semibold text-gray-900">{t('admin_dashboard.details.applicant_history')}</strong>
                <span className="ml-1">{formatHistory(app.applicantHistory, t)}</span>
                {app.applicantHistory?.totalSubmissions > 1 && <AlertTriangleIcon />}
            </div>
            <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.groom')}</strong> {app.groomFirstName} {app.groomLastName}</div>
            <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.bride')}</strong> {app.brideFirstName} {app.brideLastName}</div>
        </div>
        <hr />
        <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.witnesses')}</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
                <li>{app.witness1FirstName} {app.witness1LastName}</li>
                <li>{app.witness2FirstName} {app.witness2LastName}</li>
                {app.witness3FirstName && <li>{app.witness3FirstName} {app.witness3LastName}</li>}
            </ul>
        </div>
        <hr />
        {app.notes && <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.user_notes')}</strong><p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded break-words">{app.notes}</p></div>}
        <div className="space-y-1 mt-3 pt-3 border-t">
            <h4 className="font-semibold text-gray-900 mb-2">{t('admin_dashboard.details.history_status')}</h4>
            <div><strong className="w-28 inline-block whitespace-nowrap">{t('admin_dashboard.details.submitted')}</strong>{formatDate(app.createdAt, 'PPpp')}</div>
            {app.processedAt && app.processedByName && (
                <div className={app.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                    <strong className="w-28 inline-block whitespace-nowrap">{t(app.status === 'REJECTED' ? 'admin_dashboard.details.rejected_by' : 'admin_dashboard.details.approved_by')}</strong>
                    {app.processedByName} ({format(new Date(app.processedAt), 'PPpp')})
                </div>
            )}
            {app.rejectionReason && <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700 break-words"><strong className="font-semibold">{t('admin_dashboard.details.rejection_reason')}</strong> {app.rejectionReason}</div>}

            {app.completedAt && app.completedByName && (
                <div className="text-blue-600">
                    <strong className="w-28 inline-block whitespace-nowrap">{t('admin_dashboard.details.completed_by')}</strong>
                    {app.completedByName} ({formatDate(app.completedAt, 'PPpp')})
                </div>
            )}
            {app.adminNotes && <div className="p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 break-words"><strong className="font-semibold">{t('admin_dashboard.details.admin_notes')}</strong> {app.adminNotes}</div>}

            {app.cancelledAt && app.cancelledByName && (
                <div className="text-gray-600">
                    <strong className="w-28 inline-block whitespace-nowrap">{t('admin_dashboard.details.cancelled_by')}</strong>
                    {app.cancelledByName} ({formatDate(app.cancelledAt, 'PPpp')})
                </div>
            )}
            {app.cancellationReason && <div className="p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 break-words"><strong className="font-semibold">{t('admin_dashboard.details.cancellation_reason')}</strong> {app.cancellationReason}</div>}
        </div>
    </div>
);

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { formatDate } = useDateFormatter();
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
    const filterOptions = [
        { label: t('admin_dashboard.filters.pending'), value: 'PENDING' },
        { label: t('admin_dashboard.filters.approved'), value: 'APPROVED' },
        { label: t('admin_dashboard.filters.completed'), value: 'COMPLETED' },
        { label: t('admin_dashboard.filters.rejected'), value: 'REJECTED' },
        { label: t('admin_dashboard.filters.cancelled'), value: 'CANCELLED' },
    ];

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
                toast.success(t(result.data.message));
            })
            .catch((err) => toast.error(t(err.message || 'admin_dashboard.toasts.approve_fail')));
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (!reason.trim()) {
            setFormErrors({ reason: t('admin_dashboard.validation.reason_empty') });
            return;
        }
        if (reason.length > MAX_REASON_LENGTH) {
            setFormErrors({ reason: t('admin_dashboard.validation.reason_length', { count: MAX_REASON_LENGTH }) });
            return;
        }
        dispatch(rejectAdminAppointment({ id: selectedApp.id, reason }))
            .unwrap()
            .then((result) => {
                toast.error(t(result.data.message));
                setIsRejectionModalOpen(false);
            })
            .catch((err) => toast.error(t(err.message || 'admin_dashboard.toasts.reject_fail')));
    };

    const handleCompleteSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (adminNotes.length > MAX_NOTES_LENGTH) {
            setFormErrors({ notes: t('admin_dashboard.validation.notes_length', { count: MAX_NOTES_LENGTH }) });
            return;
        }
        dispatch(completeAdminAppointment({ id: selectedApp.id, adminNotes }))
            .unwrap()
            .then((result) => {
                toast.success(t(result.data.message));
                setIsCompleteModalOpen(false);
            })
            .catch((err) => toast.error(t(err.message || 'admin_dashboard.toasts.complete_fail')));
    };

    const handleCancelSubmit = (e) => {
        e.preventDefault();
        setFormErrors({});
        if (!reason.trim()) {
            setFormErrors({ reason: t('admin_dashboard.validation.reason_cancellation_empty') });
            return;
        }
        if (reason.length > MAX_REASON_LENGTH) {
            setFormErrors({ reason: t('admin_dashboard.validation.reason_length', { count: MAX_REASON_LENGTH }) });
            return;
        }
        dispatch(cancelAdminAppointment({ id: selectedApp.id, reason }))
            .unwrap()
            .then((result) => {
                toast.success(t(result.data.message));
                setIsCancelModalOpen(false);
            })
            .catch((err) => toast.error(t(err.message || 'admin_dashboard.toasts.cancel_fail')));
    };

    const handleDownloadDocument = async (app) => {
        toast.loading(t('admin_dashboard.toasts.downloading'));
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
            toast.success(t('admin_dashboard.toasts.download_success'));
        } catch (error) {
            toast.dismiss();
            toast.error(t('admin_dashboard.toasts.download_error'));
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
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={t('admin_dashboard.details.title', { id: selectedApp?.id })}>
                {selectedApp && <AppointmentDetails app={selectedApp} t={t} formatDate={formatDate} />}
            </Modal>

            <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)} title={t('admin_dashboard.modals.reject_title', { id: selectedApp?.id })}>
                <form onSubmit={handleRejectSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`w-full p-2 border rounded-md ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('admin_dashboard.modals.reason_placeholder')}
                        rows="4"
                        maxLength={MAX_REASON_LENGTH}
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.reason && <p className="text-red-500 text-xs">{formErrors.reason}</p>}
                        <p className={`text-xs ml-auto ${reason.length >= MAX_REASON_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {t('admin_dashboard.modals.chars_remaining', { count: MAX_REASON_LENGTH - reason.length })}
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsRejectionModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t('buttons.cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md">{t('admin_dashboard.modals.button_submit_rejection')}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title={t('admin_dashboard.modals.cancel_title', { id: selectedApp?.id })}>
                <form onSubmit={handleCancelSubmit}>
                    <p>{t('admin_dashboard.modals.cancel_confirm_message')}</p>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-4 ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('admin_dashboard.modals.reason_cancellation_placeholder')}
                        rows="4"
                        maxLength={MAX_REASON_LENGTH}
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.reason && <p className="text-red-500 text-xs">{formErrors.reason}</p>}
                        <p className={`text-xs ml-auto ${reason.length >= MAX_REASON_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {t('admin_dashboard.modals.chars_remaining', { count: MAX_REASON_LENGTH - reason.length })}
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t('admin_dashboard.modals.button_back')}</button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md">{t('admin_dashboard.modals.button_submit_cancellation')}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title={t('admin_dashboard.modals.complete_title', { id: selectedApp?.id })}>
                <form onSubmit={handleCompleteSubmit}>
                    <p>{t('admin_dashboard.modals.complete_message')}</p>
                    <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-4 ${formErrors.notes ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('admin_dashboard.modals.admin_notes_placeholder')}
                        rows="4"
                        maxLength={MAX_NOTES_LENGTH}
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.notes && <p className="text-red-500 text-xs">{formErrors.notes}</p>}
                        <p className={`text-xs ml-auto ${adminNotes.length >= MAX_NOTES_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {t('admin_dashboard.modals.chars_remaining', { count: MAX_NOTES_LENGTH - adminNotes.length })}
                        </p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={() => setIsCompleteModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t('admin_dashboard.modals.button_back')}</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{t('admin_dashboard.modals.button_submit_completion')}</button>
                    </div>
                </form>
            </Modal>

            <h1 className="text-3xl font-bold mb-6">{t('admin_dashboard.title')}</h1>
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {filterOptions.map((option) => (
                        <motion.button
                            key={option.value}
                            onClick={() => setSelectedStatus(option.value)}
                            className={`relative px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedStatus === option.value
                                ? 'text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {selectedStatus === option.value && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-indigo-600 rounded-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{option.label}</span>
                        </motion.button>
                    ))}
                </div>
            </div>


            {status === 'loading' && <p>{t('admin_dashboard.loading')}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin_dashboard.table.applicant')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin_dashboard.table.datetime')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin_dashboard.table.status')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin_dashboard.table.actions')}</th>
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
                                    <button onClick={() => openDetailsModal(app)} className="text-indigo-600 hover:text-indigo-900">{t('admin_dashboard.table.details')}</button>
                                    <button onClick={() => handleDownloadDocument(app)} className="text-gray-600 hover:text-gray-900">{t('admin_dashboard.table.document')}</button>
                                    {app.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleApprove(app.id)} className="text-green-600 hover:text-green-900">{t('admin_dashboard.table.approve')}</button>
                                            <button onClick={() => openRejectionModal(app)} className="text-red-600 hover:text-red-900">{t('admin_dashboard.table.reject')}</button>
                                        </>
                                    )}
                                    {app.status === 'APPROVED' && (
                                        <>
                                            <button onClick={() => openCompleteModal(app)} className="text-blue-600 hover:text-blue-900">{t('admin_dashboard.table.complete')}</button>
                                            <button onClick={() => openCancelModal(app)} className="text-red-600 hover:text-red-900">{t('admin_dashboard.table.cancel')}</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {status === 'succeeded' && appointments && appointments.length === 0 && <p className="text-center mt-4">{t('admin_dashboard.empty')}</p>}
        </div>
    );
};

export default AdminDashboard;
