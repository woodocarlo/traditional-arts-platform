"use client";

import React from 'react';
import { Translation } from '../types';
import { GlobeIcon, HelpCircleIcon } from './icons';

export const Header = ({ onMenuClick, onLanguageToggle, t }: { onMenuClick: () => void; onLanguageToggle: () => void; t: Translation }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm border-b border-slate-800/50">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold text-white tracking-wider">
          Kala<span style={{ color: '#F4C430' }}>सखी</span>
        </h1>
      </div>
      <nav className="flex items-center space-x-4">
        <a href="#features" className="text-white/80 hover:text-white font-medium transition-opacity hidden sm:block">{t.features}</a>
        <button onClick={onLanguageToggle} className="p-2 text-white hover:bg-white/10 rounded-full" aria-label="Toggle language">
          <GlobeIcon />
        </button>
        <button onClick={onMenuClick} className="p-2 text-white hover:bg-white/10 rounded-full" aria-label="Open instructions">
          <HelpCircleIcon />
        </button>
        <a href="#" className="bg-[#F4C430] text-black font-bold py-2 px-5 rounded-lg hover:bg-amber-400 transition-colors shadow-md">{t.signUp}</a>
      </nav>
    </div>
  </header>
);

export default Header;
