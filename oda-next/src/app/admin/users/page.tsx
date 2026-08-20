"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sofa,
  Users,
  BarChart3,
  Loader2,
  Search,
  Shield,
  LogOut,
  Mail,
  Calendar,
  FolderOpen,
  X,
} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "admin";
  createdAt: string;
  projectCount?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Furniture Management", href: "/admin/furniture", icon: Sofa },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "AI Usage", href: "/admin", icon: BarChart3 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20 } },
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUsers = useCallback(
    async (page = 1, searchTerm = "") => {
      if (!token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });
        if (searchTerm) params.set("search", searchTerm);

        const res = await fetch(`/api/admin/users?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setUsers(data.data.users || []);
            setPagination(data.data.pagination);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    const init = async () => {
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
            if (userData.data.role !== "admin") {
              router.push("/admin");
              return;
            }
            setAdminUser(userData.data);
            setAuthorized(true);
          }
        } else {
          router.push("/auth/login");
          return;
        }
      } catch {
        router.push("/auth/login");
        return;
      }

      fetchUsers(1);
    };

    init();
  }, [token, router, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Insight Nexsus Admin</h1>
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
                {adminUser?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{adminUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/auth/login");
              }}
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                View and manage user accounts
              </p>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 max-w-7xl mx-auto">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Table */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((userData) => (
                      <motion.tr
                        key={userData._id}
                        variants={itemAnim}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                              {userData.avatar ? (
                                <img
                                  src={userData.avatar}
                                  alt={userData.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-white">
                                  {userData.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {userData.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {userData.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <FolderOpen className="h-3.5 w-3.5 text-gray-400" />
                            {userData.projectCount ?? 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(userData.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => setSelectedUser(userData)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1, search)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchUsers(pageNum, search)}
                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? "bg-blue-600 text-white"
                            : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchUsers(pagination.page + 1, search)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                  {selectedUser.role === "admin" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-full mt-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    Joined {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FolderOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">
                    {selectedUser.projectCount ?? 0} projects
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
