"use client";

import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Transformer, Line } from 'react-konva';
import { useEditorStore } from './store';
import Konva from 'konva';
import { CanvasElement } from './CanvasElement';

export default function CanvasArea() {
  const { 
    canvasSize, 
    canvasBackgroundColor, 
    objects, 
    selectedId, 
    setSelectedId, 
    updateObject,
    // --- DRAWING STATE ---
    editorMode,
    lines,
    brushColor,
    brushSize,
    addNewLine,
    updateLinePoints
  } = useEditorStore();
  
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  
  const isDrawing = useRef(false);
  const currentLineId = useRef<string | null>(null);

  useEffect(() => {
    // ... (This useEffect is unchanged)
    if (trRef.current && stageRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne('#' + selectedId);
        if (selectedNode) {
          trRef.current.nodes([selectedNode]);
          if (selectedNode.attrs.type === 'text') {
            trRef.current.enabledAnchors(['middle-left', 'middle-right']);
          } else {
            trRef.current.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']);
          }
        } else {
          trRef.current.nodes([]);
        }
      } else {
        trRef.current.nodes([]);
      }
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId]);

  
  const getPointerPos = () => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    const pos = stage.getPointerPosition();
    if (!pos) return { x: 0, y: 0 };
    return pos;
  };

  
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();

    if (editorMode === 'select') {
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
    } else {
      isDrawing.current = true;
      const pos = getPointerPos();
      const newLineId = Date.now().toString();
      currentLineId.current = newLineId;

      addNewLine({
        id: newLineId,
        points: [pos.x, pos.y, pos.x, pos.y],
        // This 'stroke' property now correctly matches the type in store.ts
        stroke: editorMode === 'erase' ? '#000000' : brushColor, 
        strokeWidth: brushSize,
        compositeOperation: editorMode === 'erase' ? 'destination-out' : 'source-over',
      });
    }
  };

  // FIX 1: The 'e' or '_e' parameter is not used, so we remove it.
  const handleMouseMove = () => {
    if (!isDrawing.current || !currentLineId.current) {
      return;
    }

    const pos = getPointerPos();
    const currentLine = lines.find(l => l.id === currentLineId.current);
    if (currentLine) {
      const newPoints = currentLine.points.concat([pos.x, pos.y]);
      updateLinePoints(currentLineId.current, newPoints);
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    currentLineId.current = null;
  };
  
  if (!canvasSize) return null;

  return (
    <div className="h-full w-full p-8 flex items-center justify-center overflow-auto">
      <div 
        className="shadow-2xl"
        style={{ cursor: editorMode === 'select' ? 'default' : 'crosshair' }} 
      >
        <Stage
          ref={stageRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{ backgroundColor: canvasBackgroundColor }}
        >
          <Layer>
            {lines.map((line) => (
              <Line
                key={line.id}
                points={line.points}
                // FIX 2: Reverted to `line.stroke`. This is now type-safe
                // because of the fix in store.ts and removes all 'any' errors.
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                globalCompositeOperation={line.compositeOperation as GlobalCompositeOperation}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
            
            {objects.map((obj) => (
              <CanvasElement
                key={obj.id}
                obj={obj}
                isSelected={obj.id === selectedId}
                onSelect={() => setSelectedId(obj.id)}
                onChange={(newAttrs) => updateObject(obj.id, newAttrs)}
              />
            ))}
            
            <Transformer 
              ref={trRef} 
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}