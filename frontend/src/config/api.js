// API Configuration - Uses environment variables for production
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://doctor-backend-46g2.onrender.com";

export const apiConfig = {
    baseURL: API_BASE_URL,

    // Auth endpoints
    login: `${API_BASE_URL}/user/signin`,
    register: `${API_BASE_URL}/user/register`,
    googleLogin: `${API_BASE_URL}/user/google`,

    // Doctor endpoints
    getAllDoctors: `${API_BASE_URL}/doctors/allDoctors`,
    getDoctorById: (id) => `${API_BASE_URL}/doctors/${id}`,
    getDoctorsBySpecialty: (specialty) => `${API_BASE_URL}/doctors/doctors/bySpecialty/${specialty}`,
    addDoctor: `${API_BASE_URL}/doctors/addDoctors`,
    getDoctorsCount: `${API_BASE_URL}/doctors/count`,
    deleteDoctor: (id) => `${API_BASE_URL}/doctors/${id}`,
    updateDoctor: (id) => `${API_BASE_URL}/doctors/${id}`,
    updateAvailability: `${API_BASE_URL}/doctors/availability`,
    getMyProfile: `${API_BASE_URL}/api/doctors/me`,
    updateDoctorProfile: `${API_BASE_URL}/api/doctors/update-profile`,

    // Appointment endpoints
    createAppointment: `${API_BASE_URL}/appointments/createAppointment`,
    getMyAppointments: `${API_BASE_URL}/appointments/myAppointments`,
    getDoctorAppointments: `${API_BASE_URL}/appointments/doctor`,
    deleteAppointment: (id) => `${API_BASE_URL}/appointments/deleteAppointment/${id}`,
    updateAppointmentStatus: (id) => `${API_BASE_URL}/appointments/${id}/status`,
    respondToReschedule: (id) => `${API_BASE_URL}/appointments/${id}/reschedule-response`,


    // Department endpoints
    getAllDepartments: `${API_BASE_URL}/departments/allDepartments`,
    addDepartment: `${API_BASE_URL}/departments/addDepartment`,
    getDepartmentsCount: `${API_BASE_URL}/departments/count`,
    deleteDepartment: (id) => `${API_BASE_URL}/departments/${id}`,

    // Image upload helper
    getDoctorImage: (image) => {
        if (!image) return "/default-doctor.png";
        if (image.startsWith("http")) return image;
        if (image.startsWith("/")) return image;
        return `${API_BASE_URL}/uploads/${image}`;
    },
};

export default apiConfig;
