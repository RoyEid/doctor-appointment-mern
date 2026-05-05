import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
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
    return Promise.reject(err);
  }
);

export const API_ENDPOINTS = {
  // Appointments
  createAppointment: "/appointments/createAppointment",
  getMyAppointments: "/appointments/myAppointments",
  deleteAppointment: (id) => `/appointments/${id}`,
  getAvailability: (doctorId, date) =>
    `/appointments/availability?doctorId=${doctorId}&date=${date}`,

  // Doctor proposes reschedule, approve, reject, etc.
  updateAppointmentStatus: (id) => `/appointments/${id}/status`,
  respondToReschedule: (id) => `/appointments/${id}/reschedule-response`,

  // Patient requests reschedule
  patientRescheduleAppointment: (id) =>
    `/appointments/${id}/patient-reschedule`,
};

export default api;