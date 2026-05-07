import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import LoadingSpinner from "./LoadingSpinner";
import { ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

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

        setDoctors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to load doctors");
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
      <section
        id="doctors"
        className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
      >
        <LoadingSpinner text="Loading our doctors..." compact />
      </section>
    );
  }

  if (doctors.length === 0) {
    return (
      <section
        id="doctors"
        className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
      >
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10 dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <p className="text-base font-medium text-gray-500 sm:text-lg dark:text-slate-400">
            No doctors are available right now.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="doctors"
      className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
            Medical Team
          </div>

          <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Our <span className="text-[#008e9b] dark:text-[#46daea]">Doctors</span>
          </h2>

          <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-[#008e9b] dark:bg-[#46daea]" />

          <p className="mx-auto max-w-2xl text-lg font-medium text-gray-500 dark:text-slate-400">
            Our team of experienced specialists is committed to providing
            quality healthcare for you and your family.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.slice(0, 6).map((doc) => (
            <div
              className="group relative overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white p-6 text-center shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_14px_35px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.4)]"
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

              <Link to={`/doctor/${doc._id}`} className="block">
                <div className="mx-auto mb-5 h-36 w-36 overflow-hidden rounded-full border-4 border-[#e8fbfd] bg-gray-50 shadow-md transition group-hover:border-[#46daea] dark:border-[#1f3a40] dark:bg-[#071416] dark:group-hover:border-[#46daea]">
                  <img
                    src={apiConfig.getDoctorImage(doc?.image)}
                    alt={doc?.name || "doctor"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = "/img/doctors/avatar.png";
                    }}
                  />
                </div>

                <h3 className="text-xl font-black text-gray-900 transition group-hover:text-[#008e9b] dark:text-white dark:group-hover:text-[#46daea]">
                  {doc?.name}
                </h3>

                <p className="mt-2 inline-flex rounded-full bg-[#e8fbfd] px-4 py-1.5 text-sm font-bold text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                  {doc.specialty}
                </p>

                <p className="mt-3 text-sm font-medium text-gray-500 dark:text-slate-400">
                  {doc?.experienceYears} Years of Experience
                </p>
              </Link>
            </div>
          ))}
        </div>

        {doctors.length > 6 && (
          <div className="mt-14 text-center">
            <Link
              to="/allDoctors"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl !bg-[#008e9b] px-8 py-4 text-sm font-black text-white shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-2xl dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
            >
              View All Doctors
              <ArrowRight
                size={19}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default Doctors;
