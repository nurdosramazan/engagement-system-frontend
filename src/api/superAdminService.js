import axiosInstance from "./axiosInstance";
import toast from "react-hot-toast";

export const listLogFiles = async () => {
  const response = await axiosInstance.get("/superadmin/logs");
  return response.data.data;
};

export const downloadLogFile = async (fileName) => {
  try {
    const response = await axiosInstance.get(
      `/superadmin/logs/download/${fileName}`,
      {
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();

    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  } catch (error) {
    toast.error(`Failed to download ${fileName}.`);
  }
};

export const getUsers = (page, size, search) => {
  return axiosInstance.get("/superadmin/users", {
    params: { page, size, search },
  });
};

export const getUserDeepProfile = (userId) => {
  return axiosInstance.get(`/superadmin/users/${userId}`);
};

export const toggleUserLock = (userId) => {
  return axiosInstance.post(`/superadmin/users/${userId}/toggle-lock`);
};
