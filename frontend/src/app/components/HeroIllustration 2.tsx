import { motion } from "motion/react";

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto h-48 mb-8">
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background shapes */}
        <motion.circle
          cx="100"
          cy="100"
          r="60"
          fill="var(--nordic-accent-light)"
          stroke="var(--glass-border-subtle)"
          strokeWidth="0.5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.2, 0, 0.38, 0.9] }}
        />
        <motion.circle
          cx="300"
          cy="100"
          r="50"
          fill="var(--glass-bg)"
          stroke="var(--glass-border-subtle)"
          strokeWidth="0.5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.2, 0, 0.38, 0.9] }}
        />

        {/* Document shapes */}
        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Left document */}
          <rect
            x="60"
            y="60"
            width="80"
            height="100"
            rx="6"
            fill="rgba(255,255,255,0.7)"
            stroke="var(--glass-border)"
            strokeWidth="1"
          />
          <rect x="70" y="75" width="40" height="4" rx="2" fill="var(--muted)" />
          <rect x="70" y="85" width="60" height="4" rx="2" fill="var(--muted)" />
          <rect x="70" y="95" width="50" height="4" rx="2" fill="var(--nordic-accent)" />
          <rect x="70" y="110" width="35" height="6" rx="2" fill="var(--nordic-accent)" />
        </motion.g>

        <motion.g
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Right document */}
          <rect
            x="260"
            y="70"
            width="80"
            height="100"
            rx="6"
            fill="rgba(255,255,255,0.7)"
            stroke="var(--glass-border)"
            strokeWidth="1"
          />
          <circle cx="300" cy="95" r="12" fill="var(--nordic-accent-light)" />
          <rect x="270" y="115" width="60" height="4" rx="2" fill="var(--muted)" />
          <rect x="270" y="125" width="50" height="4" rx="2" fill="var(--muted)" />
          <rect x="270" y="140" width="40" height="6" rx="2" fill="var(--nordic-accent)" />
        </motion.g>

        {/* Center connecting arrow */}
        <motion.g
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <line
            x1="145"
            y1="110"
            x2="255"
            y2="110"
            stroke="var(--nordic-accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <polygon
            points="255,110 245,105 245,115"
            fill="var(--nordic-accent)"
          />
        </motion.g>
      </svg>
    </div>
  );
}
