import axios from "axios";
import { api_base_url, base_url } from "../constants/constant";

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: api_base_url,
  withCredentials: true
});

let csrfToken: string | null = null; // Cache the CSRF token

// Function to fetch CSRF token
const fetchCsrfToken = async () => {
  try {
    if (!csrfToken) { // Only fetch if the token is not already cached
      const response = await axios.get(`${base_url}/csrf-token`);
      csrfToken = response.data.csrfToken;
    }
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Add request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken(); // Fetch the CSRF token if not cached
  }
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken; // Add CSRF token to headers
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;
