import { useState } from "react";
import { Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function EditableText({
  value,
  onChange,
  multiline,
  className,
  textClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  textClassName?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function save() {
    onChange(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {multiline ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={Math.min(10, Math.max(3, Math.ceil(draft.length / 60)))}
            className="w-full rounded-lg bg-ink-800 border border-ink-500 px-3 py-2 text-sm text-white focus-ring resize-y"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg bg-ink-800 border border-ink-500 px-3 py-2 text-sm text-white focus-ring"
          />
        )}
        <button
          onClick={save}
          className="self-end flex items-center gap-1 text-xs font-medium text-ink-950 bg-white rounded-lg px-2.5 py-1 hover:bg-ink-50"
        >
          <Check className="size-3" /> Salvar
        </button>
      </div>
    );
  }

  return (
    <div className={cn("group relative flex items-start gap-2", className)}>
      <p className={cn("text-sm text-ink-100 whitespace-pre-line flex-1", textClassName)}>{value}</p>
      <button
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-ink-400 hover:text-white p-1 rounded-md"
        aria-label="Editar"
      >
        <Pencil className="size-3.5" />
      </button>
    </div>
  );
}
