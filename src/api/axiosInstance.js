import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export default axiosInstance;
