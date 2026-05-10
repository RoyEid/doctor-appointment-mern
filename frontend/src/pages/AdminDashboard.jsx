import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Activity,
  Ban,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Stethoscope,
  TrendingUp,
  UsersRound,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
    summary: {
      totalAppointments: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
      reschedulePending: 0,
      totalDoctors: 0,
    },
    appointmentsByStatus: [],
    appointmentsByMonth: [],
    topDoctors: [],
    recentAppointments: [],
  });

  const [displayStats, setDisplayStats] = useState({
    totalAppointments: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        if (!token) {
          toast.error("Please login again.");
          navigate("/login");
          return;
        }

        const res = await fetch(apiConfig.adminAnalytics, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load admin analytics");
        }

        setAnalytics({
          summary: data.summary || {
            totalAppointments: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            cancelled: 0,
            completed: 0,
            reschedulePending: 0,
            totalDoctors: 0,
          },
          appointmentsByStatus: data.appointmentsByStatus || [],
          appointmentsByMonth: data.appointmentsByMonth || [],
          topDoctors: data.topDoctors || [],
          recentAppointments: data.recentAppointments || [],
        });
      } catch (error) {
        toast.error(error.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchAnalytics();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (loading) return;

    const duration = 1200;
    const frameRate = 20;
    const totalFrames = duration / frameRate;
    let frame = 0;

    const summary = analytics.summary;

    const counter = setInterval(() => {
      frame += 1;

      const progress = Math.min(frame / totalFrames, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayStats({
        totalAppointments: Math.floor(
          summary.totalAppointments * easedProgress,
        ),
        pending: Math.floor(summary.pending * easedProgress),
        approved: Math.floor(summary.approved * easedProgress),
        rejected: Math.floor(summary.rejected * easedProgress),
        cancelled: Math.floor(summary.cancelled * easedProgress),
        completed: Math.floor(summary.completed * easedProgress),
      });

      if (progress === 1) {
        clearInterval(counter);

        setDisplayStats({
          totalAppointments: summary.totalAppointments,
          pending: summary.pending,
          approved: summary.approved,
          rejected: summary.rejected,
          cancelled: summary.cancelled,
          completed: summary.completed,
        });
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [loading, analytics.summary]);

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]">
        <LoadingSpinner text="Loading admin analytics..." fullScreen />
      </main>
    );
  }

  const cards = [
    {
      label: "Total",
      fullLabel: "Total Appointments",
      value: displayStats.totalAppointments,
      icon: <CalendarCheck size={24} />,
      color: "text-[#008e9b] dark:text-[#46daea]",
      bg: "bg-[#e8fbfd] dark:bg-[#46daea]/15",
    },
    {
      label: "Pending",
      fullLabel: "Pending Appointments",
      value: displayStats.pending,
      icon: <Clock size={24} />,
      color: "text-yellow-600 dark:text-yellow-300",
      bg: "bg-yellow-50 dark:bg-yellow-500/10",
    },
    {
      label: "Approved",
      fullLabel: "Approved Appointments",
      value: displayStats.approved,
      icon: <CheckCircle2 size={24} />,
      color: "text-green-600 dark:text-green-300",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
    {
      label: "Rejected",
      fullLabel: "Rejected Appointments",
      value: displayStats.rejected,
      icon: <XCircle size={24} />,
      color: "text-red-600 dark:text-red-300",
      bg: "bg-red-50 dark:bg-red-500/10",
    },
    {
      label: "Cancelled",
      fullLabel: "Cancelled Appointments",
      value: displayStats.cancelled,
      icon: <Ban size={24} />,
      color: "text-slate-600 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-500/10",
    },
    {
      label: "Completed",
      fullLabel: "Completed Appointments",
      value: displayStats.completed,
      icon: <Activity size={24} />,
      color: "text-cyan-700 dark:text-cyan-300",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
    },
  ];

  const statusColors = {
    pending: "#f59e0b",
    approved: "#22c55e",
    rejected: "#ef4444",
    cancelled: "#64748b",
    completed: "#008e9b",
    reschedule_pending: "#8b5cf6",
  };

  const activeStatusData = analytics.appointmentsByStatus.filter(
    (item) => item.value > 0,
  );

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    if (status === "reschedule_pending") return "Reschedule Pending";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300";
    }

    if (status === "pending") {
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300";
    }

    if (status === "rejected") {
      return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";
    }

    if (status === "cancelled") {
      return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300";
    }

    if (status === "completed") {
      return "bg-[#e8fbfd] text-[#008e9b] dark:bg-[#46daea]/10 dark:text-[#46daea]";
    }

    return "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300";
  };

  const chartCardClass =
    "rounded-[1.7rem] border border-gray-100 bg-white p-4 shadow-[0_14px_35px_rgba(15,23,42,0.07)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_14px_35px_rgba(0,0,0,0.28)] sm:p-5";

  const tooltipStyle = {
    borderRadius: "16px",
    border: "1px solid rgba(0,142,155,0.2)",
    fontWeight: 700,
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-8 transition-colors dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30] sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#102b30] dark:text-[#46daea]">
            <Activity size={14} />
            Admin Analytics
          </div>

          <h2 className="text-3xl font-black text-gray-900 dark:text-white sm:text-4xl">
            Admin Dashboard
          </h2>

          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-gray-500 dark:text-slate-300">
            Real-time appointment insights, status tracking, doctor performance,
            and recent platform activity.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {" "}
          {cards.map((card) => (
            <div
              key={card.fullLabel}
              className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_14px_35px_rgba(0,0,0,0.28)] dark:hover:border-[#46daea]/25 dark:hover:shadow-[0_22px_50px_rgba(0,0,0,0.38)]"
            >
              <div className="flex items-center justify-between gap-3 xl:flex-col xl:items-start">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}
                >
                  {card.icon}
                </div>

                <div className="text-right xl:text-left">
                  <p className={`text-3xl font-black ${card.color}`}>
                    {card.value}
                  </p>

                  <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
                    {card.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid w-full grid-cols-1 gap-6 xl:grid-cols-3">
          {" "}
          <div className={`${chartCardClass} xl:col-span-2`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Appointments by Month
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Booking activity over the last 6 months.
                </p>
              </div>

              <div className="rounded-2xl bg-[#e8fbfd] p-3 text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                <TrendingUp size={22} />
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.appointmentsByMonth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148,163,184,0.25)"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="appointments"
                    radius={[12, 12, 0, 0]}
                    fill="#008e9b"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={chartCardClass}>
            <div className="mb-5">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                Status Breakdown
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Appointment distribution by status.
              </p>
            </div>

            {activeStatusData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activeStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={92}
                      paddingAngle={4}
                    >
                      {activeStatusData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={statusColors[entry.status] || "#008e9b"}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-72 items-center justify-center rounded-3xl bg-gray-50 text-center text-sm font-bold text-gray-500 dark:bg-[#071416] dark:text-slate-400">
                No appointment status data yet.
              </div>
            )}

            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-2">
              {analytics.appointmentsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between gap-2 rounded-2xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-600 dark:bg-[#071416] dark:text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: statusColors[item.status] || "#008e9b",
                      }}
                    />
                    <span>{item.name}</span>
                  </div>

                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className={chartCardClass}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  All Doctors
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Every doctor with total appointment count.
                </p>
              </div>

              <div className="rounded-2xl bg-[#e8fbfd] p-3 text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                <Stethoscope size={22} />
              </div>
            </div>

            <div className="space-y-3">
              {" "}
              {analytics.topDoctors.length > 0 ? (
                analytics.topDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id || doctor.name}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 dark:border-[#1f3a40] dark:bg-[#071416]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e8fbfd] text-sm font-black text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-gray-900 dark:text-white">
                          {doctor.name}
                        </p>
                        <p className="truncate text-xs font-medium text-gray-500 dark:text-slate-400">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>

                    <span className="flex-shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[#008e9b] dark:bg-[#0f2428] dark:text-[#46daea]">
                      {doctor.appointments}{" "}
                      <span className="hidden sm:inline">appts</span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-gray-50 p-4 text-center text-sm font-semibold text-gray-500 dark:bg-[#071416] dark:text-slate-400">
                  No doctors found.
                </p>
              )}
            </div>
          </div>

          <div className={`${chartCardClass} xl:col-span-2`}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Recent Appointments
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                  Latest appointment requests and updates.
                </p>
              </div>

              <div className="rounded-2xl bg-[#e8fbfd] p-3 text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                <UsersRound size={22} />
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {analytics.recentAppointments.length > 0 ? (
                analytics.recentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-[#1f3a40] dark:bg-[#071416]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">
                          {appointment.patientName}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                          {appointment.patientEmail}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${getStatusClass(
                          appointment.status,
                        )}`}
                      >
                        {formatStatus(appointment.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 dark:bg-[#0f2428]">
                      <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        Doctor:{" "}
                        <span className="text-gray-900 dark:text-white">
                          {appointment.doctorName}
                        </span>
                      </p>

                      <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        Specialty:{" "}
                        <span className="text-gray-900 dark:text-white">
                          {appointment.specialty}
                        </span>
                      </p>

                      <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
                        Date:{" "}
                        <span className="text-gray-900 dark:text-white">
                          {formatDate(appointment.date)} at {appointment.time}
                        </span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl bg-gray-50 p-4 text-center text-sm font-semibold text-gray-500 dark:bg-[#071416] dark:text-slate-400">
                  No recent appointments found.
                </p>
              )}
            </div>

            <div className="hidden max-w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-[#1f3a40] md:block">
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 dark:divide-[#1f3a40]">
                  <thead className="bg-gray-50 dark:bg-[#071416]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
                        Patient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
                        Doctor
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-gray-400 dark:text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 bg-white dark:divide-[#1f3a40] dark:bg-[#0f2428]">
                    {analytics.recentAppointments.length > 0 ? (
                      analytics.recentAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="transition hover:bg-gray-50 dark:hover:bg-[#071416]"
                        >
                          <td className="px-4 py-4">
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                              {appointment.patientName}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                              {appointment.patientEmail}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                              {appointment.doctorName}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                              {appointment.specialty}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-sm font-black text-gray-900 dark:text-white">
                              {formatDate(appointment.date)}
                            </p>
                            <p className="text-xs font-medium text-gray-500 dark:text-slate-400">
                              {appointment.time}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${getStatusClass(
                                appointment.status,
                              )}`}
                            >
                              {formatStatus(appointment.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-8 text-center text-sm font-semibold text-gray-500 dark:text-slate-400"
                        >
                          No recent appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
