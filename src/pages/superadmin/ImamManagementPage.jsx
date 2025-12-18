import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllImams,
    createImam,
    updateExistingImam,
    toggleImamActiveStatus
} from '../../features/superAdmin/superAdminSlice';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/common/Modal';

const ImamManagementPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { imamsList, status, error } = useSelector((state) => state.superAdmin);
    const loading = status === 'loading';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingImam, setEditingImam] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '' });

    useEffect(() => {
        dispatch(fetchAllImams());
    }, [dispatch]);

    const handleOpenCreate = () => {
        setEditingImam(null);
        setFormData({ firstName: '', lastName: '' });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (imam) => {
        setEditingImam(imam);
        setFormData({ firstName: imam.firstName, lastName: imam.lastName });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingImam) {
                await dispatch(updateExistingImam({
                    id: editingImam.id,
                    data: formData
                })).unwrap();
            } else {
                await dispatch(createImam(formData)).unwrap();
            }
            setIsModalOpen(false);
        } catch (err) {
            alert(t('errors.generic_save_error') || 'Error saving Imam');
        }
    };

    const handleToggleStatus = (id, currentStatus) => {
        if (window.confirm(t('superadmin.imams.confirm_status_change'))) {
            dispatch(toggleImamActiveStatus({ id, isActive: !currentStatus }));
        }
    };
    const safeImamsList = imamsList || [];

    return (
        <div className="p-6 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('superadmin.imams.title')}</h2>
                <button
                    onClick={handleOpenCreate}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    + {t('superadmin.imams.add_new')}
                </button>
            </div>

            {status === 'failed' && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    Error: {typeof error === 'string' ? error : 'Failed to load data'}
                </div>
            )}

            {loading && safeImamsList.length === 0 ? (
                <p className="text-gray-500">{t('common.loading')}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">{t('superadmin.imams.name')}</th>
                                <th className="p-3">{t('superadmin.imams.status')}</th>
                                <th className="p-3">{t('superadmin.imams.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {safeImamsList.length > 0 ? (

                                safeImamsList.map((imam) => (
                                    <tr key={imam.id}>
                                        <td className="p-3">{imam.id}</td>
                                        <td className="p-3">{imam.firstName} {imam.lastName}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs ${imam.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {imam.isActive ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </td>
                                        <td className="p-3 space-x-2">
                                            <button
                                                onClick={() => handleOpenEdit(imam)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleToggleStatus(imam.id, imam.isActive)}
                                                className={`hover:underline ${imam.isActive ? 'text-red-600' : 'text-green-600'}`}
                                            >
                                                {imam.isActive ? t('common.disable') : t('common.enable')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (<tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500">
                                    {t('common.no_data') || 'No Imams found.'}
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <Modal isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)} title={editingImam ? t('superadmin.imams.edit_title') : t('superadmin.imams.create_title')}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">{t('superadmin.imams.first_name')}</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">{t('superadmin.imams.last_name')}</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">
                                {t('common.cancel')}
                            </button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                                {t('common.save')}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default ImamManagementPage;