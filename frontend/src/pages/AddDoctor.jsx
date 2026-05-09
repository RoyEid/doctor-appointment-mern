import React, { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ImagePlus,
  Loader2,
  Mail,
  Lock,
  Stethoscope,
  UserRound,
  FileText,
  BriefcaseMedical,
  Eye,
  EyeOff,
  Check,
  Circle,
} from "lucide-react";

function AddDoctor() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/img/doctors/avatar.png");
  const [error, setError] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    experienceYears: "",
    description: "",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const passwordRules = useMemo(() => {
    const p = form.password;

    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /\d/.test(p),
    };
  }, [form.password]);

  const strengthCount = Object.values(passwordRules).filter(Boolean).length;

  const getStrengthLabel = () => {
    if (form.password === "") return "";
    if (strengthCount <= 1) return "Weak";
    if (strengthCount === 2) return "Fair";
    if (strengthCount === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strengthCount === 1) return "bg-red-500";
    if (strengthCount === 2) return "bg-yellow-500";
    if (strengthCount === 3) return "bg-[#008e9b]";
    if (strengthCount === 4) return "bg-green-500";
    return "bg-gray-200 dark:bg-[#1f3a40]";
  };

  const isPasswordValid = strengthCount === 4;

  const isFormValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.specialty.trim() !== "" &&
    form.experienceYears !== "" &&
    form.description.trim() !== "" &&
    isPasswordValid;

  const labelClass =
    "mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-300";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]";

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416] dark:focus:ring-[#46daea]";

  const RuleItem = ({ valid, text }) => (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all duration-300 ${
        valid
          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
          : "bg-gray-50 text-gray-500 dark:bg-[#071416] dark:text-slate-400"
      }`}
    >
      {valid ? (
        <Check size={14} className="stroke-[3px]" />
      ) : (
        <Circle
          size={14}
          className="fill-gray-300 stroke-none dark:fill-slate-600"
        />
      )}
      <span>{text}</span>
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === "password") {
      setCreatedCredentials(null);
      setError(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError(null);
    setCreatedCredentials(null);

    if (!isFormValid) {
      const message =
        "Please complete all fields and make sure the password meets the requirements.";

      setError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("specialty", form.specialty);
      formData.append("experienceYears", form.experienceYears);
      formData.append("description", form.description);

      if (image) formData.append("image", image);

      const res = await fetch(apiConfig.addDoctor, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add doctor");
      }

      const credentials = data?.data?.credentials || {
        email: form.email,
        password: form.password,
      };

      setCreatedCredentials(credentials);
      toast.success("Doctor added successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        specialty: "",
        experienceYears: "",
        description: "",
      });

      setPreview("/img/doctors/avatar.png");
      setImage(null);
      setShowPassword(false);
    } catch (error) {
      console.error("Error submitting form", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-red-900/30 dark:bg-[#0f2428]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300">
            <AlertTriangle size={34} />
          </div>

          <h2 className="mb-2 text-2xl font-black text-gray-900 dark:text-white">
            Access Denied
          </h2>

          <p className="font-medium text-gray-500 dark:text-slate-400">
            Only administrators can add doctors to the system.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] sm:px-6">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Admin Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
          Add New Doctor
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
          Create a doctor profile and account credentials for the system.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-5xl gap-8 overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] md:grid-cols-[0.8fr_1.4fr] md:p-8"
        encType="multipart/form-data"
      >
        <section className="flex flex-col items-center justify-center rounded-[1.5rem] border border-gray-100 bg-gray-50 p-6 text-center dark:border-[#1f3a40] dark:bg-[#071416]/70">
          <div className="mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg dark:border-[#46daea]/20 dark:bg-[#071416]">
            <img
              src={preview}
              alt="Doctor preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = "/img/doctors/avatar.png";
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => document.getElementById("fileInput").click()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl !bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
          >
            <ImagePlus size={18} />
            Choose Image
          </button>

          <input
            id="fileInput"
            onChange={handleImageChange}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-slate-400">
            Upload a clear professional image for the doctor profile.
          </p>
        </section>

        <section className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {createdCredentials && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
              <p className="font-black">Doctor account created</p>
              <p className="mt-1">
                <span className="font-bold">Email:</span>{" "}
                {createdCredentials.email}
              </p>
              <p>
                <span className="font-bold">Password:</span>{" "}
                {createdCredentials.password}
              </p>
            </div>
          )}

          <div>
            <label className={labelClass}>Name</label>

            <div className="relative">
              <UserRound size={18} className={iconClass} />

              <input
                value={form.name}
                onChange={handleChange}
                type="text"
                name="name"
                required
                placeholder="Dr. John Doe"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>

            <div className="relative">
              <Mail size={18} className={iconClass} />

              <input
                value={form.email}
                onChange={handleChange}
                type="email"
                name="email"
                required
                placeholder="doctor@example.com"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Password</label>

            <div className="relative">
              <Lock size={18} className={iconClass} />

              <input
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 !border-none !bg-transparent !p-0 !text-gray-400 !shadow-none transition-colors hover:!bg-transparent hover:!text-[#008e9b] dark:hover:!text-[#46daea]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            <p className="mt-2 text-xs font-medium leading-relaxed text-gray-500 dark:text-slate-400">
              Use at least 8 characters with uppercase, lowercase, and a number.
            </p>

            {form.password && (
              <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#1f3a40] dark:bg-[#071416]">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
                    Security Check
                  </span>

                  <span
                    className={`text-xs font-black uppercase ${
                      strengthCount <= 1
                        ? "text-red-500 dark:text-red-300"
                        : strengthCount === 2
                          ? "text-yellow-600 dark:text-yellow-300"
                          : strengthCount === 3
                            ? "text-[#008e9b] dark:text-[#46daea]"
                            : "text-green-600 dark:text-green-300"
                    }`}
                  >
                    Strength: {getStrengthLabel()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index <= strengthCount
                          ? getStrengthColor()
                          : "bg-gray-200 dark:bg-[#1f3a40]"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <RuleItem valid={passwordRules.length} text="8+ Characters" />
                  <RuleItem valid={passwordRules.uppercase} text="Uppercase" />
                  <RuleItem valid={passwordRules.lowercase} text="Lowercase" />
                  <RuleItem valid={passwordRules.number} text="Number" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Specialty</label>

            <div className="relative">
              <Stethoscope size={18} className={iconClass} />

              <input
                value={form.specialty}
                onChange={handleChange}
                type="text"
                name="specialty"
                required
                placeholder="Cardiology"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Experience Years</label>

            <div className="relative">
              <BriefcaseMedical size={18} className={iconClass} />

              <input
                value={form.experienceYears}
                onChange={handleChange}
                type="number"
                name="experienceYears"
                required
                min="0"
                placeholder="5"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>

            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-4 text-[#008e9b] dark:text-[#46daea]"
              />

              <textarea
                onChange={handleChange}
                value={form.description}
                name="description"
                required
                rows={4}
                placeholder="Write a short professional description for this doctor."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              isFormValid && !submitting
                ? "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
                : "cursor-not-allowed !bg-gray-400 opacity-70"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Adding doctor...
              </>
            ) : (
              "Add Doctor"
            )}
          </button>
        </section>
      </form>
    </main>
  );
}

export default AddDoctor;
