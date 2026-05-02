import { useContext, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../config/api";
import { Check, X } from "lucide-react";

function Register() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Password validation logic
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
  const isPasswordValid = strengthCount === 4;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, and a number.");
      return;
    }

    try {
      const res = await fetch(apiConfig.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
        navigate("/");
      } else {
        setError(data.message || "Something went wrong during registration");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const RuleItem = ({ valid, text }) => (
    <div className={`flex items-center gap-2 text-xs font-medium transition-colors duration-200 ${valid ? "text-green-600" : "text-gray-400"}`}>
      {valid ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <form
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        onSubmit={handleSubmit}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2">
            Join us to book your appointments
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
              required
            />
          </div>

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

            {/* Password Strength Bar */}
            <div className="grid grid-cols-4 gap-2 mt-3 mb-4">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index <= strengthCount ? "bg-[#008e9b]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Password Rules Checklist */}
            <div className="grid grid-cols-1 gap-y-2">
              <RuleItem valid={passwordRules.length} text="At least 8 characters" />
              <RuleItem valid={passwordRules.uppercase} text="One uppercase letter" />
              <RuleItem valid={passwordRules.lowercase} text="One lowercase letter" />
              <RuleItem valid={passwordRules.number} text="One number" />
            </div>
          </div>
        </div>

        <button
          disabled={!isPasswordValid}
          className={`w-full mt-8 py-3.5 rounded-lg font-bold tracking-wide shadow-md transition-all duration-300 transform ${
            isPasswordValid
              ? "bg-[#008e9b] text-white hover:bg-[#007a85] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70"
          }`}
        >
          Create Account
        </button>
      </form>
      
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Register;
