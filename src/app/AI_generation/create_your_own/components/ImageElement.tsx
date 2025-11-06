"use client";

import { useRef, useEffect } from 'react';
import { Image } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { ImageObject } from './store';

type Props = {
  obj: ImageObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageObject>) => void;
};

export const ImageElement = ({ obj, onSelect, onChange }: Props) => {
  const shapeRef = useRef<Konva.Image>(null);
  const [img] = useImage(obj.src, 'anonymous');

  useEffect(() => {
    // Apply filters
    const node = shapeRef.current;
    if (node) {
      node.cache(); // Cache for filters to work
      node.filters([
        Konva.Filters.Brightness,
        Konva.Filters.Contrast,
        Konva.Filters.Blur,
        Konva.Filters.Grayscale,
        Konva.Filters.Sepia,
        Konva.Filters.Invert,
        Konva.Filters.Emboss,
        Konva.Filters.Posterize,
      ]);
      node.brightness(obj.brightness);
      node.contrast(obj.contrast);
      node.blurRadius(obj.blur);
      // Note: grayscale, sepia, invert, emboss, posterize are not direct methods on Konva.Image
      // They are applied via filters array above
      
      node.getLayer()?.batchDraw();
    }
  }, [obj, img]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (node) {
      onChange({
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation(),
        scaleX: 1, // Reset scale
        scaleY: 1,
      });
    }
  };

  return (
    <Image
      ref={shapeRef}
      id={obj.id}
      type="image" // Custom attr
      image={img}
      x={obj.x}
      y={obj.y}
      width={obj.width}
      height={obj.height}
      rotation={obj.rotation}
      opacity={obj.opacity}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      // Shadow props
      shadowColor={obj.shadow.color}
      shadowBlur={obj.shadow.blur}
      shadowOffsetX={obj.shadow.offsetX}
      shadowOffsetY={obj.shadow.offsetY}
      shadowOpacity={obj.shadow.opacity}
    />
  );
};