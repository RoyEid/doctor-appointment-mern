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

function AddAppointment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const [form, setForm] = useState({
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });

  const [selectedDoctorSlots, setSelectedDoctorSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "user") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (form.doctor && doctors.length > 0) {
      const doc = doctors.find((d) => d._id === form.doctor);

      if (doc && doc.availableSlots && doc.availableSlots.length > 0) {
        setSelectedDoctorSlots(doc.availableSlots);

        if (!form.time || !doc.availableSlots.includes(form.time)) {
          setForm((prev) => ({ ...prev, time: doc.availableSlots[0] }));
        }
      } else {
        setSelectedDoctorSlots([]);
      }
    }
  }, [form.doctor, doctors, form.time]);

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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

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
        toast.error(data.message || "Failed to add appointment");
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      toast.error("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Appointment Request
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
          Book an Appointment
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500">
          Choose your doctor, preferred date and time, and tell us the reason
          for your visit.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8"
      >
        <div className="space-y-5">
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
                {doctors?.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc?.name} - {doc?.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                min={new Date().toISOString().split("T")[0]}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Time
            </label>

            <div className="relative">
              <Clock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              {selectedDoctorSlots.length > 0 ? (
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                >
                  {selectedDoctorSlots.map((slot, i) => (
                    <option key={i} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                />
              )}
            </div>
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
                className="h-32 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                placeholder="Describe your reason for the appointment..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              submitting
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
        </div>
      </form>
    </main>
  );
}

export default AddAppointment;
