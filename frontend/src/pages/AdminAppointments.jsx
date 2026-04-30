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
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white shadow-sm border border-gray-100 p-5 sm:p-6 rounded-2xl hover:shadow-md transition-all duration-300 gap-4 sm:gap-0 relative"
              >
                <div className="flex items-center gap-4 sm:gap-6 w-full">
                  <img
                    alt={app?.doctor?.name || "Doctor"}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#008e9b]"
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
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {app.doctor?.name || "Unknown Doctor"}
                      </h3>
                      {app.user && (
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
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
                    <p className="text-gray-600 mb-1">{app.reason}</p>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-gray-500">📅</span>
                      {new Date(app.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">🕒</span>
                      {app.time || "Time not specified"}
                    </p>
                  </div>
                </div>

                <div className="absolute sm:relative top-4 right-4 sm:top-auto sm:right-auto flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  {currentStatus === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(app._id, "approved")}
                        className="text-white bg-green-500 hover:bg-green-600 rounded px-3 py-1.5 text-sm font-semibold transition shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app._id, "rejected")}
                        className="text-white bg-orange-500 hover:bg-orange-600 rounded px-3 py-1.5 text-sm font-semibold transition shadow-sm"
                      >
                        Reject
                      </button>
                    </div>
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
