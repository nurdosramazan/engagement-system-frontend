import axiosInstance from './axiosInstance';

// Fetches the current user's appointments
export const getMyAppointments = async () => {
  const response = await axiosInstance.get('/appointments/my-appointments');
  return response.data.data;
};

// Fetches available time slots for a given month and year
export const getAvailableSlots = async (year, month) => {
  const response = await axiosInstance.get(`/appointments/available-slots?year=${year}&month=${month}`);
  return response.data.data;
};

// Creates a new appointment
export const createAppointment = async (formData) => {
  const response = await axiosInstance.post('/appointments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Cancels an existing appointment
export const cancelAppointment = async (appointmentId) => {
  const response = await axiosInstance.post(`/appointments/${appointmentId}/cancel`);
  return response.data;
};
