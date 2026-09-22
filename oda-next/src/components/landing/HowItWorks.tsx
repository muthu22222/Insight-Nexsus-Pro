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
    <section id="how-it-works" className="py-24 md:py-32 bg-[var(--surface)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[#2B1B12] dark:text-white text-sm font-bold tracking-widest uppercase bg-[var(--surface-secondary)] border border-[var(--border)] px-3.5 py-1 rounded-full inline-block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#2B1B12] dark:text-white mt-4 tracking-tight">
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
                <span className="absolute -top-6 -left-2 text-7xl md:text-8xl font-black text-[#2B1B12]/15 dark:text-white/15 select-none pointer-events-none">
                  {step.number}
                </span>

                <div className="relative bg-[var(--background)] border border-[var(--border)] rounded-2xl p-8 hover:border-[var(--text-secondary)] transition-all duration-300 hover:shadow-xl h-full backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center mb-6 group-hover:scale-105 transition-all duration-300 shadow-xs">
                    <Icon size={24} className="text-[#2B1B12] dark:text-white" />
                  </div>

                  <h3 className="text-[#2B1B12] dark:text-white text-xl font-bold mb-3">
                    {step.title}
                  </h3>

                  <p className="text-[#5F5750] dark:text-[#D6CEC5] text-sm leading-relaxed">
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
