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
        return 'text-gray-400 hover:text-white hover:bg-white/10 active:bg-white/15 border-transparent';
      case 'floating':
        return 'bg-[#1c1309]/90 backdrop-blur-xl text-[#FAF6F0] hover:text-[#E1D4C2] border-[#523A25] shadow-xl hover:bg-[#20160B] active:scale-95';
      case 'pill':
        return 'bg-[#6E473B]/20 text-[#E1D4C2] hover:bg-[#6E473B]/35 active:bg-[#6E473B]/50 border-[#A78D78]/30 rounded-full px-4';
      case 'outline':
        return 'bg-transparent border-[#523A25] text-[#BEB5A9] hover:bg-[#6E473B]/20 hover:border-[#A78D78]/40 hover:text-[#FAF6F0] active:bg-[#6E473B]/30';
      case 'default':
      default:
        return 'bg-[#362413]/70 text-[#BEB5A9] hover:text-[#FAF6F0] border-[#523A25] hover:border-[#A78D78]/40 hover:bg-[#362413] active:bg-[#452F19] shadow-2xs hover:shadow-xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-[#6E473B]/40 ${getVariantStyles()} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-inherit" />
      <span>{label}</span>
    </button>
  );
}
