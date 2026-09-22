"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section id="cta" className="py-24 md:py-32 bg-[var(--surface)] border-t border-[var(--border)] relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/40 via-transparent to-stone-100/20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#2B1B12] dark:text-white mb-6 leading-tight tracking-tight">
            Ready to Transform
            <br />
            <span className="text-[#5F5750] dark:text-[#D6CEC5]">Your Space?</span>
          </h2>

          <p className="text-[#5F5750] dark:text-[#D6CEC5] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Join thousands of homeowners and designers who are creating
            beautiful spaces with AI. Start for free — no credit card required.
          </p>

          <Link
            href="/designer"
            className="inline-flex items-center gap-2 bg-[#2B1B12] hover:bg-[#433328] dark:bg-white dark:hover:bg-[#F5EFE7] text-white dark:text-[#141210] font-extrabold px-10 py-4 rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:scale-[1.02] border border-[#2B1B12] dark:border-white"
          >
            <span>START DESIGNING NOW</span>
            <ArrowRight size={18} className="text-white dark:text-[#141210]" />
          </Link>

          <p className="text-xs text-[#8A8178] dark:text-[#D6CEC5] mt-6 font-medium">
            Free forever for personal use • Upgrade anytime for pro features
          </p>
        </motion.div>
      </div>
    </section>
  );
}
