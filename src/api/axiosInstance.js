import axios from 'axios';

//const API_URL = 'https://engagement-system-production.up.railway.app/api/v1';
const API_URL = 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export default axiosInstance;
