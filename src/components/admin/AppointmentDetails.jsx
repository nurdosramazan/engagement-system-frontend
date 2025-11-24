import React, { useState } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon, UserIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import EditAppointmentModal from './modals/EditAppointmentModal';
import ApproveAppointmentModal from './modals/ApproveAppointmentModal';

const AlertTriangleIcon = () => (
    <div className="inline-flex items-center justify-center ml-2 bg-red-100 text-red-600 rounded-full p-1 animate-pulse" title="High submission history">
        <svg className="w-5 h-5 text-red-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    </div>
);

const formatHistory = (history, t) => {
    if (!history) return t('admin_dashboard.history.not_available');

    const parts = [];
    parts.push(`${t('admin_dashboard.history.total')} ${history.totalSubmissions}`);

    if (history.approvedCount > 0) parts.push(`${t('admin_dashboard.history.approved')} ${history.approvedCount}`);
    if (history.rejectedCount > 0) parts.push(`${t('admin_dashboard.history.rejected')} ${history.rejectedCount}`);
    if (history.cancelledCount > 0) parts.push(`${t('admin_dashboard.history.cancelled')} ${history.cancelledCount}`);
    if (history.completedCount > 0) parts.push(`${t('admin_dashboard.history.completed')} ${history.completedCount}`);

    return (
        <span className="text-xs text-gray-500 block mt-1">
            ({parts.join(' | ')})
        </span>
    );
};

const AppointmentDetails = ({ app, t, formatDate, onReject, onApproveSuccess, onEditSuccess }) => {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    const getLocalizedDate = (dateVal) => {
        if (!dateVal) return 'N/A';
        return formatDate(dateVal, 'P');
    };

    return (
        <div className="space-y-6 text-sm text-gray-700">
            <div className="flex justify-between items-center border-b pb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold tracking-wide ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                    }`}>
                    {app.status}
                </span>
                {app.status === 'PENDING' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200 transition shadow-sm"
                        >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            {t('buttons.edit')}
                        </button>

                        <button
                            onClick={onReject}
                            className="flex items-center px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200 transition shadow-sm"
                        >
                            <XMarkIcon className="w-4 h-4 mr-2" />
                            {t('admin_dashboard.table.reject')}
                        </button>

                        <button
                            onClick={() => setIsApproveOpen(true)}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm transition transform hover:scale-105"
                        >
                            <CheckIcon className="w-4 h-4 mr-2" />
                            {t('admin_dashboard.table.approve')}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-3">
                    <UserIcon className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{t('admin_dashboard.details.label_applicant_user')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                    <div>
                        <p className="text-xs text-gray-500 uppercase">{t('admin_dashboard.details.label_login_phone')}</p>
                        <div className="flex items-center">
                            <p className="font-medium text-base">{app.applicantPhoneNumber}</p>
                            {app.applicantHistory?.totalSubmissions > 1 && <AlertTriangleIcon />}
                        </div>
                    </div>
                    <div>
                        <strong className="font-semibold text-gray-900">{t('admin_dashboard.details.applicant_history')}</strong>
                        {formatHistory(app.applicantHistory, t)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-8 -mt-8"></div>
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                        <span className="mr-2 text-2xl">🤵</span> {t('admin_dashboard.details.section_groom')}
                    </h3>
                    <div className="space-y-3">
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_name')}</span> <p className="font-medium text-gray-800">{app.groomFirstName} {app.groomLastName}</p></div>
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_phone')}</span> <p className="font-medium text-gray-800">{app.groomPhoneNumber}</p></div>
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_dob')}</span> <p className="font-medium text-gray-800">{getLocalizedDate(app.groomDateOfBirth)}</p></div>
                        <div><span className="text-blue-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_origin')}</span> <p className="font-medium text-gray-800">{app.groomOrigin}</p></div>
                    </div>
                </div>


                <div className="bg-pink-50 p-5 rounded-xl border border-pink-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-pink-100 rounded-bl-full -mr-8 -mt-8"></div>
                    <h3 className="text-lg font-bold text-pink-900 mb-4 flex items-center">
                        <span className="mr-2 text-2xl">👰</span> {t('admin_dashboard.details.section_bride')}
                    </h3>
                    <div className="space-y-3">
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_name')}</span> <p className="font-medium text-gray-800">{app.brideFirstName} {app.brideLastName}</p></div>
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_phone')}</span> <p className="font-medium text-gray-800">{app.bridePhoneNumber}</p></div>
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_dob')}</span> <p className="font-medium text-gray-800">{getLocalizedDate(app.brideDateOfBirth)}</p></div>
                        <div><span className="text-pink-400 text-xs uppercase font-semibold">{t('admin_dashboard.details.label_origin')}</span> <p className="font-medium text-gray-800">{app.brideOrigin}</p></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-3 text-gray-700">
                        <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                        <h4 className="font-bold">{t('admin_dashboard.details.user_notes')}</h4>
                    </div>
                    <p className="text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-100 min-h-[3rem]">
                        {app.notes || "No notes provided."}
                    </p>
                </div>
            </div>
            {app.assignedImam && (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center shadow-sm">
                    <p className="text-xs text-indigo-500 uppercase font-bold mb-1">{t('admin_dashboard.details.assigned_imam')}</p>
                    <p className="text-xl font-bold text-indigo-800">{app.assignedImam}</p>
                </div>
            )}

            <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-500 space-y-2 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider">{t('admin_dashboard.details.history_status')}</h4>

                <div><strong className="w-32 inline-block">{t('admin_dashboard.details.submitted')}</strong>{formatDate(app.createdAt, 'PPpp')}</div>

                {app.processedAt && app.processedByName && (
                    <div className={app.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'}>
                        <strong className="w-32 inline-block">{t(app.status === 'REJECTED' ? 'admin_dashboard.details.rejected_by' : 'admin_dashboard.details.approved_by')}</strong>
                        {app.processedByName} ({format(new Date(app.processedAt), 'PPpp')})
                    </div>
                )}

                {app.rejectionReason && (
                    <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 break-words">
                        <strong className="font-semibold">{t('admin_dashboard.details.rejection_reason')}</strong> {app.rejectionReason}
                    </div>
                )}

                {app.completedAt && app.completedByName && (
                    <div className="text-blue-600">
                        <strong className="w-32 inline-block">{t('admin_dashboard.details.completed_by')}</strong>
                        {app.completedByName} ({formatDate(app.completedAt, 'PPpp')})
                    </div>
                )}

                {app.adminNotes && (
                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 break-words">
                        <strong className="font-semibold">{t('admin_dashboard.details.admin_notes')}</strong> {app.adminNotes}
                    </div>
                )}

                {app.cancelledAt && app.cancelledByName && (
                    <div className="text-gray-600">
                        <strong className="w-32 inline-block">{t('admin_dashboard.details.cancelled_by')}</strong>
                        {app.cancelledByName} ({formatDate(app.cancelledAt, 'PPpp')})
                    </div>
                )}

                {app.cancellationReason && (
                    <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 break-words">
                        <strong className="font-semibold">{t('admin_dashboard.details.cancellation_reason')}</strong> {app.cancellationReason}
                    </div>
                )}
            </div>

            <EditAppointmentModal
                appointment={app}
                isOpen={isEditOpen}
                onClose={() => { setIsEditOpen(false); if (onEditSuccess) onEditSuccess(); }}

                t={t}
            />

            <ApproveAppointmentModal
                appointmentId={app.id}
                isOpen={isApproveOpen}
                onClose={() => { setIsApproveOpen(false); if (onApproveSuccess) onApproveSuccess(); }}
                t={t}
            />
        </div>
    );
};

export default AppointmentDetails;