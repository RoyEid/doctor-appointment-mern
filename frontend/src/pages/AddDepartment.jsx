import { useState, useContext, useEffect } from "react";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2, PlusCircle } from "lucide-react";

function AddDepartment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Unauthorized access");
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      const res = await fetch(apiConfig.addDepartment, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || "Department added successfully!");
        setName("");
        setDescription("");
        // Navigate back to departments or dashboard after a short delay
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(data.message || "Error adding department");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return null; // The useEffect handles redirection
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#008e9b]"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <PlusCircle className="text-[#008e9b]" size={32} />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Add Department</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Department Name</label>
              <input
                type="text"
                placeholder="E.g. Cardiology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Description</label>
              <textarea
                placeholder="Describe the medical services provided by this department..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 text-gray-800 resize-none"
                required
                disabled={loading}
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 py-3.5 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-all duration-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] py-3.5 rounded-xl bg-[#008e9b] text-white font-bold tracking-wide hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e9b] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Create Department"
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-6 text-center text-gray-500 text-sm">
          Departments created here will immediately appear on the homepage services section.
        </p>
      </div>
    </div>
  );
}

export default AddDepartment;
