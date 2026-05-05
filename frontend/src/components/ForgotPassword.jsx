import { useState } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(apiConfig.forgotPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not send password reset email.");
        return;
      }

      setMessage(
        data.message || "Password reset email sent. Please check your inbox.",
      );
      setEmail("");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
                <Lock size={34} />
              </div>

              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-white/75">
                Password Recovery
              </p>

              <h1 className="max-w-xl text-5xl font-black leading-tight">
                Reset your password securely.
              </h1>

              <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-white/80">
                Enter the email connected to your MediCare account. We will send
                you a secure reset link so you can create a new password.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <Mail size={26} />
                  <div>
                    <p className="font-black">Check your inbox</p>
                    <p className="text-sm text-white/75">
                      The reset link will be sent to your email.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <ShieldCheck size={26} />
                  <div>
                    <p className="font-black">Secure reset link</p>
                    <p className="text-sm text-white/75">
                      The password reset link expires after 30 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <CheckCircle2 size={26} />
                  <div>
                    <p className="font-black">Return to login</p>
                    <p className="text-sm text-white/75">
                      After resetting, log in using your new password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Forgot password card */}
        <section className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-7 shadow-2xl sm:p-9"
          >
            <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8fbfd] text-[#008e9b]">
                <Mail size={32} />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
                <Sparkles size={15} />
                Forgot Password
              </div>

              <h2 className="text-3xl font-black text-gray-900">
                Recover Account
              </h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                Enter your email and we will send you a password reset link.
              </p>
            </div>

            {message && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                {error}
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
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className={`group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
                loading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#008e9b] hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl"
              }`}
            >
              {loading ? "Sending email..." : "Send Reset Link"}
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

export default ForgotPassword;
