import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  AlertTriangle,
  BriefcaseMedical,
  FileText,
  ImagePlus,
  Loader2,
  Stethoscope,
  UserRound,
} from "lucide-react";

function EditDoctor() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    specialty: "",
    experienceYears: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setPageLoading(true);
        setError(null);

        const res = await fetch(apiConfig.getDoctorById(id));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load doctor");
        }

        setForm({
          name: data.name || "",
          specialty: data.specialty || "",
          experienceYears: data.experienceYears || "",
          description: data.description || "",
          image: null,
        });

        if (data.image) {
          setPreview(apiConfig.getDoctorImage(data.image));
        }
      } catch (err) {
        console.error("Failed to load doctor", err);
        setError(err.message || "Failed to load doctor");
        toast.error(err.message || "Failed to load doctor");
      } finally {
        setPageLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchDoctor();
    }
  }, [id, user?.role]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("specialty", form.specialty);
      formData.append("experienceYears", form.experienceYears);
      formData.append("description", form.description);

      if (form.image) formData.append("image", form.image);

      const res = await fetch(apiConfig.updateDoctor(id), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update doctor");
      }

      toast.success("Doctor updated successfully!");
      navigate(`/doctor/${id}`);
    } catch (error) {
      console.error("Error submitting form", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
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
            Only administrators can edit doctor profiles securely.
          </p>
        </div>
      </main>
    );
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <LoadingSpinner text="Loading doctor profile..." fullScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Admin Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
          Edit Doctor
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
          Update the doctor profile, specialty, experience, description, and
          profile image.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-5xl gap-8 overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_30px_90px_rgba(0,0,0,0.4)] md:grid-cols-[0.8fr_1.4fr] md:p-8"
        encType="multipart/form-data"
      >
        <section className="flex flex-col items-center justify-center rounded-[1.5rem] border border-gray-100 bg-gray-50 p-6 dark:border-[#1f3a40] dark:bg-[#071416]/70 text-center">
          <div className="mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            <img
              src={preview || "/img/doctors/avatar.png"}
              alt="Doctor preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.src = "/img/doctors/avatar.png";
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => document.getElementById("fileInput").click()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl !bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
          >
            <ImagePlus size={18} />
            Choose Image
          </button>

          <input
            id="fileInput"
            onChange={handleChange}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-slate-400">
            Upload a new image only if you want to replace the current one.
          </p>
        </section>

        <section className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                value={form.name}
                onChange={handleChange}
                type="text"
                name="name"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Specialty
            </label>

            <div className="relative">
              <Stethoscope
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                value={form.specialty}
                onChange={handleChange}
                type="text"
                name="specialty"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
              Experience Years
            </label>

            <div className="relative">
              <BriefcaseMedical
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                value={form.experienceYears}
                onChange={handleChange}
                type="number"
                name="experienceYears"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
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
                onChange={handleChange}
                value={form.description}
                name="description"
                required
                rows={4}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all duration-300 ${
              submitting
                ? "cursor-not-allowed !bg-gray-400 opacity-80"
                : "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Updating doctor...
              </>
            ) : (
              "Update Doctor"
            )}
          </button>
        </section>
      </form>
    </main>
  );
}

export default EditDoctor;
