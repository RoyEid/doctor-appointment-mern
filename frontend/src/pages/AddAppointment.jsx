import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import AuthRequired from "../components/AuthRequired";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  CalendarDays,
  Clock,
  FileText,
  Loader2,
  Stethoscope,
} from "lucide-react";

const CLINIC_TIME_ZONE = "Asia/Beirut";

function AddAppointment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  const [form, setForm] = useState({
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const getLebanonDateParts = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: CLINIC_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const values = {};

    parts.forEach((part) => {
      values[part.type] = part.value;
    });

    return {
      date: `${values.year}-${values.month}-${values.day}`,
      minutes: Number(values.hour) * 60 + Number(values.minute),
    };
  };

  const getTodayInLebanon = () => {
    return getLebanonDateParts().date;
  };

  const isTodayInLebanon = (dateValue) => {
    return dateValue === getTodayInLebanon();
  };

  const getSlotMinutes = (timeValue) => {
    if (!timeValue) return null;

    const [hours, minutes] = timeValue.split(":");

    return Number(hours) * 60 + Number(minutes);
  };

  const isPastSlotInLebanon = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return false;

    if (!isTodayInLebanon(dateValue)) return false;

    const currentLebanonMinutes = getLebanonDateParts().minutes;
    const slotMinutes = getSlotMinutes(timeValue);

    if (slotMinutes === null) return true;

    return slotMinutes <= currentLebanonMinutes;
  };

  useEffect(() => {
    if (user && user.role !== "user") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setDoctorsLoading(true);

        const res = await fetch(apiConfig.getAllDoctors);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not load doctors.");
        }

        setDoctors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("FETCH_DOCTORS_ERROR:", error);
        toast.error("Could not load doctors. Please try again.");
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctor();
  }, []);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!form.doctor || !form.date) {
        setAvailabilitySlots([]);
        setForm((prev) => ({ ...prev, time: "" }));
        return;
      }

      try {
        setSlotsLoading(true);

        const res = await fetch(
          apiConfig.getAppointmentAvailability(form.doctor, form.date),
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not load available times.");
        }

        const slots = Array.isArray(data.slots) ? data.slots : [];

        const normalizedSlots = slots.map((slot) => {
          const isPast =
            Boolean(slot.isPast) || isPastSlotInLebanon(form.date, slot.time);

          return {
            ...slot,
            isPast,
            available: Boolean(slot.available) && !isPast,
            status: isPast ? "past" : slot.status,
          };
        });

        setAvailabilitySlots(normalizedSlots);

        setForm((prev) => {
          const selectedSlotStillAvailable = normalizedSlots.some(
            (slot) => slot.time === prev.time && slot.available,
          );

          return selectedSlotStillAvailable ? prev : { ...prev, time: "" };
        });
      } catch (error) {
        console.error("FETCH_AVAILABILITY_ERROR:", error);
        setAvailabilitySlots([]);
        setForm((prev) => ({ ...prev, time: "" }));
        toast.error(error.message || "Could not load available times.");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.doctor, form.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "doctor" || name === "date" ? { time: "" } : {}),
    }));
  };

  const handleSlotClick = (slot) => {
    if (!slot.available) return;

    setForm((prev) => ({
      ...prev,
      time: prev.time === slot.time ? "" : slot.time,
    }));
  };

  const resendVerificationEmail = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      await Swal.fire({
        icon: "error",
        title: "Login required",
        text: "Please log in again before requesting a new verification email.",
        confirmButtonColor: "#06b6d4",
      });
      return;
    }

    try {
      const res = await fetch(apiConfig.resendVerification, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Verification email sent",
          text:
            data.message ||
            "We sent you a new verification email. Please check your inbox.",
          confirmButtonText: "Okay",
          confirmButtonColor: "#06b6d4",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "Could not send email",
          text: data.message || "Please try again later.",
          confirmButtonColor: "#06b6d4",
        });
      }
    } catch (error) {
      console.error("RESEND_VERIFICATION_FRONTEND_ERROR:", error);

      await Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not send verification email. Please check your connection.",
        confirmButtonColor: "#06b6d4",
      });
    }
  };

  const showBookingError = async (message) => {
    const lowerMessage = message.toLowerCase();

    const isSameDoctorSameDayError =
      lowerMessage.includes("already have an active appointment") ||
      lowerMessage.includes("same doctor") ||
      lowerMessage.includes("same day") ||
      lowerMessage.includes("another day or book with another doctor");

    if (isSameDoctorSameDayError) {
      await Swal.fire({
        icon: "warning",
        title: "Appointment Already Exists",
        html: `
          <div style="text-align: center;">
            <p style="font-size: 15px; color: #475569; margin-bottom: 10px;">
              You already have an active appointment with this doctor on this day.
            </p>
            <p style="font-size: 14px; color: #64748b;">
              Please choose another day, or book with another doctor.
            </p>
          </div>
        `,
        confirmButtonText: "Choose Another Date",
        confirmButtonColor: "#008e9b",
      });
      return;
    }

    await Swal.fire({
      icon: "error",
      title: "Booking Failed",
      text: message || "Failed to add appointment.",
      confirmButtonColor: "#008e9b",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!form.time) {
      toast.error("Please choose an available time slot.");
      return;
    }

    if (isPastSlotInLebanon(form.date, form.time)) {
      toast.error("This time has already passed. Please choose another slot.");
      setForm((prev) => ({ ...prev, time: "" }));
      return;
    }

    setSubmitting(true);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(apiConfig.createAppointment, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: "Appointment submitted",
          text: "Your appointment request has been sent successfully.",
          confirmButtonText: "View appointments",
          confirmButtonColor: "#06b6d4",
        });

        setForm({ doctor: "", date: "", time: "", reason: "" });
        setAvailabilitySlots([]);
        navigate("/my-appointments");
      } else if (res.status === 403) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Email verification required",
          html: `
            <p style="margin-bottom: 10px;">
              Please verify your email before booking an appointment.
            </p>
            <p style="font-size: 14px; color: #666;">
              If your verification link expired or you cannot find the email,
              we can send you a new one.
            </p>
          `,
          showCancelButton: true,
          confirmButtonText: "Resend Email",
          cancelButtonText: "Cancel",
          confirmButtonColor: "#06b6d4",
          cancelButtonColor: "#6b7280",
        });

        if (result.isConfirmed) {
          await resendVerificationEmail();
        }
      } else {
        await showBookingError(data.message || "Failed to add appointment.");
      }
    } catch (error) {
      console.error("Network or parsing error:", error);

      await Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Network error occurred. Please check your connection and try again.",
        confirmButtonColor: "#008e9b",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((doctor) => doctor._id === form.doctor);

  const availableCount = availabilitySlots.filter(
    (slot) => slot.available,
  ).length;

  const bookedCount = availabilitySlots.filter(
    (slot) => !slot.available && !slot.isPast,
  ).length;

  const pastCount = availabilitySlots.filter((slot) => slot.isPast).length;

  const hasOnlyPastOrBookedSlots =
    form.doctor &&
    form.date &&
    !slotsLoading &&
    availabilitySlots.length > 0 &&
    availableCount === 0;

  if (!user) return <AuthRequired />;

  if (doctorsLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff]">
        <LoadingSpinner text="Preparing appointment form..." fullScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Appointment Request
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
          Book an Appointment
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500">
          Choose your doctor and date, then select one available 30-minute time
          slot.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-5xl gap-6 overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <section className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Doctor
            </label>

            <div className="relative">
              <Stethoscope
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <select
                name="doctor"
                value={form.doctor}
                onChange={handleChange}
                required
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              >
                <option value="">Select doctor</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc?.name} - {doc?.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedDoctor && (
            <div className="rounded-3xl border border-[#008e9b]/10 bg-[#f4fbfc] p-4">
              <p className="text-sm font-black text-gray-900">
                {selectedDoctor.name}
              </p>

              <p className="mt-1 text-sm font-semibold text-[#008e9b]">
                {selectedDoctor.specialty}
              </p>

              <p className="mt-1 text-xs font-medium text-gray-500">
                {selectedDoctor.experienceYears} years of experience
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={getTodayInLebanon()}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>

            <p className="mt-2 text-xs font-semibold text-gray-500">
              Appointment times follow Lebanon time.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Reason
            </label>

            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-4 text-[#008e9b]"
              />

              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                required
                className="h-36 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                placeholder="Describe your reason for the appointment..."
              />
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#008e9b] shadow-sm">
                <Clock size={14} />
                30-minute slots
              </div>

              <h3 className="text-xl font-black text-gray-900">
                Available Times
              </h3>

              <p className="mt-1 text-sm font-medium text-gray-500">
                Teal slots are available. Gray slots are unavailable.
              </p>
            </div>

            {form.doctor && form.date && !slotsLoading && (
              <div className="flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-full bg-[#008e9b] px-3 py-1 text-white">
                  {availableCount} available
                </span>

                <span className="rounded-full bg-gray-200 px-3 py-1 text-gray-500">
                  {bookedCount} booked
                </span>

                {pastCount > 0 && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-red-500">
                    {pastCount} passed
                  </span>
                )}
              </div>
            )}
          </div>

          {!form.doctor || !form.date ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center">
              <p className="max-w-xs text-sm font-medium text-gray-500">
                Select a doctor and date to see the available appointment times.
              </p>
            </div>
          ) : slotsLoading ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-3xl bg-white">
              <div className="text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-[#008e9b]"
                />
                <p className="mt-3 text-sm font-semibold text-gray-500">
                  Loading available times...
                </p>
              </div>
            </div>
          ) : availabilitySlots.length === 0 ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center">
              <p className="max-w-xs text-sm font-medium text-gray-500">
                No slots are available for this doctor on this date.
              </p>
            </div>
          ) : (
            <>
              {hasOnlyPastOrBookedSlots && (
                <div className="mb-4 rounded-3xl border border-yellow-100 bg-yellow-50 p-4 text-sm font-semibold text-yellow-700">
                  No available slots remain for this date. Please choose
                  tomorrow or another future date.
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {availabilitySlots.map((slot) => {
                  const isSelected = form.time === slot.time;
                  const isPast = Boolean(slot.isPast);
                  const slotLabel = isPast
                    ? "Passed"
                    : slot.available
                      ? isSelected
                        ? "Selected"
                        : "Available"
                      : "Booked";

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => handleSlotClick(slot)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-black transition-all ${
                        slot.available
                          ? isSelected
                            ? "!bg-[#008e9b] text-white shadow-lg ring-2 ring-[#46daea]"
                            : "!bg-white text-[#008e9b] border-[#008e9b]/20 hover:-translate-y-0.5 hover:!bg-[#e8fbfd] hover:shadow-md"
                          : isPast
                            ? "cursor-not-allowed border-red-100 !bg-red-50 text-red-300 opacity-80"
                            : "cursor-not-allowed border-gray-200 !bg-gray-200 text-gray-400 opacity-70"
                      }`}
                      title={
                        slot.available
                          ? isSelected
                            ? "Click again to unselect"
                            : "Available"
                          : isPast
                            ? "This time has already passed"
                            : "This time is already booked"
                      }
                    >
                      {slot.time}

                      <span className="mt-1 block text-[10px] font-black uppercase tracking-wide">
                        {slotLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-5 rounded-3xl border border-white bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
              Selected appointment
            </p>

            <div className="mt-3 space-y-1 text-sm font-semibold text-gray-600">
              <p>
                Doctor:{" "}
                <span className="font-black text-gray-900">
                  {selectedDoctor?.name || "Not selected"}
                </span>
              </p>

              <p>
                Date:{" "}
                <span className="font-black text-gray-900">
                  {form.date || "Not selected"}
                </span>
              </p>

              <p>
                Time:{" "}
                <span className="font-black text-[#008e9b]">
                  {form.time || "Not selected"}
                </span>
              </p>

              <p>
                Duration:{" "}
                <span className="font-black text-gray-900">30 minutes</span>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.doctor || !form.date || !form.time}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              submitting || !form.doctor || !form.date || !form.time
                ? "cursor-not-allowed !bg-gray-400 opacity-80"
                : "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Submitting request...
              </>
            ) : (
              "Submit Request"
            )}
          </button>
        </section>
      </form>
    </main>
  );
}

export default AddAppointment;
