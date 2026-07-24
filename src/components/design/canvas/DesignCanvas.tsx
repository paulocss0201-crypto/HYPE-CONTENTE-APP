import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Line, Transformer } from "react-konva";
import type Konva from "konva";
import type { DesignElement, DesignFormatSpec, DesignSlide } from "@/types/design";
import { TextNode } from "./TextNode";
import { ImageNode } from "./ImageNode";
import { ShapeNode } from "./ShapeNode";
import { IconNode } from "./IconNode";
import { computeSnap } from "./snapping";
import type { GuideLine } from "./snapping";

export function DesignCanvas({
  slide,
  format,
  scale,
  selectedIds,
  onSelectIds,
  onUpdateElement,
  onCommit,
  editingTextId,
  onStartEditText,
  onFinishEditText,
  stageRef,
}: {
  slide: DesignSlide;
  format: DesignFormatSpec;
  scale: number;
  selectedIds: string[];
  onSelectIds: (ids: string[]) => void;
  onUpdateElement: (id: string, patch: Partial<DesignElement>) => void;
  onCommit: () => void;
  editingTextId: string | null;
  onStartEditText: (id: string) => void;
  onFinishEditText: (id: string, text: string) => void;
  stageRef?: (stage: Konva.Stage | null) => void;
}) {
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [guides, setGuides] = useState<GuideLine[]>([]);

  const visibleElements = [...slide.elements].filter((e) => !e.hidden).sort((a, b) => a.zIndex - b.zIndex);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    const nodes = selectedIds.map((id) => nodeRefs.current.get(id)).filter((n): n is Konva.Node => !!n);
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, slide.elements.length]);

  function registerRef(id: string, node: Konva.Node | null) {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  }

  function handleSelect(id: string, e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
    const shift = "shiftKey" in e.evt && e.evt.shiftKey;
    if (shift) {
      if (selectedIds.includes(id)) onSelectIds(selectedIds.filter((x) => x !== id));
      else onSelectIds([...selectedIds, id]);
    } else if (!selectedIds.includes(id)) {
      onSelectIds([id]);
    }
  }

  function handleDragStart(id: string) {
    if (!selectedIds.includes(id)) onSelectIds([id]);
    dragStartPositions.current.clear();
    const ids = selectedIds.includes(id) ? selectedIds : [id];
    ids.forEach((selId) => {
      const node = nodeRefs.current.get(selId);
      if (node) dragStartPositions.current.set(selId, { x: node.x(), y: node.y() });
    });
  }

  function handleDragMove(activeId: string, node: Konva.Node) {
    const activeIds = selectedIds.includes(activeId) ? selectedIds : [activeId];
    const box = { x: node.x(), y: node.y(), width: node.width(), height: node.height() };
    const others = slide.elements.filter((e) => !activeIds.includes(e.id));
    const { dx, dy, guides: newGuides } = computeSnap(box, others, format.width, format.height);
    if (dx || dy) {
      node.x(node.x() + dx);
      node.y(node.y() + dy);
    }
    setGuides(newGuides);

    if (activeIds.length > 1) {
      const start = dragStartPositions.current.get(activeId);
      if (start) {
        const deltaX = node.x() - start.x;
        const deltaY = node.y() - start.y;
        activeIds
          .filter((id) => id !== activeId)
          .forEach((id) => {
            const other = nodeRefs.current.get(id);
            const otherStart = dragStartPositions.current.get(id);
            if (other && otherStart) {
              other.x(otherStart.x + deltaX);
              other.y(otherStart.y + deltaY);
            }
          });
      }
    }
  }

  function handleDragEnd(activeId: string) {
    setGuides([]);
    const activeIds = selectedIds.includes(activeId) ? selectedIds : [activeId];
    activeIds.forEach((id) => {
      const node = nodeRefs.current.get(id);
      if (node) onUpdateElement(id, { x: node.x(), y: node.y() });
    });
    onCommit();
  }

  const editingEl = editingTextId ? (slide.elements.find((e) => e.id === editingTextId) as Extract<DesignElement, { kind: "text" }> | undefined) : undefined;

  return (
    <div className="relative inline-block" style={{ width: format.width * scale, height: format.height * scale }}>
      <Stage
        width={format.width * scale}
        height={format.height * scale}
        scaleX={scale}
        scaleY={scale}
        ref={(node) => stageRef?.(node)}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelectIds([]);
        }}
      >
        <Layer>
          {slide.backgroundGradientTo ? (
            <Rect
              width={format.width}
              height={format.height}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: format.height }}
              fillLinearGradientColorStops={[0, slide.background, 1, slide.backgroundGradientTo]}
            />
          ) : (
            <Rect width={format.width} height={format.height} fill={slide.background} />
          )}

          {visibleElements.map((el) => {
            const commonProps = {
              onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => handleSelect(el.id, e),
              onDragStart: () => handleDragStart(el.id),
              onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => handleDragMove(el.id, e.target),
              onDragEnd: () => handleDragEnd(el.id),
              onTransformEnd: (attrs: { x: number; y: number; width: number; height: number; rotation: number }) => {
                onUpdateElement(el.id, attrs);
                onCommit();
              },
            };
            if (el.kind === "text")
              return <TextNode key={el.id} el={el} nodeRef={(n) => registerRef(el.id, n)} onDblClick={() => onStartEditText(el.id)} {...commonProps} />;
            if (el.kind === "image") return <ImageNode key={el.id} el={el} nodeRef={(n) => registerRef(el.id, n)} {...commonProps} />;
            if (el.kind === "shape") return <ShapeNode key={el.id} el={el} nodeRef={(n) => registerRef(el.id, n)} {...commonProps} />;
            return <IconNode key={el.id} el={el} nodeRef={(n) => registerRef(el.id, n)} {...commonProps} />;
          })}

          <Transformer
            ref={transformerRef}
            rotateEnabled
            borderStroke="#ffffff"
            anchorStroke="#ffffff"
            anchorFill="#0a0a0a"
            anchorSize={10}
            borderDash={[4, 4]}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 16 || newBox.height < 16 ? oldBox : newBox)}
          />

          {guides.map((g, i) => (
            <Line key={i} points={g.points} stroke="#ffffff" strokeWidth={1 / scale} dash={[4 / scale, 4 / scale]} listening={false} />
          ))}
        </Layer>
      </Stage>

      {editingEl && (
        <textarea
          autoFocus
          defaultValue={editingEl.content}
          onBlur={(e) => onFinishEditText(editingEl.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onFinishEditText(editingEl.id, editingEl.content);
          }}
          style={{
            position: "absolute",
            top: editingEl.y * scale,
            left: editingEl.x * scale,
            width: editingEl.width * scale,
            height: editingEl.height * scale,
            fontSize: editingEl.fontSize * scale,
            fontFamily: editingEl.fontFamily,
            fontWeight: editingEl.fontWeight,
            color: editingEl.color,
            textAlign: editingEl.align,
            lineHeight: editingEl.lineHeight,
            letterSpacing: editingEl.letterSpacing,
            background: "rgba(20,20,20,0.55)",
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 4px rgba(255,255,255,0.15), 0 8px 24px rgba(0,0,0,0.5)",
            borderRadius: 4,
            resize: "none",
            outline: "none",
            padding: 2,
            caretColor: "#ffffff",
          }}
        />
      )}
    </div>
  );
}
