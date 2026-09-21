"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CTASection() {
  const { user } = useAuth();

  return (
    <section id="cta" className="py-24 md:py-32 bg-[#291C0E] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6E473B]/20 via-transparent to-[#A78D78]/15" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,71,59,0.25)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#FAF6F0] mb-6 leading-tight">
            Ready to Transform
            <br />
            <span className="text-[#A78D78]">Your Space?</span>
          </h2>

          <p className="text-[#BEB5A9] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of homeowners and designers who are creating
            beautiful spaces with AI. Start for free — no credit card required.
          </p>

          <Link
            href="/designer"
            className="inline-flex items-center gap-2 bg-[#6E473B] hover:bg-[#855749] text-[#FAF6F0] font-bold px-10 py-4 rounded-xl text-base transition-all duration-200 hover:shadow-xl hover:shadow-[#6E473B]/35 border border-[#A78D78]/40"
          >
            START DESIGNING NOW
            <ArrowRight size={18} className="text-[#E1D4C2]" />
          </Link>

          <p className="text-xs text-[#BEB5A9]/70 mt-6">
            Free forever for personal use • Upgrade anytime for pro features
          </p>
        </motion.div>
      </div>
    </section>
  );
}
