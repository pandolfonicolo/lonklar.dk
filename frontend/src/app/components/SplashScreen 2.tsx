import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-20 h-20 rounded-2xl bg-[var(--nordic-accent)] flex items-center justify-center shadow-[var(--shadow-lg)]">
          <span className="text-white font-semibold text-3xl">DK</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl text-foreground">LønKlar</h1>
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-1 bg-[var(--nordic-accent)] rounded-full"
        />
      </motion.div>
    </div>
  );
}
