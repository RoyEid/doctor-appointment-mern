import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiConfig } from "../config/api";
import { GoogleLogin } from "@react-oauth/google";
import Swal from "sweetalert2";

function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <form
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        onSubmit={handleSubmit}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2">
            Log in to manage your appointments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
              required
            />
          </div>
        </div>

        <button
          disabled={loading}
          className={`w-full mt-8 py-3.5 rounded-lg text-white font-bold tracking-wide focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e9b] shadow-md hover:shadow-lg transition-all duration-300 transform ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#008e9b] hover:bg-[#007a85] hover:-translate-y-0.5"
          }`}
        >
          {loading ? "Logging in..." : "Login securely"}
        </button>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the email?{" "}
            <button
              type="button"
              onClick={handleResendVerificationEmail}
              className="font-semibold text-[#008e9b] hover:text-[#007a85] hover:underline transition-colors bg-transparent border-none p-0"
            >
              Resend verification email
            </button>
          </p>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>

          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500 uppercase tracking-wider text-[10px] font-bold">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed")}
            theme="filled_blue"
            shape="pill"
            width="100%"
          />
        </div>
      </form>
    </div>
  );
}

export default Login;
