import { Group, Text, Rect } from "react-konva";
import type Konva from "konva";
import type { TextElement } from "@/types/design";

type DragHandler = (e: Konva.KonvaEventObject<DragEvent>) => void;
type TransformAttrs = { x: number; y: number; width: number; height: number; rotation: number };

export function TextNode({
  el,
  nodeRef,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
  onDblClick,
}: {
  el: TextElement;
  nodeRef: (node: Konva.Group | null) => void;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: DragHandler;
  onDragMove: DragHandler;
  onDragEnd: DragHandler;
  onTransformEnd: (attrs: TransformAttrs) => void;
  onDblClick: () => void;
}) {
  const displayText = el.uppercase ? el.content.toUpperCase() : el.content;
  const fontStyle = `${el.italic ? "italic " : ""}${el.fontWeight >= 600 ? "bold" : "normal"}`.trim();
  const textDecoration = el.underline ? "underline" : "";

  function handleTransformEnd(e: Konva.KonvaEventObject<Event>) {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    onTransformEnd({
      x: node.x(),
      y: node.y(),
      width: Math.max(20, node.width() * scaleX),
      height: Math.max(20, node.height() * scaleY),
      rotation: node.rotation(),
    });
  }

  if (el.curved) {
    const chars = displayText.split("");
    const arc = (el.curveAmount || 60) * (Math.PI / 180);
    const radius = el.width / (arc || 0.01);
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
        onDblClick={onDblClick}
        onDblTap={onDblClick}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {chars.map((c, i) => {
          const t = chars.length > 1 ? i / (chars.length - 1) - 0.5 : 0;
          const angle = t * arc;
          const cx = el.width / 2 + radius * Math.sin(angle);
          const cy = el.height / 2 - radius * Math.cos(angle) + radius;
          return (
            <Text
              key={i}
              text={c}
              x={cx}
              y={cy - el.fontSize / 2}
              fontFamily={el.fontFamily}
              fontSize={el.fontSize}
              fontStyle={fontStyle}
              fill={el.color}
              rotation={(angle * 180) / Math.PI}
              align="center"
              offsetX={el.fontSize / 4}
            />
          );
        })}
      </Group>
    );
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
      onDblClick={onDblClick}
      onDblTap={onDblClick}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {el.background && <Rect width={el.width} height={el.height} fill={el.backgroundColor} cornerRadius={8} />}
      <Text
        text={displayText}
        width={el.width}
        height={el.height}
        fontFamily={el.fontFamily}
        fontSize={el.fontSize}
        fontStyle={fontStyle}
        textDecoration={textDecoration}
        fill={el.gradient ? undefined : el.color}
        fillLinearGradientStartPoint={el.gradient ? { x: 0, y: 0 } : undefined}
        fillLinearGradientEndPoint={el.gradient ? { x: el.width, y: el.height } : undefined}
        fillLinearGradientColorStops={el.gradient ? [0, el.gradientFrom, 1, el.gradientTo] : undefined}
        align={el.align}
        verticalAlign="top"
        letterSpacing={el.letterSpacing}
        lineHeight={el.lineHeight}
        stroke={el.stroke ? el.strokeColor : undefined}
        strokeWidth={el.stroke ? 1.2 : undefined}
        shadowColor={el.shadow ? "#000000" : undefined}
        shadowBlur={el.shadow ? 12 : undefined}
        shadowOpacity={el.shadow ? 0.6 : undefined}
        shadowOffsetY={el.shadow ? 4 : undefined}
        wrap="word"
      />
    </Group>
  );
}
