import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../api/client";

export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type Platform = "AWS" | "AZURE" | "DATABASE" | "AUTOMATION" | "FRONTEND" | "BACKEND";
export type Level = "L1" | "L2" | "L3";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  platform: Platform | null;
  level: Level | null;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): User | null {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser());
  const [isLoading, setIsLoading] = useState(false);

  async function login(email: string, password: string): Promise<User> {
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data.user as User;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
