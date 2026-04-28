import React, { useState } from "react";

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
      const res = await fetch("http://localhost:5000/departments/addDepartment", {
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          Add Department
        </h2>

        <input
          type="text"
          placeholder="Department name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-[#008e9b] text-white py-2 rounded"
        >
          Add Department
        </button>
      </form>
    </div>
  );
}

export default AddDepartment;