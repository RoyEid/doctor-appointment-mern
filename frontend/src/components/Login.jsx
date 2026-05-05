import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    const verified = searchParams.get("verified");

    if (verified === "true") {
      Swal.fire({
        icon: "success",
        title: "Email verified",
        text: "Your email has been verified successfully. You can now log in.",
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

  const handleResendVerificationEmail = async () => {
    const email = form.email.trim();

    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address first, then click login again.",
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
          text:
            resendData.message ||
            "A new verification email was sent. Please check your inbox.",
          confirmButtonColor: "#008e9b",
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
      text: "Please verify your email before logging in.",
      showCancelButton: true,
      confirmButtonText: "Resend Email",
      cancelButtonText: "OK",
      confirmButtonColor: "#008e9b",
      cancelButtonColor: "#6b7280",
    });

    if (result.isConfirmed) {
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
          await showEmailVerificationPopup();
          setLoading(false);
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

        <button
          type="button"
          onClick={handleResendVerificationEmail}
          className="w-full mt-4 text-sm font-semibold text-[#008e9b] hover:text-[#007a85] transition-colors"
        >
          Resend verification email
        </button>

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
