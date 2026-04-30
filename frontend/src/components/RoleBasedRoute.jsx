import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AuthRequired from "./AuthRequired";

/**
 * RoleBasedRoute component for protecting routes
 * @param {React.Component} element - The component to render if authorized
 * @param {string|string[]} requiredRole - The role(s) required to access this route
 * @returns {React.Component} - Either the protected component, login page, or access denied
 */
function RoleBasedRoute({ element, requiredRole }) {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthRequired />;
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white shadow-xl rounded-2xl p-6 text-center max-w-md w-full border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0 0a9 9 0 110-18 9 9 0 010 18z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Your role is:{" "}
            <strong>{user.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return element;
}

export default RoleBasedRoute;
