"use client";

import { useRef } from 'react';
import { Rect, Circle, Line } from 'react-konva'; // <-- ADD Circle and Line
import Konva from 'konva';
import { ShapeObject, useEditorStore } from '../store';

type Props = {
  obj: ShapeObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ShapeObject>) => void;
};

export const ShapeElement = ({ obj, isSelected, onSelect, onChange }: Props) => {
  // We use a generic ref type since it could be Rect, Circle, or Line
  const shapeRef = useRef<Konva.Shape>(null); 
  const { editorMode } = useEditorStore();

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

  const commonProps = {
    id: obj.id,
    type: "shape",
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    scaleX: obj.scaleX,
    scaleY: obj.scaleY,
    opacity: obj.opacity,
    draggable: editorMode === 'select',
    onClick: () => { if (editorMode === 'select') onSelect() },
    onTap: () => { if (editorMode === 'select') onSelect() },
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    // Style props
    fill: obj.fill,
    stroke: obj.stroke,
    strokeWidth: obj.strokeWidth,
    // Shadow props
    shadowColor: obj.shadow.color,
    shadowBlur: obj.shadow.blur,
    shadowOffsetX: obj.shadow.offsetX,
    shadowOffsetY: obj.shadow.offsetY,
    shadowOpacity: obj.shadow.opacity,
  };

  // <-- FIX 2: Render different shapes based on shapeType -->
  switch (obj.shapeType) {
    case 'rect':
      return <Rect ref={shapeRef as React.Ref<Konva.Rect>} {...commonProps} />;
    case 'circle':
      return <Circle ref={shapeRef as React.Ref<Konva.Circle>} {...commonProps} radius={obj.width / 2} />; // Circle uses radius
    case 'triangle':
      return (
        <Line
          ref={shapeRef as React.Ref<Konva.Line>}
          {...commonProps}
          // A triangle is a line with 3 points, closed
          points={[
            obj.width / 2, 0,          // top center
            obj.width, obj.height,     // bottom right
            0, obj.height             // bottom left
          ]}
          closed={true}
        />
      );
    default:
      return null;
  }
};