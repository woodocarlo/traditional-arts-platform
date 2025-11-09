"use client";

import { useState } from 'react';
import { useEditorStore, TextObject, ShadowProps } from '../store';
import { 
  Trash, Copy, ChevronDown, Brush, Type, SlidersHorizontal, 
  Palette, Bold, Italic, Underline, 
  AlignCenter, AlignLeft, AlignRight, Pilcrow
} from 'lucide-react';

// --- Reusable Components (Copied from ImageSettingsPanel) ---

const Slider = ({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="w-full">
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex items-center gap-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-sm w-12 text-right">{value}</span>
    </div>
  </div>
);

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="w-full">
    <label className="text-xs text-gray-400">{label}</label>
    <div className="flex items-center gap-2 mt-1">
      <input
        type="color"
        value={value}
        onChange={onChange}
        className="h-8 w-8 rounded border border-gray-600 p-0"
      />
      <span className="text-sm font-mono">{value.toUpperCase()}</span>
    </div>
  </div>
);

const ToggleButton = ({ label, isActive, onClick, icon: Icon }: { label: string; isActive: boolean; onClick: () => void; icon?: React.ComponentType<{ size?: number }> }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 w-full p-2 rounded text-xs ${isActive ? 'bg-purple-700 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
  >
    {Icon && <Icon size={14} />}
    {label}
  </button>
);

const AccordionItem = ({ title, name, icon: Icon, isOpen, onToggle, children }: { title: string; name: string; icon: React.ComponentType<{ size?: number }>; isOpen: boolean; onToggle: (name: string) => void; children: React.ReactNode }) => (
  <div className="w-full border-b border-gray-700">
    <button
      onClick={() => onToggle(name)}
      className="flex w-full items-center justify-between p-3 text-left text-sm font-medium hover:bg-gray-800"
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <span>{title}</span>
      </div>
      <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="p-3 bg-gray-800 bg-opacity-30">
        {children}
      </div>
    )}
  </div>
);

// --- Font List ---
const fontList = [
  // Cursive
  "Dancing Script", "Pacifico", "Great Vibes", "Lobster",
  // Serif
  "Merriweather", "Playfair Display", "Roboto Slab", "Times New Roman",
  // Sans-Serif
  "Roboto", "Montserrat", "Oswald", "Lato", "Arial",
  // Monospace
  "Roboto Mono", "Courier New"
];

// --- Main Panel Component ---

export const TextSettingsPanel = ({ selectedText }: { selectedText: TextObject }) => {
  const { updateObject, deleteObject, duplicateObject } = useEditorStore();
  
  const [openAccordion, setOpenAccordion] = useState<string | null>('font');

  const toggleAccordion = (name: string) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const handleChange = (prop: keyof TextObject, value: string | number) => {
    updateObject(selectedText.id, { [prop]: value });
  };
  
  const handleShadowChange = (prop: keyof ShadowProps, value: unknown) => {
    updateObject(selectedText.id, {
      shadow: {
        ...selectedText.shadow,
        [prop]: value
      }
    });
  };

  return (
    <div className="flex flex-col gap-0 -m-4">
      {/* Actions (Not in an accordion) */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-700">
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
      
      {/* Content Accordion */}
      <AccordionItem
        title="Content"
        name="content"
        icon={Type}
        isOpen={openAccordion === 'content'}
        onToggle={toggleAccordion}
      >
        <textarea
          className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
          value={selectedText.text}
          onChange={(e) => handleChange('text', e.target.value)}
          rows={4}
        />
      </AccordionItem>

      {/* Font & Style Accordion */}
      <AccordionItem
        title="Font & Style"
        name="font"
        icon={Palette}
        isOpen={openAccordion === 'font'}
        onToggle={toggleAccordion}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400">Font Family</label>
            <select
              value={selectedText.fontFamily}
              onChange={(e) => handleChange('fontFamily', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
            >
              {fontList.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          <Slider
            label="Font Size"
            min={8} max={200} step={1}
            value={selectedText.fontSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('fontSize', parseInt(e.target.value, 10))}
          />
          <ColorInput
            label="Color"
            value={selectedText.fill}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('fill', e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <ToggleButton
              label="Bold"
              icon={Bold}
              isActive={selectedText.fontWeight === 'bold'}
              onClick={() => handleChange('fontWeight', selectedText.fontWeight === 'bold' ? 'normal' : 'bold')}
            />
            <ToggleButton
              label="Italic"
              icon={Italic}
              isActive={selectedText.fontStyle === 'italic'}
              onClick={() => handleChange('fontStyle', selectedText.fontStyle === 'italic' ? 'normal' : 'italic')}
            />
            <ToggleButton
              label="Underline"
              icon={Underline}
              isActive={selectedText.textDecoration === 'underline'}
              onClick={() => handleChange('textDecoration', selectedText.textDecoration === 'underline' ? 'none' : 'underline')}
            />
          </div>
        </div>
      </AccordionItem>
      
      {/* Layout & Spacing Accordion */}
      <AccordionItem
        title="Layout & Spacing"
        name="layout"
        icon={Pilcrow} // Or use AlignHorizontalJustifyCenter
        isOpen={openAccordion === 'layout'}
        onToggle={toggleAccordion}
      >
        <div className="flex flex-col gap-4">
          <label className="text-xs text-gray-400">Alignment</label>
          <div className="grid grid-cols-3 gap-2">
            <ToggleButton
              label="Left"
              icon={AlignLeft}
              isActive={selectedText.align === 'left'}
              onClick={() => handleChange('align', 'left')}
            />
            <ToggleButton
              label="Center"
              icon={AlignCenter}
              isActive={selectedText.align === 'center'}
              onClick={() => handleChange('align', 'center')}
            />
            <ToggleButton
              label="Right"
              icon={AlignRight}
              isActive={selectedText.align === 'right'}
              onClick={() => handleChange('align', 'right')}
            />
          </div>
          <Slider
            label="Line Height"
            min={0.5} max={3} step={0.1}
            value={selectedText.lineHeight}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('lineHeight', parseFloat(e.target.value))}
          />
          <Slider
            label="Letter Spacing"
            min={-10} max={50} step={1}
            value={selectedText.letterSpacing}
            // --- THIS IS THE FIX ---
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('letterSpacing', parseInt(e.target.value, 10))}
          />
        </div>
      </AccordionItem>

      {/* Transform Accordion */}
      <AccordionItem
        title="Transform"
        name="transform"
        icon={SlidersHorizontal}
        isOpen={openAccordion === 'transform'}
        onToggle={toggleAccordion}
      >
        <div className="flex flex-col gap-4">
          <Slider
            label="Opacity"
            min={0} max={1} step={0.01}
            value={selectedText.opacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('opacity', parseFloat(e.target.value))}
          />
          <Slider
            label="Rotation"
            min={0} max={359} step={1}
            value={selectedText.rotation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('rotation', parseInt(e.target.value, 10))}
          />
        </div>
      </AccordionItem>

      {/* Shadow Accordion */}
      <AccordionItem
        title="Shadow"
        name="shadow"
        icon={Brush}
        isOpen={openAccordion === 'shadow'}
        onToggle={toggleAccordion}
      >
        <div className="flex flex-col gap-4">
          <ColorInput
            label="Shadow Color"
            value={selectedText.shadow.color}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('color', e.target.value)}
          />
          <Slider
            label="Blur"
            min={0} max={50} step={1}
            value={selectedText.shadow.blur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('blur', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Offset X"
            min={-50} max={50} step={1}
            value={selectedText.shadow.offsetX}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('offsetX', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Offset Y"
            min={-50} max={50} step={1}
            value={selectedText.shadow.offsetY}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('offsetY', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Opacity"
            min={0} max={1} step={0.01}
            value={selectedText.shadow.opacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('opacity', parseFloat(e.target.value))}
          />
        </div>
      </AccordionItem>
    </div>
  );
};