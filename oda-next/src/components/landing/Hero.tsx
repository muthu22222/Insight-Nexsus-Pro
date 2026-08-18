"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const hotspots = [
  {
    id: 1,
    top: "35%",
    left: "25%",
    name: "Modern Sofa",
    price: "$1,299",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop",
  },
  {
    id: 2,
    top: "55%",
    left: "65%",
    name: "Floor Lamp",
    price: "$249",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab382?w=300&h=200&fit=crop",
  },
  {
    id: 3,
    top: "70%",
    left: "40%",
    name: "Area Rug",
    price: "$459",
    image: "https://images.unsplash.com/photo-1600166898405-da9535204843?w=300&h=200&fit=crop",
  },
];

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
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.05)_0%,transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 text-amber-500 text-sm font-medium bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5">
                <Sparkles size={14} />
                AI-Powered Interior Design
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.9] tracking-tight mb-6"
            >
              <span className="block text-white">DESIGN</span>
              <span className="block text-white">YOUR</span>
              <span className="block text-amber-500">SPACE.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-amber-400/80 font-medium mb-4"
            >
              Turn Your Room Into Your Dream room
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="text-gray-400 text-base md:text-lg max-w-md mb-8 leading-relaxed"
            >
              Upload your room, tell us what you love, and let AI design a space
              you can actually shop.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-4 rounded-lg text-sm transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
              >
                START DESIGNING
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
              >
                TRY A REDESIGN
                <ArrowRight size={16} />
              </Link>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-xs text-gray-500"
            >
              No credit card required • AI-powered • Real furniture
            </motion.p>
          </motion.div>

          {/* Right: Interactive Room Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02]">
              {/* Placeholder room visual */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-500/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Sparkles size={32} className="text-amber-500" />
                  </div>
                  <p className="text-gray-500 text-sm">Interactive Room Preview</p>
                </div>
              </div>

              {/* Hotspot dots */}
              {hotspots.map((spot) => (
                <div
                  key={spot.id}
                  className="absolute"
                  style={{ top: spot.top, left: spot.left }}
                >
                  <button
                    onClick={() =>
                      setActiveHotspot(activeHotspot === spot.id ? null : spot.id)
                    }
                    className="relative group"
                  >
                    {/* Pulsing ring */}
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/40" />
                    {/* Dot */}
                    <span className="relative block w-4 h-4 rounded-full bg-amber-500 border-2 border-[#0a0a0a] cursor-pointer shadow-lg shadow-amber-500/30" />

                    {/* Product card tooltip */}
                    {activeHotspot === spot.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20"
                      >
                        <div className="w-full h-28 bg-white/5">
                          <img
                            src={spot.image}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-white text-sm font-semibold">{spot.name}</p>
                          <p className="text-amber-500 text-sm font-bold">{spot.price}</p>
                        </div>
                      </motion.div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
