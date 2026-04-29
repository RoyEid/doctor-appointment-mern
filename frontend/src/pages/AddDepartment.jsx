import { useState } from "react";
import { apiConfig } from "../config/api";

function AddDepartment() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in as admin");
      return;
    }

    try {
      const res = await fetch(apiConfig.addDepartment, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 REQUIRED
        },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Department added successfully!");
        setName("");
        setDescription("");
      } else {
        alert(data.message || "Error adding department");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-center text-gray-800">Add Department</h2>

        <div className="space-y-5">
          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Department Name</label>
            <input
              type="text"
              placeholder="E.g. Cardiology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-semibold text-gray-700">Description</label>
            <textarea
              placeholder="A brief description of this department..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008e9b] focus:border-transparent outline-none transition-all bg-gray-50 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 mt-8 rounded-lg bg-[#008e9b] text-white font-bold tracking-wide hover:bg-[#007a85] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#008e9b] shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Add Department
        </button>
      </form>
    </div>
  );
}

export default AddDepartment;
