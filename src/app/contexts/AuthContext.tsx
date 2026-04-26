import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  fullName: string;
  email: string;
  role: string;
  officerPosition?: string;
  idNumber?: string;
  profileImage?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize the state directly from localStorage if it exists
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("sEEync_currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("sEEync_currentUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sEEync_currentUser");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};