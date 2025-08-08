import axios from "axios";
import { baseUrl } from "../common/Summaryapi";

const Axios = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // ✅ Needed only if using cookies (can be removed for pure Bearer token auth)
});

Axios.interceptors.request.use(
  (config) => {
    // ✅ Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // ⛔ Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Optional: Add logout cleanup here for AuthContext users

      // 🚪 Redirect to login
      //window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default Axios;