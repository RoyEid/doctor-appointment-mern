import { useState, useContext, useEffect } from "react";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Building2,
  FileText,
  Loader2,
  PlusCircle,
} from "lucide-react";

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

    if (loading) return;

    setLoading(true);

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      setLoading(false);
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

        setTimeout(() => navigate("/"), 1500);
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 dark:border-red-900/30 dark:bg-[#0f2428] text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangle size={34} />
          </div>

          <h2 className="mb-2 text-2xl font-black text-gray-900 dark:text-white">
            Access Denied
          </h2>

          <p className="font-medium text-gray-500 dark:text-slate-400">
            Only administrators can create departments.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Admin Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
          Add Department
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
          Create a new medical department that will appear in your services
          section.
        </p>
      </div>

      <div className="mx-auto w-full max-w-lg overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
            <PlusCircle size={30} />
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              Department Details
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
              Fill in the information below.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Department Name
            </label>

            <div className="relative">
              <Building2
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                type="text"
                placeholder="E.g. Cardiology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-70 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Description
            </label>

            <div className="relative">
              <FileText
                size={18}
                className="absolute left-4 top-4 text-[#008e9b]"
              />

              <textarea
                placeholder="Describe the medical services provided by this department..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all disabled:cursor-not-allowed disabled:opacity-70 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-[0.8fr_1.2fr]">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 !bg-white dark:border-[#1f3a40] dark:!bg-[#071416] dark:text-slate-300 px-5 py-4 text-sm font-black text-gray-600 !shadow-none transition-all hover:!bg-gray-50 hover:text-[#008e9b]"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg transition-all duration-300 ${
                loading
                  ? "cursor-not-allowed !bg-gray-400 opacity-80"
                  : "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating department...
                </>
              ) : (
                "Create Department"
              )}
            </button>
          </div>
        </form>
      </div>

      <p className="mx-auto mt-6 max-w-lg text-center text-sm font-medium text-gray-500 dark:text-slate-400">
        Departments created here will immediately appear on the homepage
        services section.
      </p>
    </main>
  );
}

export default AddDepartment;
