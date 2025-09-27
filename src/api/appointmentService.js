import axiosInstance from './axiosInstance';

export const getMyAppointments = () => {
  return axiosInstance.get('/appointments/my-appointments');
};

export const getAvailableSlots = (year, month) => {
  return axiosInstance.get('/appointments/available-slots', { params: { year, month } });
};

export const createAppointment = (formData) => {
  return axiosInstance.post('/appointments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const cancelUserAppointment = (id) => {
    return axiosInstance.post(`/appointments/${id}/cancel`);
};

export const getAppointmentDocument = (id) => {
    return axiosInstance.get(`/appointments/${id}/document`, {
        responseType: 'blob',
    });
};

