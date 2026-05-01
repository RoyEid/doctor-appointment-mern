import api from "./api";
import jwtDecode from "jwt-decode";

const AUTH_PREFIXES = [
  "/api/auth", // preferred
  "/user"      // legacy compatibility
];

const tryPost = async (paths, segment, payload) => {
  for (const base of paths) {
    try {
      const { data } = await api.post(`${base}/${segment}`, payload);
      return data;
    } catch (e) {
      // try next path
    }
  }
  throw new Error("Auth request failed on all known endpoints");
};

export const register = async (payload) => {
  const data = await tryPost(AUTH_PREFIXES, "register", payload);
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
};

export const login = async (payload) => {
  const data = await tryPost(AUTH_PREFIXES, "login", payload).catch(async () => {
    // legacy fallback: /user/signin
    const { data } = await api.post(`/user/signin`, payload);
    return data;
  });
  if (data?.token) localStorage.setItem("token", data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = jwtDecode(token);
    return {
      id: payload.id,
      role: payload.role
    };
  } catch {
    return null;
  }
};
