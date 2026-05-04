import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { apiConfig } from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import AuthRequired from "../components/AuthRequired";
import { respondToReschedule } from "../services/appointmentService";

function MyAppointments() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === "admin") {
      // Admins can see all, but they have their own page.
    }
  }, [user, navigate]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingApptId, setRespondingApptId] = useState(null);

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

        console.log("📋 Appointments loaded:", {
          count: sorted.length,
          statuses: sorted.map((a) => ({ id: a._id, status: a.status })),
        });

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

  const handleRescheduleResponse = async (id, response) => {
    try {
      setRespondingApptId(id);
      console.log("🔄 Reschedule response:", { appointmentId: id, response });

      const data = await respondToReschedule(id, response);
      console.log("✅ Reschedule response received:", data);

      setAppointments((prev) => prev.map((a) => (a._id === id ? data : a)));

      toast.success(
        `Reschedule ${response === "accept" ? "accepted" : "rejected"}!`,
      );
    } catch (err) {
      console.error("❌ Reschedule response error:", err);
      toast.error(err.message || "Failed to respond to reschedule request");
    } finally {
      setRespondingApptId(null);
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
    <div className="px-4 sm:px-6 py-6 bg-gray-100 min-h-screen">
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
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* LEFT */}
                  <div className="flex gap-3 min-w-0">
                    <img
                      alt={app?.doctor?.name || "Doctor"}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-[#008e9b]"
                      src={apiConfig.getDoctorImage(app?.doctor?.image)}
                      onError={(e) => {
                        e.target.src = "/img/doctors/avatar.png";
                      }}
                    />

                    <div className="min-w-0">
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
                              : currentStatus === "reschedule_pending"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {currentStatus === "reschedule_pending"
                          ? "Reschedule Request"
                          : currentStatus}
                      </span>

                      {currentStatus === "reschedule_pending" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() =>
                              handleRescheduleResponse(app._id, "accept")
                            }
                            disabled={respondingApptId === app._id}
                            className={`text-xs px-3 py-1.5 rounded-lg shadow-sm transition ${
                              respondingApptId === app._id
                                ? "bg-green-400 text-white cursor-not-allowed opacity-70"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                          >
                            {respondingApptId === app._id
                              ? "Updating..."
                              : "Accept New Time"}
                          </button>
                          <button
                            onClick={() =>
                              handleRescheduleResponse(app._id, "reject")
                            }
                            disabled={respondingApptId === app._id}
                            className={`text-xs px-3 py-1.5 rounded-lg shadow-sm transition ${
                              respondingApptId === app._id
                                ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-70"
                                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                          >
                            {respondingApptId === app._id
                              ? "Updating..."
                              : "Reject New Time"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="shrink-0 self-end sm:self-start">
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md transition"
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
                      <X size={18} strokeWidth={2.5} />
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
