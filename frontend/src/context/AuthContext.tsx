import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginRequest, logoutRequest, registerRequest, type AuthUser } from "../api/auth";
import { apiClient, setAccessToken, setAuthCallbacks } from "../api/client";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthCallbacks({
      onTokenRefreshed: (newToken) => setToken(newToken),
      onAuthExpired: () => {
        setToken(null);
        setUser(null);
        setAccessToken(null);
      },
    });

    
    apiClient
      .post("/auth/refresh")
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setToken(res.data.accessToken);
        setUser(res.data.user);
      })
      .catch(() => {
        // no valid session — fine, user needs to log in
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken: token,
      loading,
      async login(email, password) {
        const res = await loginRequest(email, password);
        setAccessToken(res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
      },
      async register(email, password, name) {
        const res = await registerRequest(email, password, name);
        setAccessToken(res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
      },
      async logout() {
        await logoutRequest().catch(() => {});
        setAccessToken(null);
        setToken(null);
        setUser(null);
      },
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
