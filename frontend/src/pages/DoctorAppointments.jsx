import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { apiConfig } from "../config/api";
import { useNavigate } from "react-router-dom";

function DoctorAppointments() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [tempTime, setTempTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Basic redirect guard for normal users navigating to the route directly
    if (user && user.role !== "doctor") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
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
        
        // Ensure data is array and sort newest first
        const apptArray = Array.isArray(data) ? data : data.appointments || [];
        const sorted = apptArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setAppointments(sorted);
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        toast.error(error.message || "Error loading appointments");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "doctor") {
      fetchAppointments();
    }
  }, [user]);

  const updateAppointment = async (id, { status, time }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.updateAppointmentStatus(id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, time })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update appointment");
      }
      
      setAppointments((prev) => 
        prev.map((a) => a._id === id ? data : a)
      );
      
      if (status) toast.success(`Appointment ${status} successfully!`);
      if (time) toast.success(`Time updated to ${time}`);
      
      setEditingTimeId(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.message);
    }
  };

  const updateStatus = (id, status) => updateAppointment(id, { status });
  
  const saveTime = (id) => {
    if (!tempTime) return setEditingTimeId(null);
    updateAppointment(id, { time: tempTime });
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await fetch(apiConfig.getAllDoctors);
        const doctors = await res.json();
        const currentDoc = doctors.find(d => d.userId === user.id);
        if (currentDoc && currentDoc.availableSlots) {
          setAvailableSlots(currentDoc.availableSlots);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    };
    if (user?.role === "doctor") fetchAvailability();
  }, [user]);

  const addSlot = async () => {
    if (!newSlot) return;
    const updated = [...availableSlots, newSlot].sort();
    await saveAvailability(updated);
    setNewSlot("");
  };

  const removeSlot = async (slot) => {
    const updated = availableSlots.filter(s => s !== slot);
    await saveAvailability(updated);
  };

  const saveAvailability = async (slots) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.updateAvailability, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availableSlots: slots })
      });
      if (res.ok) {
        setAvailableSlots(slots);
        toast.success("Availability updated!");
      }
    } catch (err) {
      toast.error("Failed to update availability");
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
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        Doctor Dashboard
      </h2>

      {/* Availability Management */}
      <div className="max-w-3xl mx-auto mb-10 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📅</span> Manage My Availability
        </h3>
        <p className="text-sm text-gray-500 mb-4">Define the time slots you are available for appointments.</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {availableSlots.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No slots defined yet.</p>
          ) : (
            availableSlots.map((slot, i) => (
              <span key={i} className="bg-blue-50 text-[#008e9b] px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium border border-blue-100">
                {slot}
                <button onClick={() => removeSlot(slot)} className="text-red-400 hover:text-red-600 font-bold">×</button>
              </span>
            ))
          )}
        </div>

        <div className="flex gap-2 max-w-sm">
          <input 
            type="text" 
            placeholder="e.g. 09:00 AM" 
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            className="flex-1 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#008e9b] transition-all bg-gray-50"
          />
          <button 
            onClick={addSlot}
            className="bg-[#008e9b] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#007a85] transition shadow-sm"
          >
            Add Slot
          </button>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">
        My Patients & Appointments
      </h3>

      <div className="space-y-4 px-4 max-w-3xl mx-auto">
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
                className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-md p-4 transition-all duration-300 border border-gray-50 hover:shadow-lg flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="flex gap-4 w-full">
                   <div className="flex-shrink-0 w-12 h-12 bg-[#008e9b] text-white rounded-full flex items-center justify-center font-bold text-xl uppercase">
                      {app.user?.name ? app.user.name.charAt(0) : 'P'}
                   </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col mb-1 gap-0.5">
                        <h3 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight">
                          {app.user?.name || "Unknown Patient"}
                        </h3>
                        <p className="text-sm font-medium text-[#008e9b]">
                          {app.user?.email || "No Email Provided"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      {currentStatus === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(app._id, "approved")}
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, "rejected")}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition shadow-sm"
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
                      {new Date(app.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="mx-0.5">|</span>
                      <span>🕒</span>
                      
                      {editingTimeId === app._id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={tempTime}
                            onChange={(e) => setTempTime(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-0.5 text-gray-700 w-24 outline-none focus:ring-1 focus:ring-[#008e9b]"
                            placeholder="e.g. 10:00 AM"
                            autoFocus
                          />
                          <button 
                            onClick={() => saveTime(app._id)}
                            className="text-[#008e9b] font-bold hover:underline"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span 
                          onClick={() => {
                            setEditingTimeId(app._id);
                            setTempTime(app.time || "");
                          }}
                          className="hover:text-[#008e9b] cursor-pointer transition-colors flex items-center gap-1"
                          title="Click to edit time"
                        >
                          {app.time || <span className="italic text-gray-400">Time not specified</span>}
                          <span className="text-[10px] opacity-0 group-hover:opacity-100 italic transition-opacity"> (edit)</span>
                        </span>
                      )}
                    </div>

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
