"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Education from "@/components/Education";
import Experience from "@/components/Experience";
import Achievement from "@/components/Achievement";
import TechStack from "@/components/TechStack";
import WhyHireMe from "@/components/WhyHireMe";
import Contact from "@/components/Contact";
import ThreeBackground from "@/components/ThreeBackground";
import CustomCursor from "@/components/CustomCursor";
import Loader from "@/components/Loader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const minLoadTime = 2200; // Cinematic buffer for premium Lottie feel
    const startTime = Date.now();

    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, minLoadTime - elapsed);
      setTimeout(() => setIsLoading(false), delay);
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad, { once: true });
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Loader key="loader" />}
      </AnimatePresence>
      <main className={`min-h-screen font-sans antialiased text-white selection:bg-blue-500/30 selection:text-white ${isLoading ? "overflow-hidden h-screen" : "overflow-y-auto"}`}>
        <CustomCursor />
        <ThreeBackground />
        <Navbar />

        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, scale: 1.02, filter: "blur(20px)" }}
          animate={!isLoading ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Hero />
          <About />
          <Education />
          <Experience />
          <Achievement />
          <TechStack />
          <WhyHireMe />
          <Contact />
        </motion.div>

        {/* Footer */}
        <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-xs md:text-sm">
          <div className="max-w-7xl mx-auto px-6">
            <p>&copy; {new Date().getFullYear()} Sahil Narkar. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
