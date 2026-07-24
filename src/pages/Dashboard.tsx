import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardHover, Badge, StatusBadge, EmptyState } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useBrandStore } from "@/store/brandStore";
import { useContentStore, projectsThisMonth } from "@/store/contentStore";
import { generateIdeas } from "@/lib/ai";
import { Clapperboard, Layers, CircleDot, Sparkles, Heart, CalendarDays, FolderKanban, ArrowRight, Lightbulb } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/utils";

const FORMAT_ICON = { reels: Clapperboard, carousel: Layers, stories: CircleDot };
const FORMAT_LABEL = { reels: "Reels", carousel: "Carrossel", stories: "Stories" };

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const brand = useBrandStore((s) => s.profile);
  const projects = useContentStore((s) => s.projects);
  const calendarEntries = useContentStore((s) => s.calendarEntries);

  const recentProjects = useMemo(() => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4), [projects]);
  const favoriteProjects = useMemo(() => projects.filter((p) => p.favorite).slice(0, 4), [projects]);
  const monthCount = projectsThisMonth(projects);

  const upcoming = useMemo(
    () =>
      [...calendarEntries]
        .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 4),
    [calendarEntries]
  );

  const ideas = useMemo(
    () =>
      generateIdeas({
        count: 3,
        objective: "",
        format: "todos",
        theme: brand.segment,
        creativity: 60,
        brand,
        salt: Date.now() / 100000,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader
        title={`Olá, ${user?.name ?? brand.userName ?? "por aí"}. O que vamos criar hoje?`}
        description="Escolha um formato para começar ou continue de onde parou."
        action={
          <Button icon={<Sparkles className="size-4" />} onClick={() => navigate("/create")}>
            Criar novo conteúdo
          </Button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <CreationCard
          icon={Clapperboard}
          title="Criar Reels"
          description="Crie roteiros estratégicos para vídeos curtos, com gancho, desenvolvimento e chamada para ação."
          cta="Criar roteiro"
          onClick={() => navigate("/create/reels")}
        />
        <CreationCard
          icon={Layers}
          title="Criar Carrossel"
          description="Transforme ideias em carrosséis educativos, persuasivos e prontos para publicar."
          cta="Criar carrossel"
          onClick={() => navigate("/create/carousel")}
        />
        <CreationCard
          icon={CircleDot}
          title="Criar Stories"
          description="Crie sequências de Stories para gerar conexão, engajamento e vendas."
          cta="Criar Stories"
          onClick={() => navigate("/create/stories")}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <p className="text-xs text-ink-300 mb-1">Conteúdos gerados no mês</p>
          <p className="text-3xl font-semibold">{monthCount}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-300 mb-1">Total de projetos</p>
          <p className="text-3xl font-semibold">{projects.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-ink-300 mb-1">Favoritos</p>
          <p className="text-3xl font-semibold">{projects.filter((p) => p.favorite).length}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="size-4 text-ink-300" />
              <p className="text-sm font-semibold">Conteúdos criados recentemente</p>
            </div>
            <button onClick={() => navigate("/projects")} className="text-xs text-ink-300 hover:text-white flex items-center gap-1">
              Ver todos <ArrowRight className="size-3" />
            </button>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState title="Nenhum conteúdo ainda" description="Seus conteúdos gerados aparecerão aqui." />
          ) : (
            <div className="flex flex-col gap-2">
              {recentProjects.map((p) => {
                const Icon = FORMAT_ICON[p.format];
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/projects?open=${p.id}`)}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-ink-850 transition-colors text-left"
                  >
                    <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-ink-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-ink-300">{FORMAT_LABEL[p.format]} · {timeAgo(p.updatedAt)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-ink-300" />
              <p className="text-sm font-semibold">Próximas publicações</p>
            </div>
            <button onClick={() => navigate("/calendar")} className="text-xs text-ink-300 hover:text-white flex items-center gap-1">
              Ver calendário <ArrowRight className="size-3" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState title="Nada agendado ainda" description="Agende publicações no calendário editorial." />
          ) : (
            <div className="flex flex-col gap-2">
              {upcoming.map((e) => {
                const Icon = FORMAT_ICON[e.format];
                return (
                  <div key={e.id} className="flex items-center gap-3 rounded-xl p-2.5">
                    <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-ink-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <p className="text-xs text-ink-300">{formatDate(e.date)} {e.time && `às ${e.time}`}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="size-4 text-ink-300" />
            <p className="text-sm font-semibold">Ideias recomendadas pela IA</p>
          </div>
          <div className="flex flex-col gap-2">
            {ideas.map((idea) => (
              <div key={idea.id} className="rounded-xl border border-ink-700 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge>{idea.category}</Badge>
                </div>
                <p className="text-sm font-medium mb-1">{idea.title}</p>
                <p className="text-xs text-ink-300 mb-2">{idea.description}</p>
                <Button size="sm" variant="outline" onClick={() => navigate(`/create/${idea.format}`, { state: { theme: idea.title, objective: idea.objective } })}>
                  Criar este conteúdo
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="size-4 text-ink-300" />
              <p className="text-sm font-semibold">Atalhos para favoritos</p>
            </div>
            <button onClick={() => navigate("/favorites")} className="text-xs text-ink-300 hover:text-white flex items-center gap-1">
              Ver todos <ArrowRight className="size-3" />
            </button>
          </div>
          {favoriteProjects.length === 0 ? (
            <EmptyState title="Nenhum favorito ainda" description="Favorite conteúdos para acessá-los rapidamente aqui." />
          ) : (
            <div className="flex flex-col gap-2">
              {favoriteProjects.map((p) => {
                const Icon = FORMAT_ICON[p.format];
                return (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/projects?open=${p.id}`)}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-ink-850 transition-colors text-left"
                  >
                    <div className="size-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-ink-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.title}</p>
                      <p className="text-xs text-ink-300">{FORMAT_LABEL[p.format]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function CreationCard({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
}: {
  icon: typeof Clapperboard;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <CardHover className="p-6 flex flex-col gap-4">
      <div className="size-11 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
        <Icon className="size-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-white mb-1.5">{title}</p>
        <p className="text-sm text-ink-300">{description}</p>
      </div>
      <Button variant="secondary" onClick={onClick} className="w-full">
        {cta}
      </Button>
    </CardHover>
  );
}
