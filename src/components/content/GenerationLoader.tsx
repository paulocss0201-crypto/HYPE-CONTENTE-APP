import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LOADING_PHRASES } from "@/lib/ai";
import { ProgressBar } from "@/components/ui";

export function GenerationLoader() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setIndex((i) => Math.min(i + 1, LOADING_PHRASES.length - 1));
    }, 900);
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 14, 96));
    }, 400);
    return () => {
      clearInterval(phraseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="size-16 rounded-2xl bg-ink-900 border border-ink-700 flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_-15px_rgba(255,255,255,0.1)]"
      >
        <Sparkles className="size-7 text-white" />
      </motion.div>

      <div className="h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-sm font-medium text-ink-100"
          >
            {LOADING_PHRASES[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-xs">
        <ProgressBar value={progress} />
      </div>
    </div>
  );
}
