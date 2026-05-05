import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Trash2, Info, PlusCircle } from "lucide-react";
import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";

function Departments() {
  const { user } = useContext(AuthContext);
  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);

        const res = await fetch(apiConfig.getAllDepartments);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch departments");
        }

        const normalized = Array.isArray(data) ? data : [];

        setDepartments(normalized);

        if (normalized.length > 0) {
          setActiveTab(normalized[0]._id);
        }
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
    const result = await Swal.fire({
      icon: "question",
      title: "Delete department?",
      text: "Are you sure you want to delete this department? This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#06b6d4",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(apiConfig.deleteDepartment(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
      <section
        id="services"
        className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20"
      >
        <LoadingSpinner text="Loading departments..." compact />
      </section>
    );
  }

  return (
    <section
      id="services"
      className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b]">
            Services
          </div>

          <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
            Our <span className="text-[#008e9b]">Departments</span>
          </h2>

          <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-[#008e9b]" />

          <p className="mx-auto max-w-2xl text-lg font-medium text-gray-500 md:text-xl">
            Explore our specialized medical departments staffed with expert
            doctors dedicated to your health and well-being.
          </p>
        </div>

        {user?.role === "admin" && (
          <div className="mb-10 flex justify-center">
            <Link
              to="/add-department"
              className="inline-flex items-center gap-2 rounded-full !bg-[#008e9b] px-8 py-3.5 font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl"
            >
              <PlusCircle size={20} />
              <span>Add Department</span>
            </Link>
          </div>
        )}

        {departments.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <Info className="mx-auto mb-4 text-gray-300" size={48} />

            <p className="text-lg font-medium text-gray-500">
              No departments available at the moment.
            </p>

            {user?.role === "admin" && (
              <p className="mt-2 text-sm font-bold text-[#008e9b]">
                Please add departments via the Admin Dashboard.
              </p>
            )}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.10)] md:flex-row">
            {/* Tabs List */}
            <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50/70 md:w-72 md:border-b-0 md:border-r">
              <ul className="hide-scrollbar flex gap-2.5 overflow-x-auto p-3 md:flex-col md:p-6">
                {departments.map((dep) => (
                  <li key={dep._id} className="flex-shrink-0">
                    <button
                      onClick={() => handleTabClick(dep._id)}
                      className={`w-full whitespace-nowrap rounded-2xl px-6 py-4 text-left font-black transition-all duration-300 ${
                        activeTab === dep._id
                          ? "!bg-[#008e9b] text-white shadow-lg"
                          : "!bg-transparent text-gray-500 hover:!bg-white hover:text-[#008e9b] hover:shadow-md"
                      }`}
                    >
                      {dep?.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tab Content */}
            <div className="relative flex-1 bg-white p-8 md:p-12">
              {departments.map((dep) =>
                dep._id === activeTab ? (
                  <div key={dep._id} className="animate-fadeIn">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-3xl font-black text-gray-900 md:text-4xl">
                        {dep?.name}
                      </h3>

                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleDelete(dep._id)}
                          className="group inline-flex items-center justify-center gap-2 rounded-2xl !bg-red-50 px-4 py-2 font-black text-red-500 shadow-sm transition-all hover:!bg-red-500 hover:text-white"
                          title="Delete Department"
                        >
                          <Trash2
                            size={18}
                            className="transition-transform group-hover:scale-110"
                          />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      )}
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600">
                      <p className="whitespace-pre-line text-lg leading-relaxed">
                        {dep?.description}
                      </p>
                    </div>

                    <div className="mt-12 flex items-center gap-4 border-t border-gray-100 pt-8 text-[#008e9b]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008e9b]/10">
                        <PlusCircle size={20} />
                      </div>

                      <span className="font-black">
                        Fully equipped for specialized care
                      </span>
                    </div>
                  </div>
                ) : null,
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
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
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
