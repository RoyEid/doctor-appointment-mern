import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    if (token && userData) {
      try {
        const decode = jwtDecode(token);
        const parsedUserData = JSON.parse(userData);
        setUser({ ...decode, ...parsedUserData });
      } catch (err) {
        console.error("Failed to decode token or user data:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token, userData = null) => {
    localStorage.setItem("token", token);
    const decode = jwtDecode(token);

    // If userData is provided (from server response), store and merge it
    const mergedUser = userData ? { ...decode, ...userData } : decode;

    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }

    setUser(mergedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
