import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  CalendarDays,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  UserRound,
} from "lucide-react";

function DoctorAppointments() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(today);
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time: "",
  });

  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleSlotsLoading, setRescheduleSlotsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "doctor") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(apiConfig.getDoctorAppointments, {
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
      console.error("Error fetching doctor appointments:", error);
      toast.error(error.message || "Error loading appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctorSchedule = useCallback(async () => {
    if (!selectedDate) return;

    try {
      setScheduleLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.getDoctorSchedule(selectedDate), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load schedule");
      }

      setScheduleSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch (error) {
      console.error("FETCH_DOCTOR_SCHEDULE_ERROR:", error);
      toast.error(error.message || "Could not load doctor schedule");
      setScheduleSlots([]);
    } finally {
      setScheduleLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchAppointments();
    }
  }, [fetchAppointments, user?.role]);

  useEffect(() => {
    if (user?.role === "doctor") {
      fetchDoctorSchedule();
    }
  }, [fetchDoctorSchedule, user?.role]);

  const fetchRescheduleSlots = async (date) => {
    if (!date) {
      setRescheduleSlots([]);
      return;
    }

    try {
      setRescheduleSlotsLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.getDoctorSchedule(date), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load reschedule slots");
      }

      setRescheduleSlots(Array.isArray(data.slots) ? data.slots : []);
    } catch (error) {
      console.error("FETCH_RESCHEDULE_SLOTS_ERROR:", error);
      toast.error(error.message || "Could not load reschedule slots");
      setRescheduleSlots([]);
    } finally {
      setRescheduleSlotsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    if (updatingId) return;

    setUpdatingId(id);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.updateAppointmentStatus(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update appointment");
      }

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id
            ? { ...appointment, status: data.status || status }
            : appointment,
        ),
      );

      toast.success(`Appointment ${status} successfully!`);
      fetchDoctorSchedule();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const startReschedule = async (appointment) => {
    const dateValue = appointment?.date
      ? new Date(appointment.date).toISOString().split("T")[0]
      : today;

    setEditingId(appointment._id);
    setRescheduleForm({
      date: dateValue,
      time: "",
    });

    await fetchRescheduleSlots(dateValue);
  };

  const submitReschedule = async (id) => {
    if (!rescheduleForm.date || !rescheduleForm.time) {
      toast.error("Please choose an available date and time.");
      return;
    }

    try {
      setUpdatingId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.updateAppointmentStatus(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: rescheduleForm.date,
          time: rescheduleForm.time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to reschedule appointment");
      }

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id ? data : appointment,
        ),
      );

      setEditingId(null);
      setRescheduleForm({ date: "", time: "" });
      setRescheduleSlots([]);

      toast.success("Reschedule request sent to patient.");
      fetchDoctorSchedule();
    } catch (error) {
      toast.error(error.message || "Failed to reschedule appointment");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRescheduleDateChange = async (date) => {
    setRescheduleForm({ date, time: "" });
    await fetchRescheduleSlots(date);
  };

  const getStatusBadge = (status) => {
    if (status === "approved") {
      return "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300";
    }

    if (status === "rejected") {
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    }

    if (status === "cancelled") {
      return "bg-gray-100 text-gray-500 dark:bg-slate-500/10 dark:text-slate-300";
    }

    if (status === "completed") {
      return "bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/10 dark:text-[#46daea]";
    }

    if (status === "reschedule_pending") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300";
    }

    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const activeScheduleCount = scheduleSlots.filter(
    (slot) => !slot.available,
  ).length;
  const availableScheduleCount = scheduleSlots.filter(
    (slot) => slot.available,
  ).length;

  if (!user || user.role !== "doctor") {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <LoadingSpinner text="Loading your doctor appointments..." fullScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] sm:px-6">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Doctor Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
          Doctor Schedule
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
          View your daily schedule, patient bookings, and available 30-minute
          slots.
        </p>
      </div>

      <section className="mx-auto mb-8 max-w-6xl rounded-[2rem] border border-white bg-white/95 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
              <CalendarDays size={14} />
              Daily Calendar
            </div>

            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
              Cyan card = available slot. Dark card = booked patient
              appointment.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-slate-200 dark:focus:bg-[#071416] dark:focus:ring-[#46daea]"
            />

            <button
              type="button"
              onClick={fetchDoctorSchedule}
              className="inline-flex items-center justify-center gap-2 rounded-2xl !bg-[#008e9b] px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:!bg-[#007a85] dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-[#e8fbfd] p-4 text-center dark:bg-[#46daea]/15">
            <p className="text-2xl font-black text-[#008e9b] dark:text-[#46daea]">
              {availableScheduleCount}
            </p>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
              Available
            </p>
          </div>

          <div className="rounded-3xl bg-gray-100 p-4 text-center dark:bg-[#1f3a40]">
            <p className="text-2xl font-black text-gray-800 dark:text-white">
              {activeScheduleCount}
            </p>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
              Booked
            </p>
          </div>

          <div className="col-span-2 rounded-3xl bg-white p-4 text-center shadow-sm dark:bg-[#071416] sm:col-span-1">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              30 min
            </p>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
              Slot duration
            </p>
          </div>
        </div>

        {scheduleLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-3xl bg-gray-50 dark:bg-[#071416]">
            <div className="text-center">
              <Loader2
                size={34}
                className="mx-auto animate-spin text-[#008e9b] dark:text-[#46daea]"
              />
              <p className="mt-3 text-sm font-bold text-gray-500 dark:text-slate-400">
                Loading schedule...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scheduleSlots.length === 0 ? (
              <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-[#1f3a40] dark:bg-[#071416]">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  No schedule slots found for this date.
                </p>
              </div>
            ) : (
              scheduleSlots.map((slot) => {
                const appointment = slot.appointment;

                return (
                  <div
                    key={slot.time}
                    className={`rounded-3xl border p-4 transition-all hover:-translate-y-0.5 ${
                      slot.available
                        ? "border-[#008e9b]/15 bg-[#e8fbfd] shadow-sm hover:shadow-[0_16px_40px_rgba(0,142,155,0.12)] dark:border-[#46daea]/20 dark:bg-[#071416] dark:hover:border-[#46daea]/35 dark:hover:shadow-[0_16px_40px_rgba(70,218,234,0.10)]"
                        : "border-gray-100 bg-white shadow-sm hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-[#1f3a40] dark:bg-[#0b1d20] dark:hover:border-[#46daea]/20 dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black shadow-sm ${
                          slot.available
                            ? "bg-white text-gray-700 dark:bg-[#0f2428] dark:text-slate-200"
                            : "bg-gray-50 text-gray-700 dark:bg-[#071416] dark:text-slate-200"
                        }`}
                      >
                        <Clock
                          size={14}
                          className={
                            slot.available
                              ? "text-[#008e9b] dark:text-[#46daea]"
                              : "text-gray-500 dark:text-slate-400"
                          }
                        />
                        {slot.time}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${
                          slot.available
                            ? "bg-[#008e9b] text-white dark:bg-[#46daea] dark:text-[#071416]"
                            : getStatusBadge(appointment?.status || "booked")
                        }`}
                      >
                        {slot.available ? "Available" : appointment?.status}
                      </span>
                    </div>

                    {slot.available ? (
                      <p className="text-sm font-semibold text-[#008e9b] dark:text-[#46daea]">
                        This time is free.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white">
                          <UserRound
                            size={16}
                            className="text-[#008e9b] dark:text-[#46daea]"
                          />
                          {appointment?.user?.name || "Unknown Patient"}
                        </div>

                        {appointment?.user?.email && (
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400">
                            <Mail size={14} />
                            {appointment.user.email}
                          </div>
                        )}

                        <p className="line-clamp-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                          <span className="font-black text-gray-700 dark:text-slate-200">
                            Reason:
                          </span>{" "}
                          {appointment?.reason || "No reason provided"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-4xl">
        <div className="mb-5 text-center">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            Appointment Requests
          </h3>

          <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
            Approve, reject, or propose a new available time.
          </p>
        </div>

        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-[#1f3a40] dark:bg-[#0f2428] sm:p-10">
              <p className="text-base font-medium text-gray-500 dark:text-slate-400 sm:text-lg">
                No appointments assigned to you.
              </p>
            </div>
          ) : (
            appointments.map((app) => {
              const currentStatus = app.status || "pending";
              const isUpdating = updatingId === app._id;

              return (
                <div
                  key={app._id}
                  className="w-full overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_14px_35px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_22px_50px_rgba(0,0,0,0.35)]"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#008e9b] text-xl font-black uppercase text-white shadow-md dark:bg-[#46daea] dark:text-[#071416]">
                        {app.user?.name ? app.user.name.charAt(0) : "P"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3 className="text-base font-black leading-tight text-gray-900 dark:text-white sm:text-lg">
                              {app.user?.name || "Unknown Patient"}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                              <span className="font-black text-gray-700 dark:text-slate-200">
                                Reason:
                              </span>{" "}
                              {app.reason || "No reason provided"}
                            </p>
                          </div>

                          {currentStatus === "pending" && (
                            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(app._id, "approved")
                                }
                                disabled={isUpdating}
                                className={`rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition ${
                                  isUpdating
                                    ? "cursor-not-allowed !bg-gray-400 opacity-70"
                                    : "!bg-green-500 hover:!bg-green-600"
                                }`}
                              >
                                {isUpdating ? "..." : "Approve"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(app._id, "rejected")
                                }
                                disabled={isUpdating}
                                className={`rounded-xl px-4 py-2 text-xs font-black text-white shadow-sm transition ${
                                  isUpdating
                                    ? "cursor-not-allowed !bg-gray-400 opacity-70"
                                    : "!bg-red-500 hover:!bg-red-600"
                                }`}
                              >
                                {isUpdating ? "..." : "Reject"}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-slate-500 sm:text-sm">
                          <span>📅</span>
                          <span>{formatDate(app.date)}</span>

                          <span className="mx-0.5">|</span>

                          <span>🕒</span>
                          <span>{app.time || "N/A"}</span>
                        </div>

                        {editingId === app._id ? (
                          <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-[#1f3a40] dark:bg-[#071416]/70">
                            <div className="mb-3">
                              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                New Date
                              </label>

                              <input
                                type="date"
                                value={rescheduleForm.date}
                                min={today}
                                onChange={(e) =>
                                  handleRescheduleDateChange(e.target.value)
                                }
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm font-semibold text-gray-700 outline-none transition-all focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-slate-200 dark:focus:ring-[#46daea]"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-xs font-black uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                Choose available time
                              </label>

                              {rescheduleSlotsLoading ? (
                                <div className="flex items-center justify-center rounded-2xl bg-white p-5 dark:bg-[#0f2428]">
                                  <Loader2
                                    size={24}
                                    className="animate-spin text-[#008e9b] dark:text-[#46daea]"
                                  />
                                </div>
                              ) : rescheduleSlots.length === 0 ? (
                                <div className="rounded-2xl bg-white p-4 text-center text-sm font-medium text-gray-500 dark:bg-[#0f2428] dark:text-slate-400">
                                  No slots found for this date.
                                </div>
                              ) : (
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                  {rescheduleSlots.map((slot) => {
                                    const isSelected =
                                      rescheduleForm.time === slot.time;

                                    return (
                                      <button
                                        key={slot.time}
                                        type="button"
                                        disabled={!slot.available}
                                        onClick={() =>
                                          setRescheduleForm((prev) => ({
                                            ...prev,
                                            time: slot.time,
                                          }))
                                        }
                                        className={`rounded-xl border px-3 py-2 text-xs font-black transition ${
                                          slot.available
                                            ? isSelected
                                              ? "!bg-[#008e9b] text-white ring-2 ring-[#46daea] dark:!bg-[#46daea] dark:text-[#071416]"
                                              : "!bg-white text-[#008e9b] hover:!bg-[#e8fbfd] dark:border-[#46daea]/20 dark:!bg-[#0f2428] dark:text-[#46daea] dark:hover:!bg-[#46daea]/10"
                                            : "cursor-not-allowed !bg-gray-200 text-gray-400 opacity-70 dark:!bg-[#1f3a40] dark:text-slate-500"
                                        }`}
                                      >
                                        {slot.time}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => submitReschedule(app._id)}
                                disabled={
                                  isUpdating ||
                                  !rescheduleForm.date ||
                                  !rescheduleForm.time
                                }
                                className={`rounded-xl px-4 py-2 text-xs font-black text-white transition ${
                                  isUpdating ||
                                  !rescheduleForm.date ||
                                  !rescheduleForm.time
                                    ? "cursor-not-allowed !bg-gray-400 opacity-70"
                                    : "!bg-[#008e9b] hover:!bg-[#007a85] dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
                                }`}
                              >
                                {isUpdating ? "Saving..." : "Send Request"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(null);
                                  setRescheduleForm({ date: "", time: "" });
                                  setRescheduleSlots([]);
                                }}
                                className="rounded-xl border border-gray-200 !bg-white px-4 py-2 text-xs font-black text-gray-600 transition hover:!bg-gray-50 dark:border-[#1f3a40] dark:!bg-[#0f2428] dark:text-slate-300 dark:hover:!bg-[#071416]"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startReschedule(app)}
                            className="mt-4 rounded-xl border border-[#008e9b]/25 !bg-white px-4 py-2 text-xs font-black text-[#008e9b] shadow-sm transition hover:!bg-[#e8fbfd] dark:border-[#46daea]/25 dark:!bg-[#0f2428] dark:text-[#46daea] dark:hover:!bg-[#46daea]/10"
                          >
                            Reschedule
                          </button>
                        )}

                        <div className="mt-3">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusBadge(
                              currentStatus,
                            )}`}
                          >
                            {currentStatus.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

export default DoctorAppointments;
