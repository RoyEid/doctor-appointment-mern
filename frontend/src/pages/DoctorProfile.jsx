import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import {
  Check,
  Circle,
  X,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  Lock,
  ImagePlus,
  Loader2,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

function DoctorProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== "doctor") {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        setPageLoading(true);

        const token = localStorage.getItem("token");

        const { data } = await axios.get(apiConfig.getMyProfile, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm((prev) => ({
          ...prev,
          name: data.name || user.name || "",
          email: data.email || user.email || "",
        }));

        if (data.image) {
          setPreview(apiConfig.getDoctorImage(data.image));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load doctor profile");
      } finally {
        setPageLoading(false);
      }
    };

    if (user) {
      fetchProfile();
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
    return "bg-gray-200";
  };

  const passwordsMatch =
    form.confirmPassword !== "" && form.password === form.confirmPassword;

  const isPasswordValid = !form.password || strengthCount === 4;
  const isConfirmValid = !form.password || passwordsMatch;

  const isFormValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    isPasswordValid &&
    isConfirmValid;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];

      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      if (form.password && !passwordsMatch) {
        toast.error("Password and confirm password must match");
      } else if (form.password && !isPasswordValid) {
        toast.error(
          "Please make sure your new password meets the requirements.",
        );
      } else {
        toast.error("Please fill all required fields correctly.");
      }

      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      const payload = new FormData();

      if (form.name) payload.append("name", form.name);
      if (form.email) payload.append("email", form.email);
      if (form.password) payload.append("password", form.password);
      if (form.image) payload.append("image", form.image);

      const { data } = await axios.put(apiConfig.updateDoctorProfile, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }

      toast.success(data.message || "Profile updated successfully");

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        image: null,
      }));

      if (data.doctor && data.doctor.image) {
        setPreview(apiConfig.getDoctorImage(data.doctor.image));
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const RuleItem = ({ valid, text }) => (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all duration-300 ${
        valid ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
      }`}
    >
      {valid ? (
        <Check size={14} className="stroke-[3px]" />
      ) : (
        <Circle size={14} className="fill-gray-300 stroke-none" />
      )}

      <span>{text}</span>
    </div>
  );

  if (!user || user.role !== "doctor") return null;

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <LoadingSpinner text="Loading your doctor profile..." fullScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Doctor Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
          Doctor Profile
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
          Update your profile information, profile image, and account security.
        </p>
      </div>

      <div className="mx-auto max-w-2xl overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:p-8">
        <form
          className="space-y-5"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <div className="rounded-[1.5rem] border border-gray-100 bg-gray-50 p-5 dark:border-[#1f3a40] dark:bg-[#071416]/70">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                <img
                  src={preview || "/img/doctors/avatar.png"}
                  alt="Doctor profile"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="w-full flex-1 text-center sm:text-left">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#008e9b] shadow-sm">
                  <ImagePlus size={15} />
                  Profile Image
                </div>

                <p className="mb-3 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Upload a clear professional image for your doctor profile.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full cursor-pointer text-xs text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-50 file:px-4 file:py-2 file:text-xs file:font-bold file:text-cyan-700 hover:file:bg-cyan-100"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                required
              />
            </div>
          </div>

          <div className="mt-7 border-t border-gray-100 dark:border-[#1f3a40] pt-7">
            <div className="mb-5">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Account Security
              </h3>

              <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                Leave the password fields empty if you do not want to change
                your password.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                  New Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
                  />

                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave empty to keep current"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 !border-none !bg-transparent !p-0 !text-gray-400 !shadow-none transition-colors hover:!bg-transparent hover:!text-[#008e9b]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {form.password && (
                  <div className="mt-4 rounded-3xl border border-gray-100 bg-white dark:border-[#1f3a40] dark:bg-[#0f2428] p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                        Security Check
                      </span>

                      <span
                        className={`text-xs font-black uppercase ${
                          strengthCount <= 1
                            ? "text-red-500"
                            : strengthCount === 2
                              ? "text-yellow-600"
                              : strengthCount === 3
                                ? "text-[#008e9b]"
                                : "text-green-600"
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
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <RuleItem
                        valid={passwordRules.length}
                        text="8+ Characters"
                      />
                      <RuleItem
                        valid={passwordRules.uppercase}
                        text="Uppercase"
                      />
                      <RuleItem
                        valid={passwordRules.lowercase}
                        text="Lowercase"
                      />
                      <RuleItem valid={passwordRules.number} text="Number" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                  Confirm New Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
                  />

                  <input
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className={`w-full rounded-2xl border bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 ${
                      form.confirmPassword === ""
                        ? "border-gray-200 focus:ring-[#008e9b]"
                        : passwordsMatch
                          ? "border-green-200 focus:ring-green-500"
                          : "border-red-200 focus:ring-red-500"
                    }`}
                    required={!!form.password}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 !border-none !bg-transparent !p-0 !text-gray-400 !shadow-none transition-colors hover:!bg-transparent hover:!text-[#008e9b]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {form.confirmPassword !== "" && form.password !== "" && (
                  <div className="mt-2 ml-1 flex items-center gap-1.5">
                    {passwordsMatch ? (
                      <div className="flex items-center gap-1 text-xs font-black uppercase tracking-tight text-green-600">
                        <Check size={14} strokeWidth={3} />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-black uppercase tracking-tight text-red-500">
                        <X size={14} strokeWidth={3} />
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !isFormValid}
            className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              isFormValid && !saving
                ? "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
                : "cursor-not-allowed !bg-gray-400 opacity-70"
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Saving changes...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default DoctorProfile;
