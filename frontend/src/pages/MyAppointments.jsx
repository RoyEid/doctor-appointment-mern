import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Check,
  Clock,
  Loader2,
  Stethoscope,
  X,
} from "lucide-react";
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
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    if (user && user.role === "admin") {
      // Admins can see all appointments from their own admin page.
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

        const sorted = apptArray.sort((a, b) => {
          const dateA = new Date(
            `${a.date?.split?.("T")?.[0] || a.date} ${a.time}`,
          );
          const dateB = new Date(
            `${b.date?.split?.("T")?.[0] || b.date} ${b.time}`,
          );
          return dateB - dateA;
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
      setCancelingId(id);

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
        throw new Error(data.message || "Failed to cancel appointment");
      }

      setAppointments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Appointment cancelled successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCancelingId(null);
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
    if (status === "completed") return "bg-purple-100 text-purple-700";
    if (isReschedulePending) return "bg-blue-100 text-blue-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const formatDisplayStatus = (status, isReschedulePending) => {
    if (isReschedulePending) return "Reschedule Request";
    return (status || "pending").replace("_", " ");
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLongDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const activeAppointments = appointments.filter(
    (app) =>
      !["cancelled", "rejected", "completed"].includes(
        (app.status || "pending").toLowerCase(),
      ),
  );

  if (!user) return <AuthRequired />;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff]">
        <LoadingSpinner text="Loading your appointments..." fullScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-3 py-8 sm:px-6">
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

      <div className="mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-[#008e9b]">
            {appointments.length}
          </p>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">
            Total
          </p>
        </div>

        <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-black text-green-600">
            {activeAppointments.length}
          </p>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">
            Active
          </p>
        </div>

        <div className="col-span-2 rounded-3xl bg-white p-4 text-center shadow-sm sm:col-span-1">
          <p className="text-2xl font-black text-gray-900">30 min</p>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">
            Duration
          </p>
        </div>
      </div>

      {error && (
        <div className="mx-auto mb-5 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8fbfd] text-[#008e9b]">
              <Stethoscope size={34} />
            </div>

            <p className="mb-4 text-base font-medium text-gray-500 sm:text-lg">
              You have no appointments booked.
            </p>

            <Link
              to="/add-appointment"
              className="inline-flex items-center justify-center rounded-2xl !bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
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
            const isCanceling = cancelingId === app._id;

            const canCancel = !["cancelled", "rejected", "completed"].includes(
              normalizedStatus,
            );

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

                        <p className="mt-1 text-sm font-bold text-[#008e9b]">
                          {app.doctor?.specialty || "Doctor"}
                        </p>

                        <p className="mt-1 line-clamp-2 break-words text-sm font-medium text-gray-500">
                          {app.reason || "No reason provided"}
                        </p>
                      </div>
                    </div>

                    {canCancel && (
                      <button
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-red-100 text-white shadow-md transition sm:h-11 sm:w-11 ${
                          isCanceling
                            ? "cursor-not-allowed !bg-gray-400 opacity-70"
                            : "!bg-red-500 hover:!bg-red-600"
                        }`}
                        aria-label="Cancel appointment"
                        title="Cancel appointment"
                        disabled={isCanceling}
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
                        {isCanceling ? (
                          <Loader2 size={22} className="animate-spin" />
                        ) : (
                          <X size={24} strokeWidth={3.5} />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 sm:ml-[76px]">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f4fbfc] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#008e9b]">
                          <CalendarDays size={15} />
                          Date
                        </div>

                        <p className="text-sm font-black text-gray-900">
                          {formatLongDate(app.date)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f4fbfc] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#008e9b]">
                          <Clock size={15} />
                          Time
                        </div>

                        <p className="text-sm font-black text-gray-900">
                          {app.time || "N/A"}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          30-minute appointment
                        </p>
                      </div>
                    </div>

                    {isReschedulePending && (
                      <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-black text-blue-700">
                          Doctor proposed a new appointment time
                        </p>

                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                              Previous
                            </p>
                            <p className="mt-1 text-sm font-bold text-gray-700">
                              {formatDate(app.oldDate)} at{" "}
                              {app.oldTime || "N/A"}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                              New
                            </p>
                            <p className="mt-1 text-sm font-bold text-[#008e9b]">
                              {formatDate(app.date)} at {app.time || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                          <button
                            onClick={() =>
                              handleRescheduleResponse(app._id, "accept")
                            }
                            disabled={isResponding}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition ${
                              isResponding
                                ? "cursor-not-allowed !bg-green-300 text-white opacity-70"
                                : "!bg-green-500 text-white hover:!bg-green-600"
                            }`}
                          >
                            {isResponding ? (
                              <>
                                <Loader2 size={17} className="animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Check size={17} />
                                Accept New Time
                              </>
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleRescheduleResponse(app._id, "reject")
                            }
                            disabled={isResponding}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold shadow-sm transition ${
                              isResponding
                                ? "cursor-not-allowed border-gray-300 !bg-gray-300 text-gray-600 opacity-70"
                                : "border-red-200 !bg-white text-red-600 hover:!bg-red-50"
                            }`}
                          >
                            {isResponding ? (
                              <>
                                <Loader2 size={17} className="animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <X size={17} />
                                Reject New Time
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
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
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

export default MyAppointments;
