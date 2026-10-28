'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { firebaseResetPassword } from '@/lib/firebase-auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await firebaseResetPassword(email);
      setIsSent(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      let message = 'Failed to send reset link';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block group">
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Insight <span className="text-[#7C3AED] dark:text-[#A78BFA] font-extrabold group-hover:opacity-90 transition-opacity">Nexsus</span>
              </h1>
            </Link>
          </div>

          {isSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-[#E6F8F1] dark:bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0F9D78]/30">
                <CheckCircle className="w-8 h-8 text-[#0F9D78] dark:text-[#10B981]" />
              </div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Check your email</h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-semibold text-[var(--text-primary)]">{email}</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)] mb-6 font-medium">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => {
                  setIsSent(false);
                  setEmail('');
                }}
                className="w-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] py-2.5 rounded-xl font-bold text-sm hover:border-[#7C3AED] hover:bg-[#F0E7FF]/50 dark:hover:bg-[#7C3AED]/15 transition-all cursor-pointer"
              >
                Try another email
              </button>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Forgot password?</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  No worries, we&apos;ll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--text-muted)]" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                        error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-[var(--border)] focus:border-[#7C3AED]'
                      } bg-[var(--background)] text-[var(--text-primary)] text-sm placeholder-[var(--text-muted)] outline-none transition-all`}
                    />
                  </div>
                  {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-[#7C3AED]/25 hover:shadow-lg hover:shadow-[#7C3AED]/35 hover:scale-[1.01] active:scale-98 border border-[#7C3AED]/40 cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-sm text-[#6D28D9] dark:text-[#C4B5FD] hover:underline font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
