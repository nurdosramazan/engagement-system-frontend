import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, toggleUserLock } from '../../features/superAdmin/superAdminSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlassIcon, LockClosedIcon, ChevronLeftIcon, ChevronRightIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

const UserManagementPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { usersList, totalElements, totalPages } = useSelector((state) => state.superAdmin);

    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const pageSize = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchAllUsers({ page, size: pageSize, search }));
        }, 500);
        return () => clearTimeout(timer);
    }, [page, search, dispatch]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(0);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const handleToggleLock = (user) => {
        const action = user.isLocked ? 'Unban' : 'Ban';
        if (window.confirm(`Are you sure you want to ${action} ${user.firstName}?`)) {
            dispatch(toggleUserLock(user.id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {t('superadmin.users.title')} <span className="text-sm font-normal text-gray-500">({totalElements})</span>
                </h1>
                <div className="relative w-full sm:w-64">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('superadmin.users.search_placeholder')}
                        className="pl-10 p-2 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                        value={search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('superadmin.users.user')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('superadmin.users.role')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('superadmin.users.status')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('superadmin.users.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usersList.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {user.firstName ? user.firstName.charAt(0) : '?'}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <Link
                                                    to={`/admin/users/${user.id}`}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline"
                                                >
                                                    {user.firstName} {user.lastName}
                                                </Link>
                                                <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-1">
                                            {user.roles.map(role => (
                                                <span key={role} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' :
                                                    role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.isLocked ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <LockClosedIcon className="w-3 h-3 mr-1" />
                                                {t('superadmin.status.BANNED')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {t('superadmin.status.ACTIVE')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleToggleLock(user)}
                                            className={`font-semibold transition-colors ${user.isLocked
                                                ? 'text-green-600 hover:text-green-900'
                                                : 'text-red-600 hover:text-red-900'
                                                }`}
                                        >
                                            {user.isLocked ? t('superadmin.users.unban') : t('superadmin.users.ban')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    {t('pagination.info', {
                                        start: page * pageSize + 1,
                                        end: Math.min((page + 1) * pageSize, totalElements),
                                        total: totalElements
                                    })}
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages - 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagementPage;