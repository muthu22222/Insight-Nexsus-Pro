"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator,
  Download,
  Loader2,
  Menu,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { useAuth } from "@/contexts/AuthContext";
import type { BudgetPlan } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import jsPDF from "jspdf";

const categoryColors: Record<string, string> = {
  "Living Room": "#2563eb",
  Bedroom: "#7c3aed",
  Kitchen: "#16a34a",
  Lighting: "#f59e0b",
  Decor: "#ec4899",
  Miscellaneous: "#6b7280",
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
    doc.text("Budget Plan", 20, 25);
    doc.setFontSize(12);
    doc.text(`Total Budget: ${formatCurrency(plan.totalBudget)}`, 20, 38);
    doc.text(
      `Estimated Spend: ${formatCurrency(plan.totalBudget - plan.remaining)}`,
      20,
      46
    );
    doc.text(`Remaining: ${formatCurrency(plan.remaining)}`, 20, 54);

    doc.setFontSize(16);
    doc.text("Allocation Breakdown", 20, 70);

    let y = 82;
    plan.allocations.forEach((alloc) => {
      doc.setFontSize(11);
      doc.text(
        `${alloc.category}: ${formatCurrency(alloc.amount)} (${alloc.percentage}%)`,
        25,
        y
      );
      y += 8;
    });

    if (plan.remaining < 0) {
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(239, 68, 68);
      doc.text(
        "Warning: Over budget! Consider cheaper alternatives.",
        20,
        y
      );
    }

    doc.save("budget_plan_oda.pdf");
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
            color: categoryColors[alloc.category] || "#6b7280",
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
          <BackButton fallbackHref="/dashboard" label="Back" variant="subtle" />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Budget Planner</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Plan your interior design budget with AI
            </p>
          </div>
          {plan && (
            <button
              onClick={handleDownloadPDF}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          )}
        </header>

        <main className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-6"
          >
            <div className="max-w-lg mx-auto text-center">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Calculator className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Set Your Total Budget
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your total budget and let AI allocate it across categories
                for your interior design project.
              </p>

              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    &#8377;
                  </span>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setBudget(raw ? parseInt(raw).toLocaleString("en-IN") : "");
                    }}
                    placeholder="2,00,000"
                    className="w-full pl-9 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-semibold text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !budget}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4" />
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
                <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm text-gray-500">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(plan.totalBudget)}
                  </p>
                </motion.div>
                <motion.div variants={item} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm text-gray-500">Estimated Spend</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(totalSpend)}
                  </p>
                </motion.div>
                <motion.div
                  variants={item}
                  className={`rounded-2xl border p-5 ${
                    isOverBudget
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <p className={`text-sm ${isOverBudget ? "text-red-600" : "text-green-600"}`}>
                    {isOverBudget ? "Over Budget" : "Remaining"}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      isOverBudget ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {formatCurrency(Math.abs(plan.remaining))}
                  </p>
                </motion.div>
              </div>

              {isOverBudget && (
                <motion.div
                  variants={item}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Over budget by {formatCurrency(Math.abs(plan.remaining))}
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Consider choosing budget-friendly alternatives or reducing
                      quantities to stay within your budget.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  variants={item}
                  className="bg-white rounded-2xl border border-gray-100 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-5">
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
                                  categoryColors[alloc.category] || "#6b7280",
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {alloc.category}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(alloc.amount)} ({alloc.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${alloc.percentage}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                categoryColors[alloc.category] || "#6b7280",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  variants={item}
                  className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center"
                >
                  <h3 className="font-semibold text-gray-900 mb-5 self-start">
                    Distribution
                  </h3>
                  <div className="relative w-56 h-56">
                    <div
                      className="w-full h-full rounded-full"
                      style={{ background: buildPieBackground() }}
                    />
                    <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(plan.totalBudget)}
                        </p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-6 w-full max-w-xs">
                    {plan.allocations.map((alloc) => (
                      <div key={alloc.category} className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              categoryColors[alloc.category] || "#6b7280",
                          }}
                        />
                        <span className="text-xs text-gray-600 truncate">
                          {alloc.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={item}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">
                  Category Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.allocations.map((alloc) => (
                    <div
                      key={alloc.category}
                      className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[alloc.category] || "#6b7280",
                          }}
                        />
                        <span className="font-medium text-gray-900 text-sm">
                          {alloc.category}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(alloc.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alloc.percentage}% of total budget
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="flex sm:hidden pb-6">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:shadow-lg transition-shadow"
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
