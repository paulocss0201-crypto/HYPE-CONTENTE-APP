export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  marks,
}: {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  marks?: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-ink-100">{label}</label>}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-white h-1.5 cursor-pointer"
      />
      {marks && (
        <div className="flex justify-between text-xs text-ink-300">
          {marks.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}
