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
        return 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 active:bg-gray-200/80 border-transparent';
      case 'floating':
        return 'bg-white/90 backdrop-blur-md text-gray-800 hover:text-gray-950 border-gray-200/80 shadow-md hover:shadow-lg hover:bg-white active:scale-95';
      case 'pill':
        return 'bg-gray-900 text-white hover:bg-gray-800 active:bg-black border-transparent rounded-full px-4';
      case 'outline':
        return 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100';
      case 'default':
      default:
        return 'bg-white text-gray-700 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 active:bg-gray-100 shadow-2xs hover:shadow-xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${getVariantStyles()} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-inherit" />
      <span>{label}</span>
    </button>
  );
}
