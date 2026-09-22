"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const router = useRouter();
  const { userData, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
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

  const sidebarContent = (
    <div className="flex h-full w-full flex-col bg-[#F3F1EE] border-r border-[#D5CFC7] text-[#5F5750]">
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#D5CFC7]">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#5F5750] border border-[#D5CFC7] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-[#FFF9F2] font-black text-xs tracking-wider">IN</span>
            </div>
            <span className="text-lg font-bold text-[#5F5750] tracking-tight">
              Insight <span className="text-[#8A8178]">Nexsus</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="flex items-center justify-center w-full">
            <div className="h-9 w-9 rounded-xl bg-[#5F5750] border border-[#D5CFC7] flex items-center justify-center shadow-xs">
              <span className="text-[#FFF9F2] font-black text-xs tracking-wider">IN</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#E5E1DC] text-[#8A8178] hover:text-[#5F5750] transition-colors"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden h-7 w-7 flex items-center justify-center rounded-lg hover:bg-[#E5E1DC] text-[#8A8178]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isAction ? false : isActive(item.href);
          if (item.isAction) {
            return (
              <button
                key={item.label}
                onClick={() => {
                  document.dispatchEvent(new CustomEvent("toggle-ai-assistant"));
                  onMobileClose?.();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-[#E5E1DC] text-[#8A8178] hover:text-[#5F5750] cursor-pointer ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4.5 w-4.5 shrink-0 text-[#8A8178]" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-[#E5E1DC] text-[#5F5750] border border-[#D5CFC7] font-semibold shadow-xs"
                  : "text-[#8A8178] hover:bg-[#E5E1DC] hover:text-[#5F5750] border border-transparent"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? "text-[#5F5750]" : "text-[#8A8178]"}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#D5CFC7] p-3 bg-[#E5E1DC]">
        {user && (
          <div
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="h-8 w-8 rounded-full bg-[#5F5750] border border-[#D5CFC7] flex items-center justify-center text-[#FFF9F2] text-xs font-black shrink-0">
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
                <p className="text-sm font-semibold text-[#5F5750] truncate">
                  {user.name}
                </p>
                <p className="text-xs text-[#8A8178] truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}
        <div className={`mt-2 mb-2 flex items-center px-1 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <span className="text-xs text-[#8A8178] font-medium">Theme</span>}
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className={`mt-1.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8A8178] hover:bg-[#DCD6CF] hover:text-[#5F5750] transition-colors ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 bg-[#F3F1EE]">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden bg-[#F3F1EE]"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
