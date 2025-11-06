"use client";
import { useRef } from 'react';
import { Text } from 'react-konva';
import Konva from 'konva';
import { TextObject, useEditorStore } from '../store'; // <-- IMPORT useEditorStore

type Props = {
  obj: TextObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<TextObject>) => void;
};

export const TextElement = ({ obj, onSelect, onChange }: Props) => {
  const shapeRef = useRef<Konva.Text>(null);
  const { editorMode } = useEditorStore(); // <-- GET editorMode

  // ... (handleDragEnd and handleTransformEnd are unchanged)
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => { /* ... */ };
  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => { /* ... */ };

  return (
    <Text
      ref={shapeRef}
      {...obj}
      draggable={editorMode === 'select'} // <-- UPDATE THIS
      onClick={() => { if (editorMode === 'select') onSelect() }} // <-- UPDATE THIS
      onTap={() => { if (editorMode === 'select') onSelect() }} // <-- UPDATE THIS
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      // ... (shadow props are unchanged)
    />
  );
};