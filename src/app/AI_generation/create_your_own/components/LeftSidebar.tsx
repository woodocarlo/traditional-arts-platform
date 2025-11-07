// {
// type: "new_file",
// fileName: "LeftSidebar.tsx",
// fileContent:
"use client";

import React, { useRef } from 'react';
import { Type, ImageIcon, Palette, Pencil, Sparkles, Shapes, GalleryHorizontal } from 'lucide-react';
import { useEditorStore, TextObject, ImageObject } from './store';

type ToolButtonProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
};

const ToolButton = ({ icon: Icon, label, onClick }: ToolButtonProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-2 rounded hover:bg-gray-700 transition-colors"
    title={label}
  >
    <Icon size={20} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

export default function LeftSidebar() {
  const { addObject, canvasSize, setEditorMode } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    setEditorMode('select');
    addObject({
      type: 'text',
      x: 100,
      y: 100,
      text: 'Type here',
      fontSize: 40,
      fontFamily: 'Roboto',
      fill: '#000000',
      rotation: 0,
      width: 200,
      height: 50,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      shadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0.5 },
    } as Omit<TextObject, 'id'>);
  };

  const handleImageUploadClick = () => {
    setEditorMode('select');
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvasSize) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        const maxDim = Math.min(canvasSize.width, canvasSize.height) * 0.8;
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        setEditorMode('select');
        addObject({
          type: 'image',
          src: src,
          x: (canvasSize.width - width) / 2,
          y: (canvasSize.height - height) / 2,
          width: width,
          height: height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          shadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0.5 },
          // Basic
          brightness: 0,
          contrast: 0,
          blur: 0,
          grayscale: false,
          sepia: false,
          invert: false,
          // --- NEW DEFAULTS ---
          noise: 0,
          emboss: false,
          posterize: false,
          // HSL
          hue: 0,
          saturation: 0,
          luminance: 0,
          // Colorize
          colorize: '#FFFFFF',
          colorizeStrength: 0,
        } as Omit<ImageObject, 'id'>);
      };
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  };

  return (
    <aside className="w-20 bg-[#0e0e1a] p-2">
      <div className="flex flex-col gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        <ToolButton icon={ImageIcon} label="Add Image" onClick={handleImageUploadClick} />
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
// }