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
    },
);

export const API_ENDPOINTS = {
    // Doctors
    getAllDoctors: "/doctors",
    getDoctorById: (id) => `/doctors/${id}`,

    // Doctor image helper
    getDoctorImage: (image) => {
        if (!image) return "/img/doctors/avatar.png";

        if (image.startsWith("http")) return image;

        return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
    },

    // Auth / verification
    resendVerification: "/auth/resend-verification",

    // Appointments
    createAppointment: "/appointments/createAppointment",
    getMyAppointments: "/appointments/myAppointments",

    // Your backend has both old POST delete and new DELETE.
    // AddAppointment/MyAppointments old code may still use this.
    deleteAppointmentLegacy: (id) => `/appointments/deleteAppointment/${id}`,

    // New REST delete endpoint
    deleteAppointment: (id) => `/appointments/${id}`,

    getAppointmentAvailability: (doctorId, date) =>
        `/appointments/availability?doctorId=${doctorId}&date=${date}`,

    getAvailability: (doctorId, date) =>
        `/appointments/availability?doctorId=${doctorId}&date=${date}`,

    updateAppointmentStatus: (id) => `/appointments/${id}/status`,

    respondToReschedule: (id) => `/appointments/${id}/reschedule-response`,

    patientRescheduleAppointment: (id) =>
        `/appointments/${id}/patient-reschedule`,
};

// Keep this because your current files use:
// import { apiConfig } from "../config/api";
export const apiConfig = API_ENDPOINTS;

export default api;