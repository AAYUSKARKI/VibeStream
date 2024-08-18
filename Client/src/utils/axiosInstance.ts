import axios from "axios";
import { api_base_url } from "../constants/constant";

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: api_base_url,
  withCredentials: true
});

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    const response = await axios.get('/csrf-token'); // Adjust path if needed
    return response.data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Add request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const csrfToken = await fetchCsrfToken(); // Fetch the CSRF token
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken; // Add CSRF token to headers
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
