"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
// Added Rect for shapes, Line for drawing
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Rect as KonvaRect, Line as KonvaLine } from 'react-konva';
import Konva from 'konva/lib/Core';
import {
  Upload, Type, Palette, Sparkles, Sun, Contrast, Droplet, Trash2, X,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  BringToFront, SendToBack, Square as ShapeIcon, Minus, PenTool, Blend, RotateCcw,
  BoxSelect, Droplet as BlurIcon, Focus, MinusSquare, Zap, Frame,
  GripVertical, Crop, Image as ImageIcon, ImagePlay, PictureInPicture, ArrowLeft,
  Paintbrush, Eraser, Copy, Wand2 // Added icons
} from 'lucide-react';

import stockAssets from '../post_generation/stock.json' assert { type: 'json' };

// --- Konva module imports for filters (side-effects) ---
import 'konva/lib/filters/Brighten';
import 'konva/lib/filters/Contrast';
import 'konva/lib/filters/Grayscale';
import 'konva/lib/filters/Sepia';
import 'konva/lib/filters/Invert';
import 'konva/lib/filters/Blur';
import 'konva/lib/filters/Emboss';
import 'konva/lib/filters/Posterize';
// --- End Konva module imports ---

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
    
    /* --- Custom Scrollbar --- */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(17, 24, 39, 0.5); /* bg-gray-900/50 */
    }
    ::-webkit-scrollbar-thumb {
      background: #374151; /* bg-gray-700 */
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #4b5563; /* bg-gray-600 */
      background-clip: padding-box;
    }
    * {
      scrollbar-width: thin;
      scrollbar-color: #374151 rgba(17, 24, 39, 0.5);
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
    className="flex flex-col items-center justify-center w-full p-2 py-3 bg-gray-800/50 backdrop-blur-md rounded-lg border border-gray-700/50 text-gray-200 hover:bg-gray-700/60 transition-colors text-xs"
    title={label}
  >
    <Icon size={20} className="mb-1" />
    <span>{label}</span>
  </button>
);

const IconButton = ({ icon: Icon, onClick, isActive = false, title }: { icon: React.ElementType, onClick: () => void, isActive?: boolean, title?: string }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-md transition-colors ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'}`}
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
      className="w-full px-2 py-1 bg-gray-800/50 border border-gray-700/50 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
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
      className="w-full h-8 p-0.5 bg-gray-800/50 border border-gray-700/50 rounded-md cursor-pointer"
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
        className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500"
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
    <div className="mb-4 bg-gray-800/30 border border-gray-700/30 rounded-lg overflow-hidden">
      <button
        className="w-full flex justify-between items-center p-3 text-white text-sm font-semibold hover:bg-gray-700/40 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} />
          <span>{title}</span>
        </div>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div className="p-3 border-t border-gray-700/30 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};


// --- Konva Components ---

const ImageObject = ({ shapeProps, isSelected, onSelect, onChange }: { shapeProps: any, isSelected: boolean, onSelect: () => void, onChange: (props: any) => void }) => {
  const [image] = useImage(shapeProps.src, 'Anonymous');
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

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

  // Dynamically build filter array
  const filters: any[] = [];
  if (Konva.Filters.Brighten) filters.push(Konva.Filters.Brighten);
  if (Konva.Filters.Contrast) filters.push(Konva.Filters.Contrast);
  if (Konva.Filters.Grayscale && shapeProps.grayscale) filters.push(Konva.Filters.Grayscale);
  if (Konva.Filters.Sepia && shapeProps.sepia) filters.push(Konva.Filters.Sepia);
  if (Konva.Filters.Invert && shapeProps.invert) filters.push(Konva.Filters.Invert);
  if (Konva.Filters.Blur && shapeProps.blur) filters.push(Konva.Filters.Blur);
  if (Konva.Filters.Emboss && shapeProps.emboss) filters.push(Konva.Filters.Emboss);
  if (Konva.Filters.Posterize && shapeProps.posterize) filters.push(Konva.Filters.Posterize);


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
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
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
          x: shapeProps.cropX,
          y: shapeProps.cropY,
          width: shapeProps.cropWidth,
          height: shapeProps.cropHeight,
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const TextObject = ({ shapeProps, isSelected, onSelect, onChange }: { shapeProps: any, isSelected: boolean, onSelect: () => void, onChange: (props: any) => void }) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Apply font styles based on boolean flags
  const fontStyle = `${shapeProps.isBold ? 'bold' : ''} ${shapeProps.isItalic ? 'italic' : ''}`.trim();
  let textDecoration = '';
  if (shapeProps.isUnderlined) textDecoration += 'underline ';
  if (shapeProps.isStrikethrough) textDecoration += 'line-through';
  textDecoration = textDecoration.trim();

  return (
    <>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        fontStyle={fontStyle}
        textDecoration={textDecoration}
        draggable
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              fontSize: Math.max(5, (node.fontSize() || 12) * scaleY),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['middle-left', 'middle-right']}
          rotateEnabled={true}
        />
      )}
    </>
  );
};

const ShapeObject = ({ shapeProps, isSelected, onSelect, onChange }: { shapeProps: any, isSelected: boolean, onSelect: () => void, onChange: (props: any) => void }) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaRect // Currently only renders rectangles
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
              rotation: node.rotation(),
            });
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

// --- Main Page Component ---

type ActiveLeftPanel = 'tools' | 'backgrounds' | 'elements' | 'overlays' | 'ai'; // Added 'ai'
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

export default function CreateYourOwnPost() {
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const stageRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainCanvasContainerRef = useRef<HTMLElement>(null);

  const [showPresetModal, setShowPresetModal] = useState(true);
  const [canvasAspectRatio, setCanvasAspectRatio] = useState(1 / 1);
  const [stageSize, setStageSize] = useState({ width: 500, height: 500 });
  
  const [activeLeftPanel, setActiveLeftPanel] = useState<ActiveLeftPanel>('tools'); // Renamed state
  
  // Drawing states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [drawingTool, setDrawingTool] = useState<DrawingTool>('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [currentLinePoints, setCurrentLinePoints] = useState<number[]>([]);
  const [aiPrompt, setAiPrompt] = useState(''); // State for AI prompt

  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState('#FFFFFF');

  // --- Helper Function to disable drawing ---
  const disableDrawing = () => {
    setIsDrawingMode(false);
    setIsDrawing(false); // Ensure drawing stops if active
    setCurrentLinePoints([]); // Clear any partial line
  };

  useEffect(() => {
    const checkSize = () => {
      if (mainCanvasContainerRef.current) {
        const containerWidth = mainCanvasContainerRef.current.offsetWidth;
        const containerHeight = mainCanvasContainerRef.current.offsetHeight;

        let newWidth, newHeight;

        const padding = 32;
        const availableWidth = Math.max(10, containerWidth - padding);
        const availableHeight = Math.max(10, containerHeight - padding);

        if (availableWidth / availableHeight > canvasAspectRatio) {
          newHeight = availableHeight;
          newWidth = availableHeight * canvasAspectRatio;
        } else {
          newWidth = availableWidth;
          newHeight = availableWidth / canvasAspectRatio;
        }

        setStageSize({ width: newWidth, height: newHeight });
      }
    };

    if (!mainCanvasContainerRef.current) return;
    const observer = new ResizeObserver(checkSize);
    observer.observe(mainCanvasContainerRef.current);
    checkSize(); 

    return () => observer.disconnect();
  }, [canvasAspectRatio, activeLeftPanel]); // Changed dependency

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    disableDrawing(); // Disable drawing when uploading
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const scale = Math.min(stageSize.width * 0.5 / img.width, stageSize.height * 0.5 / img.height, 1);
          
          const newObject = {
            id: `image-${Date.now()}`,
            type: 'image',
            src,
            x: (stageSize.width - img.width * scale) / 2,
            y: (stageSize.height - img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            rotation: 0,
            opacity: 1,
            brightness: 0,
            contrast: 0,
            grayscale: false,
            sepia: false,
            invert: false,
            blur: 0,
            emboss: false,
            posterize: 0,
            stroke: '#000000',
            strokeWidth: 0,
            shadowColor: '#000000',
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowOpacity: 0,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            cropX: 0,
            cropY: 0,
            cropWidth: img.naturalWidth,
            cropHeight: img.naturalHeight,
          };
          setObjects(prev => [...prev, newObject]);
          setSelectedId(newObject.id);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };
  
  const addStockImage = (url: string, type: ActiveLeftPanel) => {
    disableDrawing(); // Disable drawing when adding stock
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const scale = Math.min(stageSize.width / img.naturalWidth, stageSize.height / img.naturalHeight, 1);
      
      const newObject = {
        id: `image-${Date.now()}`,
        type: 'image',
        src: url,
        x: (stageSize.width - img.naturalWidth * scale) / 2,
        y: (stageSize.height - img.naturalHeight * scale) / 2,
        width: img.naturalWidth * scale,
        height: img.naturalHeight * scale,
        rotation: 0,
        opacity: 1,
        brightness: 0,
        contrast: 0,
        grayscale: false,
        sepia: false,
        invert: false,
        blur: 0,
        emboss: false,
        posterize: 0,
        stroke: '#000000',
        strokeWidth: 0,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowOpacity: 0,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        cropX: 0,
        cropY: 0,
        cropWidth: img.naturalWidth,
        cropHeight: img.naturalHeight,
      };

      if (type === 'backgrounds') {
        setObjects(prev => [newObject, ...prev]);
      } else {
        setObjects(prev => [...prev, newObject]);
      }
      setSelectedId(newObject.id);
    };
    img.onerror = () => {
      console.error("Failed to load stock image.");
    };
  };

  const addText = () => {
    disableDrawing(); // Disable drawing when adding text
    const newObject = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Type here',
      x: stageSize.width / 2 - 100,
      y: stageSize.height / 2 - 20,
      fontSize: 40,
      fontFamily: 'Roboto',
      fill: '#000000',
      rotation: 0,
      opacity: 1,
      width: 200,
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      isStrikethrough: false,
      align: 'left',
      lineHeight: 1.2,
      letterSpacing: 0,
      stroke: '#000000',
      strokeWidth: 0,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0,
    };
    setObjects(prev => [...prev, newObject]);
    setSelectedId(newObject.id);
  };
  
  const addShape = () => {
    disableDrawing(); // Disable drawing when adding shape
    const newObject = {
      id: `shape-${Date.now()}`,
      type: 'shape', 
      shapeType: 'rect', 
      x: stageSize.width / 2 - 50,
      y: stageSize.height / 2 - 50,
      width: 100,
      height: 100,
      fill: '#000000', 
      stroke: '#000000',
      strokeWidth: 0,
      rotation: 0,
      opacity: 1,
      shadowColor: '#000000',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowOpacity: 0,
    };
    setObjects(prev => [...prev, newObject]);
    setSelectedId(newObject.id);
  };

  const updateObject = (id: string, newProps: any) => {
    setObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, ...newProps } : obj))
    );
  };

  const checkDeselect = (e: any) => {
     if (isDrawingMode) return; // Don't deselect if drawing mode is on

    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const downloadImage = () => {
    if (stageRef.current) {
      setSelectedId(null); 
      disableDrawing(); 
      setTimeout(() => {
        if (!stageRef.current) return;
        const dataURL = stageRef.current.toDataURL({
          mimeType: 'image/png',
          quality: 1.0,
          pixelRatio: 2, 
        });
        const link = document.createElement('a');
        link.download = 'my-canvas-creation.png';
        link.href = dataURL;
        link.click();
      }, 100); 
    }
  };

  // --- NEW: Placeholder Post function ---
  const handlePost = () => {
    console.log("Post button clicked - implement posting logic here");
    // Example: You might want to call downloadImage() and then upload the result
  };

  const moveObject = (direction: 'forward' | 'backward') => {
    if (!selectedId) return;
    const index = objects.findIndex(obj => obj.id === selectedId);
    if (index === -1) return;

    const newObjects = [...objects];
    const [movedObject] = newObjects.splice(index, 1);

    if (direction === 'forward' && index < newObjects.length) {
      newObjects.splice(index + 1, 0, movedObject);
    } else if (direction === 'backward' && index > 0) {
      newObjects.splice(index - 1, 0, movedObject);
    } else {
      newObjects.splice(index, 0, movedObject);
    }
    setObjects(newObjects);
  };

  const duplicateObject = () => {
    if (!selectedId) return;
    const sourceObject = objects.find(obj => obj.id === selectedId);
    if (!sourceObject || sourceObject.type === 'line') return; // Cannot duplicate lines

    const newObject = { 
      ...JSON.parse(JSON.stringify(sourceObject)), 
      id: `${sourceObject.type}-${Date.now()}`,
      x: sourceObject.x + 20,
      y: sourceObject.y + 20,
     };

    setObjects(prev => [...prev, newObject]);
    setSelectedId(newObject.id); 
  };
  
  // --- Drawing Event Handlers ---
  const handleMouseDown = (e: any) => {
     if (!isDrawingMode || selectedId || e.target !== e.target.getStage()) {
      checkDeselect(e); 
      return;
    }
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setCurrentLinePoints([pos.x, pos.y]); 
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing || !isDrawingMode) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setCurrentLinePoints(prevPoints => [...prevPoints, point.x, point.y]); 
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isDrawingMode) return;
    setIsDrawing(false);
    
    // Don't create empty lines
    if (currentLinePoints.length < 4) { 
        setCurrentLinePoints([]);
        return;
    }

    const newLine: LineData = {
      id: `line-${Date.now()}`,
      type: 'line',
      tool: drawingTool,
      points: currentLinePoints,
      stroke: drawingTool === 'eraser' ? '#FFFFFF' : brushColor, 
      strokeWidth: brushSize,
      tension: 0.5, 
      lineCap: 'round',
      globalCompositeOperation: drawingTool === 'eraser' ? 'destination-out' : 'source-over', 
    };

    setObjects(prev => [...prev, newLine]); 
    setCurrentLinePoints([]); 
  };

  // Find the currently selected object
  const selectedObject = objects.find(obj => obj.id === selectedId);

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleAccordionToggle = (title: string) => {
    setOpenAccordion(prevOpen => (prevOpen === title ? null : title));
  };

  // Reset accordion when selected object changes
  useEffect(() => {
    setOpenAccordion(null);
  }, [selectedId]);

  const renderPropertiesPanel = () => {
    // Render Canvas Settings if nothing is selected
    if (!selectedObject) {
      return (
         <div className="p-4 h-full flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4">Canvas Settings</h3>
          <div className="flex-1 overflow-y-auto pr-2">
            <AccordionSection
              title="Background"
              icon={Palette}
              isOpen={openAccordion === 'Background'}
              onToggle={() => handleAccordionToggle('Background')}
            >
              <ColorInput
                label="Background Color"
                value={canvasBackgroundColor}
                onChange={(e) => setCanvasBackgroundColor(e.target.value)}
              />
            </AccordionSection>
            
             {/* --- ADD SHAPE BUTTON MOVED HERE --- */}
            <AccordionSection
              title="Add Elements"
              icon={ShapeIcon} // Using ShapeIcon, but could be something else
              isOpen={openAccordion === 'Add Elements'}
              onToggle={() => handleAccordionToggle('Add Elements')}
            >
               <button
                  onClick={addShape}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ShapeIcon size={16} /> Add Rectangle
               </button>
               {/* Add buttons for other shapes here */}
            </AccordionSection>

            <AccordionSection
              title="Drawing Tools"
              icon={Paintbrush}
              isOpen={openAccordion === 'Drawing Tools'}
              onToggle={() => handleAccordionToggle('Drawing Tools')}
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-300">Drawing Mode</label>
                <button
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    isDrawingMode ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {isDrawingMode ? 'ON' : 'OFF'}
                </button>
              </div>
              {isDrawingMode && (
                <>
                  <div className="flex gap-2 mb-3">
                     <IconButton 
                       icon={Paintbrush} 
                       onClick={() => setDrawingTool('pen')} 
                       isActive={drawingTool === 'pen'} 
                       title="Pen Tool"
                     />
                     <IconButton 
                       icon={Eraser} 
                       onClick={() => setDrawingTool('eraser')} 
                       isActive={drawingTool === 'eraser'} 
                       title="Eraser Tool"
                     />
                  </div>
                  {drawingTool === 'pen' && (
                     <ColorInput
                        label="Brush Color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                     />
                  )}
                  <SliderControl
                    label="Brush Size"
                    min={1} max={50} step={1}
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                  />
                </>
              )}
            </AccordionSection>
          </div>
           <div className="mt-auto pt-3"></div> 
        </div>
      );
    }
    
    // Render Selected Object Settings
    return (
      <div className="p-4 h-full flex flex-col">
        <h3 className="text-xl font-bold text-white mb-4 capitalize">
          {selectedObject.type} Settings
        </h3>

        <div className="flex-1 overflow-y-auto pr-2">
          <AccordionSection
            title="Transform"
            icon={GripVertical}
            isOpen={openAccordion === 'Transform'}
            onToggle={() => handleAccordionToggle('Transform')}
          >
            <SliderControl
              label="Opacity"
              min={0} max={1} step={0.01}
              value={selectedObject.opacity}
              onChange={(e) => updateObject(selectedId!, { opacity: parseFloat(e.target.value) })}
            />
            <SliderControl
              label="Rotation"
              min={-180} max={180} step={1}
              value={selectedObject.rotation}
              onChange={(e) => updateObject(selectedId!, { rotation: parseFloat(e.target.value) })}
            />
            <div className="flex justify-around gap-2 mt-3">
              <IconButton icon={BringToFront} onClick={() => moveObject('forward')} title="Bring Forward" />
              <IconButton icon={SendToBack} onClick={() => moveObject('backward')} title="Send Backward" />
              {selectedObject.type !== 'line' && ( // Can't duplicate lines
                 <IconButton icon={Copy} onClick={duplicateObject} title="Duplicate Object" /> 
              )}
            </div>
          </AccordionSection>

          {/* --- Image-Specific Properties --- */}
          {selectedObject.type === 'image' && (
            <>
              <AccordionSection
                title="Adjustments"
                icon={Sparkles}
                isOpen={openAccordion === 'Adjustments'}
                onToggle={() => handleAccordionToggle('Adjustments')}
              >
                <SliderControl
                  label="Brightness"
                  min={-1} max={1} step={0.01}
                  value={selectedObject.brightness}
                  onChange={(e) => updateObject(selectedId!, { brightness: parseFloat(e.target.value) })}
                />
                <SliderControl
                  label="Contrast"
                  min={-100} max={100} step={1}
                  value={selectedObject.contrast}
                  onChange={(e) => updateObject(selectedId!, { contrast: parseFloat(e.target.value) })}
                />
                <SliderControl
                  label="Blur"
                  min={0} max={50} step={1}
                  value={selectedObject.blur}
                  onChange={(e) => updateObject(selectedId!, { blur: parseFloat(e.target.value) })}
                />
                <SliderControl
                  label="Posterize"
                  min={0} max={10} step={1}
                  value={selectedObject.posterize}
                  onChange={(e) => updateObject(selectedId!, { posterize: parseFloat(e.target.value) })}
                />
              </AccordionSection>

              <AccordionSection
                title="Filters"
                icon={Blend}
                isOpen={openAccordion === 'Filters'}
                onToggle={() => handleAccordionToggle('Filters')}
              >
                <div className="grid grid-cols-3 gap-2">
                  <IconButton icon={MinusSquare} isActive={selectedObject.grayscale} onClick={() => updateObject(selectedId!, { grayscale: !selectedObject.grayscale })} title="Grayscale" />
                  <IconButton icon={Zap} isActive={selectedObject.sepia} onClick={() => updateObject(selectedId!, { sepia: !selectedObject.sepia })} title="Sepia" />
                  <IconButton icon={RotateCcw} isActive={selectedObject.invert} onClick={() => updateObject(selectedId!, { invert: !selectedObject.invert })} title="Invert" />
                  <IconButton icon={BlurIcon} isActive={selectedObject.emboss} onClick={() => updateObject(selectedId!, { emboss: !selectedObject.emboss })} title="Emboss" />
                </div>
              </AccordionSection>
            </>
          )}

          {/* --- Text-Specific Properties --- */}
          {selectedObject.type === 'text' && (
            <>
              <AccordionSection
                title="Content & Font"
                icon={Type}
                isOpen={openAccordion === 'Content & Font'}
                onToggle={() => handleAccordionToggle('Content & Font')}
              >
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Content</label>
                  <textarea
                    value={selectedObject.text}
                    onChange={(e) => updateObject(selectedId!, { text: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                  />
                </div>
                <SmallInput
                  label="Font Size"
                  type="number"
                  min={1}
                  value={selectedObject.fontSize}
                  onChange={(e) => updateObject(selectedId!, { fontSize: parseFloat(e.target.value) })}
                />
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Font Family</label>
                  <select
                    value={selectedObject.fontFamily}
                    onChange={(e) => updateObject(selectedId!, { fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none custom-select"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font} value={font} style={{ fontFamily: font, backgroundColor: '#374151' }}>{font}</option>
                    ))}
                  </select>
                </div>
                <ColorInput
                  label="Text Color"
                  value={selectedObject.fill}
                  onChange={(e) => updateObject(selectedId!, { fill: e.target.value })}
                />
              </AccordionSection>

              <AccordionSection
                title="Text Style"
                icon={Bold}
                isOpen={openAccordion === 'Text Style'}
                onToggle={() => handleAccordionToggle('Text Style')}
              >
                <div className="grid grid-cols-3 gap-2 mb-3">
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
                <SliderControl
                  label="Line Height"
                  min={0.5} max={3} step={0.1}
                  value={selectedObject.lineHeight}
                  onChange={(e) => updateObject(selectedId!, { lineHeight: parseFloat(e.target.value) })}
                />
                <SliderControl
                  label="Letter Spacing"
                  min={-10} max={50} step={1}
                  value={selectedObject.letterSpacing}
                  onChange={(e) => updateObject(selectedId!, { letterSpacing: parseFloat(e.target.value) })}
                />
              </AccordionSection>
            </>
          )}
          
          {selectedObject.type === 'shape' && (
             <AccordionSection
                title="Color"
                icon={Palette}
                isOpen={openAccordion === 'Color'}
                onToggle={() => handleAccordionToggle('Color')}
              >
                 <ColorInput
                    label="Fill Color"
                    value={selectedObject.fill}
                    onChange={(e) => updateObject(selectedId!, { fill: e.target.value })}
                  />
             </AccordionSection>
          )}

          {(selectedObject.type === 'text' || selectedObject.type === 'shape') && (
            <AccordionSection
              title="Outline"
              icon={PenTool}
              isOpen={openAccordion === 'Outline'}
              onToggle={() => handleAccordionToggle('Outline')}
            >
              <ColorInput
                label="Outline Color"
                value={selectedObject.stroke}
                onChange={(e) => updateObject(selectedId!, { stroke: e.target.value })}
              />
              <SliderControl
                label="Outline Width"
                min={0} max={20} step={1}
                value={selectedObject.strokeWidth}
                onChange={(e) => updateObject(selectedId!, { strokeWidth: parseFloat(e.target.value) })}
              />
            </AccordionSection>
          )}

          {/* Shadow only if not a line */}
          {selectedObject.type !== 'line' && (
            <AccordionSection
              title="Shadow"
              icon={Frame}
              isOpen={openAccordion === 'Shadow'}
              onToggle={() => handleAccordionToggle('Shadow')}
            >
              <ColorInput
                label="Shadow Color"
                value={selectedObject.shadowColor}
                onChange={(e) => updateObject(selectedId!, { shadowColor: e.target.value })}
              />
              <SliderControl
                label="Shadow Blur"
                min={0} max={50} step={1}
                value={selectedObject.shadowBlur}
                onChange={(e) => updateObject(selectedId!, { shadowBlur: parseFloat(e.target.value) })}
              />
              <SliderControl
                label="Shadow Offset X"
                min={-50} max={50} step={1}
                value={selectedObject.shadowOffsetX}
                onChange={(e) => updateObject(selectedId!, { shadowOffsetX: parseFloat(e.target.value) })}
              />
              <SliderControl
                label="Shadow Offset Y"
                min={-50} max={50} step={1}
                value={selectedObject.shadowOffsetY}
                onChange={(e) => updateObject(selectedId!, { shadowOffsetY: parseFloat(e.target.value) })}
              />
              <SliderControl
                label="Shadow Opacity"
                min={0} max={1}
                step={0.01}
                value={selectedObject.shadowOpacity}
                onChange={(e) => updateObject(selectedId!, { shadowOpacity: parseFloat(e.target.value) })}
              />
            </AccordionSection>
          )}
        </div>
        
        {/* --- Delete Button (only if not a line) --- */}
         {selectedObject.type !== 'line' && (
            <div className="mt-auto pt-3">
              <button
                onClick={() => {
                  setObjects(prev => prev.filter(obj => obj.id !== selectedId));
                  setSelectedId(null); 
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Object
              </button>
            </div>
         )}
      </div>
    );
  };
  
  const renderMainToolbar = () => (
    <div className="flex flex-col gap-4">
      <ToolButton
        label="Add Image"
        icon={Upload}
        onClick={() => {
          disableDrawing();
          fileInputRef.current?.click();
        }}
      />
      <ToolButton
        label="Add Text"
        icon={Type}
        onClick={addText} // addText already calls disableDrawing
      />
       {/* --- SHAPE BUTTON REMOVED FROM HERE --- */}
      <ToolButton
        label="New Canvas"
        icon={BoxSelect}
        onClick={() => {
           disableDrawing();
           setShowPresetModal(true);
        }}
      />
      <ToolButton
        label="Backgrounds"
        icon={ImageIcon}
        onClick={() => {
           disableDrawing();
           setActiveLeftPanel('backgrounds');
        }}
      />
      <ToolButton
        label="Elements"
        icon={ImagePlay}
        onClick={() => {
           disableDrawing();
           setActiveLeftPanel('elements');
        }}
      />
      <ToolButton
        label="Overlays"
        icon={PictureInPicture}
        onClick={() => {
           disableDrawing();
           setActiveLeftPanel('overlays');
        }}
      />
      {/* --- NEW AI GEN BUTTON --- */}
       <ToolButton
        label="AI Gen"
        icon={Wand2}
        onClick={() => {
           disableDrawing();
           setActiveLeftPanel('ai');
        }}
      />
    </div>
  );

  const renderAssetPanel = () => {
    let title = '';
    let assets: { id: string, url: string }[] = [];

    if (activeLeftPanel === 'backgrounds') {
      title = 'Backgrounds';
      assets = stockAssets.backgrounds;
    } else if (activeLeftPanel === 'elements') {
      title = 'Elements';
      assets = stockAssets.centerImages;
    } else if (activeLeftPanel === 'overlays') {
      title = 'Overlays';
      assets = stockAssets.overlays;
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-4 flex-shrink-0">
          <button
            onClick={() => setActiveLeftPanel('tools')}
            className="p-2 text-gray-300 hover:text-white"
            title="Back to tools"
          >
            <ArrowLeft size={20} />
          </button>
          <h4 className="text-white text-sm font-semibold mx-auto pr-8">{title}</h4>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 pr-2">
          {assets.map(item => (
            <img
              key={item.id}
              src={item.url}
              crossOrigin="Anonymous"
              alt={item.id}
              className="w-full h-auto object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => addStockImage(item.url, activeLeftPanel)} // addStockImage calls disableDrawing
              onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/374151/9ca3af?text=Error')}
            />
          ))}
        </div>
      </div>
    );
  };
  
  // --- NEW: AI Generation Panel ---
  const renderAIPanel = () => {
    const handleGenerate = () => {
      console.log("Generate AI Image with prompt:", aiPrompt);
      // Add your backend integration logic here
      // Maybe show a loading state
    };
    
    return (
       <div className="flex flex-col h-full">
        <div className="flex items-center mb-4 flex-shrink-0">
          <button
            onClick={() => setActiveLeftPanel('tools')}
            className="p-2 text-gray-300 hover:text-white"
            title="Back to tools"
          >
            <ArrowLeft size={20} />
          </button>
          <h4 className="text-white text-sm font-semibold mx-auto pr-8">AI Image Generation</h4>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
           <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Enter your image prompt..."
              className="w-full h-40 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none" // Added resize-none
            />
             <button
              onClick={handleGenerate}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              Generate Image
            </button>
            {/* You could add results display area here */}
        </div>
      </div>
    );
  };


  const PresetButton = ({ label, ratio, width, height, onClick }: { label: string, ratio: string, width: number, height: number, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/50 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
    >
      <div className="text-white text-lg font-medium mb-1">{label}</div>
      <div className="text-gray-400 text-sm">{ratio} ({width}x{height}px)</div>
    </button>
  );

  return (
    <>
      <GoogleFontImporter />

      <div className="h-screen p-4 sm:p-6 bg-gradient-to-bl from-[#1d002a] via-[#2d1b69] to-[#4b006e] text-white">
        <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50">

          <header className="w-full p-4 flex justify-between items-center bg-gray-900/30 backdrop-blur-sm border-b border-gray-700/50 z-20 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">My Canva</h1>
            {/* --- ADDED POST BUTTON --- */}
            <div className="flex gap-4">
               <button
                  onClick={handlePost}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Post
                </button>
                <button
                  onClick={downloadImage}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Download
                </button>
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">

            <aside className={`p-4 bg-gray-900/40 border-r border-gray-700/50 z-10 transition-all duration-300 ${activeLeftPanel === 'tools' ? 'w-28' : 'w-80'}`}>
              {/* --- Conditional Rendering for Left Panel --- */}
              {activeLeftPanel === 'tools' && renderMainToolbar()}
              {(activeLeftPanel === 'backgrounds' || activeLeftPanel === 'elements' || activeLeftPanel === 'overlays') && renderAssetPanel()}
              {activeLeftPanel === 'ai' && renderAIPanel()}
            </aside>

            <main
              className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-gray-900 relative"
              ref={mainCanvasContainerRef}
            >
              {showPresetModal && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700 max-w-2xl w-full relative">
                    <button
                      onClick={() => setShowPresetModal(false)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
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
                    <div className="flex gap-4">
                      <SmallInput
                        label="Width (px)"
                        type="number"
                        min={100}
                        value={stageSize.width}
                        onChange={(e) => {
                          const newWidth = parseFloat(e.target.value) || 100;
                          setStageSize(prev => ({ width: newWidth, height: prev.height }));
                        }}
                      />
                      <SmallInput
                        label="Height (px)"
                        type="number"
                        min={100}
                        value={stageSize.height}
                        onChange={(e) => {
                          const newHeight = parseFloat(e.target.value) || 100;
                          setStageSize(prev => ({ width: prev.width, height: newHeight }));
                        }}
                      />
                      <button
                        onClick={() => {
                          disableDrawing();
                          setCanvasAspectRatio(stageSize.width / stageSize.height);
                          setObjects([]);
                          setSelectedId(null);
                          setShowPresetModal(false);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors self-end h-max"
                      >
                        Create Custom
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* --- Canvas Container --- */}
              <div
                className="rounded-lg shadow-2xl overflow-hidden" // Removed bg-white, handled by Stage now
                style={{ width: stageSize.width, height: stageSize.height }}
              >
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
                  style={{ backgroundColor: canvasBackgroundColor, cursor: isDrawingMode ? 'crosshair' : 'default' }} 
                >
                  <Layer>
                    {objects.map((obj) => {
                      // --- FIX: Pass key directly, remove from commonProps ---
                      const commonProps = {
                        shapeProps: obj,
                        isSelected: obj.id === selectedId,
                        onSelect: () => !isDrawingMode && setSelectedId(obj.id), 
                        onChange: (newAttrs: any) => {
                          updateObject(obj.id, newAttrs);
                        },
                      };

                      if (obj.type === 'image') {
                        return <ImageObject key={obj.id} {...commonProps} />;
                      }
                      if (obj.type === 'text') {
                        return <TextObject key={obj.id} {...commonProps} />;
                      }
                      if (obj.type === 'shape') { 
                        return <ShapeObject key={obj.id} {...commonProps} />;
                      }
                      if (obj.type === 'line') {
                        return (
                          <KonvaLine
                            key={obj.id}
                            points={obj.points}
                            stroke={obj.stroke}
                            strokeWidth={obj.strokeWidth}
                            tension={obj.tension}
                            lineCap={obj.lineCap}
                            globalCompositeOperation={obj.globalCompositeOperation}
                          />
                        );
                      }
                      return null;
                    })}
                    {/* Render the line currently being drawn */}
                    {isDrawing && (
                      <KonvaLine
                        points={currentLinePoints}
                        stroke={drawingTool === 'eraser' ? '#FFFFFF' : brushColor} 
                        strokeWidth={brushSize}
                        tension={0.5}
                        lineCap="round"
                        globalCompositeOperation={drawingTool === 'eraser' ? 'destination-out' : 'source-over'}
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
            </main>

            <aside className="w-80 bg-gray-900/60 backdrop-blur-sm border-l border-gray-700/50 z-10 flex flex-col">
              {renderPropertiesPanel()}
            </aside>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </>
  );
}