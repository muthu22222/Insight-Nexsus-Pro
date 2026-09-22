"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Download,
  Loader2,
  Menu,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import type { BudgetPlan } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import jsPDF from "jspdf";

const categoryColors: Record<string, string> = {
  "Living Room": "#f59e0b",
  Bedroom: "#8b5cf6",
  Kitchen: "#10b981",
  Lighting: "#fbbf24",
  Decor: "#ec4899",
  Miscellaneous: "#64748b",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, damping: 20 } },
};

export default function BudgetPage() {
  const { getToken } = useAuth();
  const { sidebarWidthClass } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [budget, setBudget] = useState("");
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    const amount = parseInt(budget.replace(/[^0-9]/g, ""), 10);
    if (!amount || amount < 10000) return;

    setGenerating(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/budget/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ budget: amount }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setPlan(data.data);
        }
      }
    } catch {
      const fallback: BudgetPlan = {
        totalBudget: amount,
        allocations: [
          { category: "Living Room", amount: Math.round(amount * 0.3), percentage: 30 },
          { category: "Bedroom", amount: Math.round(amount * 0.25), percentage: 25 },
          { category: "Kitchen", amount: Math.round(amount * 0.2), percentage: 20 },
          { category: "Lighting", amount: Math.round(amount * 0.1), percentage: 10 },
          { category: "Decor", amount: Math.round(amount * 0.1), percentage: 10 },
          { category: "Miscellaneous", amount: Math.round(amount * 0.05), percentage: 5 },
        ],
        remaining: 0,
      };
      setPlan(fallback);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!plan) return;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Insight Nexsus - Budget Plan", 20, 25);
    doc.setFontSize(12);
    doc.text(`Total Budget: ${formatCurrency(plan.totalBudget)}`, 20, 38);
    doc.text(
      `Estimated Spend: ${formatCurrency(plan.totalBudget - plan.remaining)}`,
      20,
      46
    );
    doc.text(`Remaining Balance: ${formatCurrency(plan.remaining)}`, 20, 54);

    let y = 70;
    doc.setFontSize(14);
    doc.text("Category Allocations:", 20, y);
    y += 10;

    doc.setFontSize(11);
    plan.allocations.forEach((alloc) => {
      doc.text(
        `${alloc.category}: ${formatCurrency(alloc.amount)} (${alloc.percentage}%)`,
        25,
        y
      );
      y += 8;
    });

    doc.save("Insight_Nexsus_Budget_Plan.pdf");
  };

  const totalSpend = plan ? plan.totalBudget - plan.remaining : 0;
  const isOverBudget = plan ? plan.remaining < 0 : false;

  const pieSegments = plan
    ? (() => {
        let accumulated = 0;
        return plan.allocations.map((alloc) => {
          const start = accumulated;
          accumulated += alloc.percentage;
          return {
            ...alloc,
            startAngle: (start / 100) * 360,
            endAngle: (accumulated / 100) * 360,
            color: categoryColors[alloc.category] || "#64748b",
          };
        });
      })()
    : [];

  const buildPieBackground = () => {
    if (pieSegments.length === 0) return "";
    const gradientParts: string[] = [];
    let currentAngle = 0;
    for (const seg of pieSegments) {
      const nextAngle = currentAngle + (seg.percentage / 100) * 360;
      gradientParts.push(
        `${seg.color} ${currentAngle}deg ${nextAngle}deg`
      );
      currentAngle = nextAngle;
    }
    return `conic-gradient(${gradientParts.join(", ")})`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarWidthClass}`}>
          <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md px-4 sm:px-6 py-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5 text-[var(--text-primary)]" />
            </button>
            <BackButton fallbackHref="/dashboard" label="Back to Dashboard" variant="subtle" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Budget Planner</h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Plan and optimize your interior design budget with AI
              </p>
            </div>
            <ThemeToggle />
            {plan && (
              <button
                onClick={handleDownloadPDF}
                className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold rounded-xl hover:border-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4 text-[var(--text-primary)]" />
                Download PDF
              </button>
            )}
          </header>

          <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 mb-6 shadow-xs"
            >
              <div className="max-w-lg mx-auto text-center">
                <div className="h-14 w-14 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center mx-auto mb-4 text-[var(--text-primary)] shadow-xs">
                  <Calculator className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Set Your Total Interior Budget
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6">
                  Enter your total budget and let Insight Nexsus AI intelligently allocate it across rooms and furniture categories.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 max-w-sm mx-auto">
                  <div className="relative flex-1 w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] font-bold">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setBudget(raw ? parseInt(raw).toLocaleString("en-IN") : "");
                      }}
                      placeholder="2,00,000"
                      className="w-full pl-9 pr-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-base font-bold text-[var(--text-primary)] placeholder-[var(--text-muted)] text-center focus:outline-none focus:border-[var(--text-primary)]"
                    />
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !budget}
                    className="w-full sm:w-auto px-6 py-3 bg-[#2B1B12] hover:bg-[#433328] text-white font-extrabold text-sm rounded-xl border border-[#2B1B12] shadow-md shadow-[#2B1B12]/15 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4 stroke-[2.5]" />
                    )}
                    Generate Plan
                  </button>
                </div>
              </div>
            </motion.div>

            {plan && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <motion.div variants={item} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
                    <p className="text-xs text-[var(--text-secondary)] font-semibold">Total Budget</p>
                    <p className="text-2xl font-black text-[var(--text-primary)] mt-1">
                      {formatCurrency(plan.totalBudget)}
                    </p>
                  </motion.div>
                  <motion.div variants={item} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 shadow-xs">
                    <p className="text-xs text-[var(--text-secondary)] font-semibold">Estimated Spend</p>
                    <p className="text-2xl font-black text-[var(--text-primary)] mt-1">
                      {formatCurrency(totalSpend)}
                    </p>
                  </motion.div>
                  <motion.div
                    variants={item}
                    className={`rounded-2xl border p-5 shadow-xs ${
                      isOverBudget
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-emerald-500/10 border-emerald-500/30"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                      {isOverBudget ? "Over Budget" : "Allocated Balance"}
                    </p>
                    <p
                      className={`text-2xl font-black mt-1 ${
                        isOverBudget ? "text-red-700 dark:text-red-300" : "text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {formatCurrency(Math.abs(plan.remaining))}
                    </p>
                  </motion.div>
                </div>

                {isOverBudget && (
                  <motion.div
                    variants={item}
                    className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-300">
                        Over budget by {formatCurrency(Math.abs(plan.remaining))}
                      </p>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                        Consider choosing budget-friendly alternatives or reducing quantities to stay within your budget.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    variants={item}
                    className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs"
                  >
                    <h3 className="font-bold text-[var(--text-primary)] mb-5 text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--text-secondary)]" />
                      Budget Allocation
                    </h3>
                    <div className="space-y-4">
                      {plan.allocations.map((alloc) => (
                        <div key={alloc.category}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    categoryColors[alloc.category] || "#F5A900",
                                }}
                              />
                              <span className="text-sm font-semibold text-[var(--text-primary)]">
                                {alloc.category}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-[var(--text-secondary)]">
                              {formatCurrency(alloc.amount)} ({alloc.percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden border border-[var(--border)]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${alloc.percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{
                                backgroundColor:
                                  categoryColors[alloc.category] || "#F5A900",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    variants={item}
                    className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 flex flex-col items-center shadow-xs"
                  >
                    <h3 className="font-bold text-[var(--text-primary)] mb-5 self-start text-base">
                      Distribution
                    </h3>
                    <div className="relative w-52 h-52">
                      <div
                        className="w-full h-full rounded-full"
                        style={{ background: buildPieBackground() }}
                      />
                      <div className="absolute inset-5 bg-[var(--surface)] rounded-full flex items-center justify-center border border-[var(--border)]">
                        <div className="text-center">
                          <p className="text-base font-black text-[var(--text-primary)]">
                            {formatCurrency(plan.totalBudget)}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Total Plan</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-6 w-full max-w-xs">
                      {plan.allocations.map((alloc) => (
                        <div key={alloc.category} className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                categoryColors[alloc.category] || "#F5A900",
                            }}
                          />
                          <span className="text-xs text-[var(--text-secondary)] truncate">
                            {alloc.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  variants={item}
                  className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs"
                >
                  <h3 className="font-bold text-[var(--text-primary)] mb-4 text-base">
                    Category Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.allocations.map((alloc) => (
                      <div
                        key={alloc.category}
                        className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] hover:border-[var(--text-secondary)] transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                categoryColors[alloc.category] || "#F5A900",
                            }}
                          />
                          <span className="font-bold text-[var(--text-primary)] text-sm">
                            {alloc.category}
                          </span>
                        </div>
                        <p className="text-xl font-black text-[var(--text-primary)]">
                          {formatCurrency(alloc.amount)}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {alloc.percentage}% of total budget
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <div className="flex sm:hidden pb-6">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#2B1B12] hover:bg-[#433328] text-white font-extrabold text-sm rounded-xl border border-[#2B1B12] shadow-lg"
                  >
                    <Download className="h-4 w-4" />
                    Download Budget PDF
                  </button>
                </div>
              </motion.div>
            )}
          </main>
        </div>

        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
}
