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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SlideRoom {
  id: number;
  title: string;
  style: string;
  roomType: string;
  image: string;
  itemsCount: number;
  rating: string;
  palette: string[];
}

const slideRooms: SlideRoom[] = [
  {
    id: 1,
    title: "Warm Contemporary Living Room",
    style: "Warm Contemporary",
    roomType: "Living Room",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=85",
    itemsCount: 3,
    rating: "4.9 ★",
    palette: ["#D4A373", "#CCD5AE", "#E9D8A6", "#333333"],
  },
  {
    id: 2,
    title: "Japandi Minimalist Master Suite",
    style: "Japandi Zen",
    roomType: "Master Bedroom",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=85",
    itemsCount: 4,
    rating: "5.0 ★",
    palette: ["#E6CCB2", "#DDB892", "#7F5539", "#EDE0D4"],
  },
  {
    id: 3,
    title: "Nordic Architectural Dining",
    style: "Nordic Minimal",
    roomType: "Dining Space",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85",
    itemsCount: 5,
    rating: "4.8 ★",
    palette: ["#E9ECEF", "#DEE2E6", "#495057", "#212529"],
  },
  {
    id: 4,
    title: "Modern Coastal Open Lounge",
    style: "Modern Coastal",
    roomType: "Open Studio",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&auto=format&fit=crop&q=85",
    itemsCount: 4,
    rating: "4.9 ★",
    palette: ["#A8DADC", "#457B9D", "#1D3557", "#F1FAEE"],
  },
];

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

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.35 },
      scale: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
    },
  }),
};

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slideRooms.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slideRooms.length) % slideRooms.length);
  };

  const selectSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Automatic sliding timer (pauses on mouse hover)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, currentSlide]);

  const activeRoom = slideRooms[currentSlide];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden py-16 lg:py-24"
    >
      {/* 1. Deep Space Base Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />

      {/* 2. Blueprint Grid Pattern */}
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

            {/* Animated Room Type Subtitle */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 text-base sm:text-lg md:text-xl font-semibold mb-4 text-gray-200"
            >
              <span>Explore:</span>
              <div className="inline-block relative h-7 overflow-hidden min-w-[200px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeRoom.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute left-0 text-amber-400 font-bold underline decoration-amber-500/50 underline-offset-4"
                  >
                    {activeRoom.title}
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

          {/* Right Column: Interactive Sliding Showcase Carousel (6 Columns) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 w-full relative"
          >
            {/* Main Interactive Carousel Container */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/70 shadow-2xl backdrop-blur-xl group select-none"
            >
              {/* Top Header Bar */}
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Insight Nexsus Studio</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {activeRoom.style}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-bold">{activeRoom.rating}</span>
                  <span className="text-xs text-gray-400 font-medium">· {activeRoom.roomType}</span>
                </div>
              </div>

              {/* SLIDING ROOM IMAGE CONTAINER */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={activeRoom.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={activeRoom.image}
                      alt={activeRoom.title}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />

                    {/* Subtle bottom vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Floating Style Badge */}
                    <div className="absolute top-4 left-4 z-20 pointer-events-none">
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-md text-white rounded-lg text-xs font-bold border border-white/20 shadow-md">
                        {activeRoom.roomType}
                      </span>
                    </div>

                    {/* Floating Top-Right AI Redesigned Pill */}
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                      <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-lg text-xs font-black shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        AI REDESIGNED
                      </span>
                    </div>

                    {/* Room title banner at bottom of image */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex items-center justify-between">
                      <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
                        <p className="text-xs font-bold text-white">{activeRoom.title}</p>
                        <p className="text-[10px] text-amber-400 font-semibold">{activeRoom.itemsCount} Shoppable Furniture Items</p>
                      </div>

                      {/* Color Palette Dots */}
                      <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/15">
                        {activeRoom.palette.map((color, i) => (
                          <span
                            key={i}
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Sliding Navigation Chevron Buttons */}
                <button
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Carousel Controls & Pagination Dots */}
              <div className="p-3 bg-black/90 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                {/* Clickable Slide Indicators */}
                <div className="flex items-center gap-1.5">
                  {slideRooms.map((room, idx) => (
                    <button
                      key={room.id}
                      onClick={() => selectSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentSlide === idx
                          ? "w-7 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                          : "w-2 bg-white/25 hover:bg-white/50"
                      }`}
                    />
                  ))}
                  <span className="text-[11px] text-gray-400 ml-2">
                    {currentSlide + 1} / {slideRooms.length}
                  </span>
                </div>

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
