"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image"; // ✅ Added for optimized image caching

export default function GlobalLoader({ loading }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center
                     bg-gradient-to-br from-[#07030d] via-[#12081a] to-[#2a0f1f]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Glass Card */}
          <motion.div
            className="relative flex flex-col items-center gap-5
                       px-14 py-20 rounded-3xl
                       bg-white/5 backdrop-blur-xl
                       border border-white/10
                       shadow-[0_0_90px_rgba(212,175,55,0.18)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* ORBIT RINGS */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="absolute w-70 h-70 rounded-full
                           border border-[#D4AF37]/30"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full
                           border border-[#FFD700]/20"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
              />
            </div>

            {/* ✅ OPTIMIZED CACHED LOGO */}
            <motion.div className="relative w-28 h-28 md:w-36 md:h-36 relative z-10 drop-shadow-2xl">
              <Image
                src="/klogo.png"
                alt="Kalakruthi Logo"
                fill
                priority={true} // ✅ Priority loading for above-fold
                quality={100}
                sizes="(max-width: 768px) 112px, 144px"
                className="object-contain"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.6,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            {/* BRAND NAME */}
            <motion.h1
              className="relative z-10 text-center
                         text-3xl md:text-4xl font-serif tracking-wide
                         bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#FFF2C0]
                         bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Kalakruthi
            </motion.h1>

            {/* TAGLINE */}
            <motion.p
              className="relative z-10 text-center
                         text-xs md:text-sm uppercase tracking-[0.35em]
                         text-white/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              Photography
            </motion.p>

            {/* LOADING LINE */}
            <div className="relative z-10 w-40 h-[2px]
                            bg-white/10 overflow-hidden rounded-full">
              <motion.div
                className="absolute inset-0
                           bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeInOut",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
