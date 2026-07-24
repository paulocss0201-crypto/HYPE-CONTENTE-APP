import { Group, Path, Circle, Rect, Line } from "react-konva";
import { ICON_REGISTRY } from "@/lib/design-ai/iconPaths";

export function IconGroupNode({ icon, color, width, height }: { icon: string; color: string; width: number; height: number }) {
  const nodes = ICON_REGISTRY[icon] ?? ICON_REGISTRY.star;
  const scale = width / 24;

  return (
    <Group scaleX={scale} scaleY={height / 24 || scale} listening={false}>
      {nodes.map(([tag, attrs], i) => {
        const common = { stroke: color, strokeWidth: 2, lineCap: "round" as const, lineJoin: "round" as const, fill: "transparent" };
        if (tag === "path") return <Path key={i} data={String(attrs.d)} {...common} />;
        if (tag === "circle") return <Circle key={i} x={Number(attrs.cx)} y={Number(attrs.cy)} radius={Number(attrs.r)} {...common} />;
        if (tag === "rect")
          return (
            <Rect
              key={i}
              x={Number(attrs.x)}
              y={Number(attrs.y)}
              width={Number(attrs.width)}
              height={Number(attrs.height)}
              cornerRadius={Number(attrs.rx) || 0}
              {...common}
            />
          );
        if (tag === "line") return <Line key={i} points={[Number(attrs.x1), Number(attrs.y1), Number(attrs.x2), Number(attrs.y2)]} {...common} />;
        if (tag === "polyline" || tag === "polygon") {
          const points = String(attrs.points)
            .trim()
            .split(/\s+/)
            .flatMap((pair) => pair.split(",").map(Number));
          return <Line key={i} points={points} closed={tag === "polygon"} {...common} />;
        }
        return null;
      })}
    </Group>
  );
}
