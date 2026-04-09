"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  confirmSignUp,
  type SignInInput,
} from "aws-amplify/auth";
import { configureAuth } from "./auth-config";

configureAuth();

type User = {
  userId: string;
  email: string;
  name: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
  confirm: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      const attrs = await fetchUserAttributes();
      setUser({
        userId: currentUser.userId,
        email: attrs.email || "",
        name: attrs.name || attrs.email || "",
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    await signIn({ username: email, password } as SignInInput);
    await fetchUser();
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await signUp({
      username: email,
      password,
      options: { userAttributes: { email, name } },
    });
    return { needsConfirmation: !result.isSignUpComplete };
  };

  const confirm = async (email: string, code: string) => {
    await confirmSignUp({ username: email, confirmationCode: code });
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, confirm, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
