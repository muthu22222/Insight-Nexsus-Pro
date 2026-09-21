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
        return 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F3F5] active:bg-[#E2E8F0] border-transparent';
      case 'floating':
        return 'bg-white/90 backdrop-blur-xl text-[#0F172A] hover:text-[#0F172A] border-[#E2E8F0] shadow-md hover:bg-[#F8F9FA] active:scale-95';
      case 'pill':
        return 'bg-[#F1F3F5] text-[#0F172A] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] border-[#E2E8F0] rounded-full px-4';
      case 'outline':
        return 'bg-transparent border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F3F5] hover:border-[#CBD5E1] hover:text-[#0F172A] active:bg-[#E2E8F0]';
      case 'default':
      default:
        return 'bg-[#F1F3F5] text-[#0F172A] hover:text-[#0F172A] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] shadow-2xs hover:shadow-xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 ${getVariantStyles()} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-inherit" />
      <span>{label}</span>
    </button>
  );
}
