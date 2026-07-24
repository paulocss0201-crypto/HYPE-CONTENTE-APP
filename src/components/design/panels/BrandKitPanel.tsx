import { useRef, useState } from "react";
import { Button, Textarea } from "@/components/ui";
import { useDesignStore } from "@/store/designStore";
import { Upload, Plus, Trash2, Wand2 } from "lucide-react";
import { FONT_OPTIONS } from "@/types/design";

export function BrandKitPanel({ onApplyIdentity }: { onApplyIdentity: () => void }) {
  const brandKit = useDesignStore((s) => s.brandKit);
  const setBrandKit = useDesignStore((s) => s.setBrandKit);
  const [newColor, setNewColor] = useState("#ffffff");
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(kind: "logoPrimary" | "logoSecondary" | "symbol", file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setBrandKit({ [kind]: reader.result });
    };
    reader.readAsDataURL(file);
  }

  function addColor() {
    if (!brandKit.colors.includes(newColor)) setBrandKit({ colors: [...brandKit.colors, newColor] });
  }

  function toggleFont(font: string) {
    setBrandKit({ fonts: brandKit.fonts.includes(font) ? brandKit.fonts.filter((f) => f !== font) : [...brandKit.fonts, font] });
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      <Button icon={<Wand2 className="size-4" />} onClick={onApplyIdentity}>
        Aplicar identidade da minha marca
      </Button>

      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Logotipo principal</p>
        <LogoUploader src={brandKit.logoPrimary} onFile={(f) => handleLogoUpload("logoPrimary", f)} />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Logotipo secundário</p>
        <LogoUploader src={brandKit.logoSecondary} onFile={(f) => handleLogoUpload("logoSecondary", f)} />
      </div>
      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Símbolo</p>
        <LogoUploader src={brandKit.symbol} onFile={(f) => handleLogoUpload("symbol", f)} />
      </div>

      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Paleta de cores</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {brandKit.colors.map((c) => (
            <button key={c} onClick={() => setBrandKit({ colors: brandKit.colors.filter((x) => x !== c) })} className="size-8 rounded-lg border border-ink-600 relative group" style={{ background: c }}>
              <Trash2 className="size-3 absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-white" />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="size-9 rounded-lg border border-ink-600 bg-transparent" />
          <Button size="sm" variant="outline" icon={<Plus className="size-3.5" />} onClick={addColor}>
            Adicionar
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Fontes da marca</p>
        <div className="flex flex-wrap gap-1.5">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => toggleFont(f)}
              className={`text-xs rounded-full border px-2.5 py-1.5 transition-colors ${brandKit.fonts.includes(f) ? "bg-white text-ink-950 border-white" : "border-ink-600 text-ink-200 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-ink-300 mb-2">Regras visuais</p>
        <Textarea rows={3} value={brandKit.rules} onChange={(e) => setBrandKit({ rules: e.target.value })} placeholder="Ex: sempre usar o logo no canto superior esquerdo, nunca usar fundo colorido..." />
      </div>

      <input ref={logoInputRef} type="file" accept="image/*" hidden />
      <p className="text-[11px] text-ink-500">Planos superiores permitem cadastrar mais de uma marca.</p>
    </div>
  );
}

function LogoUploader({ src, onFile }: { src?: string; onFile: (file: File | undefined) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <button onClick={() => ref.current?.click()} className="w-full h-20 rounded-xl border border-dashed border-ink-600 flex items-center justify-center hover:border-ink-400 transition-colors overflow-hidden bg-ink-900/50">
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      {src ? <img src={src} alt="logo" className="max-h-full max-w-full object-contain" /> : <Upload className="size-5 text-ink-400" />}
    </button>
  );
}
