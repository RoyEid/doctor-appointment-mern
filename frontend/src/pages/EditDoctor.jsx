import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useParams, useNavigate } from "react-router-dom";

function EditDoctor() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    experienceYears: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(apiConfig.getDoctorById(id));
        const data = await res.json();
        if (res.ok) {
          setForm({
            name: data.name || "",
            specialty: data.specialty || "",
            experienceYears: data.experienceYears || "",
            description: data.description || "",
            image: null, // Image payload sits null until overwritten via the system
          });
          if (data.image) {
            setPreview(apiConfig.getImageUrl(data.image));
          }
        }
      } catch (err) {
        console.error("Failed to load doctor", err);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
      navigate(`/doctor/${id}`); // Bounce back to doctor view
    } catch (error) {
      console.error("Error submitting form", error);
      setError(error.message);
      toast.error(error.message);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only administrators can edit explicit doctor entities securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl border border-gray-100 rounded-2xl p-6 md:p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center md:items-start"
        encType="multipart/form-data"
      >
        <div className="flex flex-col items-center w-full md:w-1/3 space-y-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="object-cover w-full h-full"
              />
            ) : (
              <img
                src="/img/doctors/avatar.png"
                alt="Default avatar"
                className="object-cover w-full h-full"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("fileInput").click()}
            className="mt-2 bg-[#008e9b] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-[#007a85] transition-colors shadow-sm"
          >
            Choose Image
          </button>
          <input
            id="fileInput"
            onChange={handleChange}
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>

        <div className="w-full md:w-2/3 space-y-4">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800 text-center md:text-left">
            Edit Doctor
          </h2>

          {error && <p className="text-red-500">{error}</p>}

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Name</label>
            <input
              value={form.name}
              onChange={handleChange}
              type="text"
              name="name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Specialty</label>
            <input
              value={form.specialty}
              onChange={handleChange}
              type="text"
              name="specialty"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Experience Years</label>
            <input
              value={form.experienceYears}
              onChange={handleChange}
              type="number"
              name="experienceYears"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Description</label>
            <textarea
              onChange={handleChange}
              value={form.description}
              name="description"
              required
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-lg bg-[#008e9b] text-white font-bold tracking-wide hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e9b] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Update Doctor
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditDoctor;
