import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveAppointment, fetchActiveImams } from '../../../features/admin/adminSlice';
import toast from 'react-hot-toast';

const ApproveAppointmentModal = ({ appointmentId, isOpen, onClose, t }) => {
    const dispatch = useDispatch();
    const { imamsList } = useSelector((state) => state.admin);
    const [selectedImamId, setSelectedImamId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && (!imamsList || imamsList.length === 0)) {
            dispatch(fetchActiveImams());
        }
    }, [isOpen, dispatch, imamsList]);

    const handleApprove = async () => {
        if (!selectedImamId) {
            toast.error(t('admin_dashboard.approve.select_imam_error'));
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(approveAppointment({ id: appointmentId, data: { imamId: selectedImamId } })).unwrap();
            toast.success(t('api.appointment_approved'));
            onClose();
        } catch (error) {
            const msg = error?.message || 'approval_failed';
            toast.error(t(`errors.${msg}`));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">{t('admin_dashboard.approve.title')}</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin_dashboard.approve.select_imam')}
                    </label>
                    <select
                        value={selectedImamId}
                        onChange={(e) => setSelectedImamId(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- {t('admin_dashboard.approve.select_placeholder')} --</option>
                        {imamsList && imamsList.map(imam => (
                            <option key={imam.id} value={imam.id}>
                                {imam.firstName} {imam.lastName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded text-gray-800">{t('buttons.cancel')}</button>
                    <button
                        onClick={handleApprove}
                        disabled={!selectedImamId || isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                    >
                        {isLoading ? t('admin_dashboard.approve.processing') : t('admin_dashboard.approve.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveAppointmentModal;