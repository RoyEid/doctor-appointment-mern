import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { apiConfig } from "../config/api";

function AddAppointment() {
  const [doctors, setDoctors] = useState([]);
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    doctor: "",
    date: "",
    reason: "",
  });

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
        setForm({ doctor: "", date: "", reason: "" });
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
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4 bg-gray-50">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center max-w-md w-full border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
            <svg className="w-8 h-8 text-[#008e9b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-8 font-medium">You need to login to create an appointment.</p>
          <Link to="/login" className="inline-block w-full bg-[#008e9b] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-[#007a85] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all duration-200 bg-gray-50"
            />
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
