"use client";

import { CanvasObject } from './store';
import { TextElement } from './elements/TextElement';
import { ImageElement } from './elements/ImageElement';
import { ShapeElement } from './elements/ShapeElement'; // <-- ADD THIS

type CanvasElementProps = {
  obj: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasObject>) => void;
};

export const CanvasElement = ({ obj, ...props }: CanvasElementProps) => {
  switch (obj.type) {
    case 'text':
      return <TextElement obj={obj} {...props} />;
    case 'image':
      return <ImageElement obj={obj} {...props} />;
    case 'shape': // <-- ADD THIS CASE
      return <ShapeElement obj={obj} {...props} />;
    default:
      return null;
  }
};