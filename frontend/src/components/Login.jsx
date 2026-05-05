import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiConfig } from "../config/api";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Lock,
  Mail,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
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
        text: "Your email has been verified successfully. Go back to the browser where you were logging in and continue.",
        confirmButtonColor: "#008e9b",
      });
    }

    if (verified === "false") {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: "This verification link is invalid or expired. Please request a new verification email.",
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
      title: "Waiting for email verification",
      html: `
        <div style="text-align: left; line-height: 1.6;">
          <p style="margin-bottom: 10px;">
            Open Gmail on your phone and press <strong>Verify Email</strong>.
          </p>
          <p style="margin-bottom: 10px;">
            Keep this laptop page open. We will detect the verification automatically.
          </p>
          <p style="font-size: 13px; color: #6b7280;">
            After it is verified, you can continue from this laptop.
          </p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cancel",
      cancelButtonColor: "#6b7280",
      didOpen: () => {
        Swal.showLoading();
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
            title: "Email verified",
            html: `
              <p>Your email is verified now.</p>
              <p style="margin-top: 10px; color: #6b7280;">
                Click the login button again to continue from this laptop.
              </p>
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
              <p>We could not detect verification yet.</p>
              <p style="margin-top: 10px; color: #6b7280;">
                If you already clicked the email link, press Login again.
              </p>
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
            <p>${resendData.message || "A new verification email was sent."}</p>
            <p style="margin-top: 10px; color: #6b7280;">
              Open Gmail on your phone, press Verify Email, then return to this laptop.
            </p>
          `,
          confirmButtonText: "Wait on this laptop",
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
      title: "Email verification required",
      html: `
        <div style="text-align: left; line-height: 1.6;">
          <p style="margin-bottom: 10px;">
            Your account exists, but your email is not verified yet.
          </p>
          <p style="margin-bottom: 10px;">
            You can open Gmail on your phone and press <strong>Verify Email</strong>.
          </p>
          <p style="font-size: 13px; color: #6b7280;">
            Keep this laptop page open. We can wait here and detect when your email becomes verified.
          </p>
        </div>
      `,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Wait here",
      denyButtonText: "Resend Email",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#008e9b",
      denyButtonColor: "#0ea5e9",
      cancelButtonColor: "#6b7280",
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute right-[-160px] top-[-120px] h-96 w-96 rounded-full bg-[#46daea]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-140px] h-96 w-96 rounded-full bg-[#008e9b]/10 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        {/* Left professional panel */}
        <section className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#008e9b] via-[#00a7b5] to-[#46daea] p-10 text-white shadow-[0_30px_90px_rgba(0,142,155,0.25)]">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-xl">
                <HeartPulse size={34} />
              </div>

              <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-white/75">
                Secure MediCare Login
              </p>

              <h1 className="max-w-xl text-5xl font-black leading-tight">
                Manage your healthcare with confidence.
              </h1>

              <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-white/80">
                Sign in to book appointments, track doctor responses, manage
                reschedules, and continue your care journey securely.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <ShieldCheck size={26} />
                  <div>
                    <p className="font-black">Protected account access</p>
                    <p className="text-sm text-white/75">
                      Secure login with patient, doctor, and admin roles.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <MailCheck size={26} />
                  <div>
                    <p className="font-black">Email verification support</p>
                    <p className="text-sm text-white/75">
                      Verify from your phone and continue from your laptop.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <CheckCircle2 size={26} />
                  <div>
                    <p className="font-black">Password recovery ready</p>
                    <p className="text-sm text-white/75">
                      Reset your password safely if you forget it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Login card */}
        <section className="mx-auto w-full max-w-md">
          <form
            className="relative overflow-hidden rounded-[2rem] border border-white bg-white/90 p-7 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-9"
            onSubmit={handleSubmit}
          >
            <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-[#008e9b] via-[#46daea] to-[#008e9b]" />

            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#e8fbfd] text-[#008e9b] shadow-sm">
                <Lock size={32} />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
                <Sparkles size={15} />
                Welcome Back
              </div>

              <h2 className="text-3xl font-black text-gray-900">
                Login to MediCare
              </h2>

              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                Access your dashboard and manage your healthcare appointments.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-5">
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
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label className="block text-sm font-bold text-gray-700">
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
            </div>

            <button
              disabled={loading}
              className={`group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
                loading
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-[#008e9b] hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl"
              }`}
            >
              {loading ? "Logging in..." : "Login securely"}
              {!loading && (
                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>

            <div className="mt-5 rounded-2xl bg-[#eefbfc] px-4 py-3 text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the email?{" "}
                <button
                  type="button"
                  onClick={handleResendVerificationEmail}
                  className="border-none bg-transparent p-0 font-black text-[#008e9b] transition-colors hover:text-[#007a85] hover:underline"
                >
                  Resend verification
                </button>
              </p>
            </div>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>

              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Login Failed")}
                theme="filled_blue"
                shape="pill"
                width="100%"
              />
            </div>

            <p className="mt-7 text-center text-sm font-medium text-gray-600">
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
      </div>
    </main>
  );
}

export default Login;
