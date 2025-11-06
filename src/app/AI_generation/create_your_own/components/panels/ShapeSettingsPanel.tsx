"use client";

import { useEditorStore, ShapeObject } from '../store';
import { Trash, Copy } from 'lucide-react';

// Reusable Slider
const Slider = ({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="w-full">
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm w-10 text-right">{value}</span>
    </div>
  </div>
);

// Reusable Color Input
const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="w-full">
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="h-8 w-8 rounded border border-gray-600 p-0"
      />
      <span className="text-sm">{value.toUpperCase()}</span>
    </div>
  </div>
);

export const ShapeSettingsPanel = ({ selectedShape }: { selectedShape: ShapeObject }) => {
  const { updateObject, deleteObject, duplicateObject } = useEditorStore();

  const handleChange = (prop: keyof ShapeObject, value: unknown) => {
    updateObject(selectedShape.id, { [prop]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => duplicateObject(selectedShape.id)}
          className="flex items-center justify-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600">
          <Copy size={16} /> <span className="text-sm">Duplicate</span>
        </button>
        <button 
          onClick={() => deleteObject(selectedShape.id)}
          className="flex items-center justify-center gap-2 p-2 bg-red-800 rounded hover:bg-red-700">
          <Trash size={16} /> <span className="text-sm">Delete</span>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <ColorInput
          label="Fill Color"
          value={selectedShape.fill}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('fill', e.target.value)}
        />
        <ColorInput
          label="Stroke Color"
          value={selectedShape.stroke}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('stroke', e.target.value)}
        />
      </div>

      <Slider
        label="Stroke Width"
        min={0}
        max={30}
        step={1}
        value={selectedShape.strokeWidth}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('strokeWidth', parseInt(e.target.value, 10))}
      />
      <Slider
        label="Opacity"
        min={0}
        max={1}
        step={0.01}
        value={selectedShape.opacity}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('opacity', parseFloat(e.target.value))}
      />
    </div>
  );
};