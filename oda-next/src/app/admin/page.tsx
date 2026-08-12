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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
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
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500 text-sm">{error}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
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
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      color: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      label: "Total Furniture Items",
      value: stats?.totalFurnitureItems ?? 0,
      icon: Package,
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "AI Requests",
      value: stats?.totalAiRequests ?? 0,
      icon: Bot,
      color: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">ODA Admin</h1>
            <p className="text-xs text-gray-500">Management Panel</p>
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
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <navItem.icon className="h-4.5 w-4.5" />
                {navItem.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Overview of your platform metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full">
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
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className={`h-11 w-11 rounded-xl ${card.color} flex items-center justify-center`}>
                        <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <TrendingUp className="h-4 w-4 text-gray-300" />
                    </div>
                    <p className="mt-4 text-2xl font-bold text-gray-900">
                      {card.value.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <motion.div variants={item}>
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    <Link
                      href="/admin/users"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{activity.message}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-12 text-center">
                      <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/admin/furniture"
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="h-11 w-11 rounded-xl bg-green-50 flex items-center justify-center">
                    <Sofa className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Manage Furniture</p>
                    <p className="text-xs text-gray-500">Add, edit, or remove items</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-green-600 transition-colors" />
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Manage Users</p>
                    <p className="text-xs text-gray-500">View user accounts</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-blue-600 transition-colors" />
                </Link>
                <Link
                  href="/admin/furniture"
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="h-11 w-11 rounded-xl bg-violet-50 flex items-center justify-center">
                    <Package className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Add Furniture</p>
                    <p className="text-xs text-gray-500">Catalog new products</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 ml-auto group-hover:text-violet-600 transition-colors" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
