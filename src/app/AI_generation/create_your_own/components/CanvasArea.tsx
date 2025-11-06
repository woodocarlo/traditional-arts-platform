"use client";

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Text, Transformer } from 'react-konva';
import { useEditorStore, CanvasObject } from './store';
import Konva from 'konva';

// CanvasElement component remains the same as before
const CanvasElement = ({ obj, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<Konva.Text>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({ ...obj, x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (node) {
      onChange({
        ...obj,
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        scaleX: 1,
        scaleY: 1,
        rotation: node.rotation(),
      });
    }
  };

  if (obj.type === 'text') {
    return (
      <Text
        ref={shapeRef}
        id={obj.id}
        {...obj}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    );
  }
  return null;
};


export default function CanvasArea() {
  const { canvasSize, objects, selectedId, setSelectedId, updateObject } = useEditorStore();
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    // Attach/detach transformer
    if (trRef.current && stageRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne('#' + selectedId);
        if (selectedNode) {
          trRef.current.nodes([selectedNode]);
        } else {
          trRef.current.nodes([]);
        }
      } else {
        trRef.current.nodes([]);
      }
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  const handleDeselect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  if (!canvasSize) return null; // Should not happen due to page logic, but good practice

  return (
    // This outer container centers the fixed-size canvas
    <div className="h-full w-full p-8 flex items-center justify-center">
      <div className="shadow-2xl">
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleDeselect}
          onTouchStart={handleDeselect}
          style={{ backgroundColor: 'white' }}
        >
          <Layer>
            {objects.map((obj) => (
              <CanvasElement
                key={obj.id}
                obj={obj}
                isSelected={obj.id === selectedId}
                onSelect={() => setSelectedId(obj.id)}
                onChange={(newAttrs: CanvasObject) => updateObject(obj.id, newAttrs)}
              />
            ))}
            <Transformer ref={trRef} />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}