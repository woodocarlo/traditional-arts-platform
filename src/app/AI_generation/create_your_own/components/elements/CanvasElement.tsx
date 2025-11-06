"use client";

import { CanvasObject } from '../store';
import { TextElement } from './TextElement';
import { ImageElement } from './ImageElement';

type CanvasElementProps = {
  obj: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasObject>) => void;
};

// This component checks the object type and renders the correct Konva component
export const CanvasElement = ({ obj, ...props }: CanvasElementProps) => {
  switch (obj.type) {
    case 'text':
      return <TextElement obj={obj} {...props} />;
    case 'image':
      return <ImageElement obj={obj} {...props} />;
    // Add other types like 'shape' here
    default:
      return null;
  }
};