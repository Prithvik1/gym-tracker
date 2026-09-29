import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError, type User } from './api';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
  setTrainingLevel: (level: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api.token = token;
    api
      .getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        api.token = null;
      })
      .finally(() => setLoading(false));
  }, []);

  function persist(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    api.token = token;
    setUser(user);
    return user;
  }

  async function login(email: string, password: string) {
    const result = await api.login(email, password);
    return persist(result.access_token, result.user);
  }

  async function signup(email: string, password: string, name: string) {
    const result = await api.signup(email, password, name);
    return persist(result.access_token, result.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    api.token = null;
    setUser(null);
  }

  async function setTrainingLevel(level: string) {
    const updated = await api.setTrainingLevel(level);
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setTrainingLevel }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : 'Something went wrong';
}
