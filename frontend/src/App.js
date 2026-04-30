import Login from "./components/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import Register from "./components/Register.jsx";
import AddAppointment from "./pages/AddAppointment.jsx";
import AddDoctor from "./pages/AddDoctor.jsx";
import Home from "./pages/Home.jsx";
import MyAppointments from "./pages/MyAppointments.jsx";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AllDoctors from "./pages/AllDoctors.jsx";
import DoctorDetails from "./pages/DoctorDetails.jsx";
import "react-toastify/dist/ReactToastify.css";
import AddDepartment from "./pages/AddDepartment";
import EditDoctor from "./pages/EditDoctor.jsx";
import AdminAppointments from "./pages/AdminAppointments.jsx";
import DoctorAppointments from "./pages/DoctorAppointments.jsx";
import RoleBasedRoute from "./components/RoleBasedRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DoctorProfile from "./pages/DoctorProfile.jsx";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-appointment" element={<AddAppointment />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/add-doctor" element={<RoleBasedRoute element={<AddDoctor />} requiredRole="admin" />} />
        <Route path="/admin/dashboard" element={<RoleBasedRoute element={<AdminDashboard />} requiredRole="admin" />} />
        <Route path="/admin/appointments" element={<RoleBasedRoute element={<AdminAppointments />} requiredRole="admin" />} />
        <Route path="/doctor/dashboard" element={<RoleBasedRoute element={<DoctorAppointments />} requiredRole="doctor" />} />
        <Route path="/doctor/appointments" element={<RoleBasedRoute element={<DoctorAppointments />} requiredRole="doctor" />} />
        <Route path="/doctor/profile" element={<RoleBasedRoute element={<DoctorProfile />} requiredRole="doctor" />} />
        <Route path="/edit-doctor/:id" element={<RoleBasedRoute element={<EditDoctor />} requiredRole="admin" />} />
        <Route path="/allDoctors" element={<AllDoctors />} />
        <Route path="/doctor/:id" element={<DoctorDetails />} />
        <Route path="/add-department" element={<RoleBasedRoute element={<AddDepartment />} requiredRole="admin" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;