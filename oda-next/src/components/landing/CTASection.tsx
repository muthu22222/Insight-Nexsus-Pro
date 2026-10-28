"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section id="cta" className="py-24 md:py-32 bg-[#211A2E] text-white border-t border-[#3B3050] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#7C3AED]/20 to-[#10B981]/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-[#A78BFA] via-[#C4B5FD] to-[#10B981] bg-clip-text text-transparent">
              Your Space?
            </span>
          </h2>

          <p className="text-white text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Join thousands of homeowners and designers who are creating
            beautiful spaces with AI. Start for free — no credit card required.
          </p>

          <Link
            href="/designer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D28D9] hover:to-[#9333EA] text-white font-extrabold px-10 py-4 rounded-xl text-base transition-all duration-200 shadow-xl shadow-[#7C3AED]/35 hover:shadow-[#7C3AED]/50 hover:scale-[1.02] border border-white/20 active:scale-98"
          >
            <span>START DESIGNING NOW</span>
            <ArrowRight size={18} className="text-white" />
          </Link>

          <p className="text-xs text-white/80 mt-6 font-semibold">
            Free forever for personal use • Upgrade anytime for pro features
          </p>
        </motion.div>
      </div>
    </section>
  );
}
