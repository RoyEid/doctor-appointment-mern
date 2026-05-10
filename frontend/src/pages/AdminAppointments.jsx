import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(apiConfig.getMyAppointments, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch appointments");
        }

        const apptArray = Array.isArray(data) ? data : data.appointments || [];
        const sorted = apptArray.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );

        setAppointments(sorted);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error(error.message || "Error loading appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchAppointments();
    }
  }, [user]);

  if (!user || user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <LoadingSpinner text="Loading all appointments..." fullScreen />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
          Admin Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl dark:text-white">
          All Appointments
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500 dark:text-slate-300">
          Review appointment activity across the platform. Approval actions are
          handled by the assigned doctors.
        </p>
      </div>

      <div className="mx-auto max-w-3xl space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white dark:border-[#1f3a40] dark:bg-[#0f2428] p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-base font-medium text-gray-500 sm:text-lg dark:text-slate-300">
              No appointments found across the platform.
            </p>
          </div>
        ) : (
          appointments.map((app) => {
            const currentStatus = app.status || "pending";

            return (
              <div
                key={app._id}
                className="w-full overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white dark:border-[#1f3a40] dark:bg-[#0f2428] shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex min-w-0 gap-3">
                    <img
                      alt={app?.doctor?.name || "Doctor"}
                      className="h-14 w-14 rounded-full border border-[#008e9b] object-cover sm:h-16 sm:w-16"
                      src={apiConfig.getDoctorImage(app?.doctor?.image)}
                      onError={(e) => {
                        e.target.src = "/img/doctors/avatar.png";
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-col gap-0.5">
                        <h3 className="text-base font-black leading-tight text-gray-900 sm:text-lg dark:text-white">
                          {app.doctor?.name || "Unknown Doctor"}
                        </h3>

                        {app.user && (
                          <p className="text-sm font-bold text-[#008e9b] dark:text-[#46daea]">
                            Patient: {app.user.name}
                          </p>
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-500 dark:text-slate-300">
                        {app.reason || "No reason provided"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-400 sm:text-sm">
                        <span>📅</span>
                        <span>
                          {new Date(app.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>

                        <span className="mx-0.5">|</span>

                        <span>🕒</span>
                        <span>{app.time || "N/A"}</span>
                      </div>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          currentStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : currentStatus === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 dark:border-[#1f3a40] dark:bg-[#071416] dark:text-slate-300">
                    Review only. Approval actions are handled by assigned
                    doctors.
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

export default AdminAppointments;
