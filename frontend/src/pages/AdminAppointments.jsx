import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";

function AdminAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Basic redirect guard for normal users navigating to the route directly
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(apiConfig.getMyAppointments, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch appointments");
        }
        
        // Ensure data is array and sort newest first
        const apptArray = Array.isArray(data) ? data : data.appointments || [];
        const sorted = apptArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAppointments(sorted);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error(error.message || "Error loading appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchAppointments();
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.updateAppointmentStatus(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update appointment status");
      }
      
      setAppointments((prev) => 
        prev.map((a) => a._id === id ? { ...a, status: data.status } : a)
      );
      toast.success(`Appointment ${status} successfully!`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message);
    }
  };

  if (!user || user.role !== "admin") {
    return null; // Don't flash UI before navigate fires
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        Admin Dashboard - Appointments
      </h2>

      <div className="space-y-6 max-w-5xl mx-auto px-4">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">No appointments found across the platform.</p>
          </div>
        ) : (
          appointments.map((app) => {
            const currentStatus = app.status || "pending";
            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 flex flex-col md:flex-row justify-between gap-4 transition-all duration-300 hover:shadow-md"
              >
                {/* LEFT SIDE */}
                <div className="flex gap-4 sm:gap-6">
                  <img
                    alt={app?.doctor?.name || "Doctor"}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#008e9b]"
                    src={
                      app?.doctor?.image
                        ? apiConfig.getImageUrl(app.doctor.image)
                        : "./img/doctors/avatar.png"
                    }
                    onError={(e) => {
                      e.target.src = "./img/doctors/avatar.png";
                    }}
                  />

                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                        {app.doctor?.name || "Unknown Doctor"}
                      </h3>
                      {app.user && (
                        <span className="text-xs sm:text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                          User: {app.user.name}
                        </span>
                      )}
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          currentStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                          currentStatus === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1 text-sm sm:text-base">{app.reason}</p>
                    <p className="text-sm font-medium text-gray-700 flex flex-wrap items-center gap-2">
                      <span className="text-gray-500">📅</span>
                      {new Date(app.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="hidden sm:inline text-gray-400">|</span>
                      <span className="text-gray-500">🕒</span>
                      {app.time || "Time not specified"}
                    </p>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex gap-2 mt-3 md:mt-0 justify-end items-center">
                  {currentStatus === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(app._id, "approved")}
                        className="text-white bg-green-500 hover:bg-green-600 rounded px-4 py-2 text-sm font-semibold transition shadow-sm whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app._id, "rejected")}
                        className="text-white bg-orange-500 hover:bg-orange-600 rounded px-4 py-2 text-sm font-semibold transition shadow-sm whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminAppointments;
