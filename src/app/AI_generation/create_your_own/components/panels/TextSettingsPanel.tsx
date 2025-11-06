"use client";

import { useEditorStore, TextObject } from '../store';
import { Trash, Copy } from 'lucide-react';

export const TextSettingsPanel = ({ selectedText }: { selectedText: TextObject }) => {
  const { updateObject, deleteObject, duplicateObject } = useEditorStore();
  
  const handleChange = (prop: keyof TextObject, value: string) => {
    updateObject(selectedText.id, { [prop]: value });
  };
  
  return (
    <div className="flex flex-col gap-4">
      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => duplicateObject(selectedText.id)}
          className="flex items-center justify-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600">
          <Copy size={16} /> <span className="text-sm">Duplicate</span>
        </button>
        <button 
          onClick={() => deleteObject(selectedText.id)}
          className="flex items-center justify-center gap-2 p-2 bg-red-800 rounded hover:bg-red-700">
          <Trash size={16} /> <span className="text-sm">Delete</span>
        </button>
      </div>
      
      <div>
        <label className="text-xs text-gray-400">Text Content</label>
        <textarea
          className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
          value={selectedText.text}
          onChange={(e) => handleChange('text', e.target.value)}
        />
      </div>
    </div>
  );
};