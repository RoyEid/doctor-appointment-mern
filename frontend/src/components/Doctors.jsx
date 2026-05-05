import { ArrowRight } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";

function Doctors() {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchedDoctors = async () => {
      try {
        setLoading(true);

        const res = await fetch(apiConfig.getAllDoctors);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch doctors");
        }

        const normalized = Array.isArray(data) ? data : [];
        setDoctors(normalized.slice(0, 3));
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Could not load doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchedDoctors();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Delete doctor?",
      text: "Are you sure you want to delete this doctor?",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#06b6d4",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.deleteDoctor(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Doctor deleted successfully");
        setDoctors((prev) => prev.filter((d) => d._id !== id));
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete doctor");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error deleting doctor");
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20">
        <LoadingSpinner text="Loading featured doctors..." compact />
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto mb-14 max-w-4xl text-center">
        <div className="mb-4 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Medical Experts
        </div>

        <h2 className="text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
          Our <span className="text-[#008e9b]">Doctors</span>
        </h2>

        <div className="mx-auto my-6 h-1.5 w-24 rounded-full bg-[#008e9b]" />

        <p className="mx-auto max-w-2xl text-lg font-medium text-gray-500">
          Meet our trusted medical team and choose the right specialist for your
          healthcare needs.
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-gray-100 bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <p className="text-base font-medium text-gray-500 sm:text-lg">
            No doctors are available right now.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <div
              className="group relative overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white p-6 text-center shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
              key={doc?._id}
            >
              {user?.role === "admin" && (
                <div className="absolute right-4 top-4 z-10 flex gap-2">
                  <Link
                    to={`/edit-doctor/${doc._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-xl !bg-blue-500 px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:!bg-blue-600"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(doc._id);
                    }}
                    className="rounded-xl !bg-red-500 px-3 py-1.5 text-xs font-black text-white shadow-sm transition hover:!bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}

              <Link to={`/doctor/${doc?._id}`} className="block">
                <div className="mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-[#e8fbfd] bg-gray-50 shadow-md transition group-hover:border-[#46daea]">
                  <img
                    src={apiConfig.getDoctorImage(doc?.image)}
                    alt={doc?.name || "doctor"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = "/img/doctors/avatar.png";
                    }}
                  />
                </div>

                <h3 className="text-xl font-black text-gray-900 transition group-hover:text-[#008e9b]">
                  {doc?.name}
                </h3>

                <p className="mt-2 inline-flex rounded-full bg-[#e8fbfd] px-4 py-1.5 text-sm font-bold text-[#008e9b]">
                  {doc?.specialty}
                </p>

                <p className="mt-3 text-sm font-medium text-gray-500">
                  {doc?.experienceYears} Years of Experience
                </p>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center">
        <Link
          className="inline-flex items-center gap-2 rounded-2xl !bg-[#008e9b] px-7 py-4 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
          to="/allDoctors"
        >
          See All Doctors
          <ArrowRight size={19} />
        </Link>
      </div>
    </section>
  );
}

export default Doctors;
