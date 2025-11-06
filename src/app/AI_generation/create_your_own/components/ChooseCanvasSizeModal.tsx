"use client";

import { useState } from 'react';
import { useEditorStore } from './store';
// import { X } from 'lucide-react'; // <-- FIX 1: Removed unused import

const PRESET_SIZES = [
  { name: 'Square', ratio: '1:1', dims: '(1080x1080px)', width: 1080, height: 1080 },
  { name: 'Instagram Post', ratio: '4:5', dims: '(1080x1350px)', width: 1080, height: 1350 },
  { name: 'Landscape', ratio: '16:9', dims: '(1920x1080px)', width: 1920, height: 1080 },
  { name: 'Portrait', ratio: '9:16', dims: '(1080x1920px)', width: 1080, height: 1920 },
  { name: 'Facebook Cover', ratio: '820:312', dims: '(820x312px)', width: 820, height: 312 },
  { name: 'A4 Document', ratio: '210:297', dims: '(794x1123px)', width: 794, height: 1123 },
];

// FIX 2: Added a specific type for the button props
type PresetButtonProps = {
  name: string;
  ratio: string;
  dims: string;
  onClick: () => void;
};

const PresetButton = ({ name, ratio, dims, onClick }: PresetButtonProps) => (
  <button onClick={onClick} className="w-full rounded-md border border-gray-700 bg-gray-800 p-3 text-left hover:bg-gray-700">
    <p className="font-semibold text-white">{name}</p>
    <p className="text-sm text-gray-400">{ratio} <span className="text-gray-500">{dims}</span></p>
  </button>
);

export default function ChooseCanvasSizeModal() {
  const { setCanvasSize } = useEditorStore();
  const [customWidth, setCustomWidth] = useState(768);
  const [customHeight, setCustomHeight] = useState(768);

  const handleCreateCustom = () => {
    if (customWidth > 0 && customHeight > 0) {
      setCanvasSize({ width: customWidth, height: customHeight });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative w-full max-w-2xl rounded-lg bg-[#1e1f22] p-8 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-white">Choose Canvas Size</h2>
        <p className="mb-6 text-gray-400">Select a preset to start your design or define a custom size.</p>

        {/* <button className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button> */}

        <div className="grid grid-cols-3 gap-4">
          {PRESET_SIZES.map(preset => (
            <PresetButton
              key={preset.name}
              {...preset}
              onClick={() => setCanvasSize({ width: preset.width, height: preset.height })}
            />
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white">Custom Size</h3>
          <div className="mt-4 flex items-center gap-4">
            <div>
              <label htmlFor="width" className="text-sm text-gray-400">Width (px)</label>
              <input
                type="number"
                id="width"
                value={customWidth}
                onChange={(e) => setCustomWidth(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
              />
            </div>
            <div>
              <label htmlFor="height" className="text-sm text-gray-400">Height (px)</label>
              <input
                type="number"
                id="height"
                value={customHeight}
                onChange={(e) => setCustomHeight(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 p-2 text-white"
              />
            </div>
            <div className="self-end">
              <button
                onClick={handleCreateCustom}
                className="h-[42px] rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-6 font-semibold text-white transition-opacity hover:opacity-90"
              >
                Create Custom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}