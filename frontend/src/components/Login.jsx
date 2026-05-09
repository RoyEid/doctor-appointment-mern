import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiConfig } from "../config/api";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import {
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
} from "lucide-react";

function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const verificationIntervalRef = useRef(null);

  useEffect(() => {
    const verified = searchParams.get("verified");

    if (verified === "true") {
      Swal.fire({
        icon: "success",
        title: "Email verified",
        html: `
          <div style="text-align: center; line-height: 1.7;">
            <p style="margin: 0; color: #475569; font-size: 15px;">
              Your email is verified successfully.
            </p>
            <p style="margin: 10px 0 0; color: #008e9b; font-weight: 800; font-size: 15px;">
              You can now login and continue.
            </p>
          </div>
        `,
        confirmButtonText: "Continue",
        confirmButtonColor: "#008e9b",
      });
    }

    if (verified === "false") {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        html: `
          <div style="text-align: center; line-height: 1.7;">
            <p style="margin: 0; color: #475569; font-size: 15px;">
              This verification link is invalid or expired.
            </p>
            <p style="margin: 10px 0 0; color: #64748b; font-size: 14px;">
              Please request a new verification email and try again.
            </p>
          </div>
        `,
        confirmButtonColor: "#008e9b",
      });
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

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
        setError(data.message || "Google login failed");
      }
    } catch (err) {
      setError("Google login failed");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const checkVerificationStatus = async (email) => {
    const res = await fetch(apiConfig.checkVerificationStatus, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    return data;
  };

  const startWaitingForVerification = async () => {
    const email = form.email.trim();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address first.",
        confirmButtonColor: "#008e9b",
      });
      return;
    }

    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
    }

    let checksCount = 0;
    const maxChecks = 40;

    Swal.fire({
      title: "Waiting for verification",
      html: `
        <div style="text-align: center; line-height: 1.7; padding: 2px 4px;">
          <div style="
            width: 58px;
            height: 58px;
            margin: 0 auto 18px;
            border-radius: 18px;
            background: linear-gradient(135deg, rgba(0,142,155,0.16), rgba(70,218,234,0.18));
            display: flex;
            align-items: center;
            justify-content: center;
            color: #46daea;
            font-size: 28px;
            font-weight: 900;
            box-shadow: 0 16px 35px rgba(0,142,155,0.18);
          ">
            ✉
          </div>

          <p style="
            margin: 0 auto 12px;
            max-width: 420px;
            color: #e5f9fb;
            font-size: 18px;
            font-weight: 800;
          ">
            Check your inbox and tap <span style="color: #46daea;">Verify Email</span>.
          </p>

          <p style="
            margin: 0 auto 10px;
            max-width: 420px;
            color: #cbd5e1;
            font-size: 15px;
          ">
            Keep this page open — we’ll check automatically.
          </p>

          <p style="
            margin: 14px auto 0;
            max-width: 420px;
            color: #94a3b8;
            font-size: 13px;
          ">
            Already verified? Return here and press <strong style="color:#e5f9fb;">Login</strong> again.
          </p>
        </div>
      `,
      background: "#0f2428",
      color: "#ffffff",
      showClass: {
        popup: "swal2-show",
      },
      hideClass: {
        popup: "swal2-hide",
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cancel",
      cancelButtonColor: "#64748b",
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: "rounded-[2rem]",
      },
    });

    verificationIntervalRef.current = setInterval(async () => {
      try {
        checksCount += 1;

        const data = await checkVerificationStatus(email);

        if (data.success && data.isEmailVerified) {
          clearInterval(verificationIntervalRef.current);
          verificationIntervalRef.current = null;

          Swal.fire({
            icon: "success",
            title: "You’re verified",
            html: `
              <div style="text-align: center; line-height: 1.7;">
                <p style="margin: 0; color: #475569; font-size: 15px;">
                  Your email is verified successfully.
                </p>
                <p style="margin: 10px 0 0; color: #008e9b; font-size: 15px; font-weight: 800;">
                  Press Login again to continue.
                </p>
              </div>
            `,
            confirmButtonText: "Continue",
            confirmButtonColor: "#008e9b",
          });

          return;
        }

        if (checksCount >= maxChecks) {
          clearInterval(verificationIntervalRef.current);
          verificationIntervalRef.current = null;

          Swal.fire({
            icon: "info",
            title: "Still waiting",
            html: `
              <div style="text-align: center; line-height: 1.7;">
                <p style="margin: 0; color: #475569; font-size: 15px;">
                  We could not detect verification yet.
                </p>
                <p style="margin: 10px 0 0; color: #64748b; font-size: 14px;">
                  If you already clicked the verification link, return here and press Login again.
                </p>
              </div>
            `,
            confirmButtonColor: "#008e9b",
          });
        }
      } catch (err) {
        clearInterval(verificationIntervalRef.current);
        verificationIntervalRef.current = null;

        Swal.fire({
          icon: "error",
          title: "Connection issue",
          text: "Could not check verification status. Please try again.",
          confirmButtonColor: "#008e9b",
        });
      }
    }, 3000);
  };

  const handleResendVerificationEmail = async () => {
    const email = form.email.trim();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address first.",
        confirmButtonColor: "#008e9b",
      });
      return;
    }

    try {
      const resendRes = await fetch(apiConfig.resendVerificationPublic, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const resendData = await resendRes.json();

      if (resendRes.ok) {
        Swal.fire({
          icon: "success",
          title: "Verification email sent",
          html: `
            <div style="text-align: center; line-height: 1.7;">
              <p style="margin: 0; color: #475569; font-size: 15px;">
                ${resendData.message || "A new verification email was sent."}
              </p>
              <p style="margin: 10px 0 0; color: #008e9b; font-size: 15px; font-weight: 800;">
                Open your inbox, press Verify Email, then return here.
              </p>
            </div>
          `,
          confirmButtonText: "Wait here",
          confirmButtonColor: "#008e9b",
        }).then(() => {
          startWaitingForVerification();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Could not resend email",
          text:
            resendData.message ||
            "Something went wrong while resending the verification email.",
          confirmButtonColor: "#008e9b",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Could not resend verification email. Please try again.",
        confirmButtonColor: "#008e9b",
      });
    }
  };

  const showEmailVerificationPopup = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Verify your email",
      html: `
        <div style="text-align: center; line-height: 1.7; padding: 0 4px;">
          <p style="
            margin: 0 auto 12px;
            max-width: 430px;
            color: #e5f9fb;
            font-size: 17px;
            font-weight: 800;
          ">
            Your account is ready, but your email still needs confirmation.
          </p>

          <div style="
            margin: 18px auto;
            max-width: 430px;
            padding: 16px 18px;
            border-radius: 20px;
            background: rgba(70, 218, 234, 0.08);
            border: 1px solid rgba(70, 218, 234, 0.18);
          ">
            <p style="
              margin: 0;
              color: #cbd5e1;
              font-size: 15px;
            ">
              Open your inbox and press
              <strong style="color:#46daea;">Verify Email</strong>.
            </p>
          </div>

          <p style="
            margin: 0 auto 8px;
            max-width: 430px;
            color: #94a3b8;
            font-size: 13px;
          ">
            Keep this page open and we can detect the verification automatically.
          </p>

          <p style="
            margin: 0 auto;
            max-width: 430px;
            color: #94a3b8;
            font-size: 13px;
          ">
            Already verified? Return here and press <strong style="color:#e5f9fb;">Login</strong> again.
          </p>
        </div>
      `,
      background: "#0f2428",
      color: "#ffffff",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Wait here",
      denyButtonText: "Resend Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#008e9b",
      denyButtonColor: "#0ea5e9",
      cancelButtonColor: "#64748b",
      customClass: {
        popup: "rounded-[2rem]",
      },
    });

    if (result.isConfirmed) {
      await startWaitingForVerification();
    }

    if (result.isDenied) {
      await handleResendVerificationEmail();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(apiConfig.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "EMAIL_NOT_VERIFIED") {
          setLoading(false);
          await showEmailVerificationPopup();
          return;
        }

        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      if (data.token) {
        login(data.token, data.user);

        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (data.user.role === "doctor") {
          navigate("/doctor/appointments");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[-160px] top-[-120px] h-96 w-96 rounded-full bg-[#46daea]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-140px] h-96 w-96 rounded-full bg-[#008e9b]/10 blur-3xl" />

      <section className="relative z-10 flex w-full max-w-md items-center">
        <form
          className="relative w-full overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-[#e8fbfd] text-[#008e9b] shadow-sm dark:bg-[#46daea]/15 dark:text-[#46daea]">
              <Lock size={28} />
            </div>

            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
              <Sparkles size={14} />
              Welcome Back
            </div>

            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              Login to MediCare
            </h2>

            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400">
              Access your dashboard and manage your appointments.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
                />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-200">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-black text-[#008e9b] transition-colors hover:text-[#007a85] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

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
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-12 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416]"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 !border-none !bg-transparent !p-0 !text-gray-400 !shadow-none transition-colors hover:!bg-transparent hover:!text-[#008e9b]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className={`group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              loading
                ? "cursor-not-allowed !bg-gray-400 opacity-80"
                : "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                Login securely
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <div className="mt-5 rounded-2xl border border-[#008e9b]/10 bg-white px-4 py-3 text-center shadow-sm dark:border-[#46daea]/15 dark:bg-[#0f2428]">
            <p className="flex flex-col items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-300 sm:flex-row">
              <span>Didn't receive the email?</span>

              <button
                type="button"
                onClick={handleResendVerificationEmail}
                className="inline-flex items-center justify-center gap-1.5 !border-none !bg-transparent !p-0 font-black text-[#008e9b] !shadow-none transition-colors hover:!bg-transparent hover:text-[#007a85] hover:underline"
              >
                <RefreshCw size={15} />
                Resend verification
              </button>
            </p>
          </div>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#1f3a40]" />
            </div>

            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 dark:bg-[#0f2428] dark:text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[320px] justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="outline"
              shape="pill"
              size="large"
              text="continue_with"
              width="320"
            />
          </div>

          <p className="mt-6 text-center text-sm font-medium text-gray-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-black text-[#008e9b] hover:text-[#007a85] hover:underline"
            >
              Create account
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
