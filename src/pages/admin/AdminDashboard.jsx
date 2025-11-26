import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAppointmentsByStatus,
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
import AppointmentDetails from '../../components/admin/AppointmentDetails';

const AlertTriangleIcon = () => <svg className="w-5 h-5 inline-block ml-1 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

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
        setSelectedApp(app || selectedApp);
        setReason('');
        setFormErrors({});
        setIsDetailsModalOpen(false);
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

            const contentDisposition = response.headers["content-disposition"];
            let filename = "document";

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="(.+)"/);
                if (match && match[1]) filename = match[1];
            }

            const contentType = response.headers["content-type"];

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();

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
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title={t('admin_dashboard.details.title', { id: selectedApp?.id })} size="lg">
                {selectedApp && <AppointmentDetails app={selectedApp} t={t} formatDate={formatDate}
                    onReject={() => openRejectionModal(selectedApp)}
                    onApproveSuccess={() => setIsDetailsModalOpen(false)}
                    onEditSuccess={() => { }}
                />}
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
