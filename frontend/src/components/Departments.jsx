import { useEffect, useState } from "react";
import { apiConfig } from "../config/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    fetch(apiConfig.getAllDepartments)
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data);
        if (data.length > 0) setActiveTab(data[0]._id);
      })
      .catch((err) => console.error("Failed to fetch departments", err));
  }, []);

  const handleTabClick = (id) => {
    setActiveTab(id);
  };
  return (
    <section id="services" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-800 tracking-tight">Our <span className="text-[#008e9b]">Departments</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore our specialized medical departments staffed with expert
            doctors dedicated to your health and well-being.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs List */}
          <div className="md:w-64 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 flex-shrink-0">
            <ul className="flex flex-row overflow-x-auto md:flex-col hide-scrollbar p-2 md:p-4 gap-2">
              {departments.map((dep) => (
                <li key={dep._id} className="flex-shrink-0">
                  <button
                    onClick={() => handleTabClick(dep._id)}
                    className={`w-full text-left font-medium px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-200 ${
                      activeTab === dep._id
                        ? "bg-[#008e9b] text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                  >
                {dep?.name}
              </button>
            </li>
          ))}
        </ul>
        </div>
        {/* Tab Content */}

        <div className="flex-1 bg-gray-50 p-6 rounded shadow">
          {departments?.map((dep) =>
            dep?._id === activeTab ? (
              <div
                key={dep._id}
                className="flex flex-col md:flex-row items-center gap-6"
              >
                <div className="">
                  <h3 className="font-bold text-[#008e9b] mb-2 text-2xl ">
                    {dep?.name}
                  </h3>
                  <p>{dep?.description}</p>
                </div>

                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Departments;
