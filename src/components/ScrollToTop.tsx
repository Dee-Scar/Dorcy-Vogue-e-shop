"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button. Sits above the WhatsApp button, which owns
 * bottom-6 right-6, so the two never overlap.
 */
export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll(); // in case the page is restored mid-scroll
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 12 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to top"
          title="Back to top"
          className="fixed bottom-24 right-6 z-50 p-3.5 bg-[#C9956A] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#A87A52] transition-all duration-300 flex items-center justify-center group cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" strokeWidth={2.5} />

          {/* Tooltip Label */}
          <span className="absolute right-full mr-3.5 bg-[#1C1512] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Back to top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
