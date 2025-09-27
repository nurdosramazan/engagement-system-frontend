import axiosInstance from './axiosInstance';

const getMyAppointments = () => {
  return axiosInstance.get('/appointments/my-appointments');
};

const getAvailableSlots = (year, month) => {
  return axiosInstance.get('/appointments/available-slots', { params: { year, month } });
};

const createAppointment = (formData) => {
  return axiosInstance.post('/appointments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Add the new cancel method
const cancelAppointment = (id) => {
  return axiosInstance.post(`/appointments/${id}/cancel`);
};

export const getAppointmentDocument = (id) => {
    return axiosInstance.get(`/appointments/${id}/document`, {
        responseType: 'blob', // Important for file downloads
    });
};

const appointmentService = {
  getMyAppointments,
  getAvailableSlots,
  createAppointment,
  cancelAppointment, // Export the new method
};

export default appointmentService;

