import { Group, Rect } from "react-konva";
import type Konva from "konva";
import type { IconElement } from "@/types/design";
import { IconGroupNode } from "./IconGroupNode";

type DragHandler = (e: Konva.KonvaEventObject<DragEvent>) => void;
type TransformAttrs = { x: number; y: number; width: number; height: number; rotation: number };

export function IconNode({
  el,
  nodeRef,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: {
  el: IconElement;
  nodeRef: (node: Konva.Group | null) => void;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: DragHandler;
  onDragMove: DragHandler;
  onDragEnd: DragHandler;
  onTransformEnd: (attrs: TransformAttrs) => void;
}) {
  function handleTransformEnd(e: Konva.KonvaEventObject<Event>) {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onTransformEnd({
      x: node.x(),
      y: node.y(),
      width: Math.max(16, node.width() * scaleX),
      height: Math.max(16, node.height() * scaleY),
      rotation: node.rotation(),
    });
  }

  return (
    <Group
      ref={nodeRef}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      <Rect width={el.width} height={el.height} fill="transparent" />
      <IconGroupNode icon={el.icon} color={el.color} width={el.width} height={el.height} />
    </Group>
  );
}
