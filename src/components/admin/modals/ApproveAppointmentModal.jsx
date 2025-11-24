import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { approveAppointment } from '../../../features/admin/adminSlice';
import toast from 'react-hot-toast';

const ApproveAppointmentModal = ({ appointmentId, isOpen, onClose, t }) => {
    const dispatch = useDispatch();
    const [imam, setImam] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const IMAM_LIST = [
        "Бас Имам",
        "Найб Имам Серік",
        "Найб Имам Арман",
        "Ұстаз Нұрлан"
    ];

    const handleApprove = async () => {
        if (!imam) {
            toast.error("Please select an Imam.");
            return;
        }
        setIsLoading(true);
        try {
            await dispatch(approveAppointment({ id: appointmentId, data: { assignedImam: imam } })).unwrap();
            toast.success(t('api.appointment_approved'));
            onClose();
        } catch (error) {
            toast.error("Failed to approve.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">{t('admin.approve.title')}</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.approve.select_imam')}
                    </label>
                    <select
                        value={imam}
                        onChange={(e) => setImam(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">-- Select --</option>
                        {IMAM_LIST.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded text-gray-800">{t('buttons.cancel')}</button>
                    <button
                        onClick={handleApprove}
                        disabled={!imam || isLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
                    >
                        {isLoading ? 'Processing...' : t('admin.approve.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApproveAppointmentModal;