"use client";

import { motion } from "framer-motion";
import { Scan, Wand2, Sofa, PiggyBank, MapPin, ClipboardList } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Room Scanning",
    description:
      "Point your camera and our AI instantly maps your room's dimensions, furniture, and lighting conditions.",
  },
  {
    icon: Wand2,
    title: "AI Redesign",
    description:
      "Generate stunning redesigns in seconds. Choose from dozens of styles or let AI suggest what works best.",
  },
  {
    icon: Sofa,
    title: "Real Furniture",
    description:
      "Every piece in your design links to actual products from top retailers. What you see is what you can buy.",
  },
  {
    icon: PiggyBank,
    title: "Budget Control",
    description:
      "Set your budget and get redesigns that match. No surprises at checkout — just beautiful, affordable spaces.",
  },
  {
    icon: MapPin,
    title: "Store Locator",
    description:
      "Find nearby stores that carry your selected furniture. Support local or shop online — your choice.",
  },
  {
    icon: ClipboardList,
    title: "Shopping Lists",
    description:
      "Auto-generated shopping lists with prices, links, and quantities. Share with your designer or buy yourself.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-32 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-amber-500 text-sm font-semibold tracking-widest uppercase">
            Why ODA Next
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-4">
            Everything You Need to Design Smarter
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:border-amber-500/30 transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:bg-amber-500/20 transition-colors duration-300">
                  <Icon size={22} className="text-amber-500" />
                </div>

                <h3 className="text-white text-lg font-bold mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
