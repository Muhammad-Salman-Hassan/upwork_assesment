import axios from "axios";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "https://cfc.bits.com.kw",
  timeout: 1000000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Basic NzokMmEkMTQkUW1QTVNsb2EzTGc2YXVQcC9pdmhrZWhZV3FQcHIxMTZOanJ4Q1dSNzFIM1hNNS54TGw2V3k=`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
