"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  CheckCircle,
  Wand2,
  Star,
  Zap,
  ShoppingBag,
  Layers,
  Palette,
} from "lucide-react";

const roomStyles = [
  "Living Room",
  "Master Bedroom",
  "Dining Space",
  "Home Office",
  "Contemporary Villa",
];

const designedRoomImage =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function Hero() {
  const [styleIndex, setStyleIndex] = useState(0);

  // Rotate room styles smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setStyleIndex((prev) => (prev + 1) % roomStyles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden py-16 lg:py-24"
    >
      {/* 1. Deep Space Base Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* 2. Subtle Blueprint Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 3. Animated Glowing Ambient Light Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent blur-[110px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-600/15 via-violet-600/10 to-transparent blur-[120px] pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Text & CTAs (6 Columns) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-semibold bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 shadow-2xs backdrop-blur-md">
                <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                AI-Powered Interior Design & Instant Room Staging
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-black leading-[0.93] tracking-tight mb-6"
            >
              <span className="block text-white">DESIGN</span>
              <span className="block text-white">YOUR</span>
              <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                SPACE.
              </span>
            </motion.h1>

            {/* Animated Dynamic Style Rotator Subtitle */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold mb-4 text-gray-200"
            >
              <span>Transform Your</span>
              <div className="inline-block relative h-7 overflow-hidden min-w-[170px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={roomStyles[styleIndex]}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute left-0 text-amber-400 font-bold underline decoration-amber-500/50 underline-offset-4"
                  >
                    {roomStyles[styleIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-gray-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal"
            >
              Upload a photo of your empty or existing room, choose your aesthetic, and let AI generate photorealistic furnished interiors with verified catalog furniture.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3.5 mb-8">
              <Link
                href="/designer"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-98 overflow-hidden"
              >
                {/* Button shine sweep animation */}
                <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <span>START DESIGNING</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 duration-200" />
              </Link>

              <Link
                href="/dashboard/projects"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 hover:bg-white/10 backdrop-blur-sm"
              >
                <span>EXPLORE STUDIO</span>
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                Real catalog furniture
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                Instant AI render
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Animated Showcase Visual (6 Columns) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full relative"
          >
            {/* Floating Glassmorphism Badge 1 (Top Left Overhang) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-5 -left-4 z-30 hidden sm:flex items-center gap-2.5 bg-black/80 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-xl shadow-2xl"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">AI Vision Engine</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Rendered in 2.4s
                </p>
              </div>
            </motion.div>

            {/* Floating Glassmorphism Badge 2 (Bottom Right Overhang) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute -bottom-5 -right-4 z-30 hidden sm:flex items-center gap-2.5 bg-black/80 backdrop-blur-xl border border-white/20 px-3.5 py-2 rounded-xl shadow-2xl"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-white">Live Store Match</p>
                <p className="text-[10px] text-amber-300 font-semibold">1,200+ Catalog Products</p>
              </div>
            </motion.div>

            {/* Main Visual Container */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl backdrop-blur-xl group">
              {/* Top Header Bar */}
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Insight Nexsus Studio</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                    Warm Contemporary
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-gray-200">Photorealistic 4K</span>
                </div>
              </div>

              {/* ROOM IMAGE CONTAINER */}
              <div className="relative w-full aspect-[4/3] select-none overflow-hidden bg-black">
                <img
                  src={designedRoomImage}
                  alt="AI Designed Living Room"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  draggable={false}
                />

                {/* Animated AI Scanning Laser Line */}
                <motion.div
                  animate={{
                    top: ["0%", "100%", "0%"],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 2,
                  }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(251,191,36,0.9)] pointer-events-none z-20"
                />

                {/* Subtle bottom vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Top-Right AI Redesigned Pill */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-lg text-xs font-black shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    AI REDESIGNED
                  </span>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="p-3.5 bg-black/80 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant AI Room Redesign & Catalog Staging</span>
                </span>
                <Link
                  href="/designer"
                  className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1 group/link"
                >
                  <span>Design Yours</span>
                  <span className="transition-transform group-hover/link:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
