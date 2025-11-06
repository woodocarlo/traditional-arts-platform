import { create } from 'zustand';

// (Keep the TextObject and CanvasObject types from the previous response)
export type TextObject = {
  id: string;
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
  rotation: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
};
export type CanvasObject = TextObject;

// Define the state and actions
type EditorState = {
  canvasSize: { width: number; height: number } | null; // <-- ADD THIS
  setCanvasSize: (size: { width: number; height: number }) => void; // <-- ADD THIS
  objects: CanvasObject[];
  selectedId: string | null;
  addObject: (obj: Omit<CanvasObject, 'id'>) => void;
  setSelectedId: (id: string | null) => void;
  updateObject: (id: string, newProps: Partial<CanvasObject>) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  canvasSize: null, // <-- ADD THIS: Initialize as null
  objects: [],
  selectedId: null,

  setCanvasSize: (size) => { // <-- ADD THIS
    set({ canvasSize: size, objects: [], selectedId: null }); // Reset canvas on new size
  },
  
  addObject: (obj) => {
    const newObject = { ...obj, id: Date.now().toString() } as CanvasObject;
    set((state) => ({
      objects: [...state.objects, newObject],
    }));
  },

  setSelectedId: (id) => {
    set({ selectedId: id });
  },

  updateObject: (id, newProps) => {
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...newProps } : obj
      ),
    }));
  },
}));