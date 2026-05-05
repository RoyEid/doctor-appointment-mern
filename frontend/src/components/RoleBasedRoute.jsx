import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AuthRequired from "./AuthRequired";
import LoadingSpinner from "./LoadingSpinner";
import { AlertTriangle } from "lucide-react";

function RoleBasedRoute({ element, requiredRole }) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff]">
        <LoadingSpinner text="Checking your access..." fullScreen />
      </main>
    );
  }

  if (!user) {
    return <AuthRequired />;
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.role)) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-gradient-to-br from-[#f4fbfc] via-white to-[#eefcff] px-4 py-10">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white bg-white/95 p-8 text-center shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="absolute left-8 right-8 top-0 h-1 rounded-b-full bg-gradient-to-r from-red-500 via-orange-400 to-red-500" />

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-sm">
            <AlertTriangle size={34} />
          </div>

          <div className="mb-3 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-500">
            Access Denied
          </div>

          <h2 className="text-2xl font-black text-gray-900">
            You do not have permission
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed text-gray-500">
            This page is only available for{" "}
            <span className="font-black text-gray-700">{roles.join(", ")}</span>{" "}
            accounts.
          </p>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
            Your current role:{" "}
            <span className="font-black uppercase text-[#008e9b]">
              {user.role}
            </span>
          </div>
        </div>
      </main>
    );
  }

  return element;
}

export default RoleBasedRoute;
