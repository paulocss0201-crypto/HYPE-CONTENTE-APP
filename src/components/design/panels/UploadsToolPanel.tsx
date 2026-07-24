import { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import { useDesignStore } from "@/store/designStore";
import { Button } from "@/components/ui";

export function UploadsToolPanel({ onAddImage }: { onAddImage: (src: string) => void }) {
  const uploads = useDesignStore((s) => s.uploads);
  const addUpload = useDesignStore((s) => s.addUpload);
  const removeUpload = useDesignStore((s) => s.removeUpload);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") addUpload(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      <Button variant="outline" icon={<Upload className="size-4" />} onClick={() => inputRef.current?.click()}>
        Enviar imagens
      </Button>
      <div className="grid grid-cols-2 gap-2">
        {uploads.map((src) => (
          <div key={src} className="relative group rounded-xl overflow-hidden border border-ink-700 aspect-square">
            <button onClick={() => onAddImage(src)} className="w-full h-full">
              <img src={src} alt="upload" className="w-full h-full object-cover" />
            </button>
            <button
              onClick={() => removeUpload(src)}
              className="absolute top-1 right-1 p-1 rounded-lg bg-ink-950/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
        {uploads.length === 0 && <p className="col-span-2 text-xs text-ink-500 text-center py-8">Nenhum upload ainda.</p>}
      </div>
    </div>
  );
}
