"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Zap, FileCheck2 } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full h-full min-h-[80vh] overflow-hidden flex flex-col justify-center pt-10">
      {/* ——— Animated Background ——— */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#070612]">

        {/* Animated Orbs */}
        <motion.div
          className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-purple-600/20 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-indigo-600/20 blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Noise Texture layer removed due to missing asset */}
        <div className="absolute inset-0 bg-white/[0.01] pointer-events-none" />
      </div>

      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* ——— Bottom fade ——— */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#05040e] to-transparent z-10 pointer-events-none" />

      {/* ——— CONTENT ——— */}
      <div className="relative z-20 w-full text-center md:text-left py-20 pb-32">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto md:mx-0 space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 text-xs font-medium text-white/80 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Free &amp; Private PDF Tools
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              className="text-4xl md:text-5xl lg:text-[64px] font-bold leading-[1.05] tracking-tight text-white font-display"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Every PDF tool you&apos;ll ever need.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-base md:text-lg text-white/60 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Merge, split, compress, convert, rotate, watermark, protect, unlock all running
              locally in your browser. Your files never leave your device.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link href="/tools" className="btn btn-primary w-full sm:w-auto px-8 py-4 text-base shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                Browse All Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="#tools" className="btn btn-secondary w-full sm:w-auto px-8 py-4 text-base">
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
