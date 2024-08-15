import axios from "axios";
import { api_base_url } from "../constants/constant";

const axiosInstance = axios.create();

axiosInstance.defaults.baseURL = api_base_url;
axiosInstance.defaults.withCredentials = true;

export default axiosInstance;