import { NavLink, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Sparkles, ChevronUp } from "lucide-react";
import { useState } from "react";
import { PLAN_LABEL } from "@/lib/plans";

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-ink-750 bg-ink-950 z-30">
      <div className="flex items-center gap-2.5 px-6 h-20 shrink-0">
        <div className="size-8 rounded-lg bg-white flex items-center justify-center">
          <Sparkles className="size-4.5 text-ink-950" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Hype Conteúdo</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring",
                isActive ? "bg-ink-800 text-white" : "text-ink-300 hover:bg-ink-850 hover:text-white"
              )
            }
          >
            <item.icon className="size-[18px] shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-750 relative">
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 glass-card rounded-xl p-1.5 shadow-lg animate-fade-up">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/plans");
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
            >
              Fazer upgrade
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate("/settings");
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-ink-100 hover:bg-ink-800 hover:text-white transition-colors"
            >
              Configurações
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-ink-850 transition-colors focus-ring"
        >
          <div className="size-9 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center text-sm font-semibold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{user?.name ?? "Usuário"}</p>
            <p className="text-xs text-ink-300 truncate">Plano {PLAN_LABEL[user?.plan ?? "gratuito"]}</p>
          </div>
          <ChevronUp className={cn("size-4 text-ink-300 transition-transform shrink-0", menuOpen && "rotate-180")} />
        </button>
      </div>
    </aside>
  );
}
