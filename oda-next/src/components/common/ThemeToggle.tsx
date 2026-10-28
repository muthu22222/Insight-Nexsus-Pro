'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center cursor-pointer ${
        theme === 'dark'
          ? 'bg-[#2C233D] border-[#3B3050] text-[#FAF8F5] hover:bg-[#382C4E] hover:text-[#A78BFA] hover:border-[#A78BFA]/50 shadow-sm'
          : 'bg-[#FFFFFF] border-[#E8E1ED] text-[#211A23] hover:bg-[#F0E7FF] hover:text-[#7C3AED] hover:border-[#7C3AED]/50 shadow-xs'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-[#7C3AED] transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
