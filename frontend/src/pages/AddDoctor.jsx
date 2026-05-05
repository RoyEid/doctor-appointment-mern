import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ImagePlus,
  Loader2,
  Mail,
  Lock,
  Stethoscope,
  UserRound,
  FileText,
  BriefcaseMedical,
} from "lucide-react";

function AddDoctor() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/img/doctors/avatar.png");
  const [error, setError] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialty: "",
    experienceYears: "",
    description: "",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError(null);
    setCreatedCredentials(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("specialty", form.specialty);
      formData.append("experienceYears", form.experienceYears);
      formData.append("description", form.description);

      if (image) formData.append("image", image);

      const res = await fetch(apiConfig.addDoctor, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add doctor");
      }

      const credentials = data?.data?.credentials || {
        email: form.email,
        password: form.password,
      };

      setCreatedCredentials(credentials);
      toast.success("Doctor added successfully!");

      setForm({
        name: "",
        email: "",
        password: "",
        specialty: "",
        experienceYears: "",
        description: "",
      });

      setPreview("/img/doctors/avatar.png");
      setImage(null);
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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertTriangle size={34} />
          </div>

          <h2 className="mb-2 text-2xl font-black text-gray-900">
            Access Denied
          </h2>

          <p className="font-medium text-gray-500">
            Only administrators can add doctors to the system.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Admin Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
          Add New Doctor
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500">
          Create a doctor profile and account credentials for the system.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid w-full max-w-5xl gap-8 overflow-hidden rounded-[2rem] border border-white bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl md:grid-cols-[0.8fr_1.4fr] md:p-8"
        encType="multipart/form-data"
      >
        <section className="flex flex-col items-center justify-center rounded-[1.5rem] border border-gray-100 bg-gray-50 p-6 text-center">
          <div className="mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            <img
              src={preview}
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
            onChange={handleImageChange}
            type="file"
            accept="image/*"
            className="hidden"
          />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Upload a clear professional image for the doctor profile.
          </p>
        </section>

        <section className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {createdCredentials && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <p className="font-black">Doctor account created</p>
              <p className="mt-1">
                <span className="font-bold">Email:</span>{" "}
                {createdCredentials.email}
              </p>
              <p>
                <span className="font-bold">Password:</span>{" "}
                {createdCredentials.password}
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
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
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Email
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                value={form.email}
                onChange={handleChange}
                type="email"
                name="email"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
              Password
            </label>

            <div className="relative">
              <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b]"
              />

              <input
                value={form.password}
                onChange={handleChange}
                type="password"
                name="password"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
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
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
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
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-gray-700">
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
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b]"
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
                Adding doctor...
              </>
            ) : (
              "Add Doctor"
            )}
          </button>
        </section>
      </form>
    </main>
  );
}

export default AddDoctor;
