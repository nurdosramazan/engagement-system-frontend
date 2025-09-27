import axiosInstance from './axiosInstance';

export const getNotifications = () => {
    return axiosInstance.get('/notifications');
};

export const markNotificationsAsRead = () => {
    return axiosInstance.post('/notifications/mark-as-read');
};
