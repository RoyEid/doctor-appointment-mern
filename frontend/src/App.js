import Login from "./components/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Register from "./components/Register.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";

import AddAppointment from "./pages/AddAppointment.jsx";
import AddDoctor from "./pages/AddDoctor.jsx";
import Home from "./pages/Home.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import AllDoctors from "./pages/AllDoctors.jsx";
import DoctorDetails from "./pages/DoctorDetails.jsx";
import AddDepartment from "./pages/AddDepartment";
import EditDoctor from "./pages/EditDoctor.jsx";
import AdminAppointments from "./pages/AdminAppointments.jsx";
import DoctorAppointments from "./pages/DoctorAppointments.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DoctorProfile from "./pages/DoctorProfile.jsx";

import RoleBasedRoute from "./components/RoleBasedRoute.jsx";

import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "./context/ThemeContext";

function App() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-300">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Patient routes */}
        <Route path="/add-appointment" element={<AddAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />

        {/* Public doctor routes */}
        <Route path="/allDoctors" element={<AllDoctors />} />
        <Route path="/doctor/:id" element={<DoctorDetails />} />

        {/* Admin routes */}
        <Route
          path="/add-doctor"
          element={
            <RoleBasedRoute element={<AddDoctor />} requiredRole="admin" />
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute
              element={<AdminDashboard />}
              requiredRole="admin"
            />
          }
        />

        <Route
          path="/admin/appointments"
          element={
            <RoleBasedRoute
              element={<AdminAppointments />}
              requiredRole="admin"
            />
          }
        />

        <Route
          path="/edit-doctor/:id"
          element={
            <RoleBasedRoute element={<EditDoctor />} requiredRole="admin" />
          }
        />

        <Route
          path="/add-department"
          element={
            <RoleBasedRoute
              element={<AddDepartment />}
              requiredRole="admin"
            />
          }
        />

        {/* Doctor routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <RoleBasedRoute
              element={<DoctorAppointments />}
              requiredRole="doctor"
            />
          }
        />

        <Route
          path="/doctor/appointments"
          element={
            <RoleBasedRoute
              element={<DoctorAppointments />}
              requiredRole="doctor"
            />
          }
        />

        <Route
          path="/doctor/profile"
          element={
            <RoleBasedRoute
              element={<DoctorProfile />}
              requiredRole="doctor"
            />
          }
        />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === "dark" ? "dark" : "colored"}
      />
    </div>
  );
}

export default App;