'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import {
  firebaseEmailRegister,
  firebaseGoogleLogin,
} from '@/lib/firebase-auth';
import { useAuth } from '@/contexts/AuthContext';
import BackButton from '@/components/common/BackButton';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Must include uppercase, lowercase, and number';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const firebaseUser = await firebaseEmailRegister(email, password, name.trim());

      // Sync user to MongoDB
      const token = await firebaseUser.getIdToken();
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email,
        }),
      });

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      let message = 'Registration failed';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const firebaseUser = await firebaseGoogleLogin();

      // Sync user to MongoDB
      const token = await firebaseUser.getIdToken();
      await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email,
        }),
      });

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast.error('Domain not authorized in Firebase. Add your Vercel URL to Firebase Console > Auth > Settings > Authorized domains.', { duration: 6000 });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(error.message || 'Google sign-up failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-4">
          <BackButton fallbackHref="/auth/login" label="Back to Login" variant="subtle" />
        </div>
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Insight <span className="text-[#C9A66B]">Nexsus</span>
              </h1>
            </Link>
            <p className="text-[var(--text-secondary)] mt-2 text-sm">Create your account to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError('name');
                  }}
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--text-primary)]'
                  } bg-[var(--background)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none transition-all`}
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                    errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--text-primary)]'
                  } bg-[var(--background)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none transition-all`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError('password');
                  }}
                  placeholder="Min. 8 characters"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                    errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[var(--text-primary)]'
                  } bg-[var(--background)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError('confirmPassword');
                  }}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-[var(--border)] focus:border-[var(--text-primary)]'
                  } bg-[var(--background)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2B1B12] text-white py-2.5 rounded-lg font-bold text-sm hover:bg-[#433328] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-md shadow-[#2B1B12]/20 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--surface)] px-3 text-[var(--text-muted)]">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] py-2.5 rounded-lg font-bold text-sm hover:border-[var(--text-primary)] transition-colors disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>

          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[var(--text-primary)] hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
