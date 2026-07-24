import { NavLink, useNavigate } from "react-router-dom";
import { NAV_ITEMS, MOBILE_PRIMARY_KEYS } from "./navItems";
import { cn } from "@/lib/utils";
import { Menu, LogOut, X, Sparkles } from "lucide-react";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { PLAN_LABEL } from "@/lib/plans";

export function MobileBottomNav() {
  const primaryItems = NAV_ITEMS.filter((i) => MOBILE_PRIMARY_KEYS.includes(i.key));
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-ink-750 bg-ink-950/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-16">
        {primaryItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                isActive ? "text-white" : "text-ink-400"
              )
            }
          >
            <item.icon className="size-5" />
            {item.label.split(" ")[0]}
          </NavLink>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-ink-400"
        >
          <Menu className="size-5" />
          Mais
        </button>
      </div>
    </nav>
  );
}

export function MobileDrawer() {
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink-950 border-r border-ink-750 flex flex-col"
          >
            <div className="flex items-center justify-between px-5 h-16 shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-white flex items-center justify-center">
                  <Sparkles className="size-4 text-ink-950" />
                </div>
                <span className="font-semibold">Hype Conteúdo</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-ink-300 p-1">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive ? "bg-ink-800 text-white" : "text-ink-300"
                    )
                  }
                >
                  <item.icon className="size-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-ink-750 flex items-center gap-3">
              <div className="size-9 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name ?? "Usuário"}</p>
                <p className="text-xs text-ink-300">Plano {PLAN_LABEL[user?.plan ?? "gratuito"]}</p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate("/login");
                }}
                className="text-ink-300 p-2"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
