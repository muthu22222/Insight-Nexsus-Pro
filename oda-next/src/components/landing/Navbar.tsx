"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/common/ThemeToggle";

const navLinks = [
  { label: "Home", href: "/#hero" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "AI Designer", href: "/designer" },
  { label: "Explore", href: "/#testimonials" },
  { label: "Furniture", href: "/furniture" },
  { label: "Stores", href: "/stores" },
  { label: "About", href: "/#footer" },
];

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm"
          : "bg-white/80 backdrop-blur-xs border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-xl md:text-2xl font-bold tracking-tight">
            <span className="text-[#0F172A]">Insight</span>
            <span className="text-[#64748B]">Nexsus</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#64748B] hover:text-[#0F172A] transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-1.5 shadow-sm border border-[#0F172A]"
              >
                Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-[#0F172A] hover:text-[#334155] transition-colors duration-200 px-4 py-2 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold bg-[#0F172A] hover:bg-[#1E293B] text-white px-5 py-2.5 rounded-lg transition-colors duration-200 shadow-sm border border-[#0F172A]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger & ThemeToggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-[#0F172A] p-2 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white border-t border-[#E2E8F0] shadow-xl overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-[#64748B] hover:text-[#0F172A] transition-colors duration-200 py-2 font-medium"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 border border-[#0F172A]"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center text-[#0F172A] hover:text-[#334155] py-2.5 border border-[#E2E8F0] rounded-lg transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="block text-center bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 border border-[#0F172A]"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
