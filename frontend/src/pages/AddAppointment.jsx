import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";
import AuthRequired from "../components/AuthRequired";
import { useNavigate } from "react-router-dom";

function AddAppointment() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "user") {
       navigate("/");
    }
  }, [user, navigate]);

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });
  const [selectedDoctorSlots, setSelectedDoctorSlots] = useState([]);

  useEffect(() => {
    if (form.doctor && doctors.length > 0) {
      const doc = doctors.find(d => d._id === form.doctor);
      if (doc && doc.availableSlots && doc.availableSlots.length > 0) {
        setSelectedDoctorSlots(doc.availableSlots);
        // Default to first slot if nothing chosen or current not in list
        if (!form.time || !doc.availableSlots.includes(form.time)) {
          setForm(prev => ({ ...prev, time: doc.availableSlots[0] }));
        }
      } else {
        setSelectedDoctorSlots([]);
      }
    }
  }, [form.doctor, doctors, form.time]);

  useEffect(() => {
    const fetchDoctor = async () => {
      const res = await fetch(apiConfig.getAllDoctors);
      const data = await res.json();
      setDoctors(data);
    };

    fetchDoctor();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data being sent:", form);

    const token = localStorage.getItem("token");
    console.log("Token:", token);

    try {
      const res = await fetch(apiConfig.createAppointment, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);

      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        alert("Appointment added successfully!");
        setForm({ doctor: "", date: "", time: "", reason: "" });
      } else {
        console.error("Error response:", data);
        alert(data.message || "Failed to add appointment");
      }
    } catch (error) {
      console.error("Network or parsing error:", error);
      alert("Network error occurred. Check console for details.");
    }
  };

  // FIXED: Added return statement
  if (!user) return <AuthRequired />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-md border border-gray-100"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-gray-800">Add Appointment</h2>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Doctor</label>
            <select
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all duration-200 bg-gray-50"
            >
              <option value="">Select doctor</option>
              {doctors?.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc?.name} - {doc?.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all duration-200 bg-gray-50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Time</label>
            {selectedDoctorSlots.length > 0 ? (
              <select
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all duration-200 bg-gray-50"
              >
                {selectedDoctorSlots.map((slot, i) => (
                  <option key={i} value={slot}>{slot}</option>
                ))}
              </select>
            ) : (
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all duration-200 bg-gray-50"
              />
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all duration-200 bg-gray-50"
              placeholder="Describe your reason for the appointment..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-lg bg-[#008e9b] text-white font-bold tracking-wide hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e9b] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Submit Request
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAppointment;
