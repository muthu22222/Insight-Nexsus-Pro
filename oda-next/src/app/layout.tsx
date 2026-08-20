import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Insight Nexsus - AI Interior Design Platform",
  description:
    "Transform your living spaces with AI-powered interior design suggestions, furniture recommendations, and budget planning.",
  keywords: [
    "interior design",
    "AI design",
    "home decor",
    "furniture",
    "budget planner",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white text-gray-900 antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#fff",
              color: "#171717",
              borderRadius: "10px",
              border: "1px solid #e4e4e7",
              padding: "12px 16px",
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
        {/* External Chat Widget */}
        <Script
          src="http://127.0.0.1:8000/api/widget/embed.js"
          data-org-id="7350e330-bff9-4497-a536-8d8254371eef"
          data-position="bottom-right"
          data-color="#2563eb"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
