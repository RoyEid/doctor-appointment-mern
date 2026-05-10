import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { apiConfig } from "../config/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  Trash2,
  Info,
  PlusCircle,
  Edit,
  X,
  Save,
  Building2,
  FileText,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import LoadingSpinner from "./LoadingSpinner";

function Departments() {
  const { user } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setEditName(department?.name || "");
    setEditDescription(department?.description || "");
  };

  const closeEditModal = () => {
    if (savingEdit) return;

    setEditingDepartment(null);
    setEditName("");
    setEditDescription("");
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();

    if (!editingDepartment || savingEdit) return;

    const cleanName = editName.trim();
    const cleanDescription = editDescription.trim();

    if (!cleanName || !cleanDescription) {
      toast.error("Department name and description are required");
      return;
    }

    try {
      setSavingEdit(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await fetch(
        apiConfig.updateDepartment(editingDepartment._id),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: cleanName,
            description: cleanDescription,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update department");
      }

      const updatedDepartment = data.department;

      setDepartments((prevDepartments) =>
        prevDepartments.map((department) =>
          department._id === updatedDepartment._id
            ? updatedDepartment
            : department,
        ),
      );

      setActiveTab(updatedDepartment._id);
      toast.success(data.message || "Department updated successfully");
      closeEditModal();
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error(error.message || "Network error updating department");
    } finally {
      setSavingEdit(false);
    }
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
        className="bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
      >
        <LoadingSpinner text="Loading departments..." compact />
      </section>
    );
  }

  return (
    <section
      id="services"
      className="relative w-full max-w-full overflow-hidden bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] py-20 dark:from-[#071416] dark:via-[#0b1d20] dark:to-[#102b30]"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
            Services
          </div>

          <h2 className="mb-4 text-3xl font-black tracking-tight text-gray-900 md:text-5xl dark:text-white">
            Our <span className="text-[#008e9b] dark:text-[#46daea]">Departments</span>
          </h2>

          <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-[#008e9b] dark:bg-[#46daea]" />

          <p className="mx-auto max-w-2xl text-lg font-medium text-gray-500 md:text-xl dark:text-slate-400">
            Explore our specialized medical departments staffed with expert
            doctors dedicated to your health and well-being.
          </p>
        </div>

        {user?.role === "admin" && (
          <div className="mb-10 flex justify-center">
            <Link
              to="/add-department"
              className="inline-flex items-center gap-2 rounded-full !bg-[#008e9b] px-8 py-3.5 font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
            >
              <PlusCircle size={20} />
              <span>Add Department</span>
            </Link>
          </div>
        )}

        {departments.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white p-12 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <Info className="mx-auto mb-4 text-gray-300 dark:text-slate-500" size={48} />

            <p className="text-lg font-medium text-gray-500 dark:text-slate-400">
              No departments available at the moment.
            </p>

            {user?.role === "admin" && (
              <p className="mt-2 text-sm font-bold text-[#008e9b] dark:text-[#46daea]">
                Please add departments via the Admin Dashboard.
              </p>
            )}
          </div>
        ) : (
          <div className="flex min-h-[400px] flex-col overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.10)] md:flex-row dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
            <div className="flex-shrink-0 border-b border-gray-100 bg-gray-50/70 md:w-72 md:border-b-0 md:border-r dark:border-[#1f3a40] dark:bg-[#071416]/70">
              <ul className="hide-scrollbar flex gap-2.5 overflow-x-auto p-3 md:flex-col md:p-6">
                {departments.map((dep) => (
                  <li key={dep._id} className="flex-shrink-0">
                    <button
                      onClick={() => handleTabClick(dep._id)}
                      className={`w-full whitespace-nowrap rounded-2xl px-6 py-4 text-left font-black transition-all duration-300 ${
                        activeTab === dep._id
                          ? "!bg-[#008e9b] text-white shadow-lg dark:!bg-[#46daea] dark:text-[#071416]"
                          : "!bg-transparent text-gray-500 hover:!bg-white hover:text-[#008e9b] hover:shadow-md dark:text-slate-400 dark:hover:!bg-[#1f3a40] dark:hover:text-[#46daea]"
                      }`}
                    >
                      {dep?.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex-1 bg-white p-8 md:p-12 dark:bg-[#0f2428]">
              {departments.map((dep) =>
                dep._id === activeTab ? (
                  <div key={dep._id} className="animate-fadeIn">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-3xl font-black text-gray-900 md:text-4xl dark:text-white">
                        {dep?.name}
                      </h3>

                      {user?.role === "admin" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => openEditModal(dep)}
                            className="group inline-flex items-center justify-center gap-2 rounded-2xl !bg-blue-50 px-4 py-2 font-black text-blue-500 shadow-sm transition-all hover:!bg-blue-500 hover:text-white dark:!bg-blue-500/10 dark:text-blue-300 dark:hover:!bg-blue-500 dark:hover:text-white"
                            title="Edit Department"
                          >
                            <Edit
                              size={18}
                              className="transition-transform group-hover:scale-110"
                            />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(dep._id)}
                            className="group inline-flex items-center justify-center gap-2 rounded-2xl !bg-red-50 px-4 py-2 font-black text-red-500 shadow-sm transition-all hover:!bg-red-500 hover:text-white dark:!bg-red-500/10 dark:text-red-300 dark:hover:!bg-red-500 dark:hover:text-white"
                            title="Delete Department"
                          >
                            <Trash2
                              size={18}
                              className="transition-transform group-hover:scale-110"
                            />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-600 dark:text-slate-300">
                      <p className="whitespace-pre-line text-lg leading-relaxed">
                        {dep?.description}
                      </p>
                    </div>

                    <div className="mt-12 flex items-center gap-4 border-t border-gray-100 pt-8 text-[#008e9b] dark:border-[#1f3a40] dark:text-[#46daea]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#008e9b]/10 dark:bg-[#46daea]/15">
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

      {editingDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8 dark:border-[#1f3a40] dark:bg-[#0f2428] dark:shadow-[0_30px_90px_rgba(0,0,0,0.5)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-full bg-[#e8fbfd] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#008e9b] dark:bg-[#46daea]/15 dark:text-[#46daea]">
                  Admin Edit
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                  Edit Department
                </h3>

                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                  Update the department name and description.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={savingEdit}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl !bg-gray-50 text-gray-500 transition-all hover:!bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:!bg-[#1f3a40] dark:text-slate-400 dark:hover:!bg-red-500/15 dark:hover:text-red-300"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                  Department Name
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#008e9b] dark:text-[#46daea]"
                  />

                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416] dark:focus:ring-[#46daea]"
                    disabled={savingEdit}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-bold text-gray-700 dark:text-slate-200">
                  Description
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-[#008e9b] dark:text-[#46daea]"
                  />

                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-4 text-sm font-semibold text-gray-800 outline-none transition-all disabled:cursor-not-allowed disabled:opacity-70 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-[#008e9b] dark:border-[#1f3a40] dark:bg-[#071416] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#071416] dark:focus:ring-[#46daea]"
                    disabled={savingEdit}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-[0.8fr_1.2fr]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-200 !bg-white px-5 py-4 text-sm font-black text-gray-600 !shadow-none transition-all hover:!bg-gray-50 hover:text-[#008e9b] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#1f3a40] dark:!bg-[#071416] dark:text-slate-300 dark:hover:!bg-[#1f3a40] dark:hover:text-[#46daea]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black text-white shadow-lg transition-all duration-300 ${
                    savingEdit
                      ? "cursor-not-allowed !bg-gray-400 opacity-80"
                      : "!bg-[#008e9b] hover:-translate-y-0.5 hover:!bg-[#007a85] hover:shadow-xl dark:!bg-[#46daea] dark:text-[#071416] dark:hover:!bg-[#7ee9f2]"
                  }`}
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
