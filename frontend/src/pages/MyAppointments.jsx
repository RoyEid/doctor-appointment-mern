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

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingApptId, setRespondingApptId] = useState(null);

  useEffect(() => {
    if (user && user.role === "admin") {
      // Admins can see all, but they have their own page.
    }
  }, [user, navigate]);

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
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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
        `Reschedule ${response === "accept" ? "accepted" : "rejected"}!`
      );
    } catch (err) {
      console.error("❌ Reschedule response error:", err);
      toast.error(err.message || "Failed to respond to reschedule request");
    } finally {
      setRespondingApptId(null);
    }
  };

  const getStatusStyle = (status, isReschedulePending) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    if (status === "cancelled") return "bg-gray-100 text-gray-600";
    if (isReschedulePending) return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const formatDisplayStatus = (status, isReschedulePending) => {
    if (isReschedulePending) return "Reschedule Request";
    return status || "Pending";
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
    <div className="px-3 sm:px-6 py-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-[#008e9b]">
        My Appointments
      </h2>

      {error && (
        <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-center">{error}</p>
        </div>
      )}

      <div className="space-y-4 max-w-3xl mx-auto">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-base sm:text-lg mb-4">
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
            const normalizedStatus = currentStatus.toLowerCase();
            const isReschedulePending =
              normalizedStatus === "reschedule_pending";
            const isResponding = respondingApptId === app._id;

            return (
              <div
                key={app._id}
                className="w-full bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 min-w-0 flex-1">
                      <img
                        alt={app?.doctor?.name || "Doctor"}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-[#008e9b] shrink-0"
                        src={apiConfig.getDoctorImage(app?.doctor?.image)}
                        onError={(e) => {
                          e.target.src = "/img/doctors/avatar.png";
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                          {app.doctor?.name || "Unknown Doctor"}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words">
                          {app.reason || "No reason provided"}
                        </p>
                      </div>
                    </div>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md transition shrink-0 border-2 border-red-100"
                      aria-label="Cancel appointment"
                      title="Cancel appointment"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this appointment?"
                          )
                        ) {
                          cancelAppointment(app._id);
                        }
                      }}
                    >
                      <X size={28} strokeWidth={3.5} />
                    </button>
                  </div>

                  <div className="mt-3 ml-0 sm:ml-[76px]">
                    <div className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                      <span>📅</span>
                      <span>
                        {new Date(app.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      <span className="text-gray-300">|</span>

                      <span>🕒</span>
                      <span>{app.time || "N/A"}</span>
                    </div>

                    <div className="mt-3">
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full font-semibold capitalize ${getStatusStyle(
                          normalizedStatus,
                          isReschedulePending
                        )}`}
                      >
                        {formatDisplayStatus(
                          normalizedStatus,
                          isReschedulePending
                        )}
                      </span>
                    </div>

                    {isReschedulePending && (
                      <div className="mt-4 grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
                        <button
                          onClick={() =>
                            handleRescheduleResponse(app._id, "accept")
                          }
                          disabled={isResponding}
                          className={`w-full text-sm px-4 py-2 rounded-xl font-semibold shadow-sm transition ${
                            isResponding
                              ? "bg-green-300 text-white cursor-not-allowed opacity-70"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          {isResponding ? "Updating..." : "Accept New Time"}
                        </button>

                        <button
                          onClick={() =>
                            handleRescheduleResponse(app._id, "reject")
                          }
                          disabled={isResponding}
                          className={`w-full text-sm px-4 py-2 rounded-xl font-semibold shadow-sm transition border ${
                            isResponding
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed opacity-70 border-gray-300"
                              : "bg-white hover:bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {isResponding ? "Updating..." : "Reject New Time"}
                        </button>
                      </div>
                    )}
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