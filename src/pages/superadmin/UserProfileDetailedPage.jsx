import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails, toggleUserLock, clearCurrentProfile } from '../../features/superAdmin/superAdminSlice';
import { getAppointmentDocument } from '../../api/appointmentService';
import toast from 'react-hot-toast';
import {
    ClockIcon, DocumentTextIcon, ExclamationTriangleIcon, DevicePhoneMobileIcon,
    ShieldExclamationIcon, ArrowLeftIcon, UserIcon, ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const UserProfileDetailedPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { currentUserProfile: profile, status, error } = useSelector((state) => state.superAdmin);
    const [activeTab, setActiveTab] = useState('appointments');

    useEffect(() => {
        dispatch(fetchUserDetails(userId));
        return () => { dispatch(clearCurrentProfile()); };
    }, [dispatch, userId]);

    const handleDownload = async (appointmentId) => {
        toast.loading("Downloading...");
        try {
            const response = await getAppointmentDocument(appointmentId);
            let filename = 'document.pdf';
            const disposition = response.headers['content-disposition'];
            if (disposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }
            const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.dismiss();
            toast.success("Downloaded");
        } catch (error) {
            toast.dismiss();
            toast.error("Download failed");
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-64 text-gray-500">
                <ClockIcon className="w-6 h-6 animate-spin mr-2" />
                Loading profile data...
            </div>
        );
    }

    if (status === 'failed' || error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="bg-red-100 p-4 rounded-full">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t(`errors.${error?.message}`)}</h2>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                    {t('superadmin.buttons.return_to_list')}
                </button>
            </div>
        );
    }

    if (!profile) return null;

    const { basicInfo, loginHistory, auditLogs, appointments, uploadedDocumentAppointmentIds, stats } = profile;

    const tabs = [
        { id: 'appointments', label: 'Appointments', count: stats.totalAppointments },
        { id: 'logins', label: 'Login History', count: stats.totalLogins },
        { id: 'audits', label: 'Audit Logs', count: auditLogs.length },
        { id: 'documents', label: 'Documents', count: uploadedDocumentAppointmentIds.length },
    ];

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/admin/users')} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Users
            </button>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                            {basicInfo.firstName?.charAt(0)}
                        </div>
                        <div className="ml-6">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                {basicInfo.firstName} {basicInfo.lastName}
                                {basicInfo.isLocked && <ShieldExclamationIcon className="w-6 h-6 text-red-600" title="Banned" />}
                            </h1>
                            <p className="text-gray-500 font-mono text-sm mt-1">{basicInfo.phoneNumber}</p>
                            <p className="text-xs text-gray-400 mt-1">Joined: {new Date(basicInfo.createdAt).toLocaleDateString()}</p>
                            <div className="mt-3 flex gap-2">
                                {basicInfo.roles.map(r => (
                                    <span key={r} className="px-2 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => dispatch(toggleUserLock(basicInfo.id))}
                        className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-sm transition-transform active:scale-95 ${basicInfo.isLocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        {basicInfo.isLocked ? 'Unban User' : 'Ban User'}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-8 pt-6 border-t border-gray-100 text-center">
                    <StatBox label="Total" value={stats.totalAppointments} color="text-gray-900" />
                    <StatBox label="Approved" value={stats.approvedAppointments} color="text-green-600" />
                    <StatBox label="Completed" value={stats.completedAppointments} color="text-blue-600" />
                    <StatBox label="Rejected" value={stats.rejectedAppointments} color="text-red-500" />
                    <StatBox label="Cancelled" value={stats.cancelledAppointments} color="text-gray-500" />
                    <StatBox label="Logins" value={stats.totalLogins} color="text-purple-600" />
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                            <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[400px]">

                {activeTab === 'appointments' && (
                    <div className="divide-y divide-gray-200">
                        {appointments.map(app => (
                            <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900 text-lg">
                                                {new Date(app.startTime).toLocaleDateString()}
                                            </span>
                                            <span className="text-gray-500">
                                                {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-indigo-600 mt-1">
                                            {app.groomFirstName} {app.groomLastName} & {app.brideFirstName} {app.brideLastName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                app.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                    app.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {app.status}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2">ID: #{app.id}</p>
                                    </div>
                                </div>
                                {/* Rich Admin Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="space-y-2">
                                        {app.processedByName && (
                                            <div className="flex items-start text-green-700">
                                                <UserIcon className="w-4 h-4 mr-2 mt-0.5" />
                                                <span>Approved by: <strong>{app.processedByName}</strong></span>
                                            </div>
                                        )}
                                        {app.cancelledByName && (
                                            <div className="flex items-start text-red-600">
                                                <UserIcon className="w-4 h-4 mr-2 mt-0.5" />
                                                <span>Cancelled by: <strong>{app.cancelledByName}</strong></span>
                                            </div>
                                        )}
                                        {app.completedByName && (
                                            <div className="flex items-start text-blue-600">
                                                <UserIcon className="w-4 h-4 mr-2 mt-0.5" />
                                                <span>Completed by: <strong>{app.completedByName}</strong></span>
                                            </div>
                                        )}
                                        {app.assignedImam && (
                                            <div className="flex items-start text-purple-700">
                                                <UserIcon className="w-4 h-4 mr-2 mt-0.5" />
                                                <span>Imam: <strong>{app.assignedImam}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        {app.adminNotes && (
                                            <div className="text-gray-700 bg-white p-2 rounded border border-gray-200">
                                                <span className="font-semibold text-xs uppercase text-gray-400 block mb-1">Admin Notes</span>
                                                {app.adminNotes}
                                            </div>
                                        )}
                                        {app.rejectionReason && (
                                            <div className="text-red-700 bg-red-50 p-2 rounded border border-red-100">
                                                <span className="font-semibold text-xs uppercase text-red-400 block mb-1">Rejection Reason</span>
                                                {app.rejectionReason}
                                            </div>
                                        )}
                                        {app.cancellationReason && (
                                            <div className="text-gray-700 bg-gray-100 p-2 rounded border border-gray-200">
                                                <span className="font-semibold text-xs uppercase text-gray-400 block mb-1">Cancellation Reason</span>
                                                {app.cancellationReason}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {appointments.length === 0 && <EmptyState msg="No appointments found." />}
                    </div>
                )}

                {activeTab === 'logins' && (
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Time</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">IP</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-500">Device</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loginHistory.map((log, i) => (
                                <tr key={log.id || i}>
                                    <td className="px-6 py-4 text-gray-900 flex items-center whitespace-nowrap">
                                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        {new Date(log.loginTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {log.ipAddress}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-xs" title={log.userAgent}>
                                        <div className="flex items-center">
                                            <DevicePhoneMobileIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {log.userAgent}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'audits' && (
                    <div className="divide-y divide-gray-200">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="p-4 text-sm hover:bg-gray-50">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-xs">
                                        {log.actionType}
                                    </span>
                                    <span className="text-gray-400 text-xs font-mono">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-800 mt-2">{log.details}</p>
                                <p className="text-xs text-gray-400 mt-1">Entity ID: {log.entityId}</p>
                            </div>
                        ))}
                        {auditLogs.length === 0 && <EmptyState msg="No audit logs found." />}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {uploadedDocumentAppointmentIds.map((appId) => (
                            <button
                                key={appId}
                                onClick={() => handleDownload(appId)}
                                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all group shadow-sm hover:shadow-md bg-white"
                            >
                                <DocumentTextIcon className="w-12 h-12 text-gray-300 group-hover:text-indigo-500 mb-2 transition-colors" />
                                <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-700 text-center">
                                    Appointment #{appId}
                                </span>
                                <span className="text-[10px] text-blue-500 mt-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                    Download
                                </span>
                            </button>
                        ))}
                        {uploadedDocumentAppointmentIds.length === 0 && <div className="col-span-full"><EmptyState msg="No documents found." /></div>}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color }) => (
    <div className="flex flex-col items-center justify-center p-2">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">{label}</div>
    </div>
);

const EmptyState = ({ msg }) => (
    <div className="p-12 text-center flex flex-col items-center justify-center text-gray-400">
        <ChatBubbleLeftRightIcon className="w-12 h-12 mb-3 text-gray-300" />
        <p className="italic">{msg}</p>
    </div>);

export default UserProfileDetailedPage;