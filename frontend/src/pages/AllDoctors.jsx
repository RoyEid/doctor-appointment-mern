import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";

function AllDoctors() {
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
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#008e9b]">
        Our Doctors
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {doctors?.map((doc) => (
          <div
            className="bg-white rounded-lg shadow p-4 text-center"
            key={doc?._id}
          >
            <Link to={`/doctor/${doc._id}`}>
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
