import { useEffect, useRef } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";
import Konva from "konva";
import type { ImageElement } from "@/types/design";
import { useHtmlImage } from "./useHtmlImage";

type DragHandler = (e: Konva.KonvaEventObject<DragEvent>) => void;
type TransformAttrs = { x: number; y: number; width: number; height: number; rotation: number };

export function ImageNode({
  el,
  nodeRef,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: {
  el: ImageElement;
  nodeRef: (node: Konva.Group | null) => void;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  onDragStart: DragHandler;
  onDragMove: DragHandler;
  onDragEnd: DragHandler;
  onTransformEnd: (attrs: TransformAttrs) => void;
}) {
  const image = useHtmlImage(el.src);
  const imgRef = useRef<Konva.Image | null>(null);

  const filters = [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Blur, Konva.Filters.RGB, Konva.Filters.Noise];

  useEffect(() => {
    if (imgRef.current && image) {
      imgRef.current.cache();
      imgRef.current.getLayer()?.batchDraw();
    }
  }, [image, el.filters, el.backgroundRemoved]);

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

  const temp = el.filters.temperature;
  const rOffset = temp > 0 ? temp * 1.2 : 0;
  const bOffset = temp < 0 ? -temp * 1.2 : 0;

  return (
    <Group
      ref={nodeRef}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      rotation={el.rotation}
      opacity={el.opacity * (el.backgroundRemoved ? 0.92 : 1)}
      draggable={!el.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      <KonvaImage
        ref={imgRef}
        image={image}
        width={el.width}
        height={el.height}
        scaleX={el.flipX ? -1 : 1}
        scaleY={el.flipY ? -1 : 1}
        offsetX={el.flipX ? el.width : 0}
        offsetY={el.flipY ? el.height : 0}
        cornerRadius={el.cornerRadius}
        listening={false}
        filters={image ? filters : []}
        brightness={el.filters.brightness}
        contrast={el.filters.contrast}
        saturation={el.filters.saturation}
        blurRadius={el.filters.blur}
        noise={el.filters.noise / 100}
        red={128 + rOffset}
        green={128}
        blue={128 - bOffset}
      />
      {el.duotoneEnabled && (
        <Rect width={el.width} height={el.height} fill={el.duotoneColor} opacity={0.55} globalCompositeOperation="color" listening={false} cornerRadius={el.cornerRadius} />
      )}
    </Group>
  );
}
