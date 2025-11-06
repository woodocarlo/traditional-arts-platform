"use client";

import { Type, ImageIcon, Palette, Pencil, Sparkles, Shapes, GalleryHorizontal } from 'lucide-react';
import { useEditorStore } from './store';

// Reusable Button Component
const ToolButton = ({ icon: Icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex w-full flex-col items-center justify-center gap-1 rounded-lg p-2 text-gray-400 hover:bg-purple-700 hover:text-white"
  >
    <Icon size={24} />
    <span className="text-xs">{label}</span>
  </button>
);

export default function LeftSidebar() {
  const { addObject } = useEditorStore();

  const handleAddText = () => {
    addObject({
      type: 'text',
      x: 100,
      y: 100,
      text: 'Double click to edit',
      fontSize: 24,
      fill: '#ffffff',
      rotation: 0,
      width: 200,
      height: 30,
      scaleX: 1,
      scaleY: 1,
    });
  };

  return (
    <aside className="w-20 bg-[#0e0e1a] p-2">
      <div className="flex flex-col gap-2">
        <ToolButton icon={ImageIcon} label="Add Image" />
        <ToolButton icon={Type} label="Add Text" onClick={handleAddText} />
        <ToolButton icon={Sparkles} label="AI Gen" />
        <ToolButton icon={GalleryHorizontal} label="New Canvas" />
        <ToolButton icon={Palette} label="Backgrounds" />
        <ToolButton icon={Shapes} label="Elements" />
        <ToolButton icon={Pencil} label="Overlays" />
      </div>
    </aside>
  );
}