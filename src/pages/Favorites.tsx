import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Card, CardHover, StatusBadge, EmptyState } from "@/components/ui";
import { ProjectDetailModal } from "@/components/content";
import { useContentStore } from "@/store/contentStore";
import { formatDate } from "@/lib/utils";
import { Heart } from "lucide-react";
import { FORMAT_LABEL } from "@/types";
import { FORMAT_ICON } from "@/lib/formatIcons";

export function Favorites() {
  const projects = useContentStore((s) => s.projects.filter((p) => p.favorite));
  const [openId, setOpenId] = useState<string | null>(null);
  const openProject = projects.find((p) => p.id === openId);

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <PageHeader title="Favoritos" description="Conteúdos que você marcou para acessar rapidamente." />

      {projects.length === 0 ? (
        <Card>
          <EmptyState icon={<Heart className="size-6" />} title="Nenhum favorito ainda" description="Favorite conteúdos gerados para encontrá-los rapidamente aqui." />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const Icon = FORMAT_ICON[p.format];
            return (
              <CardHover key={p.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-ink-800 border border-ink-600 flex items-center justify-center">
                    <Icon className="size-5 text-white" />
                  </div>
                  <Heart className="size-4 fill-white text-white" />
                </div>
                <p className="font-medium text-white truncate">{p.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink-300">{FORMAT_LABEL[p.format]}</span>
                  <span className="text-xs text-ink-500">·</span>
                  <span className="text-xs text-ink-300">{formatDate(p.createdAt)}</span>
                  <StatusBadge status={p.status} />
                </div>
                <Button size="sm" variant="secondary" className="mt-auto" onClick={() => setOpenId(p.id)}>
                  Abrir
                </Button>
              </CardHover>
            );
          })}
        </div>
      )}

      {openProject && <ProjectDetailModal project={openProject} onClose={() => setOpenId(null)} />}
    </div>
  );
}
