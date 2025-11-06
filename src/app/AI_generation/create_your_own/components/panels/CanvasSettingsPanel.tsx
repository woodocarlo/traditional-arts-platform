"use client";

import { useEditorStore } from '../store';
import { Palette, PencilRuler, Paintbrush, MousePointer2, Pen, Eraser, RectangleHorizontal, Circle, Triangle } from 'lucide-react'; // <-- ADDED ICONS

import React, { useState } from 'react';

const Accordion = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ size?: number }>; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-600 rounded">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-3 bg-gray-700 hover:bg-gray-600 rounded"
      >
        <Icon size={16} />
        <span className="flex-1 text-left">{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="p-3 border-t border-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};

const Slider = ({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
    <span className="text-xs text-gray-400">{value}</span>
  </div>
);

const ModeButton = ({ label, icon: Icon, onClick, isActive }: { label: string; icon: React.ComponentType<{ size?: number }>; onClick: () => void; isActive: boolean }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 rounded transition-colors ${
      isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
    }`}
  >
    <Icon size={20} />
    <span className="text-xs">{label}</span>
  </button>
);


export const CanvasSettingsPanel = () => {
  const { 
    canvasBackgroundColor, 
    setBackgroundColor,
    addObject,
    editorMode,
    setEditorMode,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize
  } = useEditorStore();

  // <-- FIX 2: Generic function to add shapes -->
  const handleAddShape = (shapeType: 'rect' | 'circle' | 'triangle') => {
    setEditorMode('select'); // <-- FIX 1: Auto-switch to select

    const baseShapeProps = {
      x: 100,
      y: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      shadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0.5 },
      fill: '#A0A0A0',
      stroke: '#000000',
      strokeWidth: 2,
    } as const;

    let shapeProps: typeof baseShapeProps & { shapeType: 'rect' | 'circle' | 'triangle'; width: number; height: number };

    if (shapeType === 'rect') {
      shapeProps = { ...baseShapeProps, shapeType: 'rect', width: 200, height: 150 };
    } else if (shapeType === 'circle') {
      shapeProps = { ...baseShapeProps, shapeType: 'circle', width: 150, height: 150 }; // Konva uses width/height for radius
    } else {
      shapeProps = { ...baseShapeProps, shapeType: 'triangle', width: 150, height: 150 };
    }

    addObject({
      type: 'shape',
      ...shapeProps,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <Accordion title="Background" icon={Palette}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Background Color</label>
          <input
            type="color"
            value={canvasBackgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-full h-10 rounded border border-gray-600"
          />
        </div>
      </Accordion>

      <Accordion title="Add Elements" icon={PencilRuler}>
        {/* <-- FIX 2: Icon-based shape buttons --> */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAddShape('rect')}
            className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            <RectangleHorizontal size={20} />
            <span className="text-xs">Rectangle</span>
          </button>
          <button
            onClick={() => handleAddShape('circle')}
            className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            <Circle size={20} />
            <span className="text-xs">Circle</span>
          </button>
          <button
            onClick={() => handleAddShape('triangle')}
            className="flex flex-col items-center gap-1 p-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            <Triangle size={20} />
            <span className="text-xs">Triangle</span>
          </button>
        </div>
      </Accordion>

      <Accordion title="Drawing Tools" icon={Paintbrush}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <ModeButton
              label="Select"
              icon={MousePointer2}
              onClick={() => setEditorMode('select')}
              isActive={editorMode === 'select'}
            />
            <ModeButton
              label="Draw"
              icon={Pen}
              onClick={() => setEditorMode('draw')}
              isActive={editorMode === 'draw'}
            />
            <ModeButton
              label="Erase"
              icon={Eraser}
              onClick={() => setEditorMode('erase')}
              isActive={editorMode === 'erase'}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Brush Color</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-full h-10 rounded border border-gray-600"
            />
          </div>
          <Slider
            label="Brush Size"
            min={1}
            max={50}
            step={1}
            value={brushSize}
            onChange={setBrushSize}
          />
        </div>
      </Accordion>
    </div>
  );
};