"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, Paintbrush, ShoppingBag } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload",
    description:
      "Take a photo of your room or upload one from your camera roll. It takes just seconds.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "Analyze",
    description:
      "Our AI scans your space, mapping dimensions, lighting, and existing decor in real time.",
  },
  {
    number: "03",
    icon: Paintbrush,
    title: "Redesign",
    description:
      "Choose a style — modern, minimalist, cozy — and watch your room transform instantly.",
  },
  {
    number: "04",
    icon: ShoppingBag,
    title: "Shop",
    description:
      "Every item in your new design links directly to real stores. Buy what you love.",
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
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#291C0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[#A78D78] text-sm font-bold tracking-widest uppercase bg-[#6E473B]/20 border border-[#A78D78]/30 px-3.5 py-1 rounded-full inline-block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#FAF6F0] mt-4">
            Four Steps to Your Dream Space
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="relative group"
              >
                {/* Large faded number */}
                <span className="absolute -top-6 -left-2 text-7xl md:text-8xl font-black text-[#E1D4C2]/[0.07] select-none pointer-events-none">
                  {step.number}
                </span>

                <div className="relative bg-[#362413]/60 border border-[#523A25] rounded-2xl p-8 hover:border-[#A78D78]/60 transition-all duration-300 hover:bg-[#362413]/90 hover:shadow-xl hover:shadow-[#20160B] h-full backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-xl bg-[#6E473B]/25 border border-[#A78D78]/30 flex items-center justify-center mb-6 group-hover:bg-[#6E473B]/40 group-hover:scale-105 transition-all duration-300 shadow-inner">
                    <Icon size={24} className="text-[#E1D4C2]" />
                  </div>

                  <h3 className="text-[#FAF6F0] text-xl font-bold mb-3">
                    {step.title}
                  </h3>

                  <p className="text-[#BEB5A9] text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
