"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Type, ImageIcon, Palette, Pencil, Sparkles, Shapes, GalleryHorizontal } from 'lucide-react';
import { useEditorStore, TextObject, ImageObject } from './store';
type StockItem = { id: string; url: string };
type StockData = { background: StockItem[]; overlay: StockItem[]; elements: StockItem[] };

// --- HELPER ICONS (from page.tsx) ---
const ChevronLeftIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
// ---

type ToolButtonProps = {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  onClick?: () => void;
  isActive?: boolean; // 5. Added for active state styling
};

const ToolButton = ({ icon: Icon, label, onClick, isActive }: ToolButtonProps) => (
  <button
    onClick={onClick}
    // 2. Added w-full for proper spacing in new w-24 sidebar
    // 5. Added active state styling
    className={`w-full flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-purple-900/30 border border-purple-400'
        : 'hover:bg-gray-700'
    }`}
    title={label}
  >
    <Icon size={20} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

export default function LeftSidebar() {
  const { addObject, canvasSize, setEditorMode } = useEditorStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'background' | 'overlay' | 'elements' | null>(null);
  const [visibleImages, setVisibleImages] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false); // This now controls the *drawer*

  useEffect(() => {
    fetch('/assets/stock.json')
      .then(res => res.json())
      .then((data: StockData) => setStockData(data));
  }, []);

  // 4. This logic now correctly toggles the new drawer
  const handleCategoryClick = (category: 'background' | 'overlay' | 'elements') => {
    if (!stockData) return;
    if (selectedCategory === category) {
      // Clicked the same one: close it
      setSelectedCategory(null);
      setExpanded(false);
    } else {
      // Clicked a new one: open and load
      setSelectedCategory(category);
      setExpanded(true);
      setVisibleImages(stockData[category].slice(0, 10));
    }
  };

  const loadMoreImages = () => {
    if (!stockData || !selectedCategory) return;
    setLoading(true);
    setTimeout(() => {
      const currentLength = visibleImages.length;
      const nextImages = stockData[selectedCategory].slice(currentLength, currentLength + 5);
      setVisibleImages(prev => [...prev, ...nextImages]);
      setLoading(false);
    }, 1000); // Simulate loading
  };

  const handleStockImageClick = (url: string) => {
    if (!canvasSize) return;
    const img = new window.Image();
    img.src = url;
    img.onload = () => {
      const maxDim = Math.min(canvasSize.width, canvasSize.height) * 0.8;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      const width = img.width * scale;
      const height = img.height * scale;

      setEditorMode('select');
      addObject({
        type: 'image',
        src: url,
        x: (canvasSize.width - width) / 2,
        y: (canvasSize.height - height) / 2,
        width: width,
        height: height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        shadow: { color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0.5 },
        brightness: 0,
        contrast: 0,
        blur: 0,
        grayscale: false,
        sepia: false,
        invert: false,
        noise: 0,
        emboss: false,
        posterize: false,
        hue: 0,
        saturation: 0,
        luminance: 0,
        colorize: '#FFFFFF',
        colorizeStrength: 0,
      } as Omit<ImageObject, 'id'>);
    };
  };

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
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      align: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
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
    // 3. Changed to a flex container for the 2-panel layout
    <aside className={`flex h-full bg-[#0e0e1a] text-white`}>
      {/* Panel 1: Main Toolbar */}
      {/* 2. Set to w-24 (6rem) with p-2 for icons+text */}
      <div className="w-24 flex-shrink-0 p-2 overflow-y-auto">
        <div className="flex flex-col gap-4">
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
          
          {/* 5. Pass isActive prop for active styling */}
          <ToolButton
            icon={Palette}
            label="Backgrounds"
            onClick={() => handleCategoryClick('background')}
            isActive={selectedCategory === 'background'}
          />
          <ToolButton
            icon={Shapes}
            label="Elements"
            onClick={() => handleCategoryClick('elements')}
            isActive={selectedCategory === 'elements'}
          />
          <ToolButton
            icon={Pencil}
            label="Overlays"
            onClick={() => handleCategoryClick('overlay')}
            isActive={selectedCategory === 'overlay'}
          />
        </div>
      </div>

      {/* Panel 2: Sliding Drawer */}
      {/* 1. Set expanded width to w-56 (14rem) */}
      {/* 3. This panel now expands horizontally */}
      <div
        className={`transition-all duration-300 bg-[#121220] border-l border-gray-800 overflow-y-auto
                    ${expanded ? 'w-56 p-4' : 'w-0 p-0 overflow-hidden'}`}
      >
        {selectedCategory && (
          // Add a min-width to prevent content from collapsing during transition
          <div className="min-w-[calc(14rem-2rem)]"> 
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-sm font-semibold mb-2 capitalize">{selectedCategory}</h3>
              {/* 4. Added a dedicated collapse button inside the drawer */}
              <button
                onClick={() => {
                  setExpanded(false);
                  setSelectedCategory(null);
                }}
                className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                title="Collapse"
              >
                <ChevronLeftIcon size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {visibleImages.map((item) => (
                <img
                  key={item.id}
                  src={item.url}
                  alt={item.id}
                  className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                  onClick={() => handleStockImageClick(item.url)}
                />
              ))}
            </div>
            {visibleImages.length < (stockData?.[selectedCategory]?.length || 0) && (
              <button
                onClick={loadMoreImages}
                disabled={loading}
                className="mt-2 w-full bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}