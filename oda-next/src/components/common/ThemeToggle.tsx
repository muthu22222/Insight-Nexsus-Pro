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
          ? 'bg-[#2B2521] border-[#3A322C] text-[#F5EFE7] hover:bg-[#38302A] hover:text-[#FFFFFF]'
          : 'bg-[#E5E1DC] border-[#D5CFC7] text-[#2B1B12] hover:bg-[#DCD6CF] hover:text-[#2B1B12] shadow-xs'
      } ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-[#2B1B12] transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
