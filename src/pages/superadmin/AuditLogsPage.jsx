import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs } from '../../features/superAdmin/superAdminSlice';
import { useTranslation } from 'react-i18next';

const AuditLogsPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { auditLogs, status } = useSelector((state) => state.superAdmin);
    const loading = status === 'loading';

    const [pagination, setPagination] = useState({ page: 0, size: 20 });
    const [searchParams, setSearchParams] = useState({
        actorId: '',
        actionType: '',
        startDate: '',
        endDate: ''
    });

    const triggerFetch = () => {
        const cleanFilters = {};
        if (searchParams.actorId) cleanFilters.actorId = searchParams.actorId;
        if (searchParams.actionType) cleanFilters.actionType = searchParams.actionType;
        if (searchParams.startDate) cleanFilters.startDate = searchParams.startDate;
        if (searchParams.endDate) cleanFilters.endDate = searchParams.endDate;

        dispatch(fetchAuditLogs({
            page: pagination.page,
            size: pagination.size,
            filters: cleanFilters
        }));
    };

    useEffect(() => {
        triggerFetch();
    }, [dispatch, pagination.page, pagination.size]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 0 }));
        triggerFetch();
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold mb-6">{t('superadmin.audit_logs.title')}</h2>

            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <input
                    type="number"
                    placeholder={t('superadmin.audit_logs.actor_id')}
                    className="border p-2 rounded"
                    value={searchParams.actorId}
                    onChange={(e) => setSearchParams({ ...searchParams, actorId: e.target.value })}
                />
                <select
                    className="border p-2 rounded"
                    value={searchParams.actionType}
                    onChange={(e) => setSearchParams({ ...searchParams, actionType: e.target.value })}
                >
                    <option value="">{t('superadmin.audit_logs.all_actions')}</option>
                    <option value="APPOINTMENT_CREATED">APPOINTMENT_CREATED</option>
                    <option value="APPOINTMENT_APPROVED">APPOINTMENT_APPROVED</option>
                    <option value="APPOINTMENT_REJECTED">APPOINTMENT_REJECTED</option>
                    <option value="APPOINTMENT_CANCELLED">APPOINTMENT_CANCELLED</option>
                    <option value="APPOINTMENT_COMPLETED">APPOINTMENT_COMPLETED</option>
                    <option value="APPOINTMENT_DETAILS_UPDATED">APPOINTMENT_DETAILS_UPDATED</option>
                    <option value="USER_PROFILE_UPDATED">USER_PROFILE_UPDATED</option>
                    <option value="TIME_SLOTS_GENERATED">TIME_SLOTS_GENERATED</option>
                </select>
                <input
                    type="date"
                    className="border p-2 rounded"
                    value={searchParams.startDate}
                    onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                />
                <input
                    type="date"
                    className="border p-2 rounded"
                    value={searchParams.endDate}
                    onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                />
                <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    {t('common.search')}
                </button>
            </form>

            {loading ? (
                <p>{t('common.loading')}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">{t('superadmin.audit_logs.action')}</th>
                                <th className="p-3">{t('superadmin.audit_logs.actor')}</th>
                                <th className="p-3">{t('superadmin.audit_logs.entity')}</th>
                                <th className="p-3">{t('superadmin.audit_logs.details')}</th>
                                <th className="p-3">{t('superadmin.audit_logs.date')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {auditLogs?.content?.length > 0 ? (
                                auditLogs.content.map((log) => (
                                    <tr key={log.id}>
                                        <td className="p-3">{log.id}</td>
                                        <td className="p-3 font-semibold text-blue-800">{log.actionType}</td>
                                        <td className="p-3">{log.actorId}</td>
                                        <td className="p-3">{log.entityId}</td>
                                        <td className="p-3 text-gray-600 max-w-md truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-3 text-center text-gray-500">
                                        {t('common.no_data')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-4 flex justify-between items-center">
                <button
                    disabled={auditLogs.first}
                    onClick={() => handlePageChange(auditLogs.number - 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    {t('common.previous')}
                </button>
                <span>
                    {t('common.page')} {auditLogs.number + 1} / {auditLogs.totalPages || 1}
                </span>
                <button
                    disabled={auditLogs.last}
                    onClick={() => handlePageChange(auditLogs.number + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    {t('common.next')}
                </button>
            </div>
        </div>
    );
};

export default AuditLogsPage;