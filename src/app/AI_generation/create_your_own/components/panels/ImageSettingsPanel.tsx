// {
// type: "new_file",
// fileName: "ImageSettingsPanel.tsx",
// fileContent:
"use client";

import { useState } from 'react';
import { useEditorStore, ImageObject, ShadowProps } from '../store';
import { 
  Sun, Trash, Copy, Contrast, Waves, ChevronDown, Brush, 
  Droplet, Type, SlidersHorizontal, Palette, RefreshCcw, RefreshCw, 
  FlipHorizontal, FlipVertical 
} from 'lucide-react';

// --- Reusable Components (Slightly restyled) ---

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

// --- Accordion System ---
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


// --- Main Panel Component ---

export const ImageSettingsPanel = ({ selectedImage }: { selectedImage: ImageObject }) => {
  const { updateObject, deleteObject, duplicateObject } = useEditorStore();
  
  const [openAccordion, setOpenAccordion] = useState<string | null>('color');
  const toggleAccordion = (name: string) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const handleChange = (prop: keyof ImageObject, value: unknown) => {
    updateObject(selectedImage.id, { [prop]: value });
  };

  const handleShadowChange = (prop: keyof ShadowProps, value: unknown) => {
    updateObject(selectedImage.id, {
      shadow: {
        ...selectedImage.shadow,
        [prop]: value
      }
    });
  };

  // --- NEW: Flip Handler ---
  const handleFlip = (axis: 'x' | 'y') => {
    if (axis === 'x') {
      handleChange('scaleX', selectedImage.scaleX * -1);
    } else {
      handleChange('scaleY', selectedImage.scaleY * -1);
    }
  };

  return (
    <div className="flex flex-col gap-0 -m-4">
      {/* Actions (Not in an accordion) */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-700">
        <button 
          onClick={() => duplicateObject(selectedImage.id)}
          className="flex items-center justify-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600">
          <Copy size={16} /> <span className="text-sm">Duplicate</span>
        </button>
        <button 
          onClick={() => deleteObject(selectedImage.id)}
          className="flex items-center justify-center gap-2 p-2 bg-red-800 rounded hover:bg-red-700">
          <Trash size={16} /> <span className="text-sm">Delete</span>
        </button>
      </div>
      
      {/* --- NEW: Transform Accordion --- */}
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
            value={selectedImage.opacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('opacity', parseFloat(e.target.value))}
          />
          <div className="grid grid-cols-2 gap-2">
            <ToggleButton
              label="Flip H"
              icon={FlipHorizontal}
              isActive={false} // Flip isn't a "state" but an action
              onClick={() => handleFlip('x')}
            />
            <ToggleButton
              label="Flip V"
              icon={FlipVertical}
              isActive={false}
              onClick={() => handleFlip('y')}
            />
          </div>
        </div>
      </AccordionItem>
      
      {/* --- NEW: Color Adjust Accordion --- */}
      <AccordionItem
        title="Color Adjust"
        name="color"
        icon={Palette}
        isOpen={openAccordion === 'color'}
        onToggle={toggleAccordion}
      >
        <div className="flex flex-col gap-4">
          <Slider
            label="Brightness"
            min={-1} max={1} step={0.01}
            value={selectedImage.brightness}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('brightness', parseFloat(e.target.value))}
          />
          <Slider
            label="Contrast"
            min={-100} max={100} step={1}
            value={selectedImage.contrast}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('contrast', parseFloat(e.target.value))}
          />
          <Slider
            label="Hue"
            min={0} max={359} step={1}
            value={selectedImage.hue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('hue', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Saturation"
            min={-1} max={1} step={0.01}
            value={selectedImage.saturation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('saturation', parseFloat(e.target.value))}
          />
          <Slider
            label="Luminance"
            min={-1} max={1} step={0.01}
            value={selectedImage.luminance}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('luminance', parseFloat(e.target.value))}
          />
          
          <div className="border-t border-gray-700 pt-4 flex flex-col gap-4">
            <ColorInput
              label="Colorize (Tint)"
              value={selectedImage.colorize}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('colorize', e.target.value)}
            />
            <Slider
              label="Tint Strength"
              min={0} max={1} step={0.01}
              value={selectedImage.colorizeStrength}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('colorizeStrength', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </AccordionItem>

      {/* --- UPDATED: Effects Accordion --- */}
      <AccordionItem
        title="Effects"
        name="effects"
        icon={Sun}
        isOpen={openAccordion === 'effects'}
        onToggle={toggleAccordion}
      >
        <div className="flex flex-col gap-4">
          <Slider
            label="Blur"
            min={0} max={30} step={1}
            value={selectedImage.blur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('blur', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Grain (Noise)"
            min={0} max={1} step={0.01}
            value={selectedImage.noise}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('noise', parseFloat(e.target.value))}
          />
          <div className="grid grid-cols-3 gap-2">
            <ToggleButton
              label="Grayscale"
              isActive={selectedImage.grayscale}
              onClick={() => handleChange('grayscale', !selectedImage.grayscale)}
            />
            <ToggleButton
              label="Sepia"
              isActive={selectedImage.sepia}
              onClick={() => handleChange('sepia', !selectedImage.sepia)}
            />
            <ToggleButton
              label="Invert"
              isActive={selectedImage.invert}
              onClick={() => handleChange('invert', !selectedImage.invert)}
            />
            <ToggleButton
              label="Emboss"
              isActive={selectedImage.emboss}
              onClick={() => handleChange('emboss', !selectedImage.emboss)}
            />
            <ToggleButton
              label="Posterize"
              isActive={selectedImage.posterize}
              onClick={() => handleChange('posterize', !selectedImage.posterize)}
            />
          </div>
        </div>
      </AccordionItem>
      
      {/* Shadow Accordion (Unchanged) */}
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
            value={selectedImage.shadow.color}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('color', e.target.value)}
          />
          <Slider
            label="Blur"
            min={0} max={50} step={1}
            value={selectedImage.shadow.blur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('blur', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Offset X"
            min={-50} max={50} step={1}
            value={selectedImage.shadow.offsetX}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('offsetX', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Offset Y"
            min={-50} max={50} step={1}
            value={selectedImage.shadow.offsetY}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('offsetY', parseInt(e.target.value, 10))}
          />
          <Slider
            label="Opacity"
            min={0} max={1} step={0.01}
            value={selectedImage.shadow.opacity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleShadowChange('opacity', parseFloat(e.target.value))}
          />
        </div>
      </AccordionItem>
    </div>
  );
};
// }