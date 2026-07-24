import { Menu, Sparkles } from "lucide-react";
import { useUiStore } from "@/store/uiStore";

export function MobileTopbar() {
  const setOpen = useUiStore((s) => s.setMobileNavOpen);
  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-14 px-4 border-b border-ink-750 bg-ink-950/90 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-lg bg-white flex items-center justify-center">
          <Sparkles className="size-4 text-ink-950" />
        </div>
        <span className="font-semibold text-sm">Hype Conteúdo</span>
      </div>
      <button onClick={() => setOpen(true)} className="text-ink-200 p-1.5 focus-ring rounded-lg">
        <Menu className="size-5" />
      </button>
    </header>
  );
}
