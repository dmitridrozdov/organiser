"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type SessionUser = { id: Id<"users">; name: string; username: string };

type AuthContextValue = {
  user: SessionUser | null;
  token: string | null;
  ready: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "organiser.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginMutation = useMutation(api.auth.login);
  const logoutMutation = useMutation(api.auth.logout);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { token: string; user: SessionUser };
        setToken(parsed.token);
        setUser(parsed.user);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  async function login(username: string, password: string) {
    setError(null);
    try {
      const result = await loginMutation({ username, password });
      setToken(result.token);
      setUser(result.user);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Couldn't log in.";
      setError(message.replace(/^Uncaught Error:\s*/, ""));
      throw e;
    }
  }

  function logout() {
    if (token) void logoutMutation({ token });
    setToken(null);
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
