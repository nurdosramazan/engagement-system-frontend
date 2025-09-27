import axiosInstance from './axiosInstance';

export const getUserProfile = () => {
    return axiosInstance.get('/users/me');
};

export const updateUserProfile = (profileData) => {
    return axiosInstance.put('/users/me/update-info', profileData);
};

