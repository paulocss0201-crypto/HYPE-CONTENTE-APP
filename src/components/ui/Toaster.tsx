import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "@/store/uiStore";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-ink-800 border border-ink-600 px-4 py-2.5 text-sm text-white shadow-lg max-w-[92vw]"
          >
            {t.variant === "success" && <CheckCircle2 className="size-4 text-success shrink-0" />}
            {t.variant === "error" && <XCircle className="size-4 text-danger shrink-0" />}
            {(!t.variant || t.variant === "default") && <Info className="size-4 text-ink-200 shrink-0" />}
            <span className="truncate">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
