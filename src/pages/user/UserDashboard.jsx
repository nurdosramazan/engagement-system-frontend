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
import { UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid';


const AppointmentDetails = ({ app, t, formatDate }) => (
    <div className="space-y-6 text-sm text-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 relative overflow-hidden">
                <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                    <span className="mr-2 text-2xl">🤵</span> {t('admin_dashboard.details.section_groom')}
                </h3>
                <div className="space-y-3">
                    <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_name')}</span> <p className="font-medium text-gray-800">{app.groomFirstName} {app.groomLastName}</p></div>

                    {app.groomPhoneNumber && (
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_phone')}</span> <p className="font-medium text-gray-800">{app.groomPhoneNumber}</p></div>
                    )}
                    {app.groomDateOfBirth && (
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_dob')}</span> <p className="font-medium text-gray-800">{formatDate(app.groomDateOfBirth, 'PPP')}</p></div>
                    )}
                    {app.groomOrigin && (
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_origin')}</span> <p className="font-medium text-gray-800">{app.groomOrigin}</p></div>
                    )}
                </div>
            </div>

            <div className="bg-pink-50 p-5 rounded-xl border border-pink-100 relative overflow-hidden">
                <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center">
                    <span className="mr-2 text-2xl">🧕</span> {t('admin_dashboard.details.section_bride')}
                </h3>
                <div className="space-y-3">
                    <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_name')}</span> <p className="font-medium text-gray-800">{app.brideFirstName} {app.brideLastName}</p></div>

                    {app.bridePhoneNumber && (
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_phone')}</span> <p className="font-medium text-gray-800">{app.bridePhoneNumber}</p></div>
                    )}
                    {app.brideDateOfBirth && (
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_dob')}</span> <p className="font-medium text-gray-800">{formatDate(app.brideDateOfBirth, 'PPP')}</p></div>
                    )}
                    {app.brideOrigin && (
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_origin')}</span> <p className="font-medium text-gray-800">{app.brideOrigin}</p></div>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {app.witness1FirstName && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3 text-gray-700">
                        <UserGroupIcon className="w-5 h-5 mr-2" />
                        <h4 className="font-bold">{t('admin_dashboard.details.witnesses')}</h4>
                    </div>
                    <ul className="space-y-1 ml-2">
                        <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>{app.witness1FirstName} {app.witness1LastName}</li>
                        <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>{app.witness2FirstName} {app.witness2LastName}</li>
                        {app.witness3FirstName && <li className="flex items-center"><span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>{app.witness3FirstName} {app.witness3LastName}</li>}
                    </ul>
                </div>
            )}

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3 text-gray-700">
                    <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                    <h4 className="font-bold">{t('admin_dashboard.details.user_notes')}</h4>
                </div>
                <p className="text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-100">
                    {app.notes || t('user_dashboard.no_notes')}
                </p>
            </div>
        </div>
        {app.assignedImam && (
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center shadow-sm">
                <p className="text-xs text-indigo-500 uppercase font-bold mb-1">{t('admin_dashboard.details.assigned_imam')}</p>
                <p className="text-xl font-bold text-indigo-800">{app.assignedImam}</p>
            </div>
        )}
        <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-500 space-y-1 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider">{t('admin_dashboard.details.history_status')}</h4>

            <div><strong className="w-32 inline-block">{t('admin_dashboard.details.submitted')}</strong>{formatDate(app.createdAt, 'PPpp')}</div>

            {app.processedAt && (
                <div className={app.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                    <strong className="w-32 inline-block">{t(app.status === 'REJECTED' ? 'admin_dashboard.details.rejected' : 'admin_dashboard.details.approved')}</strong>
                    {formatDate(app.processedAt, 'PPpp')}
                </div>
            )}

            {app.rejectionReason && (
                <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 break-words">
                    <strong className="font-semibold">{t('admin_dashboard.details.rejection_reason')}</strong> {app.rejectionReason}
                </div>
            )}

            {app.completedAt && (
                <div className="text-blue-600">
                    <strong className="w-32 inline-block">{t('admin_dashboard.details.completed')}</strong>
                    {formatDate(app.completedAt, 'PPpp')}
                </div>
            )}

            {app.cancelledAt && (
                <div className="text-gray-600">
                    <strong className="w-32 inline-block">{t('admin_dashboard.details.cancelled')}</strong>
                    {formatDate(app.cancelledAt, 'PPpp')}
                </div>
            )}

            {app.cancellationReason && (
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 break-words">
                    <strong className="font-semibold">{t('admin_dashboard.details.cancellation_reason')}</strong> {app.cancellationReason}
                </div>
            )}
        </div>
    </div>
);

const UserDashboard = () => {
    const { formatDate } = useDateFormatter();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { myAppointments, status } = useSelector((state) => state.appointments);
    const { profile } = useSelector((state) => state.user);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [cancellationReason, setCancellationReason] = useState('');
    const [formErrors, setFormErrors] = useState({});


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
            .then(() => setIsCancelModalOpen(false))
            .catch((err) => {
                const msg = err.message || 'user_dashboard.toasts.cancel_fail';
                const cleanMsg = msg.startsWith('errors.') ? msg.replace('errors.', '') : msg;
                toast.error(t(`errors.${cleanMsg}`));
            });
    };

    const handleDownloadDocument = async (app) => {
        toast.loading(t('user_dashboard.toasts.downloading'));
        try {
            const response = await getAppointmentDocument(app.id);

            let filename = "marriage_certificate";
            const disposition = response.headers["content-disposition"];

            if (disposition && disposition.includes("attachment")) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches && matches[1]) {
                    filename = matches[1].replace(/['"]/g, "");
                }
            }

            const contentType = response.headers["content-type"];
            const blob = new Blob([response.data], { type: contentType });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            toast.dismiss();
            toast.success(t('user_dashboard.toasts.download_success'));

        } catch (error) {
            toast.dismiss();
            if (error.response && error.response.status === 403) {
                toast.error(t('errors.access_denied_document'));
            } else {
                toast.error(t('user_dashboard.toasts.download_error'));
            }
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
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>; //what is this line for? should it be translated?
    };
    const MAX_REASON_LENGTH = 255;
    const upcomingAppointment = myAppointments?.find(app => app.status === 'APPROVED');
    const welcomeMessage = profile?.firstName
        ? t('user_dashboard.welcome_user', { name: profile.firstName })
        : t('user_dashboard.welcome_guest');

    return (
        <div className="p-4 sm:p-6">
            <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}
                title={selectedApp ? t('user_dashboard.details_modal_title', { date: formatDate(selectedApp.startTime, 'MMM d, yyyy') }) : t('buttons.details')} size="lg"
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
            <div className="grid grid-cols-1 gap-6 mb-8 mt-6">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-indigo-50">
                    <h3 className="text-lg font-semibold text-gray-700">{t('user_dashboard.upcoming_ceremony')}</h3>
                    {upcomingAppointment ? (
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-indigo-600">{formatDate(upcomingAppointment.startTime, 'MMMM d, yyyy')}</p>
                            <p className="text-sm text-gray-500 mt-1">{formatDate(upcomingAppointment.startTime, 'p')} - {t('status.APPROVED')}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-2 italic">{t('user_dashboard.no_upcoming')}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('user_dashboard.my_appointments')}</h1>
                <Link
                    to="/book-appointment"
                    className="w-full sm:w-auto text-center px-5 py-3 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md transition transform hover:scale-105"
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
                                    {app.isDocumentAvailable && (
                                        <button onClick={() => handleDownloadDocument(app)} className="text-blue-600 hover:text-gray-900 text-sm font-medium">{t('user_dashboard.table.document')} </button>
                                    )}

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
                                <tr key={app.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatDate(app.startTime, 'PPpp')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {renderStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                        <button onClick={() => handleViewDetails(app)} className="text-indigo-600 hover:text-indigo-900 font-medium">{t('user_dashboard.table.details')}</button>
                                        {app.isDocumentAvailable && (
                                            <button onClick={() => handleDownloadDocument(app)} className="text-blue-600 hover:text-gray-900">{t('user_dashboard.table.document')}</button>
                                        )}
                                        {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                                            <button onClick={() => handleCancelClick(app)} className="text-red-600 hover:text-red-900 font-medium">{t('user_dashboard.table.cancel')}</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {status === 'succeeded' && (!myAppointments || myAppointments.length === 0) &&
                    <div className="text-center mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-lg">
                        <h3 className="text-lg font-medium text-gray-700">{t('user_dashboard.empty.title')}</h3>
                        <p className="text-gray-500 mt-1">{t('user_dashboard.empty.prompt')}</p>
                    </div>
                }
            </div>
        </div>
    );
};

export default UserDashboard;