"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="py-24 md:py-32 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Transform
            <br />
            <span className="text-amber-500">Your Space?</span>
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of homeowners and designers who are creating
            beautiful spaces with AI. Start for free — no credit card required.
          </p>

          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 py-4 rounded-lg text-base transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
          >
            START DESIGNING NOW
            <ArrowRight size={18} />
          </Link>

          <p className="text-xs text-gray-500 mt-6">
            Free forever for personal use • Upgrade anytime for pro features
          </p>
        </motion.div>
      </div>
    </section>
  );
}
