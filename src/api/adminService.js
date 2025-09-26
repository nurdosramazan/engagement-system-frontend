import axiosInstance from './axiosInstance';

// Fetches appointments by their status
export const getAppointmentsByStatus = async (status) => {
  const response = await axiosInstance.get(`/admin/appointments?status=${status}`);
  return response.data.data;
};

// Approves a pending appointment
export const approveAppointment = async (id) => {
  const response = await axiosInstance.post(`/admin/appointments/${id}/approve`);
  return response.data;
};

// Rejects a pending appointment with a reason
export const rejectAppointment = async (id, reason) => {
  const response = await axiosInstance.post(`/admin/appointments/${id}/reject`, { reason });
  return response.data;
};

// Marks an approved appointment as completed
export const completeAppointment = async (id) => {
  const response = await axiosInstance.post(`/admin/appointments/${id}/complete`);
  return response.data;
};

// Generates time slots for a given month and year
export const generateSlotsForMonth = async (year, month) => {
    const response = await axiosInstance.post('/admin/time-slots/generate', { year, month });
    return response.data;
};

// Downloads an appointment report
export const downloadReport = async (format, startDate, endDate) => {
    const response = await axiosInstance.get(`/admin/reports/appointments.${format}`, {
        params: { startDate, endDate },
        responseType: 'blob', // Important for file downloads
    });
    return response.data;
};
