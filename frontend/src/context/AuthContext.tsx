import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

interface AuthUser {
  id: number;
  role: "staff" | "student";
  display_name?: string;
  name_en?: string;
  name_kh?: string;
  email: string;
  username?: string;
  student_id?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (identifier: string, password: string, role: "staff" | "student") => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("setec-token");
    const savedUser  = localStorage.getItem("setec-user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string, role: "staff" | "student") => {
    const endpoint = role === "staff"
      ? "http://localhost:5000/api/auth/staff/login"
      : "http://localhost:5000/api/auth/student/login";

    const { data } = await axios.post(endpoint, { identifier, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("setec-token", data.token);
    localStorage.setItem("setec-user", JSON.stringify(data.user));
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("setec-token");
    localStorage.removeItem("setec-user");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
