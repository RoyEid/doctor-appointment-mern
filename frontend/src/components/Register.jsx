import { useContext, useState, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiConfig } from "../config/api";
import { Check, Circle, X } from "lucide-react";

function Register() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    name: "" 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const passwordsMatch = form.confirmPassword !== "" && form.password === form.confirmPassword;
  const isPasswordValid = strengthCount === 4;
  const isFormValid = form.name.trim() !== "" && form.email.trim() !== "" && isPasswordValid && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please complete all fields and make sure your password meets the requirements.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send only name, email, and password to the backend
      const { name, email, password } = form;
      const res = await fetch(apiConfig.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.token) {
        login(data.token, data.user);
        navigate("/");
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
    <div className={`flex items-center gap-2 text-xs font-medium transition-all duration-300 ${valid ? "text-green-600" : "text-gray-400"}`}>
      {valid ? (
        <Check size={14} className="stroke-[3px]" />
      ) : (
        <Circle size={14} className="fill-gray-200 stroke-none" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12">
      <form
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 relative overflow-hidden"
        onSubmit={handleSubmit}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#008e9b]"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Join MediCare to manage your health
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center animate-shake font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800"
              required
            />

            {/* Password Strength Bar */}
            <div className="mt-3 px-1">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Strength</span>
                <span className={`text-xs font-bold ${getStrengthLabel() === "Strong" ? "text-green-600" : "text-[#008e9b]"}`}>
                  {getStrengthLabel()}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      index <= strengthCount ? getStrengthColor() : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Password Rules Checklist */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <RuleItem valid={passwordRules.length} text="8+ Characters" />
              <RuleItem valid={passwordRules.uppercase} text="Uppercase" />
              <RuleItem valid={passwordRules.lowercase} text="Lowercase" />
              <RuleItem valid={passwordRules.number} text="Number" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800 ${
                form.confirmPassword === "" 
                  ? "border-gray-200 focus:ring-[#008e9b]" 
                  : passwordsMatch 
                    ? "border-green-200 focus:ring-green-500" 
                    : "border-red-200 focus:ring-red-500"
              }`}
              required
            />
            {form.confirmPassword !== "" && (
              <div className="mt-1.5 ml-1 flex items-center gap-1.5 transition-all duration-300">
                {passwordsMatch ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 uppercase tracking-tight">
                    <Check size={12} strokeWidth={4} />
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-red-500 uppercase tracking-tight">
                    <X size={12} strokeWidth={4} />
                    Passwords do not match
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          disabled={!isFormValid || loading}
          className={`w-full mt-10 py-4 rounded-2xl font-black tracking-widest shadow-lg transition-all duration-300 transform active:scale-95 ${
            isFormValid && !loading
              ? "bg-[#008e9b] text-white hover:bg-[#007a85] hover:shadow-xl hover:-translate-y-1 cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed grayscale"
          }`}
        >
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
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
