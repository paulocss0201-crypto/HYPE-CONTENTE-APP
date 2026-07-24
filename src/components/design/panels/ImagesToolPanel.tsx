import { Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useDesignStore } from "@/store/designStore";

export function ImagesToolPanel({ onAddImage, onOpenGenerator }: { onAddImage: (src: string) => void; onOpenGenerator: () => void }) {
  const generatedImages = useDesignStore((s) => s.generatedImages);
  const removeGeneratedImage = useDesignStore((s) => s.removeGeneratedImage);

  return (
    <div className="flex flex-col gap-3 p-3">
      <Button icon={<Sparkles className="size-4" />} onClick={onOpenGenerator}>
        Gerar imagem com IA
      </Button>
      <p className="text-xs font-medium text-ink-300">Biblioteca de imagens geradas</p>
      <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto">
        {generatedImages.map((img) => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden border border-ink-700 aspect-square">
            <button onClick={() => onAddImage(img.src)} className="w-full h-full">
              <img src={img.src} alt={img.prompt} className="w-full h-full object-cover" />
            </button>
            <button onClick={() => removeGeneratedImage(img.id)} className="absolute top-1 right-1 p-1 rounded-lg bg-ink-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {generatedImages.length === 0 && <p className="col-span-2 text-xs text-ink-500 text-center py-8">Nenhuma imagem gerada ainda.</p>}
      </div>
    </div>
  );
}
