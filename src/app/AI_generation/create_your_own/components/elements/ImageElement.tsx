
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
    const node = shapeRef.current;
    if (node && img) { // Ensure img is loaded
      
      // --- FIX 1: DYNAMIC FILTERS ---
      // This solves the "all grey" bug by only applying filters that are active.
      const filters = [];
      if (obj.brightness !== 0) filters.push(Konva.Filters.Brightness);
      if (obj.contrast !== 0) filters.push(Konva.Filters.Contrast);
      if (obj.blur > 0) filters.push(Konva.Filters.Blur);
      if (obj.noise > 0) filters.push(Konva.Filters.Noise);
      if (obj.grayscale) filters.push(Konva.Filters.Grayscale);
      if (obj.sepia) filters.push(Konva.Filters.Sepia);
      if (obj.invert) filters.push(Konva.Filters.Invert);
      if (obj.emboss) filters.push(Konva.Filters.Emboss);
      if (obj.posterize) filters.push(Konva.Filters.Posterize);
      if (obj.hue !== 0 || obj.saturation !== 0 || obj.luminance !== 0) {
        filters.push(Konva.Filters.HSL);
      }

      // Clear cache first to avoid tainted canvas issues
      node.clearCache();

      // Clear filters first to avoid tainted canvas issues
      node.filters([]);
      node.filters(filters);

      // --- Apply all filter values ---
      // Konva is smart enough to ignore values for filters that aren't in the array.
      node.brightness(obj.brightness);
      node.contrast(obj.contrast);
      node.blurRadius(obj.blur);
      node.noise(obj.noise);
      node.setAttr('grayscale', obj.grayscale ? 1 : 0);
      node.setAttr('sepia', obj.sepia ? 1 : 0);
      node.setAttr('invert', obj.invert ? 1 : 0);

      if (obj.emboss) {
        node.setAttr('embossStrength', 0.8);
        node.setAttr('embossDirection', 'top');
      } else {
        node.setAttr('embossStrength', 0);
      }

      // Use posterize levels if true, 0 if false
      node.setAttr('posterize', obj.posterize ? 4 : 0);

      // HSL filter
      node.setAttr('hue', obj.hue);
      node.setAttr('saturation', obj.saturation);
      node.setAttr('luminance', obj.luminance);

      // --- Caching ---
      // Cache only if no filters are applied (caching doesn't work with filters)
      if (filters.length === 0) {
        node.cache();
      }
      node.getLayer()?.batchDraw();
    }
  }, [obj, img]); // Re-run when obj (filter props) or img (source) changes

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ x: e.target.x(), y: e.target.y() });
  };

  // --- FIX 2: TRANSFORM END LOGIC ---
  // This solves the "size reduces on rotate" bug.
  // We now save the scaleX and scaleY from the transformer directly,
  // instead of trying to bake it into width/height.
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (node) {
      onChange({
        x: node.x(),
        y: node.y(),
        width: node.width(), // Keep original width
        height: node.height(), // Keep original height
        rotation: node.rotation(),
        scaleX: node.scaleX(), // Save the new scale
        scaleY: node.scaleY(), // Save the new scale
      });
    }
  };

  return (
    <Image
      ref={shapeRef}
      image={img}
      {...obj} // Pass all object props (x, y, width, height, scaleX, scaleY, etc.)
      draggable={editorMode === 'select'}
      onClick={() => { if (editorMode === 'select') onSelect(); }}
      onTap={() => { if (editorMode === 'select') onSelect(); }}
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
