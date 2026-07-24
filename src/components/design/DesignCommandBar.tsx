import { useState } from "react";
import { Wand2, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "deixe o fundo mais escuro",
  "aumente o título",
  "centralize tudo",
  "melhore a hierarquia",
  "deixe mais premium",
  "adapte para Stories",
];

export function DesignCommandBar({ onCommand }: { onCommand: (raw: string) => void }) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  function submit() {
    if (!value.trim()) return;
    onCommand(value);
    setValue("");
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-ink-600 bg-ink-850/80 backdrop-blur px-3.5 py-2 w-[340px] focus-within:border-ink-300 focus-within:shadow-[0_0_16px_rgba(255,255,255,0.12)] transition-all">
        <Wand2 className="size-4 text-ink-300 shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Diga o que quer mudar no design..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-ink-400 outline-none min-w-0"
        />
        <button onClick={submit} className="shrink-0 text-ink-300 hover:text-white">
          <Sparkles className="size-4" />
        </button>
      </div>

      {focused && !value && (
        <div className="absolute top-full mt-1.5 left-0 right-0 rounded-xl border border-ink-700 bg-ink-900 shadow-xl p-1.5 flex flex-col gap-0.5 z-20">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onMouseDown={(e) => {
                e.preventDefault();
                onCommand(s);
              }}
              className="text-left text-xs text-ink-200 hover:text-white hover:bg-ink-800 rounded-lg px-2.5 py-1.5"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
