"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Lock,
  Palette,
  Shield,
  Save,
  Menu,
  Sparkles,
} from "lucide-react";
import Sidebar from "@/components/shared/Sidebar";
import AIAssistant from "@/components/shared/AIAssistant";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import BackButton from "@/components/common/BackButton";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function SettingsPage() {
  const { userData } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [name, setName] = useState(userData?.name || "Designer");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Preferences saved successfully!");
    }, 600);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white text-[#0F172A]">
        <Toaster position="top-center" />
        <Sidebar isMobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-4 sm:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden h-10 w-10 rounded-lg flex items-center justify-center hover:bg-[#F1F3F5] transition-colors cursor-pointer"
              >
                <Menu className="h-5 w-5 text-[#0F172A]" />
              </button>
              <BackButton fallbackHref="/dashboard" label="Back to Dashboard" variant="subtle" />
              <div>
                <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Settings</h1>
                <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
                  Manage your account preferences and studio defaults
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="px-4 sm:px-6 py-8 max-w-4xl mx-auto space-y-6">
            {/* Profile Section */}
            <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-6 shadow-xs">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#0F172A]" />
                Profile Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#0F172A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={userData?.email || "designer@example.com"}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-[#E2E8F0] rounded-xl text-sm text-[#94A3B8] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Notification & AI Settings */}
            <div className="bg-[#F8F9FA] rounded-2xl border border-[#E2E8F0] p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0F172A]" />
                App Preferences
              </h2>
              <div className="flex items-center justify-between py-2 border-b border-[#E2E8F0]">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Email Notifications</p>
                  <p className="text-xs text-[#64748B]">Receive design completion and project updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0F172A] cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">Real-Time AI Suggestions</p>
                  <p className="text-xs text-[#64748B]">Auto-recommend styles and furniture for uploaded rooms</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiSuggestions}
                  onChange={(e) => setAiSuggestions(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#0F172A] cursor-pointer"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-extrabold rounded-xl border border-[#0F172A] shadow-md shadow-[#0F172A]/15 hover:scale-[1.02] transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </main>
        </div>

        <AIAssistant />
      </div>
    </ProtectedRoute>
  );
}
