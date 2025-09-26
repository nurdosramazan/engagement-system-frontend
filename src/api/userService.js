import axiosInstance from "./axiosInstance";

export const getUserProfile = async () => {
    const response = await axiosInstance.get('/users/me');
    return response.data.data;
};

export const updateUserProfile = async (profileData) => {
    const response = await axiosInstance.put('/users/me/update-info', profileData);
    return response.data.data;
};
