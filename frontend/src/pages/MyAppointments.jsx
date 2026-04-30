import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { Link } from "react-router-dom";
import AuthRequired from "../components/AuthRequired";

function MyAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get token from localStorage
        const token = localStorage.getItem("token");
        console.log(
          "Token from localStorage:",
          token ? "✓ Found" : "✗ Not found",
        );

        // Check if token exists
        if (!token) {
          throw new Error("No authentication token. Please login first.");
        }

        // Check if user is available
        console.log("User from context:", user);

        // Make fetch request
        const url = apiConfig.getMyAppointments;
        console.log("Fetching from:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", res.status);

        const data = await res.json();
        console.log("Response data:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch appointments");
        }

        console.log("Appointments fetched successfully:", data);
        
        const apptArray = Array.isArray(data) ? data : data.appointments || [];
        const sorted = apptArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAppointments(sorted);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError(error.message || "Failed to load appointments");
        toast.error(error.message || "Error loading appointments");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is available (logged in)
    if (user) {
      fetchAppointments();
    } else {
      console.log("User not available in context, skipping fetch");
      setLoading(false);
    }
  }, [user]); // Add user as dependency

  const cancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Deleting appointment:", id);

      const res = await fetch(apiConfig.deleteAppointment(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("Delete response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete appointment");
      }

      // Remove from state
      setAppointments((prevAppointments) =>
        prevAppointments.filter((a) => a._id !== id),
      );

      toast.success("Appointment cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message);
    }
  };

  // If not logged in
  if (!user) return <AuthRequired />;

  // Loading state
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
        My Appointments
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-center">{error}</p>
        </div>
      )}

      <div className="space-y-6 max-w-4xl mx-auto px-4">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">No appointments found</p>
            <Link to="/add-appointment" className="text-[#008e9b] hover:underline font-medium">Book your first appointment</Link>
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
                    {user?.role === "admin" && app.user && (
                      <span className="text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                        Patient: {app.user.name}
                      </span>
                    )}
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        currentStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                        currentStatus === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
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
                <button
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-full p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200 mt-2 sm:mt-0"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel this appointment?",
                      )
                    ) {
                      cancelAppointment(app._id);
                    }
                  }}
                  title="Cancel appointment"
                >
                  <X size={20} className="sm:hidden" />
                  <X size={24} className="hidden sm:block" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default MyAppointments;
