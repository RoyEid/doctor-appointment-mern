import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";

function DoctorAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: "", time: "" });
  const navigate = useNavigate();

  useEffect(() => {
    // Basic redirect guard for normal users navigating to the route directly
    if (user && user.role !== "doctor") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(apiConfig.getDoctorAppointments, {
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
      const onlyMyAppointments = apptArray.filter(
        (appt) => appt?.doctorId === user?.id || appt?.doctorId?._id === user?.id,
      );
      const sorted = onlyMyAppointments.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setAppointments(sorted);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      toast.error(error.message || "Error loading appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "doctor") fetchAppointments();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.updateAppointmentStatus(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update appointment");
      }

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id
            ? { ...appointment, status: data.status || status }
            : appointment,
        ),
      );
      toast.success(`Appointment ${status} successfully!`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.message);
    }
  };

  const startReschedule = (appointment) => {
    setEditingId(appointment._id);
    const dateValue = appointment?.date
      ? new Date(appointment.date).toISOString().split("T")[0]
      : "";
    setRescheduleForm({
      date: dateValue,
      time: appointment?.time || "",
    });
  };

  const submitReschedule = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.updateAppointmentStatus(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: rescheduleForm.date,
          time: rescheduleForm.time,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to reschedule appointment");
      }

      setAppointments((prev) =>
        prev.map((appointment) => (appointment._id === id ? data : appointment)),
      );
      setEditingId(null);
      toast.success("Appointment rescheduled successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to reschedule appointment");
    }
  };

  if (!user || user.role !== "doctor") {
    return null; // Don't flash UI before navigate fires
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        Doctor Appointments
      </h2>

      <div className="space-y-4 max-w-3xl mx-auto">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-4">No appointments assigned to you.</p>
          </div>
        ) : (
          appointments.map((app) => {
            const currentStatus = app.status || "pending";
            return (
              <div
                key={app._id}
                className="w-full mx-auto bg-white rounded-2xl shadow-md p-4 transition-all duration-300 border border-gray-50 hover:shadow-lg flex flex-col gap-4"
              >
                <div className="flex gap-4 w-full min-w-0">
                   <div className="flex-shrink-0 w-12 h-12 bg-[#008e9b] text-white rounded-full flex items-center justify-center font-bold text-xl uppercase">
                      {app.user?.name ? app.user.name.charAt(0) : 'P'}
                   </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex flex-col mb-1 gap-0.5 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight">
                          {app.user?.name || "Unknown Patient"}
                        </h3>
                      </div>

                      {/* Action Buttons */}
                      {currentStatus === "pending" && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => updateStatus(app._id, "approved")}
                            className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, "rejected")}
                            className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                       <span className="font-bold">Reason:</span> {app.reason}
                    </p>
                    
                    <div className="text-xs sm:text-sm text-gray-400 mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span>📅</span>
                      {new Date(app.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <span className="mx-0.5">|</span>
                      <span>🕒</span>
                      {app.time || "N/A"}
                    </div>

                    {editingId === app._id ? (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="date"
                            value={rescheduleForm.date}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) =>
                              setRescheduleForm((prev) => ({ ...prev, date: e.target.value }))
                            }
                            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md text-sm"
                          />
                          <input
                            type="text"
                            value={rescheduleForm.time}
                            placeholder="e.g. 10:30 AM"
                            onChange={(e) =>
                              setRescheduleForm((prev) => ({ ...prev, time: e.target.value }))
                            }
                            className="w-full sm:w-auto p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => submitReschedule(app._id)}
                            className="bg-[#008e9b] text-white px-3 py-1.5 rounded-md text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startReschedule(app)}
                        className="mt-3 bg-white border border-[#008e9b] text-[#008e9b] px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-[#008e9b] hover:text-white transition"
                      >
                        Reschedule
                      </button>
                    )}

                    <span 
                      className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                        currentStatus === 'approved' ? 'bg-green-100 text-green-700' : 
                        currentStatus === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DoctorAppointments;
