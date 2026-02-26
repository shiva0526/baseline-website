import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { login, logout } from "@/api/auth";

interface AuthContextType {
  user: { email: string; role: string } | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const loginTime = localStorage.getItem('loginTime');
        const twelveHours = 12 * 60 * 60 * 1000;

        if (storedUser && loginTime) {
          const timeElapsed = Date.now() - parseInt(loginTime);

          if (timeElapsed < twelveHours) {
            setUser(JSON.parse(storedUser));
          } else {
            // Session expired
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('loginTime');
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('loginTime');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const loginUser = async (email: string, password: string) => {
    const res = await login({ email, password });
    const userData = { email, role: res.role };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', res.access_token);
    localStorage.setItem('loginTime', Date.now().toString());
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loginTime');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loginUser, logoutUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
export default AuthContext;