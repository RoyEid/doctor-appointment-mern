import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
          throw new Error(data.message || "Failed to load dashboard data");
        }

        const appts = Array.isArray(data) ? data : data.appointments || [];

        setStats({
          total: appts.length,
          pending: appts.filter((a) => a.status === "pending").length,
          approved: appts.filter((a) => a.status === "approved").length,
          rejected: appts.filter((a) => a.status === "rejected").length,
        });
      } catch (error) {
        toast.error(error.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff]">
        <LoadingSpinner text="Loading admin dashboard..." fullScreen />
      </main>
    );
  }

  const cards = [
    {
      label: "Total Appointments",
      value: stats.total,
      color: "text-[#008e9b]",
      bg: "bg-[#e8fbfd]",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Approved",
      value: stats.approved,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 sm:px-6">
      <div className="mx-auto mb-8 max-w-4xl text-center">
        <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
          Admin Area
        </div>

        <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
          Admin Dashboard
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-gray-500">
          Monitor appointment activity and track platform status at a glance.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-[1.5rem] border border-gray-100 bg-white p-6 text-center shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]"
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg}`}
            >
              <p className={`text-2xl font-black ${card.color}`}>
                {card.value}
              </p>
            </div>

            <p className="text-sm font-black uppercase tracking-[0.12em] text-gray-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminDashboard;
