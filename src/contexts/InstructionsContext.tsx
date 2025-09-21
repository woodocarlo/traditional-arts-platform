"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface InstructionsContextType {
  instructions: ReactNode; // Change this from string to ReactNode
  setInstructions: (text: ReactNode) => void; // Change this from string to ReactNode
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const InstructionsContext = createContext<InstructionsContextType | undefined>(undefined);

export function InstructionsProvider({ children }: { children: ReactNode }) {
  const [instructions, setInstructions] = useState<ReactNode>(null); // Change initial state to null
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <InstructionsContext.Provider value={{ 
      instructions, 
      setInstructions, 
      showInstructions, 
      setShowInstructions 
    }}>
      {children}
    </InstructionsContext.Provider>
  );
}

export function useInstructions() {
  const context = useContext(InstructionsContext);
  if (context === undefined) {
    throw new Error('useInstructions must be used within an InstructionsProvider');
  }
  return context;
}