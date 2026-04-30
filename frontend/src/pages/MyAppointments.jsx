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
      <div className="space-y-4 px-4 max-w-3xl mx-auto">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">You have no appointments booked.</p>
            <Link to="/add-appointment" className="text-[#008e9b] hover:underline font-medium">Book your first appointment</Link>
          </div>
        ) : (
          appointments.map((app) => {
            const currentStatus = app.status || "pending";
            return (
            <div
              key={app._id}
              className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-4 transition-all duration-300 border border-gray-50 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                
                {/* LEFT */}
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
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                      {app.doctor?.name || "Unknown Doctor"}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                      {app.reason}
                    </p>
                    
                    <div className="text-xs sm:text-sm text-gray-400 mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span>📅</span> 
                      {new Date(app.date).toLocaleDateString("en-US", {
                        month: "short", day: "numeric"
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

                {/* RIGHT */}
                <div className="shrink-0 flex items-start">
                  <button
                    className="text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center transition-colors focus:outline-none shadow-sm"
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
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </div>

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
