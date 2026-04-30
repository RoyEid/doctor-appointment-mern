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

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token. Please login first.");
        }

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

        const apptArray = Array.isArray(data) ? data : data.appointments || [];

        const sorted = apptArray.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setAppointments(sorted);
      } catch (error) {
        setError(error.message || "Failed to load appointments");
        toast.error(error.message || "Error loading appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const cancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.deleteAppointment(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete appointment");
      }

      setAppointments((prev) => prev.filter((a) => a._id !== id));

      toast.success("Appointment cancelled successfully!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!user) return <AuthRequired />;

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        My Appointments
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-center">{error}</p>
        </div>
      )}

      <div className="space-y-4 max-w-3xl mx-auto">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">
              You have no appointments booked.
            </p>
            <Link
              to="/add-appointment"
              className="text-[#008e9b] hover:underline font-medium"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          appointments.map((app) => {
            const currentStatus = app.status || "pending";

            return (
              <div
                key={app._id}
                className="w-full bg-white rounded-2xl shadow-md p-4 border border-gray-50 hover:shadow-lg transition"
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
                          : "/img/doctors/avatar.png"
                      }
                      onError={(e) => {
                        e.target.src = "/img/doctors/avatar.png";
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
                          month: "short",
                          day: "numeric",
                        })}
                        <span className="mx-0.5">|</span>
                        <span>🕒</span>
                        {app.time || "N/A"}
                      </div>

                      <span
                        className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          currentStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : currentStatus === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="shrink-0">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-md transition"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this appointment?",
                          )
                        ) {
                          cancelAppointment(app._id);
                        }
                      }}
                    >
                      <X size={18} strokeWidth={2.5} className="text-white" />
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
