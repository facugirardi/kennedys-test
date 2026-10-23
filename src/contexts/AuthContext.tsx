'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth';
import { login as apiLogin, googleLogin as apiGoogleLogin, agentLogin as apiAgentLogin } from '@/lib/api/auth';
import { setAuthToken, clearAuthToken } from '@/lib/api/fetcher';

const STORAGE_TOKEN_KEY = 'authToken';
const STORAGE_USER_KEY = 'authUser';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const safeParseUser = (raw: string | null): User | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch (error) {
    console.warn('Failed to parse stored user payload:', error);
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  /** True only until we read localStorage once. Must not toggle during `login()` or the app unmounts and form state (e.g. login step) resets. */
  const [initializing, setInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_TOKEN_KEY) : null;
        const storedUser = typeof window !== 'undefined' ? safeParseUser(localStorage.getItem(STORAGE_USER_KEY)) : null;

        if (storedToken && !isTokenExpired(storedToken)) {
          setAuthToken(storedToken);
          setToken(storedToken);
        } else if (storedToken) {
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
          clearAuthToken();
        }

        if (storedUser && storedToken && !isTokenExpired(storedToken)) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Error initializing auth state:', err);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_TOKEN_KEY);
          localStorage.removeItem(STORAGE_USER_KEY);
        }
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const persistAuthState = (nextToken: string | null, nextUser: User | null) => {
    if (typeof window === 'undefined') {
      return;
    }

    if (nextToken) {
      localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
    } else {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }

    if (nextUser) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);

    try {
      const response = await apiLogin(email, password);

      if (!response?.success || !response?.data?.token) {
        throw new Error(response?.message || 'Authentication failed');
      }

      const { token: receivedToken, user: receivedUser } = response.data;
      if (!receivedToken) {
        throw new Error('Authentication token missing in server response');
      }

      const normalizedUser: User = {
        id: receivedUser?.id ?? '',
        email: receivedUser?.email ?? email,
        verified: receivedUser?.verified,
        role: receivedUser?.role,
        firstName: receivedUser?.firstName,
        lastName: receivedUser?.lastName,
        phoneNumber: receivedUser?.phoneNumber,
        profilePicture: receivedUser?.profilePicture,
      };

      setAuthToken(receivedToken);
      setToken(receivedToken);
      setUser(normalizedUser);
      persistAuthState(receivedToken, normalizedUser);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      const errorMessage =
        apiMessage || (err instanceof Error ? err.message : 'Error al iniciar sesión');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginWithGoogle = async (accessToken: string) => {
    setError(null);
    try {
      const response = await apiGoogleLogin(accessToken);
      if (!response?.success || !response?.data?.token) {
        throw new Error(response?.message || 'Google authentication failed');
      }
      const { token: receivedToken, user: receivedUser } = response.data;
      const normalizedUser: User = {
        id: receivedUser?.id ?? '',
        email: receivedUser?.email ?? '',
        verified: receivedUser?.verified,
        role: receivedUser?.role,
        firstName: receivedUser?.firstName,
        lastName: receivedUser?.lastName,
        phoneNumber: receivedUser?.phoneNumber,
        profilePicture: receivedUser?.profilePicture,
      };
      setAuthToken(receivedToken);
      setToken(receivedToken);
      setUser(normalizedUser);
      persistAuthState(receivedToken, normalizedUser);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      const errorMessage = apiMessage || (err instanceof Error ? err.message : 'Google login failed');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const loginAgent = async (email: string, password: string) => {
    setError(null);

    try {
      const response = await apiAgentLogin(email, password);

      if (!response?.success || !response?.data?.token) {
        throw new Error(response?.message || 'Authentication failed');
      }

      const { token: receivedToken, account: receivedAccount } = response.data as { token: string; account?: any };
      if (!receivedToken) {
        throw new Error('Authentication token missing in server response');
      }

      // AgentPortfolioAccount has no `role` — this is a separate table/system from `User` (see
      // kennedys-api's agentPortfolioAuthService.ts). isAgentPortfolioAccount is synthesized here,
      // client-side only, purely so the existing /agent-portfolio/*.tsx gates have something to check.
      const normalizedUser: User = {
        id: receivedAccount?.id ?? '',
        email: receivedAccount?.email ?? email,
        verified: receivedAccount?.verified,
        isAgentPortfolioAccount: true,
        firstName: receivedAccount?.firstName,
        lastName: receivedAccount?.lastName,
        phoneNumber: receivedAccount?.phoneNumber,
      };

      setAuthToken(receivedToken);
      setToken(receivedToken);
      setUser(normalizedUser);
      persistAuthState(receivedToken, normalizedUser);
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message;
      const errorMessage =
        apiMessage || (err instanceof Error ? err.message : 'Error al iniciar sesión');
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    persistAuthState(null, null);
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const refreshUser = (nextUser: User | null) => {
    setUser(nextUser);
    persistAuthState(token, nextUser);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    loginWithGoogle,
    loginAgent,
    logout,
    refreshUser,
    loading: initializing,
    error,
  };

  // Siempre renderizar children: ocultarlos durante `initializing` dejaba el
  // HTML de SSR vacío (sin H1, sin links, sin meta por página) y rompía el SEO
  // de todo el sitio. Los consumidores que dependan del estado de auth deben
  // usar `loading` del contexto.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
