import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiConfig } from "../config/api";
import LoadingSpinner from "../components/LoadingSpinner";

function DoctorDetails() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [relatedDoctors, setRelatedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedDoctors = async (specialty, currentId) => {
      try {
        const res = await fetch(apiConfig.getDoctorsBySpecialty(specialty));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch related doctors");
        }

        const normalized = Array.isArray(data)
          ? data.filter(
              (doc) =>
                doc?._id !== currentId &&
                doc?.specialty?.toLowerCase() === specialty,
            )
          : [];

        setRelatedDoctors(normalized);
      } catch (error) {
        console.error("Error fetching related doctors:", error);
      }
    };

    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(apiConfig.getDoctorById(id));
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch doctor details");
        }

        setDoctor(data);

        if (data?.specialty && data?._id) {
          await fetchRelatedDoctors(data.specialty.toLowerCase(), data._id);
        }
      } catch (error) {
        console.error(error);
        setError(error.message || "Failed to load doctor details");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <LoadingSpinner text="Loading doctor details..." fullScreen />
      </main>
    );
  }

  if (error || !doctor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-red-900/30 dark:bg-[#0f2428]">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Doctor Not Found
          </h2>

          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-slate-400">
            {error || "We could not find this doctor profile."}
          </p>

          <Link
            to="/allDoctors"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl"
          >
            Back to Doctors
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-5xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Doctor Profile
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
          {doctor?.name}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-400">
          View doctor details, specialty, experience, and related specialists.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-colors dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-8 md:p-10">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-full border-4 border-[#e8fbfd] bg-gray-50 shadow-lg dark:border-[#46daea]/20 dark:bg-[#071416] md:h-64 md:w-64 md:rounded-[2rem]">
                <img
                  src={apiConfig.getDoctorImage(doctor?.image)}
                  alt={doctor?.name || "doctor"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = "/img/doctors/avatar.png";
                  }}
                />
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl">
                  {doctor?.name}
                </h3>

                <div className="inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-sm font-black text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                  {doctor?.specialty}
                </div>

                <p className="text-base font-bold text-gray-600 dark:text-slate-300">
                  <span className="mr-1 text-[#008e9b] dark:text-[#46daea]">
                    {doctor?.experienceYears}
                  </span>
                  Years of Experience
                </p>

                <div className="hidden h-px w-full bg-gray-100 dark:bg-[#1f3a40] md:block" />

                <p className="text-sm font-medium leading-relaxed text-gray-500 dark:text-slate-400 sm:text-base">
                  {doctor?.description || "No description available."}
                </p>

                <Link
                  to="/add-appointment"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl dark:bg-[#46daea] dark:text-[#071416] dark:hover:bg-[#7ee9f2]"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-gray-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-colors dark:border-[#1f3a40] dark:bg-[#0f2428]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:p-8">
          <h3 className="mb-6 text-2xl font-black text-gray-900 dark:text-white">
            Other{" "}
            <span className="text-[#008e9b] dark:text-[#46daea]">
              {doctor?.specialty}
            </span>{" "}
            Doctors
          </h3>

          <div className="space-y-4">
            {relatedDoctors.length > 0 ? (
              relatedDoctors.map((doc) => (
                <Link
                  className="group flex items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#46daea]/40 hover:shadow-md dark:border-[#1f3a40] dark:bg-[#071416] dark:hover:border-[#46daea]/40"
                  key={doc?._id}
                  to={`/doctor/${doc?._id}`}
                >
                  <img
                    src={apiConfig.getDoctorImage(doc?.image)}
                    alt={doc?.name || "doctor"}
                    className="mr-4 h-16 w-16 flex-shrink-0 rounded-full border-2 border-transparent object-cover transition-colors group-hover:border-[#46daea]"
                    onError={(e) => {
                      e.target.src = "/img/doctors/avatar.png";
                    }}
                  />

                  <div className="min-w-0">
                    <h4 className="truncate font-black text-gray-900 transition-colors group-hover:text-[#008e9b] dark:text-white dark:group-hover:text-[#46daea]">
                      {doc?.name}
                    </h4>

                    <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                      Exp: {doc?.experienceYears} years
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center transition-colors dark:border-[#1f3a40] dark:bg-[#071416]">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  No related doctors found.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default DoctorDetails;
