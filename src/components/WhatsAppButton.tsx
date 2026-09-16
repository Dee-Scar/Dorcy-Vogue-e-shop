"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const AUTO_MINIMISE_MS = 5000;

const WhatsAppGlyph = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.379 2.28 13.919 1.277 12.007 1.277c-5.435 0-9.85 4.372-9.855 9.803-.002 1.761.477 3.478 1.39 4.996l-.992 3.613 3.73-.967zm12.355-6.425c-.328-.163-1.94-.945-2.24-1.053-.298-.11-.517-.163-.73.163-.215.328-.834 1.054-1.02 1.267-.188.214-.377.24-.705.077-.328-.163-1.385-.505-2.637-1.611-.973-.858-1.63-1.918-1.82-2.247-.19-.328-.02-.505.143-.668.147-.146.328-.377.49-.567.164-.188.218-.328.328-.546.11-.218.055-.41-.027-.573-.082-.164-.73-1.748-1.002-2.395-.26-.63-.53-.54-.73-.55-.187-.01-.403-.01-.618-.01-.215 0-.566.08-.863.407-.297.327-1.135 1.09-1.135 2.66 0 1.571 1.153 3.09 1.312 3.298.158.21 2.27 3.43 5.5 4.805.768.327 1.368.522 1.833.668.772.242 1.475.208 2.03.125.619-.092 1.94-.784 2.215-1.543.275-.76.275-1.41.19-1.543-.084-.13-.298-.21-.627-.375z" />
  </svg>
);

/**
 * WhatsApp button that stays out of the way: it sits as a small tab on the
 * right edge, expands to a full bubble when tapped, then tucks itself back
 * after five seconds. Hovering holds it open so it cannot vanish mid-click.
 */
export const WhatsAppButton = () => {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!expanded || hovered) return; // hovering pauses; leaving restarts the 5s
    const id = setTimeout(() => setExpanded(false), AUTO_MINIMISE_MS);
    return () => clearTimeout(id);
  }, [expanded, hovered]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {expanded ? (
        <motion.div
          key="full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 12 }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <motion.a
            href="https://wa.me/2349071262856"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:bg-[#20ba5a] transition-all duration-300 cursor-pointer"
            title="Chat on WhatsApp"
          >
            {/* Pulse ring background */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10" />
            <WhatsAppGlyph className="w-5 h-5 fill-current" />
          </motion.a>

          {/* Tooltip Label */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3.5 bg-[#1C1512] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
            Chat on WhatsApp
          </span>
        </motion.div>
      ) : (
        <motion.button
          key="tab"
          type="button"
          onClick={() => setExpanded(true)}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 14 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open WhatsApp chat button"
          title="Chat on WhatsApp"
          className="fixed bottom-6 right-0 z-50 flex items-center rounded-l-full bg-[#25D366] py-2.5 pl-3 pr-2 text-white shadow-lg hover:bg-[#20ba5a] hover:pr-3 transition-all duration-300 cursor-pointer"
        >
          <WhatsAppGlyph className="w-4 h-4 fill-current" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
