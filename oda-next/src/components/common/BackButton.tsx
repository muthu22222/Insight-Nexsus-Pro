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
        return 'text-[#CDBFB2] hover:text-[#F5EFE7] hover:bg-[#8F5F4A]/15 active:bg-[#8F5F4A]/25 border-transparent';
      case 'floating':
        return 'bg-[#22150E]/90 backdrop-blur-xl text-[#F5EFE7] hover:text-[#C9A66B] border-[#D8C3A5]/25 shadow-xl hover:bg-[#2B1B12] active:scale-95';
      case 'pill':
        return 'bg-[#8F5F4A]/20 text-[#D8C3A5] hover:bg-[#8F5F4A]/35 active:bg-[#8F5F4A]/50 border-[#C9A66B]/30 rounded-full px-4';
      case 'outline':
        return 'bg-transparent border-[#D8C3A5]/30 text-[#CDBFB2] hover:bg-[#8F5F4A]/20 hover:border-[#C9A66B]/40 hover:text-[#F5EFE7] active:bg-[#8F5F4A]/30';
      case 'default':
      default:
        return 'bg-[#37241A]/70 text-[#CDBFB2] hover:text-[#F5EFE7] border-[#D8C3A5]/20 hover:border-[#C9A66B]/40 hover:bg-[#37241A] active:bg-[#3E291E] shadow-2xs hover:shadow-xs';
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer select-none group focus:outline-none focus:ring-2 focus:ring-[#8F5F4A]/40 ${getVariantStyles()} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-inherit" />
      <span>{label}</span>
    </button>
  );
}
