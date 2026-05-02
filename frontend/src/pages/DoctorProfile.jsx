import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";

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
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Password and confirm password must match");
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

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Leave empty to keep current"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#008e9b] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  type="password"
                  placeholder="Re-enter new password"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#008e9b] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 rounded-lg bg-[#008e9b] text-white font-bold hover:bg-[#007a85] transition-all shadow-md hover:shadow-lg disabled:opacity-70 transform active:scale-[0.98]"
          >
            {loading ? "Updating Profile..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorProfile;
