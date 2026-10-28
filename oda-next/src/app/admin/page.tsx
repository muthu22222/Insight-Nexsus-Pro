"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sofa,
  Users,
  BarChart3,
  Loader2,
  TrendingUp,
  FolderOpen,
  Package,
  Bot,
  Clock,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/common/BackButton";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalFurnitureItems: number;
  totalAiRequests: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: "user_joined" | "project_created" | "furniture_added" | "ai_request";
  message: string;
  timestamp: string;
}

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Furniture Management", href: "/admin/furniture", icon: Sofa },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "AI Usage", href: "/admin", icon: BarChart3 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20 } },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { getToken, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const userRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success && userData.data) {
            const userInfo = userData.data as UserInfo;
            if (userInfo.role !== "admin") {
              setError("Access denied. Admin privileges required.");
              setLoading(false);
              return;
            }
            setUser(userInfo);
          }
        } else {
          router.push("/auth/login");
          return;
        }

        const statsRes = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success && statsData.data) {
            setStats(statsData.data);
          }
        }
      } catch {
        setError("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await logout();
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_joined":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "project_created":
        return <FolderOpen className="h-4 w-4 text-violet-600" />;
      case "furniture_added":
        return <Package className="h-4 w-4 text-green-600" />;
      case "ai_request":
        return <Bot className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-8 text-center max-w-md shadow-sm">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Access Denied</h2>
          <p className="text-[var(--text-secondary)] text-sm">{error}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-sm font-medium rounded-xl hover:opacity-95 shadow-sm transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-[#F0E7FF] dark:bg-[#7C3AED]/20",
      iconColor: "text-[#7C3AED]",
    },
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      color: "bg-[#E6F8F1] dark:bg-[#0F9D78]/20",
      iconColor: "text-[#0F9D78]",
    },
    {
      label: "Total Furniture Items",
      value: stats?.totalFurnitureItems ?? 0,
      icon: Package,
      color: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600",
    },
    {
      label: "AI Requests",
      value: stats?.totalAiRequests ?? 0,
      icon: Bot,
      color: "bg-[#F0E7FF] dark:bg-[#7C3AED]/20",
      iconColor: "text-[#7C3AED]",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border-subtle)]">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--text-primary)]">Insight Nexsus Admin</h1>
            <p className="text-xs text-[var(--text-secondary)]">Management Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((navItem) => {
            const isActive =
              navItem.href === "/admin"
                ? window.location.pathname === "/admin"
                : window.location.pathname.startsWith(navItem.href);
            return (
              <Link
                key={navItem.label}
                href={navItem.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#F0E7FF] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                <navItem.icon className="h-4.5 w-4.5" />
                {navItem.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-[#F0E7FF] dark:bg-[#7C3AED]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton fallbackHref="/dashboard" label="Back to App" variant="subtle" />
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                  Overview of your platform metrics
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200/50 dark:border-red-800/40 text-xs font-medium rounded-full">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 max-w-7xl mx-auto">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <motion.div key={card.label} variants={item}>
                  <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 hover:shadow-md hover:border-[#7C3AED]/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className={`h-11 w-11 rounded-xl ${card.color} flex items-center justify-center`}>
                        <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <p className="mt-4 text-2xl font-bold text-[var(--text-primary)]">
                      {card.value.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{card.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div variants={item}>
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Activity</h2>
                    <Link
                      href="/admin/users"
                      className="text-sm text-[#7C3AED] hover:text-[#A855F7] font-medium flex items-center gap-1 transition-colors"
                    >
                      View All
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)]">{activity.message}</p>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <Clock className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3" />
                      <p className="text-sm text-[var(--text-secondary)]">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/admin/furniture"
                  className="flex items-center gap-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 hover:border-[#0F9D78]/50 hover:shadow-md transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#E6F8F1] dark:bg-[#0F9D78]/20 flex items-center justify-center">
                    <Sofa className="h-5 w-5 text-[#0F9D78]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Manage Furniture</p>
                    <p className="text-xs text-[var(--text-secondary)]">Add, edit, or remove items</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] ml-auto group-hover:text-[#0F9D78] transition-colors" />
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 hover:border-[#7C3AED]/50 hover:shadow-md transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#F0E7FF] dark:bg-[#7C3AED]/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Manage Users</p>
                    <p className="text-xs text-[var(--text-secondary)]">View user accounts</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] ml-auto group-hover:text-[#7C3AED] transition-colors" />
                </Link>
                <Link
                  href="/admin/furniture"
                  className="flex items-center gap-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] p-5 hover:border-[#7C3AED]/50 hover:shadow-md transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-[#F0E7FF] dark:bg-[#7C3AED]/20 flex items-center justify-center">
                    <Package className="h-5 w-5 text-[#7C3AED]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Add Furniture</p>
                    <p className="text-xs text-[var(--text-secondary)]">Catalog new products</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] ml-auto group-hover:text-[#7C3AED] transition-colors" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
