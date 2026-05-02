import { useEffect, useState, useContext } from "react";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Trash2, Info, PlusCircle } from "lucide-react";


function Departments() {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(apiConfig.getAllDepartments);
        const data = await res.json();
        setDepartments(data);
        if (data.length > 0) setActiveTab(data[0]._id);
      } catch (err) {
        console.error("Failed to fetch departments", err);
        toast.error("Could not load departments");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleTabClick = (id) => {
    setActiveTab(id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(apiConfig.deleteDepartment(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "Department deleted successfully");
        const updatedDeps = departments.filter((d) => d._id !== id);
        setDepartments(updatedDeps);
        
        if (activeTab === id) {
          setActiveTab(updatedDeps.length > 0 ? updatedDeps[0]._id : null);
        }
      } else {
        toast.error(data.message || "Failed to delete department");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error deleting department");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-[#008e9b] border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 font-medium">Loading departments...</p>
      </div>
    );
  }

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-gray-800 tracking-tight">Our <span className="text-[#008e9b]">Departments</span></h2>
          <div className="w-24 h-1.5 bg-[#008e9b] mx-auto mb-6 rounded-full"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl">
            Explore our specialized medical departments staffed with expert
            doctors dedicated to your health and well-being.
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
            <Info className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No departments available at the moment.</p>
            {user?.role === "admin" && (
              <p className="text-sm mt-2 text-[#008e9b] font-medium">Please add departments via the Admin Dashboard.</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[400px]">
            {/* Tabs List */}
            <div className="md:w-72 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 flex-shrink-0">
              <ul className="flex flex-row overflow-x-auto md:flex-col hide-scrollbar p-3 md:p-6 gap-2.5">
                {departments.map((dep) => (
                  <li key={dep._id} className="flex-shrink-0">
                    <button
                      onClick={() => handleTabClick(dep._id)}
                      className={`w-full text-left font-bold px-6 py-4 rounded-2xl whitespace-nowrap transition-all duration-300 transform ${
                        activeTab === dep._id
                          ? "bg-[#008e9b] text-white shadow-lg -translate-y-0.5"
                          : "text-gray-500 hover:bg-white hover:text-[#008e9b] hover:shadow-md"
                      }`}
                    >
                      {dep?.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-8 md:p-12 bg-white relative">
              {departments.map((dep) =>
                dep._id === activeTab ? (
                  <div key={dep._id} className="animate-fadeIn">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="font-black text-gray-800 text-3xl md:text-4xl">
                        {dep?.name}
                      </h3>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDelete(dep._id)}
                          className="flex items-center gap-2 bg-red-50 text-red-500 font-bold px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                          title="Delete Department"
                        >
                          <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>
                    <div className="prose prose-lg text-gray-600 max-w-none">
                      <p className="leading-relaxed whitespace-pre-line text-lg">
                        {dep?.description}
                      </p>
                    </div>
                    
                    <div className="mt-12 pt-8 border-t border-gray-50 flex items-center gap-4 text-[#008e9b]">
                      <div className="w-10 h-10 rounded-full bg-[#008e9b]/10 flex items-center justify-center">
                        <PlusCircle size={20} />
                      </div>
                      <span className="font-bold">Fully equipped for specialized care</span>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

export default Departments;
