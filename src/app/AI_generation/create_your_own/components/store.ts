import { create } from 'zustand';

// --- Shadow Type ---
export type ShadowProps = {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
};

// --- Object Types ---
export type TextObject = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string; // Color
  rotation: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  shadow: ShadowProps;
  // --- NEW PROPERTIES ---
  fontWeight: string; // 'normal', 'bold'
  fontStyle: string; // 'normal', 'italic'
  textDecoration: string; // 'none', 'underline', 'line-through'
  align: string; // 'left', 'center', 'right'
  lineHeight: number; // 1, 1.2, 1.5 etc.
  letterSpacing: number; // 0, 1, 2 etc.
};

export type ImageObject = {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number; // <-- This will now handle flip (e.g., -1)
  scaleY: number; // <-- This will now handle flip (e.g., -1)
  opacity: number;
  shadow: ShadowProps;

  // Basic Filters
  brightness: number;
  contrast: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;

  // --- NEW / UPDATED ---
  noise: number; // Was present but not in panel
  emboss: boolean; // Was present but not in panel
  posterize: boolean; // Was present but not in panel

  // HSL
  hue: number;
  saturation: number;
  luminance: number;

  // Colorize
  colorize: string;
  colorizeStrength: number;
};

export type ShapeObject = {
  id: string;
  type: 'shape';
  shapeType: 'rect' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  shadow: ShadowProps;
};

export type CanvasObject = TextObject | ImageObject | ShapeObject;

// --- Drawing Types ---
export type EditorMode = 'select' | 'draw' | 'erase';
export type LineObject = {
  id: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  compositeOperation: string;
};

// --- Editor State ---
type EditorState = {
  canvasSize: { width: number; height: number } | null;
  canvasBackgroundColor: string;
  objects: CanvasObject[];
  selectedId: string | null;
  editorMode: EditorMode;
  lines: LineObject[];
  brushColor: string;
  brushSize: number;

  setCanvasSize: (size: { width: number; height: number }) => void;
  setBackgroundColor: (color: string) => void;
  addObject: (obj: Omit<TextObject | ImageObject | ShapeObject, 'id'>) => void;
  setSelectedId: (id: string | null) => void;
  updateObject: <T extends CanvasObject>(id: string, newProps: Partial<T>) => void;
  deleteObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  setEditorMode: (mode: EditorMode) => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;
  addNewLine: (line: LineObject) => void;
  updateLinePoints: (id: string, newPoints: number[]) => void;
  downloadCanvas: () => void;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  canvasSize: null,
  canvasBackgroundColor: '#FFFFFF',
  objects: [],
  selectedId: null,
  editorMode: 'select',
  lines: [],
  brushColor: '#000000',
  brushSize: 5,

  // --- ACTIONS ---

  setCanvasSize: (size) => {
    set({
      canvasSize: size,
      objects: [],
      lines: [],
      selectedId: null,
      canvasBackgroundColor: '#FFFFFF'
    });
  },

  setBackgroundColor: (color) => {
    set({ canvasBackgroundColor: color });
  },

  addObject: (obj) => {
    const newObject = { ...obj, id: Date.now().toString() } as CanvasObject;
    set((state) => ({
      objects: [...state.objects, newObject],
      selectedId: newObject.id,
      editorMode: 'select',
    }));
  },

  setSelectedId: (id) => {
    set({ selectedId: id, editorMode: 'select' });
  },

  updateObject: (id, newProps) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...newProps } : obj
      ),
    }));
  },

  deleteObject: (id) => {
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
      selectedId: null,
    }));
  },

  duplicateObject: (id) => {
    const objectToDuplicate = get().objects.find((obj) => obj.id === id);
    if (!objectToDuplicate) return;

    const newObject = {
      ...objectToDuplicate,
      id: Date.now().toString(),
      x: objectToDuplicate.x + 20,
      y: objectToDuplicate.y + 20,
    } as CanvasObject;

    set((state) => ({
      objects: [...state.objects, newObject],
      selectedId: newObject.id,
      editorMode: 'select',
    }));
  },

  setEditorMode: (mode) => {
    set({ editorMode: mode, selectedId: null });
  },

  setBrushColor: (color) => {
    set({ brushColor: color });
  },

  setBrushSize: (size) => {
    set({ brushSize: size });
  },

  addNewLine: (line) => {
    set((state) => ({
      lines: [...state.lines, line],
    }));
  },

  updateLinePoints: (id, newPoints) => {
    set((state) => ({
      lines: state.lines.map((line) =>
        line.id === id ? { ...line, points: newPoints } : line
      ),
    }));
  },

  downloadCanvas: () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'canvas.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  },
}));
