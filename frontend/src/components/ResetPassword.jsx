import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiConfig } from "../config/api";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const passwordRules = useMemo(() => {
    const password = form.password;

    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
  }, [form.password]);

  const strengthCount = Object.values(passwordRules).filter(Boolean).length;

  const passwordsMatch =
    form.confirmPassword !== "" && form.password === form.confirmPassword;

  const isPasswordValid = strengthCount === 4;

  const isFormValid = form.password !== "" && isPasswordValid && passwordsMatch;

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(
        "Please create a strong password and make sure both passwords match.",
      );
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(apiConfig.resetPassword(token), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not reset password.");
        return;
      }

      setMessage(data.message || "Password reset successfully.");

      setForm({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RuleItem = ({ valid, text }) => (
    <div
      className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black transition-all duration-300 ${
        valid ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"
      }`}
    >
      {valid ? (
        <Check size={14} className="flex-shrink-0 stroke-[3px]" />
      ) : (
        <Circle size={14} className="flex-shrink-0 fill-gray-300 stroke-none" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        {/* Left info panel */}
        <section className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#008e9b] via-[#00a7b5] to-[#46daea] p-10 text-white shadow-2xl">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl">
                <ShieldCheck size={34} />
              </div>

              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-white/75">
                Secure Password Reset
              </p>

              <h1 className="max-w-xl text-5xl font-black leading-tight">
                Create a new secure password.
              </h1>

              <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-white/80">
                Choose a strong password with uppercase, lowercase, and a
                number. After saving, you can log in with your new password.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <Lock size={26} />
                  <div>
                    <p className="font-black">Strong password required</p>
                    <p className="text-sm text-white/75">
                      Minimum 8 characters with mixed character types.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <KeyRound size={26} />
                  <div>
                    <p className="font-black">One-time reset link</p>
                    <p className="text-sm text-white/75">
                      Expired or used links cannot reset passwords again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reset password card */}
        <section className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-7 shadow-2xl sm:p-9"
          >
            <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8fbfd] text-[#008e9b]">
                <Lock size={32} />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
                <Sparkles size={15} />
                Reset Password
              </div>

              <h2 className="text-3xl font-black text-gray-900">
                New Password
              </h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                Enter and confirm your new password below.
              </p>
            </div>

            {message && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
                {message} Redirecting to login...
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  New Password
                </label>

                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-gray-400 transition-colors hover:text-[#008e9b]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Strength */}
              {form.password && (
                <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                      Password Strength
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
                      {getStrengthLabel()}
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
                    <RuleItem valid={passwordRules.length} text="8+ Chars" />
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

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <KeyRound
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
                  />

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full rounded-2xl border bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 ${
                      form.confirmPassword === ""
                        ? "border-gray-200 focus:ring-[#008e9b]"
                        : passwordsMatch
                          ? "border-green-200 focus:ring-green-500"
                          : "border-red-200 focus:ring-red-500"
                    }`}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-gray-400 transition-colors hover:text-[#008e9b]"
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
                  <div className="mt-2 ml-1 flex items-center gap-1.5">
                    {passwordsMatch ? (
                      <div className="flex items-center gap-1 text-xs font-black uppercase tracking-tight text-green-600">
                        <Check size={14} strokeWidth={3} />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-black uppercase tracking-tight text-red-600">
                        <X size={14} strokeWidth={3} />
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={loading || !isFormValid}
              className={`group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
                loading || !isFormValid
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#008e9b] hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
              {!loading && (
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>

            <Link
              to="/login"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-50 hover:text-[#008e9b]"
            >
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}

export default ResetPassword;
