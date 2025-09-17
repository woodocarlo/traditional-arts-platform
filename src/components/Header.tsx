"use client";

import React from 'react';

// --- Icon Components ---
const HelpCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

// --- Localization Data ---
const translations = {
    en: {
        features: "Features",
        signUp: "Sign Up",
    },
    hi: {
        features: "विशेषताएँ",
        signUp: "साइन अप करें",
    }
};

type Language = 'en' | 'hi';

interface HeaderProps {
  onMenuClick?: () => void;
  onLanguageToggle?: () => void;
  language?: Language;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onLanguageToggle, language = 'en' }) => {
  const t = translations[language];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm border-b border-slate-800/50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button onClick={onMenuClick} className="text-white hover:text-gray-300">
            <HelpCircleIcon />
          </button>
          <h1 className="text-white text-xl font-bold">Traditional Arts Platform</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <a href="#features" className="text-white hover:text-gray-300">{t.features}</a>
        </nav>
        <div className="flex items-center space-x-4">
          <button onClick={onLanguageToggle} className="text-white hover:text-gray-300">
            <GlobeIcon />
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t.signUp}</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
