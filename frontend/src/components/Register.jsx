import { useState, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiConfig } from "../config/api";
import {
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
  User,
  X,
  Loader2,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";

function Register() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError(null);

      const res = await fetch(apiConfig.googleLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.message || "Google registration failed");
      }
    } catch (err) {
      setError("Google registration failed");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

  const isPasswordValid = strengthCount === 4;

  const isFormValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    isPasswordValid &&
    passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(
        "Please complete all fields and make sure your password meets the requirements.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { name, email, password } = form;

      const res = await fetch(apiConfig.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(
          "Account created successfully. Please check your email to verify your account before booking appointments.",
        );

        setForm({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[-160px] top-[-120px] h-96 w-96 rounded-full bg-[#46daea]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-140px] h-96 w-96 rounded-full bg-[#008e9b]/10 blur-3xl" />

      <section className="relative z-10 flex w-full max-w-md items-center">
        <form
          onSubmit={handleSubmit}
          className="relative w-full overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:p-8"
        >
          <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8fbfd] text-[#008e9b] shadow-sm dark:bg-[#46daea]/15 dark:text-[#46daea]">
              <User size={28} />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
              <Sparkles size={14} />
              Join MediCare
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              Create Account
            </h2>

            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400">
              Create your account to book and manage healthcare appointments.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]"
                />

                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416]"
                  required
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
                Use at least 8 characters with uppercase, lowercase, and a
                number.
              </p>

              {form.password && (
                <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm dark:border-[#1f3a40] dark:bg-[#0f2428]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:text-slate-500">
                      Security Check
                    </span>

                    <span
                      className={`text-xs font-black uppercase ${
                        strengthCount <= 1
                          ? "text-red-500"
                          : strengthCount === 2
                            ? "text-yellow-600"
                            : strengthCount === 3
                              ? "text-[#008e9b] dark:text-[#46daea]"
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
                            : "bg-gray-200 dark:bg-[#1f3a40]"
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
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]"
                />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-2xl border bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416] ${
                    form.confirmPassword === ""
                      ? "border-gray-200 focus:ring-[#008e9b] dark:border-[#1f3a40]"
                      : passwordsMatch
                        ? "border-green-200 focus:ring-green-500 dark:border-green-500/40"
                        : "border-red-200 focus:ring-red-500 dark:border-red-500/40"
                  }`}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 !border-none !bg-transparent !p-0 !text-gray-400 !shadow-none transition-colors hover:!bg-transparent hover:!text-[#008e9b] dark:hover:!text-[#46daea]"
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

              {form.confirmPassword !== "" && (
                <div className="ml-1 mt-2 flex items-center gap-1.5">
                  {passwordsMatch ? (
                    <div className="flex items-center gap-1 text-xs font-black uppercase tracking-tight text-green-600 dark:text-green-300">
                      <Check size={14} strokeWidth={3} />
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-black uppercase tracking-tight text-red-500 dark:text-red-300">
                      <X size={14} strokeWidth={3} />
                      Passwords do not match
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            disabled={!isFormValid || loading}
            className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              isFormValid && !loading
                ? "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
                : "cursor-not-allowed !bg-gray-400 opacity-70"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={19} />
              </>
            )}
          </button>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#1f3a40]" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:bg-[#0f2428] dark:text-slate-500">
                Or join with
              </span>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[320px] justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Registration Failed")}
              theme="outline"
              shape="pill"
              size="large"
              text="signup_with"
              width="320"
            />
          </div>

          <p className="mt-6 text-center text-sm font-medium text-gray-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-black text-[#008e9b] hover:text-[#007a85] hover:underline dark:text-[#46daea] dark:hover:text-[#7ee9f2]"
            >
              Log in here
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
