"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wand2,
  FolderOpen,
  Sofa,
  Calculator,
  MapPin,
  MessageSquare,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { ThemeToggle } from "@/components/common/ThemeToggle";

interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Designer", href: "/designer", icon: Wand2 },
  { label: "My Projects", href: "/dashboard/projects", icon: FolderOpen },
  { label: "Furniture", href: "/furniture", icon: Sofa },
  { label: "Budget Planner", href: "/budget", icon: Calculator },
  { label: "Nearby Stores", href: "/stores", icon: MapPin },
  { label: "AI Assistant", href: "#", icon: MessageSquare, isAction: true },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { userData, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    if (userData) {
      setUser({ name: userData.name, email: userData.email, avatar: userData.avatar });
    }
  }, [userData]);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Renders the sidebar navigation content
  const renderNav = (collapsed: boolean, isMobile = false) => (
    <div className="flex h-full w-full flex-col bg-[var(--surface)] text-[var(--text-primary)]">
      {/* Sidebar Header */}
      <div
        className={`flex items-center border-b border-[var(--border)] min-h-[64px] transition-all duration-300 ${
          collapsed ? "justify-center px-2 py-3" : "justify-between px-4 py-4"
        }`}
      >
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
              <div className="h-9 w-9 rounded-xl bg-[#2B1B12] dark:bg-white border border-[var(--border)] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <span className="text-white dark:text-[#141210] font-black text-xs tracking-wider">IN</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight whitespace-nowrap">
                Insight <span className="text-[var(--text-muted)]">Nexsus</span>
              </span>
            </Link>

            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
              aria-label="Collapse sidebar"
              title="Collapse sidebar (‹)"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>

            {isMobile && (
              <button
                type="button"
                onClick={onMobileClose}
                className="lg:hidden h-8 w-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-2 py-1">
            <button
              type="button"
              onClick={toggleSidebar}
              className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Expand sidebar"
              title="Expand sidebar (›)"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center justify-center group"
              title="Insight Nexsus"
            >
              <div className="h-8 w-8 rounded-xl bg-[#2B1B12] dark:bg-white border border-[var(--border)] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <span className="text-white dark:text-[#141210] font-black text-[11px] tracking-wider">IN</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 py-3 space-y-1.5 overflow-y-auto overflow-x-hidden ${collapsed ? "px-2" : "px-3"}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isAction ? false : isActive(item.href);

          if (item.isAction) {
            return (
              <div key={item.label} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    document.dispatchEvent(new CustomEvent("toggle-ai-assistant"));
                    onMobileClose?.();
                  }}
                  className={`flex items-center rounded-xl text-sm font-semibold transition-all hover:bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer ${
                    collapsed
                      ? "h-11 w-11 mx-auto justify-center p-0"
                      : "w-full gap-3 px-3 py-2.5"
                  }`}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>

                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50">
                    <div className="bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--border)] whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.label} className="relative group">
              <Link
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center rounded-xl text-sm transition-all ${
                  collapsed
                    ? "h-11 w-11 mx-auto justify-center p-0"
                    : "gap-3 px-3 py-2.5"
                } ${
                  active
                    ? "bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] font-bold shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border border-transparent font-medium"
                }`}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    active ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                  } transition-colors`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>

              {collapsed && (
                <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50">
                  <div className="bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--border)] whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / User Profile & Theme Toggle */}
      <div className={`border-t border-[var(--border)] bg-[var(--surface-secondary)] ${collapsed ? "p-2 space-y-2" : "p-3"}`}>
        {user && (
          <div className="relative group">
            <div
              className={`flex items-center rounded-xl ${
                collapsed ? "justify-center p-1" : "gap-3 px-3 py-2"
              }`}
            >
              <div className="h-8 w-8 rounded-full bg-[#2B1B12] dark:bg-white border border-[var(--border)] flex items-center justify-center text-white dark:text-[#141210] text-xs font-black shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                </div>
              )}
            </div>

            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50">
                <div className="bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--border)] whitespace-nowrap">
                  {user.name}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between px-1 my-1.5"}`}>
          {!collapsed && <span className="text-xs text-[var(--text-secondary)] font-semibold">Theme</span>}
          <ThemeToggle />
        </div>

        <div className="relative group">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-red-500 transition-colors cursor-pointer ${
              collapsed
                ? "h-10 w-10 mx-auto justify-center p-0"
                : "w-full gap-3 px-3 py-2"
            }`}
            aria-label="Logout"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>

          {collapsed && (
            <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50">
              <div className="bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--border)] whitespace-nowrap">
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        }`}
      >
        {renderNav(isCollapsed, false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden bg-[var(--surface)] border-r border-[var(--border)] shadow-2xl"
            >
              {renderNav(false, true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
