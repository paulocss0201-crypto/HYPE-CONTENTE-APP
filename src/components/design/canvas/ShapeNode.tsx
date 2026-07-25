import { Rect, Ellipse, Line, Arrow } from "react-konva";
import type Konva from "konva";
import type { ShapeElement } from "@/types/design";

type DragHandler = (e: Konva.KonvaEventObject<DragEvent>) => void;
type TransformAttrs = { x: number; y: number; width: number; height: number; rotation: number };

export function ShapeNode({
  el,
  nodeRef,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: {
  el: ShapeElement;
  nodeRef: (node: Konva.Node | null) => void;
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
      width: Math.max(4, node.width() * scaleX),
      height: Math.max(4, node.height() * scaleY),
      rotation: node.rotation(),
    });
  }

  const common = {
    ref: nodeRef,
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: el.opacity,
    draggable: !el.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  if (el.shapeType === "circle") {
    return (
      <Ellipse
        {...common}
        x={el.x + el.width / 2}
        y={el.y + el.height / 2}
        radiusX={el.width / 2}
        radiusY={el.height / 2}
        width={el.width}
        height={el.height}
        offsetX={el.width / 2}
        offsetY={el.height / 2}
        fill={el.fill === "transparent" ? undefined : el.fill}
        stroke={el.strokeWidth > 0 ? el.stroke : undefined}
        strokeWidth={el.strokeWidth}
      />
    );
  }

  if (el.shapeType === "line") {
    return <Line {...common} width={el.width} height={el.height} points={[0, el.height / 2, el.width, el.height / 2]} stroke={el.fill} strokeWidth={Math.max(2, el.height)} lineCap="round" />;
  }

  if (el.shapeType === "arrow") {
    return (
      <Arrow
        {...common}
        width={el.width}
        height={el.height}
        points={[0, el.height / 2, el.width, el.height / 2]}
        stroke={el.fill}
        fill={el.fill}
        strokeWidth={Math.max(3, el.height / 4)}
        pointerLength={16}
        pointerWidth={14}
      />
    );
  }

  if (el.gradient) {
    return (
      <Rect
        {...common}
        width={el.width}
        height={el.height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={el.gradientDirection === "horizontal" ? { x: el.width, y: 0 } : { x: 0, y: el.height }}
        fillLinearGradientColorStops={[0, el.gradientFrom, 1, el.gradientTo]}
        stroke={el.strokeWidth > 0 ? el.stroke : undefined}
        strokeWidth={el.strokeWidth}
        cornerRadius={el.cornerRadius}
      />
    );
  }

  return (
    <Rect
      {...common}
      width={el.width}
      height={el.height}
      fill={el.fill === "transparent" ? undefined : el.fill}
      stroke={el.strokeWidth > 0 ? el.stroke : undefined}
      strokeWidth={el.strokeWidth}
      cornerRadius={el.cornerRadius}
    />
  );
}
