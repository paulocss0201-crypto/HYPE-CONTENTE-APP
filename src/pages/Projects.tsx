import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Input, ChipGroup, Select, Card, CardHover, StatusBadge, EmptyState } from "@/components/ui";
import { ProjectDetailModal } from "@/components/content";
import { useContentStore } from "@/store/contentStore";
import { useUiStore } from "@/store/uiStore";
import type { ContentFormat, ProjectStatus } from "@/types";
import { STATUS_LABEL } from "@/types";
import { contentToText, downloadTextFile } from "@/lib/exportContent";
import { formatDate, timeAgo } from "@/lib/utils";
import {
  Search,
  Clapperboard,
  Layers,
  CircleDot,
  MoreVertical,
  Pencil,
  Copy,
  Heart,
  Download,
  CalendarPlus,
  Trash2,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FORMAT_ICON: Record<ContentFormat, typeof Clapperboard> = { reels: Clapperboard, carousel: Layers, stories: CircleDot };
const FORMAT_LABEL: Record<ContentFormat, string> = { reels: "Reels", carousel: "Carrossel", stories: "Stories" };

const FORMAT_FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "reels", label: "Reels" },
  { key: "carousel", label: "Carrossel" },
  { key: "stories", label: "Stories" },
  { key: "favoritos", label: "Favoritos" },
];

export function Projects() {
  const projects = useContentStore((s) => s.projects);
  const toggleFavorite = useContentStore((s) => s.toggleFavorite);
  const removeProject = useContentStore((s) => s.removeProject);
  const duplicateProject = useContentStore((s) => s.duplicateProject);
  const updateProject = useContentStore((s) => s.updateProject);
  const pushToast = useUiStore((s) => s.pushToast);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const openId = searchParams.get("open");
  const openProject = projects.find((p) => p.id === openId);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (formatFilter === "favoritos" && !p.favorite) return false;
      if (formatFilter !== "todos" && formatFilter !== "favoritos" && p.format !== formatFilter) return false;
      if (statusFilter !== "todos" && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, search, formatFilter, statusFilter]);

  function handleExport(id: string) {
    const p = projects.find((x) => x.id === id);
    if (!p) return;
    downloadTextFile(contentToText(p.content, p.title), `${p.title}.txt`);
    pushToast("Projeto exportado", "success");
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader title="Meus projetos" description="Todos os conteúdos que você já criou, organizados em um só lugar." />

      <Card className="p-4 mb-6 flex flex-col gap-4">
        <Input icon={<Search className="size-4" />} placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex flex-wrap items-center gap-3">
          <ChipGroup options={FORMAT_FILTERS} value={formatFilter} onChange={setFormatFilter} />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[180px]">
            <option value="todos">Todos os status</option>
            {(Object.keys(STATUS_LABEL) as ProjectStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderKanban className="size-6" />}
            title={projects.length === 0 ? "Nenhum projeto ainda" : "Nenhum resultado encontrado"}
            description={projects.length === 0 ? "Gere seu primeiro conteúdo para vê-lo aqui." : "Tente ajustar os filtros ou o termo de busca."}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const Icon = FORMAT_ICON[p.format];
            return (
              <CardHover key={p.id} className="p-5 flex flex-col gap-3 relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="size-11 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                      className="p-1.5 rounded-lg text-ink-300 hover:text-white hover:bg-ink-800 transition-colors"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menuOpenId === p.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl p-1.5 shadow-lg z-20 animate-fade-up">
                        <MenuItem icon={Pencil} onClick={() => { setRenamingId(p.id); setRenameDraft(p.title); setMenuOpenId(null); }}>
                          Renomear
                        </MenuItem>
                        <MenuItem icon={Copy} onClick={() => { duplicateProject(p.id); setMenuOpenId(null); pushToast("Projeto duplicado", "success"); }}>
                          Duplicar
                        </MenuItem>
                        <MenuItem icon={Heart} onClick={() => { toggleFavorite(p.id); setMenuOpenId(null); }}>
                          {p.favorite ? "Remover dos favoritos" : "Favoritar"}
                        </MenuItem>
                        <MenuItem icon={Download} onClick={() => { handleExport(p.id); setMenuOpenId(null); }}>
                          Exportar
                        </MenuItem>
                        <MenuItem icon={CalendarPlus} onClick={() => { setSearchParams({ open: p.id }); setMenuOpenId(null); }}>
                          Mover para o calendário
                        </MenuItem>
                        <MenuItem icon={Trash2} danger onClick={() => { removeProject(p.id); setMenuOpenId(null); pushToast("Projeto excluído", "success"); }}>
                          Excluir
                        </MenuItem>
                      </div>
                    )}
                  </div>
                </div>

                {renamingId === p.id ? (
                  <Input
                    autoFocus
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateProject(p.id, { title: renameDraft });
                        setRenamingId(null);
                      }
                    }}
                    onBlur={() => {
                      updateProject(p.id, { title: renameDraft });
                      setRenamingId(null);
                    }}
                  />
                ) : (
                  <p className="font-medium text-white truncate">{p.title}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-ink-300">{FORMAT_LABEL[p.format]}</span>
                  <span className="text-xs text-ink-500">·</span>
                  <span className="text-xs text-ink-300">{formatDate(p.createdAt)}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-ink-400">Editado {timeAgo(p.updatedAt)}</p>

                <Button size="sm" variant="secondary" className="mt-auto" onClick={() => setSearchParams({ open: p.id })}>
                  Abrir
                </Button>

                {p.favorite && <Heart className="absolute top-3 right-14 size-4 fill-white text-white" />}
              </CardHover>
            );
          })}
        </div>
      )}

      {openProject && <ProjectDetailModal project={openProject} onClose={() => setSearchParams({})} />}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  children,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-colors",
        danger ? "text-danger hover:bg-danger/10" : "text-ink-100 hover:bg-ink-800 hover:text-white"
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </button>
  );
}
