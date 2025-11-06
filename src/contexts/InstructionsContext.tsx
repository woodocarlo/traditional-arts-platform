"use client";

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface InstructionsContextType {
  instructions: ReactNode;
  setInstructions: (instructions: ReactNode) => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const InstructionsContext = createContext<InstructionsContextType | undefined>(undefined);

export const useInstructions = () => {
  const context = useContext(InstructionsContext);
  if (!context) {
    throw new Error('useInstructions must be used within an InstructionsProvider');
  }
  return context;
};

interface InstructionsProviderProps {
  children: ReactNode;
}

export const InstructionsProvider: React.FC<InstructionsProviderProps> = ({ children }) => {
  const [instructions, setInstructions] = useState<ReactNode>(
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-teal-300 mb-3">Getting Started</h4>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Select an Indian handicraft product from the available options (Golden Elephant, Warlli Art, or Pattachitra)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Each product has unique base prices, production costs, and market characteristics</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-teal-300 mb-3">Pricing Strategies</h4>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>High Demand:</strong> Test premium pricing to capture high-value customers</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Low Demand:</strong> Use promotional pricing to stimulate sales during slow periods</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Max Profit:</strong> Optimize for maximum profit margins</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Gain Market:</strong> Aggressive pricing with marketing boost to capture market share</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Balanced:</strong> Maintain optimal balance between profit and sales volume</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-teal-300 mb-3">Understanding Metrics</h4>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Current Price:</strong> The selling price per unit (watch trend indicators)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Weekly Sales:</strong> Units sold per week (max 50 units)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Weekly Earnings:</strong> Revenue minus costs (material + marketing)</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Market Demand:</strong> Current market responsiveness (30%-200%)</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-teal-300 mb-3">AI Autopilot Mode</h4>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Enable autopilot for continuous AI-driven optimization</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>AI automatically tests strategies every 4 seconds</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Monitor the decision log to see AI reasoning and actions</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Track total profit accumulation over time</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-teal-300 mb-3">Tips for Success</h4>
        <ul className="text-sm text-slate-300 space-y-2">
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Start with balanced strategy to understand baseline performance</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Watch the price-earnings chart to visualize strategy impact</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Use Reset button to start fresh with any product</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-2 h-2 bg-teal-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span>Goal: Maximize total profit while maintaining sustainable sales volume</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <InstructionsContext.Provider value={{ instructions, setInstructions, showInstructions, setShowInstructions }}>
      {children}
    </InstructionsContext.Provider>
  );
};
