import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Check,
  Clock,
  Loader2,
  RefreshCcw,
  Stethoscope,
  X,
} from "lucide-react";
import api, { API_ENDPOINTS } from "../config/api";
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

  const [openRescheduleId, setOpenRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingRescheduleId, setSubmittingRescheduleId] = useState(null);

  useEffect(() => {
    if (user && user.role === "admin") {
      // Admins can see all appointments from their own admin page.
    }
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(API_ENDPOINTS.getMyAppointments);

      const data = res.data;
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
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load appointments";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getTodayDateInputValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getDoctorImage = (image) => {
    if (!image) return "/img/doctors/avatar.png";

    if (image.startsWith("http")) return image;

    const baseUrl = process.env.REACT_APP_API_URL || "";

    return `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`;
  };

  const getDoctorIdForAvailability = (appointment) => {
    return (
      appointment?.doctor?._id || appointment?.doctor || appointment?.doctorId
    );
  };

  const toggleRescheduleForm = (appointment) => {
    const isSameAppointment = openRescheduleId === appointment._id;

    if (isSameAppointment) {
      setOpenRescheduleId(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setAvailableSlots([]);
      return;
    }

    setOpenRescheduleId(appointment._id);
    setRescheduleDate("");
    setRescheduleTime("");
    setAvailableSlots([]);
  };

  const loadAvailableSlots = async (appointment, selectedDate) => {
    try {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setRescheduleTime("");

      const doctorId = getDoctorIdForAvailability(appointment);

      if (!doctorId) {
        throw new Error("Doctor information is missing for this appointment.");
      }

      const res = await api.get(
        API_ENDPOINTS.getAvailability(doctorId, selectedDate),
      );

      const slots = Array.isArray(res.data?.availableSlots)
        ? res.data.availableSlots
        : [];

      setAvailableSlots(slots);

      if (slots.length === 0) {
        toast.info(
          "No available slots for this date. Please choose another date.",
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to load available slots";

      toast.error(message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleRescheduleDateChange = async (appointment, value) => {
    setRescheduleDate(value);
    setRescheduleTime("");

    if (value) {
      await loadAvailableSlots(appointment, value);
    }
  };

  const submitPatientReschedule = async (appointment) => {
    try {
      if (!rescheduleDate || !rescheduleTime) {
        toast.error("Please select a new date and time.");
        return;
      }

      const result = await Swal.fire({
        icon: "question",
        title: "Request reschedule?",
        text: "Your appointment will go back to pending and the doctor must approve it again.",
        showCancelButton: true,
        confirmButtonText: "Yes, request it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#008e9b",
        cancelButtonColor: "#64748b",
      });

      if (!result.isConfirmed) return;

      setSubmittingRescheduleId(appointment._id);

      const res = await api.put(
        API_ENDPOINTS.patientRescheduleAppointment(appointment._id),
        {
          date: rescheduleDate,
          time: rescheduleTime,
        },
      );

      setAppointments((prev) =>
        prev.map((a) => (a._id === appointment._id ? res.data : a)),
      );

      setOpenRescheduleId(null);
      setRescheduleDate("");
      setRescheduleTime("");
      setAvailableSlots([]);

      toast.success("Reschedule request sent. Waiting for doctor approval.");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to request reschedule";

      toast.error(message);
    } finally {
      setSubmittingRescheduleId(null);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      setCancelingId(id);

      await api.delete(API_ENDPOINTS.deleteAppointment(id));

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id
            ? { ...appointment, status: "cancelled" }
            : appointment,
        ),
      );

      toast.success("Appointment cancelled successfully!");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to cancel appointment";

      toast.error(message);
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
          Review your appointments, request a reschedule, cancel if needed, or
          respond to doctor reschedule requests.
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
            const isSubmittingReschedule = submittingRescheduleId === app._id;
            const isRescheduleOpen = openRescheduleId === app._id;

            const canCancel = !["cancelled", "rejected", "completed"].includes(
              normalizedStatus,
            );

            const canRequestReschedule = [
              "pending",
              "approved",
              "reschedule_pending",
            ].includes(normalizedStatus);

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
                        src={getDoctorImage(app?.doctor?.image)}
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

                    {canRequestReschedule && (
                      <div className="mt-4">
                        <button
                          onClick={() => toggleRescheduleForm(app)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#008e9b]/20 !bg-[#e8fbfd] px-4 py-3 text-sm font-black text-[#008e9b] transition hover:!bg-[#d8f7fa] sm:w-auto"
                        >
                          <RefreshCcw size={17} />
                          {isRescheduleOpen
                            ? "Close Reschedule"
                            : "Request Reschedule"}
                        </button>

                        {isRescheduleOpen && (
                          <div className="mt-4 rounded-3xl border border-[#008e9b]/10 bg-[#f4fbfc] p-4">
                            <p className="text-sm font-black text-gray-900">
                              Choose a new date and available time
                            </p>

                            <p className="mt-1 text-xs font-semibold text-gray-500">
                              After submitting, this appointment will become
                              pending again until the doctor approves it.
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                                  New Date
                                </label>

                                <input
                                  type="date"
                                  min={getTodayDateInputValue()}
                                  value={rescheduleDate}
                                  onChange={(e) =>
                                    handleRescheduleDateChange(
                                      app,
                                      e.target.value,
                                    )
                                  }
                                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none transition focus:border-[#008e9b] focus:ring-2 focus:ring-[#008e9b]/10"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-gray-500">
                                  Available Time
                                </label>

                                <select
                                  value={rescheduleTime}
                                  onChange={(e) =>
                                    setRescheduleTime(e.target.value)
                                  }
                                  disabled={!rescheduleDate || loadingSlots}
                                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none transition focus:border-[#008e9b] focus:ring-2 focus:ring-[#008e9b]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                  <option value="">
                                    {loadingSlots
                                      ? "Loading slots..."
                                      : "Select time"}
                                  </option>

                                  {availableSlots.map((slot) => (
                                    <option key={slot} value={slot}>
                                      {slot}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <button
                              onClick={() => submitPatientReschedule(app)}
                              disabled={
                                isSubmittingReschedule ||
                                loadingSlots ||
                                !rescheduleDate ||
                                !rescheduleTime
                              }
                              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white shadow-lg transition sm:w-auto ${
                                isSubmittingReschedule ||
                                loadingSlots ||
                                !rescheduleDate ||
                                !rescheduleTime
                                  ? "cursor-not-allowed !bg-gray-400 opacity-70"
                                  : "!bg-[#008e9b] hover:!bg-[#007a85]"
                              }`}
                            >
                              {isSubmittingReschedule ? (
                                <>
                                  <Loader2 size={18} className="animate-spin" />
                                  Sending Request...
                                </>
                              ) : (
                                <>
                                  <RefreshCcw size={18} />
                                  Submit Reschedule Request
                                </>
                              )}
                            </button>
                          </div>
                        )}
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
