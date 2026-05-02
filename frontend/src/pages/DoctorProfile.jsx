import { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import { Check, Circle, X, Eye, EyeOff } from "lucide-react";

function DoctorProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "doctor") {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(apiConfig.getMyProfile, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // The backend returns the doctor object directly
        setForm((prev) => ({
          ...prev,
          name: data.name || user.name || "",
          email: data.email || user.email || "",
        }));
        
        if (data.image) {
          setPreview(apiConfig.getDoctorImage(data.image));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, navigate]);

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
  const isPasswordValid = !form.password || strengthCount === 4;
  const isConfirmValid = !form.password || passwordsMatch;
  const isFormValid = form.name.trim() !== "" && form.email.trim() !== "" && isPasswordValid && isConfirmValid;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      if (form.password && !passwordsMatch) {
        toast.error("Password and confirm password must match");
      } else if (form.password && !isPasswordValid) {
        toast.error("Please make sure your new password meets the requirements.");
      } else {
        toast.error("Please fill all required fields correctly.");
      }
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = new FormData();
      if (form.name) payload.append("name", form.name);
      if (form.email) payload.append("email", form.email);
      if (form.password) payload.append("password", form.password);
      if (form.image) payload.append("image", form.image);

      const { data } = await axios.put(apiConfig.updateDoctorProfile, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local storage if user data changed
      if (data.user) {
        localStorage.setItem("userData", JSON.stringify(data.user));
      }
      
      toast.success(data.message || "Profile updated successfully");
      
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
      
      if (data.doctor && data.doctor.image) {
        setPreview(apiConfig.getDoctorImage(data.doctor.image));
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const RuleItem = ({ valid, text }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold transition-all duration-300 ${valid ? "text-green-600" : "text-gray-500"}`}>
      {valid ? (
        <Check size={14} className="stroke-[3px]" />
      ) : (
        <Circle size={14} className="fill-gray-300 stroke-none" />
      )}
      <span>{text}</span>
    </div>
  );

  if (!user || user.role !== "doctor") return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-[#008e9b] mb-6 text-center sm:text-left">
          Doctor Profile
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
              <img
                src={preview || "/img/doctors/avatar.png"}
                alt="Doctor profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Profile Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleChange} 
                className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#008e9b] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#008e9b] outline-none"
              required
            />
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Security</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave empty to keep current"
                    className="w-full p-3.5 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008e9b] transition-colors !bg-transparent !p-0 !border-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {form.password && (
                  <div className="mt-3 animate-fadeIn">
                    <p className="text-[11px] text-gray-500 mb-3 font-medium">
                      Use at least 8 characters with uppercase, lowercase, and a number.
                    </p>
                    
                    {/* Password Strength Bar */}
                    <div className="px-1">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Security Check</span>
                        <span className={`text-[11px] font-black uppercase ${
                          strengthCount <= 1 ? "text-red-500" : 
                          strengthCount === 2 ? "text-yellow-600" : 
                          strengthCount === 3 ? "text-[#008e9b]" : 
                          "text-green-600"
                        }`}>
                          Strength: {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              index <= strengthCount ? getStrengthColor() : "bg-gray-200"
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
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    className={`w-full p-3.5 pr-12 border rounded-xl bg-gray-50 focus:ring-2 focus:border-transparent outline-none transition-all ${
                      form.confirmPassword === "" 
                        ? "border-gray-200 focus:ring-[#008e9b]" 
                        : passwordsMatch 
                          ? "border-green-200 focus:ring-green-500" 
                          : "border-red-200 focus:ring-red-500"
                    }`}
                    required={!!form.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#008e9b] transition-colors !bg-transparent !p-0 !border-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {form.confirmPassword !== "" && form.password !== "" && (
                  <div className="mt-2 ml-1 flex items-center gap-1.5 transition-all duration-300">
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
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className={`w-full mt-10 py-4 rounded-xl font-black tracking-widest shadow-lg transition-all duration-300 transform active:scale-95 ${
              isFormValid && !loading
                ? "bg-[#008e9b] text-white hover:bg-[#007a85] hover:shadow-xl hover:-translate-y-0.5"
                : "bg-gray-100 text-gray-400 cursor-not-allowed grayscale"
            }`}
          >
            {loading ? "UPDATING PROFILE..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default DoctorProfile;
