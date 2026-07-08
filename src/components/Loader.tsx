"use client";

import { motion } from "framer-motion";

/**
 * Dynamic Lottie + Dots Loader
 * Features:
 * - Shifting gradient background (Blue -> Purple -> Black)
 * - Centered Futuristic Lottie
 * - 3-5 Synchronized bouncing dots
 * - Smooth cinematic exit transitions
 */

export default function Loader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.9,
        filter: "blur(20px)",
        transition: { duration: 1, ease: "easeInOut" }
      }}
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Shifting Gradient Background */}
      <motion.div
        animate={{
          background: [
            "radial-gradient(circle at center, #0B1121 0%, #02040a 100%)",
            "radial-gradient(circle at center, #1E1B4B 0%, #02040a 100%)",
            "radial-gradient(circle at center, #0B1121 0%, #02040a 100%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0"
      />

      {/* 2. Central Unit */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Glow Effect behind Content */}
        <div className="absolute w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full" />

        {/* Old Circle Preloader */}
        <div className="relative w-48 md:w-64 h-48 md:h-64 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-4 border-blue-500/20 border-t-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.35)]"
          />
        </div>

        {/* 3. Moving Dots Animation */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.2, 1],
                  backgroundColor: ["lab(81 -6.67 -14.98 / 0.9)", "var(--secondary)", "lab(81 -6.67 -14.98 / 0.9)"]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]"
              />
            ))}
          </motion.div>

          {/* Text Labels */}
          <div className="text-center">
            <h2 className="text-white text-xs md:text-sm font-black tracking-[0.6em] uppercase opacity-80 mb-2">
              Initializing Portfolio
            </h2>
            <p className="text-blue-400/60 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">
              Crafting visual modules
            </p>
          </div>
        </div>

      </div>

      {/* Corner Accents */}
      <div className="absolute top-12 left-12 w-16 h-16 border-t-2 border-l-2 border-blue-500/10 rounded-tl-2xl" />
      <div className="absolute bottom-12 right-12 w-16 h-16 border-b-2 border-r-2 border-blue-500/10 rounded-br-2xl" />

    </motion.div>
  );
}
