import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments, cancelUserAppointment } from '../../features/appointment/appointmentSlice';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import { getAppointmentDocument } from '../../api/appointmentService';
import { fetchUserProfile } from '../../features/user/userSlice';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '../../hooks/useDateFormatter';

const AppointmentDetails = ({ app, t, formatDate }) => (
    <div className="space-y-4 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.groom')}</strong> {app.groomFirstName} {app.groomLastName}</div>
            <div><strong className="font-semibold text-gray-900">{t('admin_dashboard.details.bride')}</strong> {app.brideFirstName} {app.brideLastName}</div>
        </div>
        <hr />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong className="font-semibold text-gray-900">Witness 1:</strong> {app.witness1FirstName} {app.witness1LastName}</div>
            <div><strong className="font-semibold text-gray-900">Witness 2:</strong> {app.witness2FirstName} {app.witness2LastName}</div>
            {app.witness3FirstName && <div><strong className="font-semibold text-gray-900">Witness 3:</strong> {app.witness3FirstName} {app.witness3LastName}</div>}
        </div>
        {app.notes && <div><strong className="font-semibold text-gray-900 break-words">{t('admin_dashboard.details.user_notes')}</strong><p className="mt-1 text-gray-600 bg-gray-50 p-2 rounded">{app.notes}</p></div>}
        <hr className="my-3" />
        <h4 className="font-semibold text-gray-900 mb-2">{t('admin_dashboard.details.history_status')}</h4>
        <div className="space-y-1 text-sm text-gray-600">
            <p><strong className="w-28 inline-block">{t('admin_dashboard.details.submitted')}</strong>{formatDate(app.createdAt, 'PPpp')}</p>
            {app.processedAt && (app.status === 'APPROVED' || app.status === 'REJECTED') && (
                <p className={app.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                    <strong className="w-28 inline-block">{t(app.status === 'REJECTED' ? 'admin_dashboard.details.rejected_by' : 'admin_dashboard.details.approved_by')}</strong>
                    {formatDate(app.processedAt, 'PPpp')}
                </p>
            )}
            {app.rejectionReason && app.status === 'REJECTED' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md break-words"><strong className="font-medium text-red-700">{t('admin_dashboard.details.rejection_reason')}</strong> <span className="text-red-700">{app.rejectionReason}</span></div>
            )}
            {app.completedAt && app.status === 'COMPLETED' && (
                <p className="text-blue-600">
                    <strong className="w-28 inline-block">{t('admin_dashboard.details.completed_by')}</strong>
                    {formatDate(app.completedAt, 'PPpp')}
                </p>
            )}
            {app.cancelledAt && app.status === 'CANCELLED' && (
                <p>
                    <strong className="w-28 inline-block">{t('admin_dashboard.details.cancelled_by')}</strong>
                    {formatDate(app.cancelledAt, 'PPpp')}
                </p>
            )}
            {app.cancellationReason && app.status === 'CANCELLED' && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md break-words"><strong className="font-medium text-gray-700">{t('admin_dashboard.details.cancellation_reason')}</strong> <span className="text-gray-700">{app.cancellationReason}</span></div>
            )}
        </div>
    </div>
);

const UserDashboard = () => {
    const { formatDate } = useDateFormatter();
    const { t } = useTranslation();
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
            setFormErrors({ reason: t('user_dashboard.validation.reason_required') });
            return;
        }
        if (cancellationReason.length > MAX_REASON_LENGTH) {
            setFormErrors({ reason: t('user_dashboard.validation.reason_length', { count: MAX_REASON_LENGTH }) });
            return;
        }
        if (!selectedApp) return;

        dispatch(cancelUserAppointment({ id: selectedApp.id, reason: cancellationReason }))
            .unwrap()
            .then((result) => {
                setIsCancelModalOpen(false);
            })
            .catch((err) => {
                toast.error(t(`errors.${err.message || 'user_dashboard.toasts.cancel_fail'}`));
            });
    };

    const handleDownloadDocument = async (app) => {
        toast.loading(t('user_dashboard.toasts.downloading'));
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
            toast.success(t('user_dashboard.toasts.download_success'));
        } catch (error) {
            toast.dismiss();
            toast.error(t('user_dashboard.toasts.download_error'));
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
    const welcomeMessage = profile?.firstName
        ? t('user_dashboard.welcome_user', { name: profile.firstName })
        : t('user_dashboard.welcome_guest');

    return (
        <div className="p-4 sm:p-6">
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}
                title={selectedApp ? t('user_dashboard.details_modal_title', { date: formatDate(selectedApp.startTime, 'MMM d, yyyy') }) : t('buttons.details')}
            >
                {selectedApp && <AppointmentDetails app={selectedApp} t={t} formatDate={formatDate} />}
            </Modal>

            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}
                title={selectedApp ? t('user_dashboard.cancel_modal_title', { date: formatDate(selectedApp.startTime, 'MMM d, yyyy') }) : t('buttons.cancel')}
            >
                <form onSubmit={handleCancelSubmit} noValidate>
                    <p className="text-sm mb-4">{t('user_dashboard.cancel_modal_prompt')}</p>
                    <textarea
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className={`w-full p-2 border rounded-md mt-1 ${formErrors.reason ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder={t('user_dashboard.cancel_modal_reason_placeholder')}
                        rows="4"
                        maxLength={MAX_REASON_LENGTH}
                        required
                    />
                    <div className="flex justify-between items-center mt-1">
                        {formErrors.reason && <p className="text-red-500 text-xs">{formErrors.reason}</p>}
                        <p className={`text-xs ml-auto ${cancellationReason.length >= MAX_REASON_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                            {t('admin_dashboard.modals.chars_remaining', { count: MAX_REASON_LENGTH - cancellationReason.length })}
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            {t('buttons.back')}
                        </button>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                            {t('user_dashboard.cancel_modal_button_confirm')}
                        </button>
                    </div>
                </form>
            </Modal>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{welcomeMessage}</h1>
            <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700">{t('user_dashboard.upcoming_ceremony')}</h3>
                    {upcomingAppointment ? (
                        <p className="text-2xl font-bold text-indigo-600 mt-2">{formatDate(upcomingAppointment.startTime, 'MMMM d, yyyy')}</p>
                    ) : (
                        <p className="text-gray-500 mt-2">{t('user_dashboard.no_upcoming')}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">{t('user_dashboard.my_appointments')}</h1>
                <Link
                    to="/book-appointment"
                    className="w-full sm:w-auto text-center px-5 py-3 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-7l00 font-semibold"
                >
                    {t('user_dashboard.book_new')}
                </Link>
            </div>

            <div className="space-y-4 md:hidden">
                {(myAppointments || []).map((app) => (
                    <div key={app.id} className="bg-white/80 backdrop-blur-sm shadow-md rounded-lg p-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                            <div>
                                <p className="text-sm font-semibold text-indigo-600">
                                    {formatDate(app.startTime, 'PPpp')}
                                </p>
                                <div className="mt-2">
                                    {renderStatusBadge(app.status)}
                                </div>
                            </div>

                            <div className="flex-shrink-0 mt-4 sm:mt-0 sm:ml-4">
                                <div className="flex items-center justify-end space-x-3">
                                    <button onClick={() => handleViewDetails(app)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">{t('user_dashboard.table.details')}</button>
                                    <button onClick={() => handleDownloadDocument(app)} className="text-blue-600 hover:text-gray-900 text-sm font-medium">{t('user_dashboard.table.document')}</button>
                                    {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                                        <button onClick={() => handleCancelClick(app)} className="text-red-600 hover:text-red-900 text-sm font-medium">{t('user_dashboard.table.cancel')}</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block bg-white/80 backdrop-blur-sm shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user_dashboard.table.date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user_dashboard.table.status')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('user_dashboard.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(myAppointments || []).map((app) => (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatDate(app.startTime, 'PPpp')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {renderStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleViewDetails(app)} className="text-indigo-600 hover:text-indigo-900">{t('user_dashboard.table.details')}</button>
                                        <button onClick={() => handleDownloadDocument(app)} className="text-blue-600 hover:text-gray-900">{t('user_dashboard.table.document')}</button>
                                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                                            <button onClick={() => handleCancelClick(app)} className="text-red-600 hover:text-red-900">{t('user_dashboard.table.cancel')}</button>
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
                    <h3 className="text-lg font-medium text-gray-700">{t('user_dashboard.empty.title')}</h3>
                    <p className="text-gray-500 mt-1">{t('user_dashboard.empty.prompt')}</p>
                </div>
            }
        </div>
    );
};

export default UserDashboard;