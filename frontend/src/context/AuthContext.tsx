import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  adminKey: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (name: string, phone: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("bc_user");
    const key = localStorage.getItem("bc_admin_key");
    if (raw) setUser(JSON.parse(raw));
    if (key) setAdminKey(key);
    setLoading(false);
  }, []);

  const persist = (token: string, u: User, key?: string) => {
    localStorage.setItem("bc_token", token);
    localStorage.setItem("bc_user", JSON.stringify(u));
    if (key) localStorage.setItem("bc_admin_key", key);
    else localStorage.removeItem("bc_admin_key");
    setUser(u);
    setAdminKey(key || null);
  };

  const login = async (phone: string, password: string) => {
    const { data } = await api.post("/auth/login", { phone, password });
    persist(data.token, data.user, data.adminKey);
    return data.user as User;
  };

  const register = async (name: string, phone: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, phone, password });
    persist(data.token, data.user);
    return data.user as User;
  };

  const logout = () => {
    localStorage.removeItem("bc_token");
    localStorage.removeItem("bc_user");
    localStorage.removeItem("bc_admin_key");
    setUser(null);
    setAdminKey(null);
  };

  return (
    <AuthContext.Provider value={{ user, adminKey, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}
