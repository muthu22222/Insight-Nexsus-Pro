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
      <div className="flex h-screen items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Sidebar */}
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
                {adminUser?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{adminUser?.name}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{adminUser?.email}</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/auth/login");
              }}
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
        <header className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">User Management</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium rounded-xl hover:bg-[var(--bg-card-hover)] transition-colors"
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
            className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Projects
                    </th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#7C3AED] mx-auto" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Users className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--text-secondary)]">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((userData) => (
                      <motion.tr
                        key={userData._id}
                        variants={itemAnim}
                        className="hover:bg-[var(--bg-card-hover)] transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-sm">
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
                              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {userData.name}
                              </p>
                              <p className="text-xs text-[var(--text-secondary)] truncate">{userData.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {userData.role === "admin" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F0E7FF] dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold rounded-full">
                              <Shield className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-medium rounded-full">
                              User
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]">
                            <FolderOpen className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                            {userData.projectCount ?? 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                          {formatDate(userData.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => setSelectedUser(userData)}
                              className="px-3 py-1.5 text-xs font-medium text-[#7C3AED] hover:text-[#A855F7] hover:bg-[#F0E7FF]/50 dark:hover:bg-[#7C3AED]/20 rounded-lg transition-colors"
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
              <div className="px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchUsers(pagination.page - 1, search)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 border border-[var(--border-subtle)] text-sm rounded-lg hover:bg-[var(--bg-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--text-primary)]"
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
                            ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-sm"
                            : "border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => fetchUsers(pagination.page + 1, search)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1.5 border border-[var(--border-subtle)] text-sm rounded-lg hover:bg-[var(--bg-card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--text-primary)]"
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
          <div className="bg-[var(--bg-card)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-sm">
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
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{selectedUser.name}</h3>
                  {selectedUser.role === "admin" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#F0E7FF] dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold rounded-full mt-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">
                    Joined {formatDate(selectedUser.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FolderOpen className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-primary)]">
                    {selectedUser.projectCount ?? 0} projects
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full px-4 py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-medium rounded-xl transition-colors"
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
