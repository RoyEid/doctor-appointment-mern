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

      <div className="space-y-4 px-4 max-w-3xl mx-auto">
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
                className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-4 transition-all duration-300 border border-gray-50 hover:shadow-lg flex flex-col md:flex-row justify-between gap-4"
              >
                {/* LEFT SIDE */}
                <div className="flex gap-3">
                  <img
                    alt={app?.doctor?.name || "Doctor"}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-[#008e9b]"
                    src={
                      app?.doctor?.image
                        ? apiConfig.getImageUrl(app.doctor.image)
                        : "./img/doctors/avatar.png"
                    }
                    onError={(e) => {
                      e.target.src = "./img/doctors/avatar.png";
                    }}
                  />

                  <div>
                    <div className="flex flex-col mb-1 gap-0.5">
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight">
                        {app.doctor?.name || "Unknown Doctor"}
                      </h3>
                      {app.user && (
                        <p className="text-sm font-medium text-[#008e9b]">
                          {app.user.name}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{app.reason}</p>
                    
                    <div className="text-xs sm:text-sm text-gray-400 mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span>📅</span>
                      {new Date(app.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="mx-0.5">|</span>
                      <span>🕒</span>
                      {app.time || "N/A"}
                    </div>

                    <span 
                      className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                        currentStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                        currentStatus === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex gap-2 mt-2 md:mt-0 md:justify-end items-start shrink-0">
                  {currentStatus === "pending" ? (
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => updateStatus(app._id, "approved")}
                        className="flex-1 md:flex-none text-white bg-green-500 hover:bg-green-600 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-sm whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app._id, "rejected")}
                        className="flex-1 md:flex-none text-white bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition shadow-sm whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="hidden md:block w-full"></div>
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
