"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Scan,
  Wand2,
  Sofa,
  PiggyBank,
  MapPin,
  ClipboardList,
  Sparkles,
} from "lucide-react";

const row1Features = [
  {
    icon: Scan,
    badge: "01 · Vision Scan",
    title: "Room Scanning",
    description:
      "Point your camera and our AI instantly maps your room's dimensions, furniture, and lighting conditions.",
  },
  {
    icon: Wand2,
    badge: "02 · Generative Staging",
    title: "AI Redesign",
    description:
      "Generate stunning redesigns in seconds. Choose from dozens of styles or let AI suggest what works best.",
  },
  {
    icon: Sofa,
    badge: "03 · Live Retail Catalog",
    title: "Real Furniture",
    description:
      "Every piece in your design links to actual products from top retailers. What you see is what you can buy.",
  },
];

const row2Features = [
  {
    icon: PiggyBank,
    badge: "04 · Cost Intelligence",
    title: "Budget Control",
    description:
      "Set your budget and get redesigns that match. No surprises at checkout — just beautiful, affordable spaces.",
  },
  {
    icon: MapPin,
    badge: "05 · OpenStreetMap GPS",
    title: "Store Locator",
    description:
      "Find nearby stores that carry your selected furniture. Support local or shop online — your choice.",
  },
  {
    icon: ClipboardList,
    badge: "06 · Export & PDF",
    title: "Shopping Lists",
    description:
      "Auto-generated shopping lists with prices, links, and quantities. Share with your designer or buy yourself.",
  },
];

// All 6 features combined for seamless continuous looping track
const allFeatures = [...row1Features, ...row2Features];

export default function Features() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section id="features" className="py-24 md:py-32 bg-[#0a0a0a] overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 text-amber-400 text-xs sm:text-sm font-bold tracking-widest uppercase bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Why Insight Nexsus
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mt-2 tracking-tight">
            Everything You Need to Design Smarter
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mt-4">
            From instant AI room mapping to guaranteed real store products and live budget calculation.
          </p>
        </motion.div>
      </div>

      {/* CONTINUOUS MOVING CARDS TRACK (LEFT TO RIGHT ANIMATION) */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        {/* ROW 1: Moving Smoothly Left to Right */}
        <div className="flex mb-6 w-max">
          <motion.div
            animate={{
              x: isPaused ? undefined : ["-50%", "0%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 26,
                ease: "linear",
              },
            }}
            className="flex gap-6 shrink-0"
          >
            {/* Duplicated list for seamless infinite loop */}
            {[...allFeatures, ...allFeatures].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`row1-${feature.title}-${idx}`}
                  className="group relative w-[320px] sm:w-[380px] shrink-0 bg-white/[0.03] border border-white/10 hover:border-amber-500/40 rounded-2xl p-7 transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 backdrop-blur-md"
                >
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:scale-110 transition-all duration-300 shadow-inner">
                      <Icon size={22} className="text-amber-400" />
                    </div>
                    <span className="text-[11px] font-bold text-amber-400/80 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-white text-lg font-bold mb-2.5 group-hover:text-amber-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ROW 2: Moving Smoothly in Opposite Direction (Right to Left) for visual balance */}
        <div className="flex w-max">
          <motion.div
            animate={{
              x: isPaused ? undefined : ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 28,
                ease: "linear",
              },
            }}
            className="flex gap-6 shrink-0"
          >
            {[...allFeatures.slice().reverse(), ...allFeatures.slice().reverse()].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={`row2-${feature.title}-${idx}`}
                  className="group relative w-[320px] sm:w-[380px] shrink-0 bg-white/[0.03] border border-white/10 hover:border-amber-500/40 rounded-2xl p-7 transition-all duration-300 hover:bg-white/[0.06] hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/10 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 shadow-inner">
                      <Icon size={22} className="text-blue-400" />
                    </div>
                    <span className="text-[11px] font-bold text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-white text-lg font-bold mb-2.5 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
