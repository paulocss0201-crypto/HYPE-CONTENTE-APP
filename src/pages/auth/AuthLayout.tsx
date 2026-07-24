import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-ink-950">
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 max-w-2xl mx-auto lg:mx-0 w-full">
        <div className="flex items-center gap-2.5 mb-12">
          <div className="size-9 rounded-xl bg-white flex items-center justify-center">
            <Sparkles className="size-5 text-ink-950" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Hype Conteúdo</span>
        </div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
          {children}
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 relative overflow-hidden border-l border-ink-800 items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.05),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10 max-w-md px-10 text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.25, ease: "easeInOut" }}
                className="size-14 rounded-2xl bg-ink-900 border border-ink-700 flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_20px_50px_-15px_rgba(255,255,255,0.08)]"
              >
                <Sparkles className="size-6 text-ink-200" />
              </motion.div>
            ))}
          </div>
          <h2 className="text-2xl font-semibold text-balance">Roteiros, carrosséis e Stories gerados por Inteligência Artificial</h2>
          <p className="text-sm text-ink-300 text-balance">
            Uma plataforma premium para transformar ideias em conteúdos estratégicos, prontos para publicar no Instagram.
          </p>
        </div>
      </div>
    </div>
  );
}
