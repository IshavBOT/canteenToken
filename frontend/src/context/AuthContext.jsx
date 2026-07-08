import { createContext, useContext, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const employeeId = localStorage.getItem("employee_id");
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    return token ? { token, employeeId, name, role } : null;
  });

  function persist(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("employee_id", data.employee_id);
    localStorage.setItem("name", data.name);
    localStorage.setItem("role", data.role);
    setAuth({ token: data.token, employeeId: data.employee_id, name: data.name, role: data.role });
  }

  async function login(employeeId, mobile) {
    const res = await api.post("/auth/login", { employee_id: employeeId, mobile });
    persist(res.data);
  }

  async function signup(employeeId, name, mobile) {
    const res = await api.post("/auth/signup", { employee_id: employeeId, name, mobile });
    persist(res.data);
  }

  function logout() {
    localStorage.clear();
    setAuth(null);
  }

  return <AuthContext.Provider value={{ auth, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
