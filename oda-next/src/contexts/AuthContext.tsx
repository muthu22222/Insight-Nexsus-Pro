'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  onAuthChange,
  getIdToken,
  firebaseLogout,
  type FirebaseUser,
} from '@/lib/firebase-auth';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  preferences?: {
    favoriteStyles: string[];
    defaultBudget: number;
    preferredColors: string[];
  };
  createdAt?: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  getToken: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
});

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setUserData(data.data);
        }
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    });

    if (!user && !isPublicRoute) {
      router.push('/auth/login');
    }
  }, [user, loading, pathname, router]);

  const getToken = async () => {
    if (!user) return null;
    return user.getIdToken(true);
  };

  const logout = async () => {
    await firebaseLogout();
    setUser(null);
    setUserData(null);
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  const refreshUser = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, getToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
