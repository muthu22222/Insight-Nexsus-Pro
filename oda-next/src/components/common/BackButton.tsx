'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export interface BackButtonProps {
  /**
   * Explicit route to navigate back to.
   * If provided, router.push(fallbackHref) is used.
   * If not provided, window.history.back() or router.push('/dashboard') is used.
   */
  fallbackHref?: string;
  /**
   * Optional custom button label (default: "Back")
   */
  label?: string;
  /**
   * Visual style variant
   */
  variant?: 'default' | 'subtle' | 'floating' | 'outline' | 'pill';
  /**
   * Additional custom CSS classes
   */
  className?: string;
  /**
   * Custom click handler executed before navigation
   */
  onClick?: () => void;
  /**
   * Accessible aria-label
   */
  ariaLabel?: string;
}

export default function BackButton({
  fallbackHref = '/dashboard',
  label = 'Back to Dashboard',
  variant = 'default',
  className = '',
  onClick,
  ariaLabel = 'Go back to dashboard',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    if (fallbackHref) {
      router.push(fallbackHref);
    } else {
      // Use browser history if available
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/dashboard');
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] active:bg-[var(--border)] border-transparent';
      case 'floating':
        return 'bg-[var(--surface)]/95 backdrop-blur-xl text-[var(--text-primary)] border-[var(--border)] shadow-md hover:bg-[var(--surface-secondary)] active:scale-95';
      case 'pill':
        return 'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] border-[var(--border)] rounded-full px-4';
      case 'outline':
        return 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)] active:bg-[var(--surface-secondary)]';
      case 'default':
      default:
        return 'bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]/80 shadow-2xs hover:shadow-xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${getVariantStyles()} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-inherit" />
      <span>{label}</span>
    </button>
  );
}
