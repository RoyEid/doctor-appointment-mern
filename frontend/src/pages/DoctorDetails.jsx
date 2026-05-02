import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiConfig } from "../config/api";

function DoctorDetails() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [relatedDoctors, setRelatedDoctors] = useState([]);

  useEffect(() => {
    const fetchedDoctors = async () => {
      try {
        const res = await fetch(apiConfig.getDoctorById(id));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");
        setDoctor(data);
        fetchRelatedDoctors(data?.specialty.toLowerCase(), data?._id);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchRelatedDoctors = async (specialty, currentId) => {
      try {
        const res = await fetch(apiConfig.getDoctorsBySpecialty(specialty));

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");

        const normalized = data.filter(
          (doc) =>
            doc?._id !== currentId && doc.specialty.toLowerCase() === specialty,
        );
        setRelatedDoctors(normalized);
      } catch (error) {
        console.error("Error fetching related doctors:", error);
      }
    };

    fetchedDoctors();
  }, [id]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Doctor Info */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <img
            src={apiConfig.getDoctorImage(doctor?.image)}
            alt={doctor?.name || "doctor"}
            className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-full md:rounded-2xl shadow-md border-4 border-white"
          />
          <div className="space-y-4 text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">{doctor?.name}</h2>
            <div className="inline-block bg-[#e0fbff] text-[#008e9b] font-semibold px-4 py-1.5 rounded-full text-sm">
              {doctor?.specialty}
            </div>
            <p className="text-gray-600 font-medium">
              <span className="text-[#008e9b] tracking-wide mr-1 " >{doctor?.experienceYears}</span> Years of Experience
            </p>
            <div className="w-full h-px bg-gray-100 my-4 hidden md:block"></div>
            <p className="text-gray-600 leading-relaxed">
              {doctor?.description}
            </p>
          </div>
        </div>

      {/* Related Doctors */}
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-gray-200 pb-2 inline-block">
          Other {doctor?.specialty} <span className="text-[#008e9b]">Doctors</span>
        </h3>

        <div className="space-y-4">
          {relatedDoctors.length > 0 ? (
            relatedDoctors?.map((doc) => (
              <Link
                className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
                key={doc?._id}
                to={`/doctor/${doc?._id}`}
              >
                <img
                  src={apiConfig.getDoctorImage(doc?.image)}
                  alt={doc?.name || "doctor"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-[#46daea] transition-colors mr-4 flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-[#008e9b] transition-colors">{doc?.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">Exp: {doc?.experienceYears} years</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center p-6 bg-white rounded-xl border border-gray-100 border-dashed">
              <p className="text-gray-500">No related doctors found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

export default DoctorDetails;
