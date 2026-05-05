import axios from "axios";

const RAW_API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:10000";

const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

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
  (err) => Promise.reject(err)
);

const fullUrl = (path) => `${API_BASE_URL}${path}`;

export const API_ENDPOINTS = {
  // Auth
  login: "/auth/login",
  register: "/auth/register",
  googleLogin: "/auth/google",
  forgotPassword: "/auth/forgot-password",
  resetPassword: (token) => `/auth/reset-password/${token}`,
  resendVerification: "/auth/resend-verification",
  resendVerificationPublic: "/auth/resend-verification-public",
  checkVerificationStatus: "/auth/check-verification-status",
  verifyEmail: (token) => `/auth/verify-email/${token}`,

  // Users
  getProfile: "/user/profile",
  updateProfile: "/user/profile",

  // Doctors
  getAllDoctors: "/doctors/allDoctors",
  getDoctorById: (id) => `/doctors/${id}`,
  getDoctorsCount: "/doctors/count",
  getDoctorCount: "/doctors/count",
  addDoctor: "/doctors/addDoctors",
  updateDoctor: (id) => `/doctors/${id}`,
  deleteDoctor: (id) => `/doctors/${id}`,
  updateDoctorAvailability: "/doctors/availability",

  // Your current backend legacy specialty route is:
  // /doctors/doctors/byspecialty/:specialty
  getDoctorsBySpecialty: (specialty) =>
    `/doctors/doctors/byspecialty/${encodeURIComponent(specialty)}`,

  // Departments
  getAllDepartments: "/departments/allDepartments",
  getDepartmentById: (id) => `/departments/${id}`,
  getDepartmentsCount: "/departments/count",
  getDepartmentCount: "/departments/count",
  addDepartment: "/departments/addDepartment",
  updateDepartment: (id) => `/departments/${id}`,
  deleteDepartment: (id) => `/departments/${id}`,

  // Appointments
  createAppointment: "/appointments/createAppointment",
  getMyAppointments: "/appointments/myAppointments",
  getDoctorAppointments: "/appointments/doctor/appointments",
  getDoctorSchedule: (date) => `/appointments/doctor/schedule?date=${date}`,

  deleteAppointmentLegacy: (id) => `/appointments/deleteAppointment/${id}`,
  deleteAppointment: (id) => `/appointments/${id}`,

  getAppointmentAvailability: (doctorId, date) =>
    `/appointments/availability?doctorId=${doctorId}&date=${date}`,

  getAvailability: (doctorId, date) =>
    `/appointments/availability?doctorId=${doctorId}&date=${date}`,

  updateAppointmentStatus: (id) => `/appointments/${id}/status`,

  approveAppointment: (id) =>
    `/appointments/doctor/appointments/${id}/approve`,

  rejectAppointment: (id) =>
    `/appointments/doctor/appointments/${id}/reject`,

  respondToReschedule: (id) => `/appointments/${id}/reschedule-response`,

  patientRescheduleAppointment: (id) =>
    `/appointments/${id}/patient-reschedule`,

  // Admin
  adminDashboard: "/admin/dashboard",
};

export const apiConfig = {
  // Base
  baseURL: API_BASE_URL,

  // Auth
  login: fullUrl("/auth/login"),
  register: fullUrl("/auth/register"),
  googleLogin: fullUrl("/auth/google"),
  forgotPassword: fullUrl("/auth/forgot-password"),
  resetPassword: (token) => fullUrl(`/auth/reset-password/${token}`),
  resendVerification: fullUrl("/auth/resend-verification"),
  resendVerificationPublic: fullUrl("/auth/resend-verification-public"),
  checkVerificationStatus: fullUrl("/auth/check-verification-status"),
  verifyEmail: (token) => fullUrl(`/auth/verify-email/${token}`),

  // Users
  getProfile: fullUrl("/user/profile"),
  updateProfile: fullUrl("/user/profile"),

  // Doctors
  getAllDoctors: fullUrl("/doctors/allDoctors"),
  allDoctors: fullUrl("/doctors/allDoctors"),

  getDoctorById: (id) => fullUrl(`/doctors/${id}`),

  getDoctorsCount: fullUrl("/doctors/count"),
  getDoctorCount: fullUrl("/doctors/count"),
  doctorsCount: fullUrl("/doctors/count"),

  addDoctor: fullUrl("/doctors/addDoctors"),
  updateDoctor: (id) => fullUrl(`/doctors/${id}`),
  deleteDoctor: (id) => fullUrl(`/doctors/${id}`),
  updateDoctorAvailability: fullUrl("/doctors/availability"),

  getDoctorsBySpecialty: (specialty) =>
    fullUrl(`/doctors/doctors/byspecialty/${encodeURIComponent(specialty)}`),

  // Departments
  getAllDepartments: fullUrl("/departments/allDepartments"),
  allDepartments: fullUrl("/departments/allDepartments"),

  getDepartmentById: (id) => fullUrl(`/departments/${id}`),

  getDepartmentsCount: fullUrl("/departments/count"),
  getDepartmentCount: fullUrl("/departments/count"),
  departmentsCount: fullUrl("/departments/count"),

  addDepartment: fullUrl("/departments/addDepartment"),
  updateDepartment: (id) => fullUrl(`/departments/${id}`),
  deleteDepartment: (id) => fullUrl(`/departments/${id}`),

  // Appointments
  createAppointment: fullUrl("/appointments/createAppointment"),
  getMyAppointments: fullUrl("/appointments/myAppointments"),
  getDoctorAppointments: fullUrl("/appointments/doctor/appointments"),
  getDoctorSchedule: (date) =>
    fullUrl(`/appointments/doctor/schedule?date=${date}`),

  deleteAppointmentLegacy: (id) =>
    fullUrl(`/appointments/deleteAppointment/${id}`),

  deleteAppointment: (id) => fullUrl(`/appointments/${id}`),

  getAppointmentAvailability: (doctorId, date) =>
    fullUrl(`/appointments/availability?doctorId=${doctorId}&date=${date}`),

  getAvailability: (doctorId, date) =>
    fullUrl(`/appointments/availability?doctorId=${doctorId}&date=${date}`),

  updateAppointmentStatus: (id) => fullUrl(`/appointments/${id}/status`),

  approveAppointment: (id) =>
    fullUrl(`/appointments/doctor/appointments/${id}/approve`),

  rejectAppointment: (id) =>
    fullUrl(`/appointments/doctor/appointments/${id}/reject`),

  respondToReschedule: (id) =>
    fullUrl(`/appointments/${id}/reschedule-response`),

  patientRescheduleAppointment: (id) =>
    fullUrl(`/appointments/${id}/patient-reschedule`),

  // Admin
  adminDashboard: fullUrl("/admin/dashboard"),

  // Images
  getDoctorImage: (image) => {
    if (!image) return "/img/doctors/avatar.png";

    if (image.startsWith("http")) return image;

    return `${API_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  },
};

export default api;