import axiosInstance from "./axiosInstance";

export const updateAppointmentDetails = (id, updateData) => {
  return axiosInstance.put(`/admin/appointments/${id}`, updateData);
};

export const approveAppointment = (id, approvalData) => {
  return axiosInstance.post(`/admin/appointments/${id}/approve`, approvalData);
};

export const rejectAppointment = (id, reason) => {
  return axiosInstance.post(`/admin/appointments/${id}/reject`, { reason });
};

export const completeAppointment = (id, adminNotes) => {
  return axiosInstance.post(`/admin/appointments/${id}/complete`, {
    adminNotes,
  });
};

export const cancelAdminAppointment = (id, reason) => {
  return axiosInstance.post(`/admin/appointments/${id}/cancel`, { reason });
};

export const generateSlotsForMonth = (year, month) => {
  return axiosInstance.post("/admin/time-slots/generate", { year, month });
};

export const getAppointmentSchedule = (startDate, endDate) => {
  return axiosInstance.get("/admin/appointments/schedule", {
    params: { startDate, endDate },
  });
};

export const getReport = (format, startDate, endDate) => {
  return axiosInstance.get(`/admin/reports/appointments.${format}`, {
    params: { startDate, endDate },
    responseType: "blob",
  });
};

export const getActiveImams = () => {
  return axiosInstance.get("/admin/imams");
};

export const fetchFilteredAppointments = (params) => {
  return axiosInstance.get("/admin/filter", { params });
};
