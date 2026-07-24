import { Modal } from "@/components/ui";

const SHORTCUT_GROUPS: { title: string; items: { keys: string; label: string }[] }[] = [
  {
    title: "Edição",
    items: [
      { keys: "Ctrl/Cmd + Z", label: "Desfazer" },
      { keys: "Ctrl/Cmd + Shift + Z", label: "Refazer" },
      { keys: "Ctrl/Cmd + D", label: "Duplicar seleção" },
      { keys: "Delete / Backspace", label: "Excluir seleção" },
      { keys: "Esc", label: "Desmarcar seleção" },
    ],
  },
  {
    title: "Organização",
    items: [
      { keys: "Ctrl/Cmd + G", label: "Agrupar elementos" },
      { keys: "Ctrl/Cmd + Shift + G", label: "Desagrupar elementos" },
      { keys: "Setas", label: "Mover elemento 1px" },
      { keys: "Shift + Setas", label: "Mover elemento 10px" },
    ],
  },
  {
    title: "Projeto",
    items: [
      { keys: "Ctrl/Cmd + S", label: "Salvar projeto" },
      { keys: "?", label: "Abrir esta lista de atalhos" },
    ],
  },
];

export function ShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Atalhos de teclado">
      <div className="flex flex-col gap-5">
        {SHORTCUT_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-ink-300">{group.title}</p>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item) => (
                <div key={item.keys} className="flex items-center justify-between text-sm">
                  <span className="text-ink-200">{item.label}</span>
                  <kbd className="text-xs rounded-md border border-ink-600 bg-ink-850 px-2 py-1 text-ink-100 font-mono">{item.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
