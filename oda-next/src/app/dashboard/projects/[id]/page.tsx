"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  Trash2,
  Download,
  Eye,
  Sofa,
  Calculator,
  ShoppingCart,
  Check,
  Loader2,
  Menu,
  ExternalLink,
  Image,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import type { Project, AIDesign, ShoppingListItem } from "@/types";
import { formatCurrency, formatDate } from "@/utils/helpers";
import jsPDF from "jspdf";

type Tab = "overview" | "designs" | "furniture" | "budget" | "shopping";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Eye },
  { id: "designs", label: "Designs", icon: Image },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "budget", label: "Budget", icon: Calculator },
  { id: "shopping", label: "Shopping List", icon: ShoppingCart },
];

const categoryColors: Record<string, string> = {
  "Living Room": "bg-blue-500",
  Bedroom: "bg-violet-500",
  Kitchen: "bg-green-500",
  Lighting: "bg-amber-500",
  Decor: "bg-pink-500",
  Miscellaneous: "bg-gray-500",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [deletingDesignId, setDeletingDesignId] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setProject(data.data);
          setNewName(data.data.name);
          const checked: Record<number, boolean> = {};
          data.data.shoppingList?.forEach(
            (item: ShoppingListItem, i: number) => {
              checked[i] = item.checked;
            }
          );
          setCheckedItems(checked);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName === project?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setProject((prev) =>
          prev ? { ...prev, name: newName.trim() } : prev
        );
      }
    } catch {
      // silently fail
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        router.push("/dashboard/projects");
      }
    } catch {
      // silently fail
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    setDeletingDesignId(designId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/design/${designId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && project) {
        setProject({
          ...project,
          designs: project.designs.filter((d) => d._id !== designId),
        });
      }
    } catch {
      // silently fail
    } finally {
      setDeletingDesignId(null);
    }
  };

  const handleSelectDesign = async (designId: string) => {
    setSelectedDesignId(designId);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ selectedDesign: designId }),
      });
      if (project) {
        setProject({ ...project, selectedDesign: designId });
      }
    } catch {
      // silently fail
    }
  };

  const handleToggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDownloadPDF = () => {
    if (!project) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`Project: ${project.name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Status: ${project.status}`, 20, 30);
    doc.text(`Created: ${formatDate(project.createdAt)}`, 20, 38);

    if (project.budgetPlan) {
      doc.setFontSize(16);
      doc.text("Budget Breakdown", 20, 55);
      doc.setFontSize(11);
      let y = 65;
      doc.text(
        `Total Budget: ${formatCurrency(project.budgetPlan.totalBudget)}`,
        20,
        y
      );
      y += 8;
      project.budgetPlan.allocations.forEach((alloc) => {
        doc.text(
          `${alloc.category}: ${formatCurrency(alloc.amount)} (${alloc.percentage}%)`,
          20,
          y
        );
        y += 7;
      });
      y += 5;
      doc.text(
        `Remaining: ${formatCurrency(project.budgetPlan.remaining)}`,
        20,
        y
      );
    }

    if (project.shoppingList?.length) {
      const startY = project.budgetPlan ? 65 + project.budgetPlan.allocations.length * 7 + 25 : 55;
      doc.setFontSize(16);
      doc.text("Shopping List", 20, startY);
      doc.setFontSize(11);
      let y = startY + 10;
      project.shoppingList.forEach((item, i) => {
        doc.text(
          `${i + 1}. ${item.store} - ${formatCurrency(item.price)} x ${item.quantity}`,
          20,
          y
        );
        y += 7;
      });
    }

    doc.save(`${project.name.replace(/\s+/g, "_")}_oda.pdf`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xl font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNewName(project.name);
                    }
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100"
                >
                  {savingName ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewName(project.name);
                  }}
                  className="h-8 w-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {project.name}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
          <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Original Room
                    </h3>
                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      {project.roomImage ? (
                        <img
                          src={project.roomImage}
                          alt="Room"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Image className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>

                  {project.roomAnalysis && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Room Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Room Type</span>
                          <span className="font-medium text-gray-900">
                            {project.roomAnalysis.roomType}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Wall Color</span>
                          <span className="font-medium text-gray-900">
                            {project.roomAnalysis.wallColor}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Flooring</span>
                          <span className="font-medium text-gray-900">
                            {project.roomAnalysis.flooring}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Lighting</span>
                          <span className="font-medium text-gray-900">
                            {project.roomAnalysis.lighting}
                          </span>
                        </div>
                        {project.roomAnalysis.furniture?.length > 0 && (
                          <div className="pt-2">
                            <span className="text-sm text-gray-500">
                              Existing Furniture
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {project.roomAnalysis.furniture.map((f, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {project.designs?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Design Thumbnails
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {project.designs.map((design) => (
                        <div
                          key={design._id}
                          className="aspect-square bg-gray-100 rounded-xl overflow-hidden"
                        >
                          {design.generatedImages?.[0] ? (
                            <img
                              src={design.generatedImages[0]}
                              alt={design.style}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Image className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "designs" && (
              <motion.div
                key="designs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {project.designs?.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Image className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No designs saved yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {project.designs?.map((design) => (
                      <div
                        key={design._id}
                        className={`bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md ${
                          project.selectedDesign === design._id
                            ? "border-blue-500 ring-2 ring-blue-100"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="aspect-[4/3] bg-gray-100 relative">
                          {design.generatedImages?.[0] ? (
                            <img
                              src={design.generatedImages[0]}
                              alt={design.style}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                          {project.selectedDesign === design._id && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Selected
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                              {design.style}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-violet-50 text-violet-700 rounded-full">
                              {design.mood}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Budget: {formatCurrency(design.budget)}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleSelectDesign(design._id)}
                              disabled={project.selectedDesign === design._id}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {project.selectedDesign === design._id
                                ? "Selected"
                                : "Select"}
                            </button>
                            <button
                              onClick={() => handleDeleteDesign(design._id)}
                              className="flex items-center justify-center h-8 w-8 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              {deletingDesignId === design._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "furniture" && (
              <motion.div
                key="furniture"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {project.furniture?.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Sofa className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No furniture recommendations yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.furniture?.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-[4/3] bg-gray-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Sofa className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {item.productName}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.brand} · {item.storeName}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-2">
                            {formatCurrency(item.price)}
                          </p>
                          <a
                            href={item.productUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            View Product
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "budget" && (
              <motion.div
                key="budget"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {!project.budgetPlan ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Calculator className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No budget plan created yet</p>
                    <button
                      onClick={() => router.push("/budget")}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Create Budget Plan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm text-gray-500">Total Budget</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(project.budgetPlan.totalBudget)}
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm text-gray-500">Estimated Spend</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {formatCurrency(
                            project.budgetPlan.totalBudget -
                              project.budgetPlan.remaining
                          )}
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm text-gray-500">Remaining</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(project.budgetPlan.remaining)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Budget Allocation
                      </h3>
                      <div className="space-y-4">
                        {project.budgetPlan.allocations.map((alloc) => (
                          <div key={alloc.category}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-gray-700">
                                {alloc.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatCurrency(alloc.amount)} ({alloc.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${categoryColors[alloc.category] || "bg-blue-500"}`}
                                style={{ width: `${alloc.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "shopping" && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {project.shoppingList?.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Shopping list is empty</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Shopping List ({project.shoppingList?.length || 0} items)
                      </h3>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {project.shoppingList?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <button
                            onClick={() => handleToggleCheck(i)}
                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                              checkedItems[i]
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300 hover:border-blue-400"
                            }`}
                          >
                            {checkedItems[i] && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                checkedItems[i]
                                  ? "line-through text-gray-400"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.store}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p
                            className={`text-sm font-semibold ${
                              checkedItems[i]
                                ? "line-through text-gray-400"
                                : "text-gray-900"
                            }`}
                          >
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex sm:hidden items-center gap-3 mt-6 pb-6">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
          </div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
}
