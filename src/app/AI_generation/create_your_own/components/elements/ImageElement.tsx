"use client";

import { useRef, useEffect } from 'react';
import { Image } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { ImageObject, useEditorStore } from '../store';

type Props = {
  obj: ImageObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageObject>) => void;
};

export const ImageElement = ({ obj, onSelect, onChange }: Props) => {
  const shapeRef = useRef<Konva.Image>(null);
  const [img] = useImage(obj.src, 'anonymous');
  const { editorMode } = useEditorStore();

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
        Konva.Filters.Noise,
      ]);
      
      // These setters are already type-safe
      node.brightness(obj.brightness);
      node.contrast(obj.contrast);
      node.blurRadius(obj.blur);
      node.noise(obj.noise);
      
      // Boolean filters
      if (obj.grayscale) node.setAttr('grayscale', 1); else node.setAttr('grayscale', 0);
      if (obj.sepia) node.setAttr('sepia', 1); else node.setAttr('sepia', 0);
      if (obj.invert) node.setAttr('invert', 1); else node.setAttr('invert', 0);

      if (obj.emboss) {
        node.setAttr('embossStrength', 0.8);
        node.setAttr('embossDirection', 'top');
      } else {
        node.setAttr('embossStrength', 0);
      }

      if (obj.posterize) node.setAttr('posterize', 4); else node.setAttr('posterize', 0);
      
      node.getLayer()?.batchDraw();
    }
  }, [obj, img]); // obj includes all filter props

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
      image={img}
      {...obj} // Pass all object props
      draggable={editorMode === 'select'}
      onClick={() => { if (editorMode === 'select') onSelect() }}
      onTap={() => { if (editorMode === 'select') onSelect() }}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      // Shadow props are already included in {...obj}
      shadowColor={obj.shadow.color}
      shadowBlur={obj.shadow.blur}
      shadowOffsetX={obj.shadow.offsetX}
      shadowOffsetY={obj.shadow.offsetY}
      shadowOpacity={obj.shadow.opacity}
    />
  );
};