"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  UserProfile,
  getToken,
  clearToken,
  fetchProfile,
  login as apiLogin,
  register as apiRegister,
} from "@/lib/auth";
import AuthModal from "@/components/AuthModal";

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openAuthModal: (mode?: "login" | "register", onSuccess?: () => void) => void;
  closeAuthModal: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [onAuthSuccess, setOnAuthSuccess] = useState<(() => void) | null>(null);

  const openAuthModal = useCallback((mode: "login" | "register" = "login", onSuccess?: () => void) => {
    setAuthModalMode(mode);
    setOnAuthSuccess(() => onSuccess || null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setOnAuthSuccess(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchProfile();
      setUser(profile);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(email: string, password: string) {
    const result = await apiLogin(email, password);
    setUser(result.user);
  }

  async function register(email: string, password: string, fullName: string) {
    const result = await apiRegister(email, password, fullName);
    setUser(result.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
      {isAuthModalOpen && (
        <AuthModal
          mode={authModalMode}
          setMode={setMode => setAuthModalMode(setMode)}
          onClose={closeAuthModal}
          onSuccess={() => {
            if (onAuthSuccess) onAuthSuccess();
            closeAuthModal();
          }}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

