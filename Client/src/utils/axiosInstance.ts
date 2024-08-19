import axios from "axios";
import { api_base_url} from "../constants/constant";

// Create an axios instance


const axiosInstance = axios.create({
  baseURL: api_base_url,
  withCredentials: true
});


// Add request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const localStorageToken = localStorage.getItem('accesstoken');
  if (localStorageToken) {
    config.headers['Authorization'] = `Bearer ${localStorageToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
