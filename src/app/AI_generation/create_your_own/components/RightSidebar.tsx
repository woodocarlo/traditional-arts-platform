"use client";

import { useEditorStore } from './store';
import { CanvasSettingsPanel } from './panels/CanvasSettingsPanel';
import { ImageSettingsPanel } from './panels/ImageSettingsPanel';
import { TextSettingsPanel } from './panels/TextSettingsPanel';
import { ShapeSettingsPanel } from './panels/ShapeSettingsPanel'; // <-- ADD THIS

export default function RightSidebar() {
  const { selectedId, objects } = useEditorStore();
  
  const selectedObject = objects.find((obj) => obj.id === selectedId);

  const renderPanel = () => {
    if (!selectedObject) {
      return <CanvasSettingsPanel />;
    }
    
    switch (selectedObject.type) {
      case 'image':
        return <ImageSettingsPanel selectedImage={selectedObject} />;
      case 'text':
        return <TextSettingsPanel selectedText={selectedObject} />;
      case 'shape': // <-- ADD THIS CASE
        return <ShapeSettingsPanel selectedShape={selectedObject} />;
      default:
        return null;
    }
  };

  return (
    <aside className="w-80 bg-[#0e0e1a] p-4 text-gray-300 overflow-y-auto">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {selectedObject ? `${selectedObject.type.toUpperCase()} Settings` : 'Canvas Settings'}
      </h2>
      
      {renderPanel()}
    </aside>
  );
}