"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Sliders, CheckCircle, Tag, ShoppingBag, Eye } from "lucide-react";

interface Hotspot {
  id: number;
  top: string;
  left: string;
  name: string;
  price: string;
  category: string;
  image: string;
}

const hotspots: Hotspot[] = [
  {
    id: 1,
    top: "58%",
    left: "32%",
    name: "Luxury Bouclé Sectional Sofa",
    price: "₹65,000",
    category: "Main Seating",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    top: "42%",
    left: "76%",
    name: "Arched Brass Floor Lamp",
    price: "₹12,500",
    category: "Ambient Lighting",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab382?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    top: "72%",
    left: "54%",
    name: "Italian Carrara Coffee Table",
    price: "₹24,900",
    category: "Accent Furniture",
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop&q=80",
  },
];

const emptyRoomImage =
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=85";
const furnishedRoomImage =
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
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"slider" | "furnished" | "empty">("slider");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.max(5, Math.min(95, Math.round((x / rect.width) * 100)));
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleSliderMove(e.touches[0].clientX);
  };

  // Auto-animate slider slightly on mount for discovery
  useEffect(() => {
    const timer = setTimeout(() => {
      setSliderPosition(45);
      setTimeout(() => setSliderPosition(55), 400);
      setTimeout(() => setSliderPosition(50), 800);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

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
                AI-Powered Interior Design & Instant Room Staging
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
              Turn Your Bare Room Into Your Dream Interior
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-gray-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-normal"
            >
              Upload a photo of your empty or existing room, choose your aesthetic, and let AI render photorealistic furnished interiors matched with real catalog products.
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
                Slide before/after
              </span>
            </motion.div>
          </motion.div>

          {/* Right: Interactive Slide-to-View Room Visual (6 Columns) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/60 shadow-2xl backdrop-blur-xl">
              {/* Top View Mode Control Tabs */}
              <div className="p-3 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Interactive Room Staging</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode("slider")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      viewMode === "slider" ? "bg-amber-500 text-black shadow-xs" : "text-white/80 hover:text-white"
                    }`}
                  >
                    Slide Compare ◂▸
                  </button>
                  <button
                    onClick={() => setViewMode("furnished")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      viewMode === "furnished" ? "bg-white text-black shadow-xs" : "text-white/80 hover:text-white"
                    }`}
                  >
                    AI Furnished ✨
                  </button>
                  <button
                    onClick={() => setViewMode("empty")}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      viewMode === "empty" ? "bg-white text-black shadow-xs" : "text-white/80 hover:text-white"
                    }`}
                  >
                    Empty Room 📷
                  </button>
                </div>
              </div>

              {/* SLIDE-TO-VIEW CONTAINER */}
              <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                className="relative w-full aspect-[4/3] select-none overflow-hidden cursor-ew-resize bg-black"
              >
                {/* 1. Base Layer: AI Furnished Room */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={furnishedRoomImage}
                    alt="AI Furnished Room Design"
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* 2. Top Split Layer: Empty Bare Room (Clipped by slider position) */}
                <div
                  className="absolute inset-0 w-full h-full overflow-hidden transition-all pointer-events-none"
                  style={{
                    clipPath:
                      viewMode === "slider"
                        ? `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                        : viewMode === "empty"
                        ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                        : "polygon(0 0, 0 0, 0 100%, 0 100%)",
                  }}
                >
                  <img
                    src={emptyRoomImage}
                    alt="Original Empty Room"
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                  {/* Subtle vignette on empty room */}
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* 3. Floating Left / Right Pills */}
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-white rounded-lg text-[10px] font-extrabold border border-white/20 shadow-md">
                    EMPTY ROOM
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-20 pointer-events-none">
                  <span className="px-2.5 py-1 bg-amber-500 text-black rounded-lg text-[10px] font-black shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-black" />
                    AI FURNISHED
                  </span>
                </div>

                {/* 4. Interactive Hotspots (Rendered on Furnished Side) */}
                {viewMode !== "empty" &&
                  hotspots.map((spot) => {
                    const leftNum = parseInt(spot.left, 10);
                    // Only show hotspot when slider has revealed that part
                    if (viewMode === "slider" && leftNum <= sliderPosition) return null;

                    return (
                      <div
                        key={spot.id}
                        className="absolute z-20 pointer-events-auto"
                        style={{ top: spot.top, left: spot.left }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHotspot(activeHotspot === spot.id ? null : spot.id);
                          }}
                          className="relative group focus:outline-none"
                          title={spot.name}
                        >
                          <span className="absolute -inset-1.5 animate-ping rounded-full bg-amber-400/50" />
                          <span className="relative flex items-center justify-center w-6 h-6 rounded-full bg-black/90 border-2 border-amber-400 text-amber-400 text-[10px] font-black shadow-lg cursor-pointer hover:scale-110 transition-transform">
                            {spot.id}
                          </span>

                          {/* Product Card Tooltip */}
                          <AnimatePresence>
                            {activeHotspot === spot.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-2xl text-left z-30"
                              >
                                <div className="w-full h-24 bg-white/5">
                                  <img
                                    src={spot.image}
                                    alt={spot.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="p-2.5">
                                  <p className="text-white text-xs font-bold truncate">{spot.name}</p>
                                  <p className="text-[10px] text-gray-400">{spot.category}</p>
                                  <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10">
                                    <span className="text-amber-400 text-xs font-extrabold">{spot.price}</span>
                                    <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded">
                                      Real Store Item
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>
                    );
                  })}

                {/* 5. SLIDER HANDLE (Visible when in slider mode) */}
                {viewMode === "slider" && (
                  <div
                    className="absolute top-0 bottom-0 z-30 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    {/* Vertical Dividing Line */}
                    <div className="absolute top-0 bottom-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)]" />

                    {/* Circular Drag Handle */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-4.5 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-2xl border-2 border-amber-500 cursor-ew-resize font-black text-xs pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px]">◀</span>
                        <span className="text-[10px]">▶</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Instruction Bar */}
              <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Drag slider to compare empty room vs AI design</span>
                </span>
                <Link
                  href="/designer"
                  className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Try Your Room</span>
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
