import { useEffect, useState } from "react";
import { apiConfig } from "../config/api";
import { Stethoscope, Hospital, FlaskConical, Award } from "lucide-react";

function Stats() {
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [departmentsCount, setDepartmentsCount] = useState(0);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const doctorsStats = await fetch(apiConfig.getDoctorsCount);

        const departmentsStats = await fetch(apiConfig.getDepartmentsCount);

        const doctorsData = await doctorsStats.json();

        const departmentsData = await departmentsStats.json();

        setDoctorsCount(doctorsData.count || 0);
        setDepartmentsCount(departmentsData.count || 0);

        console.log("Doctors count from API:", doctorsData.count);

        console.log("departments count from API:", departmentsData.count);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    {
      icon: <Stethoscope size={40} />,
      count: doctorsCount,
      label: "Doctors",
    },

    {
      icon: <Hospital size={40} />,
      count: departmentsCount,
      label: "Departments",
    },

    {
      icon: <FlaskConical size={40} />,
      count: 8,
      label: "Research Labs",
    },

    {
      icon: <Award size={40} />,
      count: 150,
      label: "Awards",
    },
  ];
  return (
    <section className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <div
              className="group cursor-pointer flex flex-col items-center justify-center space-y-4 bg-gray-50 shadow-sm border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:bg-[#008e9b] hover:-translate-y-1 transition-all duration-300 text-center"
              key={index}
            >
              <div className="bg-white p-4 rounded-full group-hover:bg-[#007a85] transition-colors duration-300 inline-block shadow-sm">
                <div className="text-[#46daea] group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </div>
              </div>

              <div>
                <span className="text-4xl font-extrabold text-gray-800 group-hover:text-white transition-colors duration-300 block">{item.count}</span>

                <p className="text-gray-500 font-medium mt-1 group-hover:text-blue-100 transition-colors duration-300 uppercase tracking-wider text-sm">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;
