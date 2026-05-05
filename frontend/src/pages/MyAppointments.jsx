import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { apiConfig } from "../config/api";
import { Link, useNavigate } from "react-router-dom";
import AuthRequired from "../components/AuthRequired";
import LoadingSpinner from "../components/LoadingSpinner";
import { respondToReschedule } from "../services/appointmentService";
import Swal from "sweetalert2";

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

  const handleRescheduleResponse = async (id, response) => {
    try {
      setRespondingApptId(id);

      const data = await respondToReschedule(id, response);

      setAppointments((prev) => prev.map((a) => (a._id === id ? data : a)));

      toast.success(
        `Reschedule ${response === "accept" ? "accepted" : "rejected"}!`,
      );
    } catch (err) {
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
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff]">
        <LoadingSpinner text="Loading your appointments..." fullScreen />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-3 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Patient Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
          My Appointments
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500">
          Review your booked appointments, cancel if needed, or respond to
          reschedule requests from your doctor.
        </p>
      </div>

      {error && (
        <div className="mx-auto mb-5 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="mb-4 text-base font-medium text-gray-500 sm:text-lg">
              You have no appointments booked.
            </p>

            <Link
              to="/add-appointment"
              className="inline-flex items-center justify-center rounded-2xl bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl"
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
                className="w-full overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <img
                        alt={app?.doctor?.name || "Doctor"}
                        className="h-14 w-14 shrink-0 rounded-full border border-[#008e9b] object-cover sm:h-16 sm:w-16"
                        src={apiConfig.getDoctorImage(app?.doctor?.image)}
                        onError={(e) => {
                          e.target.src = "/img/doctors/avatar.png";
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-black text-gray-900 sm:text-lg">
                          {app.doctor?.name || "Unknown Doctor"}
                        </h3>

                        <p className="mt-1 line-clamp-2 break-words text-sm font-medium text-gray-500">
                          {app.reason || "No reason provided"}
                        </p>
                      </div>
                    </div>

                    <button
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-red-100 !bg-red-500 text-white shadow-md transition hover:!bg-red-600 sm:h-11 sm:w-11"
                      aria-label="Cancel appointment"
                      title="Cancel appointment"
                      onClick={async () => {
                        const result = await Swal.fire({
                          icon: "question",
                          title: "Cancel appointment?",
                          text: "Are you sure you want to cancel this appointment?",
                          showCancelButton: true,
                          confirmButtonText: "Yes, cancel it",
                          cancelButtonText: "Keep appointment",
                          confirmButtonColor: "#ef4444",
                          cancelButtonColor: "#06b6d4",
                        });

                        if (result.isConfirmed) {
                          cancelAppointment(app._id);
                        }
                      }}
                    >
                      <X size={24} strokeWidth={3.5} />
                    </button>
                  </div>

                  <div className="mt-3 sm:ml-[76px]">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500">
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
                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
                          normalizedStatus,
                          isReschedulePending,
                        )}`}
                      >
                        {formatDisplayStatus(
                          normalizedStatus,
                          isReschedulePending,
                        )}
                      </span>
                    </div>

                    {isReschedulePending && (
                      <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                        <button
                          onClick={() =>
                            handleRescheduleResponse(app._id, "accept")
                          }
                          disabled={isResponding}
                          className={`w-full rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition ${
                            isResponding
                              ? "cursor-not-allowed !bg-green-300 text-white opacity-70"
                              : "!bg-green-500 text-white hover:!bg-green-600"
                          }`}
                        >
                          {isResponding ? "Updating..." : "Accept New Time"}
                        </button>

                        <button
                          onClick={() =>
                            handleRescheduleResponse(app._id, "reject")
                          }
                          disabled={isResponding}
                          className={`w-full rounded-xl border px-4 py-2 text-sm font-bold shadow-sm transition ${
                            isResponding
                              ? "cursor-not-allowed border-gray-300 !bg-gray-300 text-gray-600 opacity-70"
                              : "border-red-200 !bg-white text-red-600 hover:!bg-red-50"
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
