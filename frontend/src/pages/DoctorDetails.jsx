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
                doc?.specialty?.toLowerCase() === specialty
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
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff]">
        <LoadingSpinner text="Loading doctor details..." fullScreen />
      </main>
    );
  }

  if (error || !doctor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8">
        <div className="w-full max-w-md rounded-[2rem] border border-red-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <h2 className="text-2xl font-black text-gray-900">
            Doctor Not Found
          </h2>

          <p className="mt-3 text-sm font-medium text-gray-500">
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
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 max-w-5xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Doctor Profile
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
          {doctor?.name}
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500">
          View doctor details, specialty, experience, and related specialists.
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 md:p-10">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-full border-4 border-[#e8fbfd] bg-gray-50 shadow-lg md:h-64 md:w-64 md:rounded-[2rem]">
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
                <h3 className="text-3xl font-black text-gray-900 md:text-4xl">
                  {doctor?.name}
                </h3>

                <div className="inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-sm font-black text-[#008e9b]">
                  {doctor?.specialty}
                </div>

                <p className="text-base font-bold text-gray-600">
                  <span className="mr-1 text-[#008e9b]">
                    {doctor?.experienceYears}
                  </span>
                  Years of Experience
                </p>

                <div className="hidden h-px w-full bg-gray-100 md:block" />

                <p className="text-sm font-medium leading-relaxed text-gray-500 sm:text-base">
                  {doctor?.description || "No description available."}
                </p>

                <Link
                  to="/add-appointment"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#008e9b] px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#007a85] hover:shadow-xl"
                >
                  Book Appointment
                </Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-gray-100 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-8">
          <h3 className="mb-6 text-2xl font-black text-gray-900">
            Other{" "}
            <span className="text-[#008e9b]">{doctor?.specialty}</span> Doctors
          </h3>

          <div className="space-y-4">
            {relatedDoctors.length > 0 ? (
              relatedDoctors.map((doc) => (
                <Link
                  className="group flex items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
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
                    <h4 className="truncate font-black text-gray-900 transition-colors group-hover:text-[#008e9b]">
                      {doc?.name}
                    </h4>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Exp: {doc?.experienceYears} years
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <p className="text-sm font-medium text-gray-500">
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