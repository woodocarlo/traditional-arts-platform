"use client";

import React, { useState, useRef, useEffect } from 'react';
// Added Rect for shapes, Line for drawing
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect as KonvaRect, Line as KonvaLine } from 'react-konva';
import {
  Upload, Type, Palette, Sparkles, Trash2, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  BringToFront, SendToBack, Square as ShapeIcon, Minus, PenTool, Blend, RotateCcw,
  BoxSelect, Droplet as BlurIcon, MinusSquare, Zap, Frame,
  GripVertical, Image as ImageIcon, ImagePlay, PictureInPicture, ArrowLeft,
  Paintbrush, Eraser, Copy, Wand2, Loader2 // Added icons
} from 'lucide-react';
// Removed: 'Image' from 'next/image' is not used

import stockAssets from '../post_generation/stock.json' assert { type: 'json' };

// --- Konva filter imports ---
import { Brighten } from 'konva/lib/filters/Brighten';
import { Contrast } from 'konva/lib/filters/Contrast';
import { Grayscale } from 'konva/lib/filters/Grayscale';
import { Sepia } from 'konva/lib/filters/Sepia';
import { Invert } from 'konva/lib/filters/Invert';
import { Blur } from 'konva/lib/filters/Blur';
import { Emboss } from 'konva/lib/filters/Emboss';
import { Posterize } from 'konva/lib/filters/Posterize';
// --- End Konva filter imports ---

// --- ADDED: Konva Type Imports ---
import type Konva from 'konva';
import type { KonvaEventObject, Filter } from 'konva/lib/Node'; // <-- THIS IS THE FIX
// --- End Konva Type Imports ---


// --- Custom useImage Hook ---
const useImage = (url: string, crossOrigin?: string) => {
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!url) return;
    const img = document.createElement('img');

    const onload = () => {
      setStatus('loaded');
      setImage(img);
    };

    const onerror = () => {
      setStatus('failed');
    };

    img.addEventListener('load', onload);
    img.addEventListener('error', onerror);
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.src = url;

    return () => {
      img.removeEventListener('load', onload);
      img.removeEventListener('error', onerror);
    };
  }, [url, crossOrigin]);

  return [image, status];
};

// --- Font Import Utility ---
const GoogleFontImporter = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Great+Vibes&family=Sacramento&family=Roboto&family=Open+Sans:wght@400;700&display=swap');
    
    /* --- Custom Scrollbar (Matches Theme) --- */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2); /* Darker transparent track */
    }
    ::-webkit-scrollbar-thumb {
      background: #4a5568; /* Slightly lighter gray thumb */
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #718096; /* Lighter gray on hover */
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: #4a5568 rgba(0, 0, 0, 0.2); /* Thumb Track */
    }
    
    /* --- Custom Select Dropdown Arrow --- */
    .custom-select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem; /* Ensure space for the arrow */
    }
  `}</style>
);

// List of fonts we'll support
const FONT_FAMILIES = [
  "Roboto", "Open Sans", "Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana",
  "Pacifico", "Great Vibes", "Sacramento", "Comic Sans MS", "Impact"
];

// --- Re-usable UI Components ---

const ToolButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center w-full p-2 py-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-gray-200 hover:bg-white/20 transition-colors text-xs" // Adjusted style
    title={label}
  >
    <Icon size={20} className="mb-1" />
    <span>{label}</span>
  </button>
);

const IconButton = ({ icon: Icon, onClick, isActive = false, title }: { icon: React.ElementType, onClick: () => void, isActive?: boolean, title?: string }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${isActive ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`} // Adjusted style
    title={title}
  >
    <Icon size={18} />
  </button>
);

const SmallInput = ({ label, value, onChange, type = "text", min, max, step }: { label?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, min?: number, max?: number, step?: number }) => (
  <div className="flex flex-col">
    {label && <label className="text-xs text-gray-400 block mb-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className="w-full px-2 py-1 bg-black/30 border border-white/20 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-400" // Adjusted style
    />
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div>
    <label className="text-xs text-gray-400 block mb-1">{label}</label>
    <input
      type="color"
      value={value}
      onChange={onChange}
      className="w-full h-8 p-0.5 bg-white/10 border border-white/20 rounded-md cursor-pointer" // Adjusted style
    />
  </div>
);

const SliderControl = ({ label, value, onChange, min, max, step }: { label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number }) => (
  <div>
    <label className="text-xs text-gray-400 block mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500" // Adjusted track style
      />
      <span className="text-xs text-gray-300 w-8 text-right">{value.toFixed(step < 1 ? 2 : 0)}</span>
    </div>
  </div>
);


const AccordionSection = ({ title, children, icon: Icon, isOpen, onToggle }: {
  title: string,
  children: React.ReactNode,
  icon: React.ElementType,
  isOpen: boolean,
  onToggle: () => void
}) => {
  return (
    <div className="mb-4 bg-black/20 border border-white/10 rounded-lg overflow-hidden"> {/* Adjusted style */}
      <button
        className="w-full flex justify-between items-center p-3 text-white text-sm font-semibold hover:bg-white/10 transition-colors" // Adjusted style
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span>{title}</span>
        </div>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="p-3 border-t border-white/10 space-y-3"> {/* Adjusted style */}
          {children}
        </div>
      )}
    </div>
  );
};


// --- Konva Components (No style changes needed here) ---
const ImageObject = ({ shapeProps, isSelected, onSelect, onChange }: { shapeProps: ImageProps, isSelected: boolean, onSelect: () => void, onChange: (props: Partial<ImageProps>) => void }) => {
  const [image] = useImage(shapeProps.src, 'anonymous');
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.cache();
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [shapeProps, image, isSelected]);

  const filters: Filter[] = [];
  filters.push(Brighten);
  filters.push(Contrast);
  if (shapeProps.grayscale) filters.push(Grayscale);
  if (shapeProps.sepia) filters.push(Sepia);
  if (shapeProps.invert) filters.push(Invert);
  if (shapeProps.blur > 0) filters.push(Blur);
  if (shapeProps.emboss) filters.push(Emboss);
  if (shapeProps.posterize > 0) filters.push(Posterize);

  return (
    <>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        image={image}
        draggable
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1); node.scaleY(1);
            onChange({
              x: node.x(), y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }
        }}
        filters={filters}
        brightness={shapeProps.brightness || 0}
        contrast={shapeProps.contrast || 0}
        blurRadius={shapeProps.blur || 0}
        levels={shapeProps.posterize || 0}
        crop={{
          x: shapeProps.cropX, y: shapeProps.cropY,
          width: shapeProps.cropWidth, height: shapeProps.cropHeight,
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)} />}
    </>
  );
};

const TextObject = ({ shapeProps, isSelected, onSelect, onChange }: { shapeProps: TextProps, isSelected: boolean, onSelect: () => void, onChange: (props: Partial<TextProps>) => void }) => {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const fontStyle = `${shapeProps.isBold ? 'bold' : ''} ${shapeProps.isItalic ? 'italic' : ''}`.trim();
  let textDecoration = '';
  if (shapeProps.isUnderlined) textDecoration += 'underline ';
  if (shapeProps.isStrikethrough) textDecoration += 'line-through';
  textDecoration = textDecoration.trim();

  return (
    <>
      <Text
        onClick={onSelect} onTap={onSelect} ref={shapeRef} {...shapeProps}
        fontStyle={fontStyle} textDecoration={textDecoration} draggable
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX(); const scaleY = node.scaleY();
            node.scaleX(1); node.scaleY(1);
            onChange({
              ...shapeProps, x: node.x(), y: node.y(),
              fontSize: Math.max(5, (node.fontSize || 12) * scaleY),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)} enabledAnchors={['middle-left', 'middle-right']} rotateEnabled={true} />}
    </>
  );
};

const ShapeObject = ({ shapeProps, isSelected, onSelect, onChange }: { shapeProps: ShapeProps, isSelected: boolean, onSelect: () => void, onChange: (props: Partial<ShapeProps>) => void }) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaRect
        onClick={onSelect} onTap={onSelect} ref={shapeRef} {...shapeProps} draggable
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX(); const scaleY = node.scaleY();
            node.scaleX(1); node.scaleY(1);
            onChange({
              ...shapeProps, x: node.x(), y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }
        }}
      />
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)} />}
    </>
  );
};


// --- Main Page Component ---

type ActiveLeftPanel = 'tools' | 'backgrounds' | 'elements' | 'overlays' | 'ai';
type DrawingTool = 'pen' | 'eraser';

interface LineData {
  id: string;
  type: 'line';
  tool: DrawingTool;
  points: number[];
  stroke: string;
  strokeWidth: number;
  tension: number;
  lineCap: string;
  globalCompositeOperation?: string;
}

// --- ADDED: Type Definitions ---
interface BaseObject {
  id: string;
  type: 'image' | 'text' | 'shape' | 'line';
  x: number;
  y: number;
  width?: number; // Not for line
  height?: number; // Not for line
  rotation?: number; // Not for line
  opacity: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowOpacity: number;
}

interface ImageProps extends BaseObject {
  type: 'image';
  src: string;
  width: number;
  height: number;
  rotation: number;
  brightness: number;
  contrast: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  blur: number;
  emboss: boolean;
  posterize: number;
  stroke: string;
  strokeWidth: number;
  naturalWidth: number;
  naturalHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

interface TextProps extends BaseObject {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width: number;
  height: number; // Konva text can have height
  rotation: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderlined: boolean;
  isStrikethrough: boolean;
  align: string;
  lineHeight: number;
  letterSpacing: number;
  stroke: string;
  strokeWidth: number;
}

interface ShapeProps extends BaseObject {
  type: 'shape';
  shapeType: 'rect'; // Only 'rect' is used
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

// A union type for all objects
type CanvasObject = ImageProps | TextProps | ShapeProps | LineData;
// --- End Type Definitions ---


const INITIAL_ASSET_COUNT = 6; // Number of assets to show initially
const LOAD_MORE_COUNT = 6;     // Number of assets to load each time

export default function CreateYourOwnPost() {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainCanvasContainerRef = useRef<HTMLElement>(null);

  const [showPresetModal, setShowPresetModal] = useState(true);
  const [canvasAspectRatio, setCanvasAspectRatio] = useState(1 / 1);
  const [stageSize, setStageSize] = useState({ width: 500, height: 500 });
  
  const [activeLeftPanel, setActiveLeftPanel] = useState<ActiveLeftPanel>('tools'); 
  
  // Drawing states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [currentLinePoints, setCurrentLinePoints] = useState<number[]>([]);
  const [aiPrompt, setAiPrompt] = useState(''); 

  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#FFFFFF'); // Dark Gray

  // --- States for asset panel pagination ---
  const [displayedAssetCount, setDisplayedAssetCount] = useState(INITIAL_ASSET_COUNT);
  const [isLoadingMoreAssets, setIsLoadingMoreAssets] = useState(false);

  // --- Reset asset count when panel changes ---
  useEffect(() => {
    setDisplayedAssetCount(INITIAL_ASSET_COUNT);
    setIsLoadingMoreAssets(false); // Reset loading state
  }, [activeLeftPanel]);


  const disableDrawing = () => {
    setIsDrawingMode(false);
    setIsDrawing(false); 
    setCurrentLinePoints([]); 
  };

  useEffect(() => {
    const checkSize = () => {
      if (mainCanvasContainerRef.current) {
        const containerWidth = mainCanvasContainerRef.current.offsetWidth;
        const containerHeight = mainCanvasContainerRef.current.offsetHeight;
        let newWidth, newHeight;
        const padding = 32; // p-8
        const availableWidth = Math.max(10, containerWidth - padding);
        const availableHeight = Math.max(10, containerHeight - padding);

        if (availableWidth / availableHeight > canvasAspectRatio) {
          newHeight = availableHeight; newWidth = availableHeight * canvasAspectRatio;
        } else {
          newWidth = availableWidth; newHeight = availableWidth / canvasAspectRatio;
        }
        setStageSize({ width: newWidth, height: newHeight });
      }
    };

    if (!mainCanvasContainerRef.current) return;
    const observer = new ResizeObserver(checkSize);
    observer.observe(mainCanvasContainerRef.current);
    checkSize(); 
    return () => observer.disconnect();
  }, [canvasAspectRatio, activeLeftPanel]); 

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    disableDrawing(); 
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const scale = Math.min(stageSize.width * 0.5 / img.width, stageSize.height * 0.5 / img.height, 1);
          const newObject: ImageProps = {
            id: `image-${Date.now()}`, type: 'image', src,
            x: (stageSize.width - img.width * scale) / 2, y: (stageSize.height - img.height * scale) / 2,
            width: img.width * scale, height: img.height * scale, rotation: 0, opacity: 1,
            brightness: 0, contrast: 0, grayscale: false, sepia: false, invert: false, blur: 0,
            emboss: false, posterize: 0, stroke: '#000000', strokeWidth: 0,
            shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0,
            naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
            cropX: 0, cropY: 0, cropWidth: img.naturalWidth, cropHeight: img.naturalHeight,
          };
          setObjects(prev => [...prev, newObject]); setSelectedId(newObject.id);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = "";
  };
  
  const addStockImage = (url: string, type: ActiveLeftPanel) => {
    disableDrawing();
    const img = new window.Image();
    img.crossOrigin = 'anonymous'; img.src = url;
    img.onload = () => {
      const scale = Math.min(stageSize.width / img.naturalWidth, stageSize.height / img.naturalHeight, 1);
      const newObject: ImageProps = {
        id: `image-${Date.now()}`, type: 'image', src: url,
        x: (stageSize.width - img.naturalWidth * scale) / 2, y: (stageSize.height - img.naturalHeight * scale) / 2,
        width: img.naturalWidth * scale, height: img.naturalHeight * scale, rotation: 0, opacity: 1,
        brightness: 0, contrast: 0, grayscale: false, sepia: false, invert: false, blur: 0,
        emboss: false, posterize: 0, stroke: '#000000', strokeWidth: 0,
        shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0,
        naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
        cropX: 0, cropY: 0, cropWidth: img.naturalWidth, cropHeight: img.naturalHeight,
      };
      if (type === 'backgrounds') setObjects(prev => [newObject, ...prev]);
      else setObjects(prev => [...prev, newObject]);
      setSelectedId(newObject.id);
    };
    img.onerror = () => console.error("Failed to load stock image.");
  };

  const addText = () => {
    disableDrawing();
    const newObject: TextProps = {
      id: `text-${Date.now()}`, type: 'text', text: 'Type here',
      x: stageSize.width / 2 - 100, y: stageSize.height / 2 - 20, fontSize: 40, fontFamily: 'Roboto',
      fill: '#000000', // Changed to Black
      rotation: 0, opacity: 1, width: 200, height: 50, // Added default height
      isBold: false, isItalic: false,
      isUnderlined: false, isStrikethrough: false, align: 'left', lineHeight: 1.2, letterSpacing: 0,
      stroke: '#000000', strokeWidth: 0, shadowColor: '#000000', shadowBlur: 0,
      shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0,
    };
    setObjects(prev => [...prev, newObject]); setSelectedId(newObject.id);
  };
  
  const addShape = () => {
    disableDrawing(); 
    const newObject: ShapeProps = {
      id: `shape-${Date.now()}`, type: 'shape', shapeType: 'rect', 
      x: stageSize.width / 2 - 50, y: stageSize.height / 2 - 50,
      width: 100, height: 100, fill: '#805AD5', // Default purple fill
      stroke: '#000000', strokeWidth: 0, rotation: 0, opacity: 1,
      shadowColor: '#000000', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 0, shadowOpacity: 0,
    };
    setObjects(prev => [...prev, newObject]); setSelectedId(newObject.id);
  };

  const updateObject = (id: string, newProps: Partial<CanvasObject>) => {
    setObjects(prev => prev.map(obj => (obj.id === id ? { ...obj, ...newProps } : obj)));
  };

  const checkDeselect = (e: KonvaEventObject) => {
     if (isDrawingMode) return; 
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) setSelectedId(null);
  };

  const downloadImage = () => {
    if (stageRef.current) {
      setSelectedId(null); disableDrawing(); 
      setTimeout(() => {
        if (!stageRef.current) return;
        const dataURL = stageRef.current.toDataURL({ mimeType: 'image/png', quality: 1.0, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'my-canvas-creation.png'; link.href = dataURL; link.click();
      }, 100); 
    }
  };

  const handlePost = () => console.log("Post button clicked - implement posting logic here");

  const moveObject = (direction: 'forward' | 'backward') => {
    if (!selectedId) return;
    const index = objects.findIndex(obj => obj.id === selectedId);
    if (index === -1) return;
    const newObjects = [...objects];
    const [movedObject] = newObjects.splice(index, 1);
    if (direction === 'forward' && index < newObjects.length) newObjects.splice(index + 1, 0, movedObject);
    else if (direction === 'backward' && index > 0) newObjects.splice(index - 1, 0, movedObject);
    else newObjects.splice(index, 0, movedObject);
    setObjects(newObjects);
  };

  const duplicateObject = () => {
    if (!selectedId) return;
    const sourceObject = objects.find(obj => obj.id === selectedId);
    if (!sourceObject || sourceObject.type === 'line') return; 
    const newObject = { 
      ...JSON.parse(JSON.stringify(sourceObject)), 
      id: `${sourceObject.type}-${Date.now()}`, x: sourceObject.x + 20, y: sourceObject.y + 20,
     };
    setObjects(prev => [...prev, newObject]); setSelectedId(newObject.id); 
  };
  
  // --- Drawing Event Handlers ---
  const handleMouseDown = (e: KonvaEventObject) => {
     if (!isDrawingMode || selectedId || e.target !== e.target.getStage()) {
       checkDeselect(e); return;
    }
    setIsDrawing(true); const pos = e.target.getStage().getPointerPosition();
    if (pos) setCurrentLinePoints([pos.x, pos.y]); 
  };
  const handleMouseMove = (e: KonvaEventObject) => {
    if (!isDrawing || !isDrawingMode) return;
    const stage = e.target.getStage(); const point = stage.getPointerPosition();
    if (point) setCurrentLinePoints(prevPoints => [...prevPoints, point.x, point.y]); 
  };
  const handleMouseUp = () => {
    if (!isDrawing || !isDrawingMode) return;
    setIsDrawing(false);
    if (currentLinePoints.length < 4) { setCurrentLinePoints([]); return; }
    const newLine: LineData = {
      id: `line-${Date.now()}`, type: 'line', tool: drawingTool,
      points: currentLinePoints,
      stroke: drawingTool === 'eraser' ? '#FFFFFF' : brushColor, 
      strokeWidth: brushSize, tension: 0.5, lineCap: 'round',
      globalCompositeOperation: drawingTool === 'eraser' ? 'destination-out' : 'source-over', 
    };
    setObjects(prev => [...prev, newLine]); setCurrentLinePoints([]); 
  };

  const selectedObject = objects.find(obj => obj.id === selectedId);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const handleAccordionToggle = (title: string) => setOpenAccordion(prev => (prev === title ? null : title));
  useEffect(() => { setOpenAccordion(null); }, [selectedId]);

  const renderPropertiesPanel = () => {
    // Canvas Settings Panel
    if (!selectedObject) {
      return (
         <div className="p-4 h-full flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Canvas Settings</h3>
          <div className="flex-1 overflow-y-auto pr-2"> {/* Scroll wrapper */}
            <AccordionSection title="Background" icon={Palette} isOpen={openAccordion === 'Background'} onToggle={() => handleAccordionToggle('Background')}>
              <ColorInput label="Background Color" value={canvasBackgroundColor} onChange={(e) => setCanvasBackgroundColor(e.target.value)} />
            </AccordionSection>
            
            <AccordionSection title="Add Elements" icon={ShapeIcon} isOpen={openAccordion === 'Add Elements'} onToggle={() => handleAccordionToggle('Add Elements')}>
               <button onClick={addShape} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <ShapeIcon size={16} /> Add Rectangle
               </button>
            </AccordionSection>

            <AccordionSection title="Drawing Tools" icon={Paintbrush} isOpen={openAccordion === 'Drawing Tools'} onToggle={() => handleAccordionToggle('Drawing Tools')}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-300">Drawing Mode</label>
                <button onClick={() => setIsDrawingMode(!isDrawingMode)} className={`px-3 py-1 rounded-full text-xs ${ isDrawingMode ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                  {isDrawingMode ? 'ON' : 'OFF'}
                </button>
              </div>
              {isDrawingMode && (
                <>
                  <div className="flex gap-2 mb-3">
                     <IconButton icon={Paintbrush} onClick={() => setDrawingTool('pen')} isActive={drawingTool === 'pen'} title="Pen Tool"/>
                     <IconButton icon={Eraser} onClick={() => setDrawingTool('eraser')} isActive={drawingTool === 'eraser'} title="Eraser Tool"/>
                  </div>
                  {drawingTool === 'pen' && ( <ColorInput label="Brush Color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)}/> )}
                  <SliderControl label="Brush Size" min={1} max={50} step={1} value={brushSize} onChange={(e) => setBrushSize(parseFloat(e.target.value))}/>
                </>
              )}
            </AccordionSection>
          </div>
           <div className="mt-auto pt-3"></div> {/* Spacer for bottom */}
        </div>
      );
    }
    
    // --- Type Guards for Selected Object ---
    const isImage = (obj: CanvasObject): obj is ImageProps => obj.type === 'image';
    const isText = (obj: CanvasObject): obj is TextProps => obj.type === 'text';
    const isShape = (obj: CanvasObject): obj is ShapeProps => obj.type === 'shape';
    // --- End Type Guards ---

    // Selected Object Settings Panel
    return (
      <div className="p-4 h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4 capitalize">{selectedObject.type} Settings</h3>
        <div className="flex-1 overflow-y-auto pr-2"> {/* Scroll wrapper */}
          {/* Transform Section (Common) */}
          {selectedObject.type !== 'line' && ( // Lines don't have transform options here
            <AccordionSection title="Transform" icon={GripVertical} isOpen={openAccordion === 'Transform'} onToggle={() => handleAccordionToggle('Transform')}>
              <SliderControl label="Opacity" min={0} max={1} step={0.01} value={selectedObject.opacity} onChange={(e) => updateObject(selectedId!, { opacity: parseFloat(e.target.value) })}/>
              <SliderControl label="Rotation" min={-180} max={180} step={1} value={selectedObject.rotation || 0} onChange={(e) => updateObject(selectedId!, { rotation: parseFloat(e.target.value) })}/>
              <div className="flex justify-around gap-2 mt-3">
                <IconButton icon={BringToFront} onClick={() => moveObject('forward')} title="Bring Forward" />
                <IconButton icon={SendToBack} onClick={() => moveObject('backward')} title="Send Backward" />
                <IconButton icon={Copy} onClick={duplicateObject} title="Duplicate Object" /> 
              </div>
            </AccordionSection>
          )}

          {/* Image Sections */}
          {isImage(selectedObject) && (
            <>
              <AccordionSection title="Adjustments" icon={Sparkles} isOpen={openAccordion === 'Adjustments'} onToggle={() => handleAccordionToggle('Adjustments')}>
                <SliderControl label="Brightness" min={-1} max={1} step={0.01} value={selectedObject.brightness} onChange={(e) => updateObject(selectedId!, { brightness: parseFloat(e.target.value) })}/>
                <SliderControl label="Contrast" min={-100} max={100} step={1} value={selectedObject.contrast} onChange={(e) => updateObject(selectedId!, { contrast: parseFloat(e.target.value) })}/>
                <SliderControl label="Blur" min={0} max={50} step={1} value={selectedObject.blur} onChange={(e) => updateObject(selectedId!, { blur: parseFloat(e.target.value) })}/>
                <SliderControl label="Posterize" min={0} max={10} step={1} value={selectedObject.posterize} onChange={(e) => updateObject(selectedId!, { posterize: parseFloat(e.target.value) })}/>
              </AccordionSection>
              <AccordionSection title="Filters" icon={Blend} isOpen={openAccordion === 'Filters'} onToggle={() => handleAccordionToggle('Filters')}>
                <div className="grid grid-cols-3 gap-2">
                  <IconButton icon={MinusSquare} isActive={selectedObject.grayscale} onClick={() => updateObject(selectedId!, { grayscale: !selectedObject.grayscale })} title="Grayscale" />
                  <IconButton icon={Zap} isActive={selectedObject.sepia} onClick={() => updateObject(selectedId!, { sepia: !selectedObject.sepia })} title="Sepia" />
                  <IconButton icon={RotateCcw} isActive={selectedObject.invert} onClick={() => updateObject(selectedId!, { invert: !selectedObject.invert })} title="Invert" />
                  <IconButton icon={BlurIcon} isActive={selectedObject.emboss} onClick={() => updateObject(selectedId!, { emboss: !selectedObject.emboss })} title="Emboss" />
                </div>
              </AccordionSection>
            </>
          )}

          {/* Text Sections */}
          {isText(selectedObject) && (
            <>
              <AccordionSection title="Content & Font" icon={Type} isOpen={openAccordion === 'Content & Font'} onToggle={() => handleAccordionToggle('Content & Font')}>
                <div> <label className="text-xs text-gray-400 block mb-1">Text Content</label> <textarea value={selectedObject.text} onChange={(e) => updateObject(selectedId!, { text: e.target.value })} className="w-full h-24 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-400 resize-none" rows={3}/> </div>
                <SmallInput label="Font Size" type="number" min={1} value={selectedObject.fontSize} onChange={(e) => updateObject(selectedId!, { fontSize: parseFloat(e.target.value) })}/>
                <div> <label className="text-xs text-gray-400 block mb-1">Font Family</label> <select value={selectedObject.fontFamily} onChange={(e) => updateObject(selectedId!, { fontFamily: e.target.value })} className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-400 appearance-none custom-select"> {FONT_FAMILIES.map(font => (<option key={font} value={font} style={{ fontFamily: font, backgroundColor: '#2D3748' }}>{font}</option> ))} </select> </div>
                <ColorInput label="Text Color" value={selectedObject.fill} onChange={(e) => updateObject(selectedId!, { fill: e.target.value })}/>
              </AccordionSection>
              <AccordionSection title="Text Style" icon={Bold} isOpen={openAccordion === 'Text Style'} onToggle={() => handleAccordionToggle('Text Style')}>
                <div className="grid grid-cols-4 gap-2 mb-3"> {/* Changed to 4 cols */}
                  <IconButton icon={Bold} isActive={selectedObject.isBold} onClick={() => updateObject(selectedId!, { isBold: !selectedObject.isBold })} title="Bold" />
                  <IconButton icon={Italic} isActive={selectedObject.isItalic} onClick={() => updateObject(selectedId!, { isItalic: !selectedObject.isItalic })} title="Italic" />
                  <IconButton icon={Underline} isActive={selectedObject.isUnderlined} onClick={() => updateObject(selectedId!, { isUnderlined: !selectedObject.isUnderlined })} title="Underline" />
                  <IconButton icon={Minus} isActive={selectedObject.isStrikethrough} onClick={() => updateObject(selectedId!, { isStrikethrough: !selectedObject.isStrikethrough })} title="Strikethrough" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <IconButton icon={AlignLeft} isActive={selectedObject.align === 'left'} onClick={() => updateObject(selectedId!, { align: 'left' })} title="Align Left" />
                  <IconButton icon={AlignCenter} isActive={selectedObject.align === 'center'} onClick={() => updateObject(selectedId!, { align: 'center' })} title="Align Center" />
                  <IconButton icon={AlignRight} isActive={selectedObject.align === 'right'} onClick={() => updateObject(selectedId!, { align: 'right' })} title="Align Right" />
                </div>
                <SliderControl label="Line Height" min={0.5} max={3} step={0.1} value={selectedObject.lineHeight} onChange={(e) => updateObject(selectedId!, { lineHeight: parseFloat(e.target.value) })}/>
                <SliderControl label="Letter Spacing" min={-10} max={50} step={1} value={selectedObject.letterSpacing} onChange={(e) => updateObject(selectedId!, { letterSpacing: parseFloat(e.target.value) })}/>
              </AccordionSection>
            </>
          )}
          
          {/* Shape Section */}
          {isShape(selectedObject) && (
             <AccordionSection title="Color" icon={Palette} isOpen={openAccordion === 'Color'} onToggle={() => handleAccordionToggle('Color')}>
                 <ColorInput label="Fill Color" value={selectedObject.fill} onChange={(e) => updateObject(selectedId!, { fill: e.target.value })}/>
             </AccordionSection>
          )}

          {/* Outline Section (Text & Shape) */}
            {(isText(selectedObject) || isShape(selectedObject)) && (
            <AccordionSection title="Outline" icon={PenTool} isOpen={openAccordion === 'Outline'} onToggle={() => handleAccordionToggle('Outline')}>
              <ColorInput label="Outline Color" value={selectedObject.stroke} onChange={(e) => updateObject(selectedId!, { stroke: e.target.value })}/>
              <SliderControl label="Outline Width" min={0} max={20} step={1} value={selectedObject.strokeWidth} onChange={(e) => updateObject(selectedId!, { strokeWidth: parseFloat(e.target.value) })}/>
            </AccordionSection>
          )}

          {/* Shadow Section (Common except Line) */}
          {selectedObject.type !== 'line' && (
            <AccordionSection title="Shadow" icon={Frame} isOpen={openAccordion === 'Shadow'} onToggle={() => handleAccordionToggle('Shadow')}>
              <ColorInput label="Shadow Color" value={selectedObject.shadowColor} onChange={(e) => updateObject(selectedId!, { shadowColor: e.target.value })}/>
              <SliderControl label="Shadow Blur" min={0} max={550} step={1} value={selectedObject.shadowBlur} onChange={(e) => updateObject(selectedId!, { shadowBlur: parseFloat(e.target.value) })}/>
              <SliderControl label="Shadow Offset X" min={-50} max={50} step={1} value={selectedObject.shadowOffsetX} onChange={(e) => updateObject(selectedId!, { shadowOffsetX: parseFloat(e.target.value) })}/>
              <SliderControl label="Shadow Offset Y" min={-50} max={50} step={1} value={selectedObject.shadowOffsetY} onChange={(e) => updateObject(selectedId!, { shadowOffsetY: parseFloat(e.target.value) })}/>
              <SliderControl label="Shadow Opacity" min={0} max={1} step={0.01} value={selectedObject.shadowOpacity} onChange={(e) => updateObject(selectedId!, { shadowOpacity: parseFloat(e.target.value) })}/>
            </AccordionSection>
          )}
        </div>
        
        {/* Delete Button (Only if not a line) */}
         {selectedObject.type !== 'line' && (
           <div className="mt-auto pt-3">
             <button onClick={() => { setObjects(prev => prev.filter(obj => obj.id !== selectedId)); setSelectedId(null); }}
               className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
               <Trash2 size={16} /> Delete Object
             </button>
           </div>
         )}
      </div>
    );
  };
  
  const renderMainToolbar = () => (
    <div className="flex flex-col gap-4">
      <ToolButton label="Add Image" icon={Upload} onClick={() => { disableDrawing(); fileInputRef.current?.click(); }}/>
      <ToolButton label="Add Text" icon={Type} onClick={addText} />
      {/* --- AI GEN BUTTON MOVED HERE --- */}
      <ToolButton label="AI Gen" icon={Wand2} onClick={() => { disableDrawing(); setActiveLeftPanel('ai'); }}/>
      <ToolButton label="New Canvas" icon={BoxSelect} onClick={() => { disableDrawing(); setShowPresetModal(true); }}/>
      <ToolButton label="Backgrounds" icon={ImageIcon} onClick={() => { disableDrawing(); setActiveLeftPanel('backgrounds'); }}/>
      <ToolButton label="Elements" icon={ImagePlay} onClick={() => { disableDrawing(); setActiveLeftPanel('elements'); }}/>
      <ToolButton label="Overlays" icon={PictureInPicture} onClick={() => { disableDrawing(); setActiveLeftPanel('overlays'); }}/>
    </div>
  );

  // --- MODIFIED: Added Load More Logic ---
  const renderAssetPanel = () => {
    let title = '';
    let allAssets: { id: string, url: string }[] = [];

    if (activeLeftPanel === 'backgrounds') { title = 'Backgrounds'; allAssets = stockAssets.backgrounds; } 
    else if (activeLeftPanel === 'elements') { title = 'Elements'; allAssets = stockAssets.centerImages; } 
    else if (activeLeftPanel === 'overlays') { title = 'Overlays'; allAssets = stockAssets.overlays; }

    // Slice assets based on current count
    const assetsToShow = allAssets.slice(0, displayedAssetCount);
    const hasMoreAssets = displayedAssetCount < allAssets.length;

    const handleLoadMore = () => {
      setIsLoadingMoreAssets(true);
      // Simulate loading delay
      setTimeout(() => {
        setDisplayedAssetCount(prev => Math.min(allAssets.length, prev + LOAD_MORE_COUNT));
        setIsLoadingMoreAssets(false);
      }, 500); // 500ms delay
    };

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4 flex-shrink-0">
          <button onClick={() => setActiveLeftPanel('tools')} className="p-2 text-gray-300 hover:text-white" title="Back to tools"> <ArrowLeft size={20} /> </button>
          <h4 className="text-white text-sm font-semibold mx-auto pr-8">{title}</h4>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4"> {/* Added space-y-4 */}
          {/* --- MODIFIED: Grid cols-2 --- */}
          <div className="grid grid-cols-2 gap-2">
            {assetsToShow.map(item => (
              // eslint-disable-next-line @next/next/no-img-element
                <img key={item.id} src={item.url} crossOrigin="anonymous" alt={item.id}
                  className="w-full h-auto object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity aspect-square" // Added aspect-square
                  onClick={() => addStockImage(item.url, activeLeftPanel)}
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/1A202C/4A5568?text=Error')}/>
            ))}
          </div>
          {/* --- Load More Button --- */}
          {hasMoreAssets && (
             <button
                onClick={handleLoadMore}
                disabled={isLoadingMoreAssets}
                className="w-full mt-4 bg-white/10 hover:bg-white/20 text-gray-200 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoadingMoreAssets ? (
                  <> <Loader2 size={16} className="animate-spin"/> Loading... </>
                ) : (
                  'Load More'
                )}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  const renderAIPanel = () => {
    const handleGenerate = () => console.log("Generate AI Image with prompt:", aiPrompt);
    return (
       <div className="flex flex-col h-full">
         <div className="flex items-center mb-4 flex-shrink-0">
           <button onClick={() => setActiveLeftPanel('tools')} className="p-2 text-gray-300 hover:text-white" title="Back to tools"> <ArrowLeft size={20} /> </button>
           <h4 className="text-white text-sm font-semibold mx-auto pr-8">AI Image Generation</h4>
         </div>
         <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Enter your image prompt..."
              className="w-full h-40 px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-400 resize-none"/>
             <button onClick={handleGenerate} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
               Generate Image
             </button>
         </div>
       </div>
    );
  };

  const PresetButton = ({ label, ratio, width, height, onClick }: { label: string, ratio: string, width: number, height: number, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"> {/* Adjusted style */}
      <div className="text-white text-lg font-medium mb-1">{label}</div>
      <div className="text-gray-400 text-sm">{ratio} ({width}x{height}px)</div>
    </button>
  );

  return (
    <>
      <GoogleFontImporter />
      <div className="h-screen p-4 sm:p-6 bg-gradient-to-bl from-[#1d002a] via-[#2d1b69] to-[#4b006e] text-white">
        <div className="h-full flex flex-col bg-black/40 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">

          <header className="w-full p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm border-b border-white/10 z-20 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">My Canva</h1>
            <div className="flex gap-4">
               <button onClick={handlePost} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg">
                 Post
               </button>
               <button onClick={downloadImage} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg">
                 Download
               </button>
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <aside className={`p-4 bg-black/30 border-r border-white/10 z-10 transition-all duration-300 ${activeLeftPanel === 'tools' ? 'w-28' : 'w-80'}`}>
              {activeLeftPanel === 'tools' && renderMainToolbar()}
              {(activeLeftPanel === 'backgrounds' || activeLeftPanel === 'elements' || activeLeftPanel === 'overlays') && renderAssetPanel()}
              {activeLeftPanel === 'ai' && renderAIPanel()}
            </aside>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-black/50 relative" ref={mainCanvasContainerRef}>
              {showPresetModal && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-gray-900/80 backdrop-blur-sm border border-white/20 p-8 rounded-2xl shadow-xl max-w-2xl w-full relative"> 
                    <button onClick={() => setShowPresetModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"> <X size={24} /> </button>
                    <h2 className="text-2xl font-bold text-white mb-6">Choose Canvas Size</h2>
                    <p className="text-gray-300 mb-6">Select a preset to start your design or define a custom size.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                      <PresetButton label="Square" ratio="1:1" width={1080} height={1080} onClick={() => { disableDrawing(); setCanvasAspectRatio(1 / 1); setStageSize({ width: 1080, height: 1080 }); setObjects([]); setSelectedId(null); setShowPresetModal(false); }} />
                      <PresetButton label="Instagram Post" ratio="4:5" width={1080} height={1350} onClick={() => { disableDrawing(); setCanvasAspectRatio(4 / 5); setStageSize({ width: 1080, height: 1350 }); setObjects([]); setSelectedId(null); setShowPresetModal(false); }} />
                      <PresetButton label="Landscape" ratio="16:9" width={1920} height={1080} onClick={() => { disableDrawing(); setCanvasAspectRatio(16 / 9); setStageSize({ width: 1920, height: 1080 }); setObjects([]); setSelectedId(null); setShowPresetModal(false); }} />
                      <PresetButton label="Portrait" ratio="9:16" width={1080} height={1920} onClick={() => { disableDrawing(); setCanvasAspectRatio(9 / 16); setStageSize({ width: 1080, height: 1920 }); setObjects([]); setSelectedId(null); setShowPresetModal(false); }} />
                      <PresetButton label="Facebook Cover" ratio="820:312" width={820} height={312} onClick={() => { disableDrawing(); setCanvasAspectRatio(820 / 312); setStageSize({ width: 820, height: 312 }); setObjects([]); setSelectedId(null); setShowPresetModal(false); }} />
                      <PresetButton label="A4 Document" ratio="210:297" width={794} height={1123} onClick={() => { disableDrawing(); setCanvasAspectRatio(210 / 297); setStageSize({ width: 794, height: 1123 }); setObjects([]); setSelectedId(null); setShowPresetModal(false); }} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">Custom Size</h3>
                    <div className="flex gap-4 items-end">
                      <SmallInput label="Width (px)" type="number" min={100} value={stageSize.width} onChange={(e) => { const w = parseFloat(e.target.value) || 100; setStageSize(p => ({ ...p, width: w })); }}/>
                      <SmallInput label="Height (px)" type="number" min={100} value={stageSize.height} onChange={(e) => { const h = parseFloat(e.target.value) || 100; setStageSize(p => ({ ...p, height: h })); }}/>
                      <button onClick={() => { disableDrawing(); setCanvasAspectRatio(stageSize.width / stageSize.height); setObjects([]); setSelectedId(null); setShowPresetModal(false); }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-colors h-9">
                        Create Custom
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg shadow-2xl overflow-hidden" style={{ width: stageSize.width, height: stageSize.height }}>
                <Stage
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    ref={stageRef}
                    style={{
                      backgroundColor: canvasBackgroundColor,
                      // --- MODIFIED CURSOR LOGIC ---
                      cursor: isDrawingMode
                       ? drawingTool === 'eraser'
                         ? 'cell' // Or 'grab', 'grabbing', 'crosshair' - 'cell' gives a boxy feel
                         : 'crosshair' // Cursor for the pen tool
                       : 'default' // Default cursor when not drawing
                    }}
                >
                  <Layer>
                    {objects.map((obj) => {
                      const commonProps = {
                        isSelected: obj.id === selectedId,
                        onSelect: () => !isDrawingMode && setSelectedId(obj.id),
                        onChange: (newAttrs: Partial<CanvasObject>) => updateObject(obj.id, newAttrs),
                      };
                        if (obj.type === 'image') return <ImageObject key={obj.id} {...commonProps} shapeProps={obj} />;
                        if (obj.type === 'text') return <TextObject key={obj.id} {...commonProps} shapeProps={obj} />;
                        if (obj.type === 'shape') return <ShapeObject key={obj.id} {...commonProps} shapeProps={obj} />;
                        if (obj.type === 'line') return <KonvaLine key={obj.id} points={obj.points} stroke={obj.stroke} strokeWidth={obj.strokeWidth} tension={obj.tension} lineCap={obj.lineCap} globalCompositeOperation={obj.globalCompositeOperation}/>;
                        return null;
                    })}
                    {isDrawing && <KonvaLine points={currentLinePoints} stroke={drawingTool === 'eraser' ? '#FFFFFF' : brushColor} strokeWidth={brushSize} tension={0.5} lineCap="round" globalCompositeOperation={drawingTool === 'eraser' ? 'destination-out' : 'source-over'}/>}
                  </Layer>
                </Stage>
              </div>
            </main>

            <aside className="w-80 bg-black/30 backdrop-blur-sm border-l border-white/10 z-10 flex flex-col">
              {renderPropertiesPanel()}
            </aside>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
      </div>
    </>
  );
}