import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";

function AllDoctors() {
  const { user } = useContext(AuthContext);
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    const fetchedDoctors = async () => {
      try {
        const res = await fetch(apiConfig.getAllDoctors);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");
        setDoctors(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchedDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.deleteDoctor(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDoctors(doctors.filter((d) => d._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete doctor");
      }
    } catch (error) {
      console.error(error);
      alert("Network error deleting doctor");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        Our Doctors
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {doctors?.map((doc) => (
          <div
            className="bg-white rounded-lg shadow p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
            key={doc?._id}
          >
            {user?.role === "admin" && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <Link
                  to={`/edit-doctor/${doc._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-600 transition shadow-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(doc._id);
                  }}
                  className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-red-600 transition shadow-sm"
                >
                  Delete
                </button>
              </div>
            )}
            <Link to={`/doctor/${doc._id}`} className="block">
              <img
                src={apiConfig.getImageUrl(doc?.image)}
                alt={doc?.name || "doctor"}
                className="w-32 h-32 mx-auto rounded-full object-cover border mb-4"
              />
              <h3 className="text-xl font-semibold">{doc?.name}</h3>

              <p className="text-gray-600">{doc.specialty}</p>

              <p className="text-sm text-gray-500">
                {doc?.experienceYears} Years Of Exprerience
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllDoctors;
