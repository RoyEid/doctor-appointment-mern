import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiConfig } from "../config/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [watchEmail, setWatchEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const passwordResetIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (passwordResetIntervalRef.current) {
        clearInterval(passwordResetIntervalRef.current);
      }
    };
  }, []);

  const checkPasswordResetStatus = async ({ emailToCheck, requestedAt }) => {
    const res = await fetch(apiConfig.checkPasswordResetStatus, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailToCheck,
        resetRequestedAt: requestedAt,
      }),
    });

    const data = await res.json();
    return data;
  };

  const startWaitingForPasswordReset = ({ emailToWatch, requestedAt }) => {
    if (passwordResetIntervalRef.current) {
      clearInterval(passwordResetIntervalRef.current);
    }

    setWaiting(true);

    let checksCount = 0;
    const maxChecks = 60;

    passwordResetIntervalRef.current = setInterval(async () => {
      try {
        checksCount += 1;

        const data = await checkPasswordResetStatus({
          emailToCheck: emailToWatch,
          requestedAt,
        });

        if (data.success && data.passwordResetCompleted) {
          clearInterval(passwordResetIntervalRef.current);
          passwordResetIntervalRef.current = null;

          setWaiting(false);
          setMessage(
            "Your password was reset successfully. Redirecting you to login...",
          );
          setError(null);

          setTimeout(() => {
            navigate("/login");
          }, 2200);

          return;
        }

        if (checksCount >= maxChecks) {
          clearInterval(passwordResetIntervalRef.current);
          passwordResetIntervalRef.current = null;

          setWaiting(false);
          setMessage(
            "We are still waiting. If you already changed your password, go back to login and use your new password.",
          );
        }
      } catch (err) {
        clearInterval(passwordResetIntervalRef.current);
        passwordResetIntervalRef.current = null;

        setWaiting(false);
        setError("Could not check password reset status. Please try again.");
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setWaiting(false);
    setMessage(null);
    setError(null);

    if (passwordResetIntervalRef.current) {
      clearInterval(passwordResetIntervalRef.current);
      passwordResetIntervalRef.current = null;
    }

    try {
      const res = await fetch(apiConfig.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not send password reset email.");
        return;
      }

      const requestedAt = data.resetRequestedAt || new Date().toISOString();

      setWatchEmail(cleanEmail);
      setMessage(
        data.message ||
          "Password reset email sent. Open it on your phone and create a new password. This laptop will detect it automatically.",
      );

      startWaitingForPasswordReset({
        emailToWatch: cleanEmail,
        requestedAt,
      });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stopWaiting = () => {
    if (passwordResetIntervalRef.current) {
      clearInterval(passwordResetIntervalRef.current);
      passwordResetIntervalRef.current = null;
    }

    setWaiting(false);
    setMessage(null);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[-160px] top-[-120px] h-96 w-96 rounded-full bg-[#46daea]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-140px] h-96 w-96 rounded-full bg-[#008e9b]/10 blur-3xl" />

      <section className="relative z-10 flex w-full max-w-md items-center">
        <form
          onSubmit={handleSubmit}
          className="relative w-full overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8fbfd] text-[#008e9b] shadow-sm">
              <Mail size={28} />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
              <Sparkles size={14} />
              Forgot Password
            </div>

            <h2 className="text-3xl font-black text-gray-900">
              Recover Account
            </h2>

            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
              Enter your email. Open the reset link on your phone, and this
              laptop will detect when the password is changed.
            </p>
          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {waiting && (
            <div className="mb-5 rounded-2xl border border-[#008e9b]/15 bg-[#eefbfc] px-4 py-4 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#008e9b] shadow-sm">
                <Loader2 className="animate-spin" size={24} />
              </div>

              <p className="text-sm font-black text-gray-900">
                Waiting for password reset
              </p>

              <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
                Open Gmail on your phone, reset the password, and keep this
                laptop page open.
              </p>

              {watchEmail && (
                <p className="mt-2 text-xs font-bold text-[#008e9b]">
                  Watching: {watchEmail}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={waiting}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                required
              />
            </div>
          </div>

          <button
            disabled={loading || waiting}
            className={`group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              loading || waiting
                ? "cursor-not-allowed !bg-gray-400"
                : "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
            }`}
          >
            {loading
              ? "Sending email..."
              : waiting
                ? "Waiting..."
                : "Send Reset Link"}
            {!loading && !waiting && (
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            )}
          </button>

          {waiting && (
            <button
              type="button"
              onClick={stopWaiting}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 !bg-white px-5 py-3 text-sm font-black text-gray-600 !shadow-none transition-all hover:!bg-gray-50 hover:text-[#008e9b]"
            >
              Stop waiting
            </button>
          )}

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="mt-0.5 flex-shrink-0 text-[#008e9b]"
              />
              <p className="text-xs font-medium leading-relaxed text-gray-500">
                After password reset is detected, this laptop will automatically
                send you back to the login page.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-600 transition-all hover:bg-gray-50 hover:text-[#008e9b]"
          >
            <ArrowLeft size={18} />
            Back to Login
          </Link>
        </form>
      </section>
    </main>
  );
}

export default ForgotPassword;
