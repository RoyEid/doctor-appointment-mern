import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const cards = [
    { label: "Total Appointments", value: stats.total, color: "text-[#008e9b]" },
    { label: "Pending", value: stats.pending, color: "text-yellow-600" },
    { label: "Approved", value: stats.approved, color: "text-green-600" },
    { label: "Rejected", value: stats.rejected, color: "text-red-600" },
  ];

  return (
    <div className="px-4 sm:px-6 py-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        Admin Dashboard
      </h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-3xl font-extrabold mt-2 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
