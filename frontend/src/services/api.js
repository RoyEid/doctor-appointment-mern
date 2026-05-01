import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Optional: centralized error handling/logging
    return Promise.reject(err);
  }
);

export default api;
