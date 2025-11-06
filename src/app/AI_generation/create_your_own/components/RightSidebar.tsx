"use client";

import { useEditorStore } from './store';

export default function RightSidebar() {
  const { selectedId, objects } = useEditorStore();
  const selectedObject = objects.find((obj) => obj.id === selectedId);

  return (
    <aside className="w-72 bg-[#0e0e1a] p-4 text-gray-300">
      <h2 className="mb-4 text-lg font-semibold text-white">
        {selectedObject ? `${selectedObject.type.toUpperCase()} Settings` : 'Canvas Settings'}
      </h2>

      {/* If nothing is selected, show Canvas settings */}
      {!selectedObject && (
        <div>
          <h3 className="text-sm font-medium">Background</h3>
          {/* Add Background Color Picker Here */}
        </div>
      )}

      {/* If a text object is selected, show text settings */}
      {selectedObject && selectedObject.type === 'text' && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs">Text Content</label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
              value={selectedObject.text}
              // Add onChange to update the object
            />
          </div>
          <div>
            <label className="text-xs">Color</label>
            {/* Add Color Picker Here */}
          </div>
          <div>
            <label className="text-xs">Font Size</label>
            {/* Add Slider Here */}
          </div>
        </div>
      )}
    </aside>
  );
}