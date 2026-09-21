"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Interior Designer",
    quote:
      "Insight Nexsus has completely changed how I present concepts to clients. What used to take days now takes minutes. The AI suggestions are shockingly accurate.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Homeowner",
    quote:
      "I was skeptical at first, but the redesign of my living room was spot-on. Found the exact sofa and rug from the design at stores near me. Game changer.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    role: "Real Estate Stager",
    quote:
      "For staging listings, Insight Nexsus is invaluable. I can show buyers the potential of empty rooms instantly. My staging business has grown 40% since using it.",
    rating: 5,
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

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 md:py-32 bg-[#22150E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="text-[#C9A66B] text-sm font-bold tracking-widest uppercase bg-[#8F5F4A]/15 border border-[#C9A66B]/30 px-3.5 py-1 rounded-full inline-block">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#F5EFE7] mt-4">
            What Our Users Say
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={itemVariants}
              className="relative bg-[#37241A]/80 border border-[#D8C3A5]/20 rounded-2xl p-8 hover:border-[#C9A66B]/50 hover:bg-[#3E291E] transition-all duration-300 shadow-md backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-[#C9A66B] text-[#C9A66B]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-[#F5EFE7] text-sm leading-relaxed mb-6 font-normal">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8F5F4A]/20 border border-[#C9A66B]/30 flex items-center justify-center">
                  <span className="text-[#C9A66B] text-sm font-bold">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <p className="text-[#F5EFE7] text-sm font-semibold">
                    {testimonial.name}
                  </p>
                  <p className="text-[#CDBFB2] text-xs">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
