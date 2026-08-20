"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle, Wand2, Star } from "lucide-react";

const designedRoomImage =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden py-16 lg:py-24">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.05)_0%,transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Text Content (6 Columns) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-semibold bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 shadow-2xs">
                <Sparkles size={14} className="text-amber-400" />
                AI-Powered Interior Design & Room Visualization
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6"
            >
              <span className="block text-white">DESIGN</span>
              <span className="block text-white">YOUR</span>
              <span className="block text-amber-500">SPACE.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl text-amber-400/90 font-semibold mb-3"
            >
              Turn Your Room Into Your Dream Room
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-gray-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal"
            >
              Upload your room, choose your aesthetic, and let AI generate photorealistic furnished interiors with shoppable furniture links.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3.5 mb-8">
              <Link
                href="/designer"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-98"
              >
                <span>START DESIGNING</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/10"
              >
                <span>EXPLORE STUDIO</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                Real catalog furniture
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                Instant AI render
              </span>
            </motion.div>
          </motion.div>

          {/* Right: Clean AI Designed Room Preview (6 Columns) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl backdrop-blur-xl group">
              {/* Top Header Badge */}
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">AI Designed Room</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Warm Contemporary
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-gray-200">Photorealistic 4K</span>
                </div>
              </div>

              {/* CLEAN ROOM IMAGE CONTAINER */}
              <div className="relative w-full aspect-[4/3] select-none overflow-hidden bg-black">
                <img
                  src={designedRoomImage}
                  alt="AI Designed Living Room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  draggable={false}
                />

                {/* Subtle bottom vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <span className="px-3 py-1 bg-amber-500 text-black rounded-lg text-xs font-black shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    AI REDESIGNED
                  </span>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="p-3.5 bg-black/80 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant AI Room Redesign & Catalog Furniture Staging</span>
                </span>
                <Link
                  href="/designer"
                  className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Design Yours</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
