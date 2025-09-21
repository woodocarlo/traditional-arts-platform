// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState, Fragment, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import DashboardSection from '../components/DashboardSection';
import FeaturesSection from '../components/FeaturesSection';
import { translations } from '../lib/translations';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import SideNav from '../components/SideNav';
import { useInstructions } from '@/contexts/InstructionsContext';

type Language = 'en' | 'hi';

// --- Main App Component ---
export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showPopup, setShowPopup] = useState(false);
  const { setInstructions, setShowInstructions } = useInstructions();

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'hi' : 'en'));
  };

  const t = translations[language];

  // Effect to set instructions and show the pop-up on page load
  useEffect(() => {
    setInstructions(
      <>
        <h2 className="text-xl font-bold text-gray-100">Prototype Instructions</h2>
        <p className="text-gray-300">
          Welcome to KalaSakhi! This platform helps traditional artists digitize and promote their work.
        </p>
        <ul className="space-y-2 list-disc list-inside text-gray-300">
          <li>
            The <strong>Insight Dashboard</strong> is coded statically for Prototype 1.
          </li>
          <li>
            The <strong>Auto-Pilot</strong> and <strong>Growth Wallet</strong> buttons are not currently working.
          </li>
          <li>
            The <strong>Art Gallery</strong> Allows you to upload your media files and set a minimum price for it, you can also directly post them from here.
          </li>
          <li>
            The <strong>Creative Arena</strong> consists of the working features available in the platform.
          </li>
        </ul>
      </>
    );
    setShowPopup(true);

    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 5000); // Popup appears for 5 seconds

    return () => clearTimeout(timer); // Clean up the timer
  }, [setInstructions, setShowInstructions]);

  return (
    <Fragment>
      <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} t={t} />
      <div className={`font-sans bg-black transition-all duration-300 ease-in-out ${isNavOpen ? 'md:ml-60' : 'ml-0'}`}>
        <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} onLanguageToggle={toggleLanguage} t={t} />
        
        {/* Pop-up for instructions */}
        {showPopup && (
          <div
            className="fixed top-20 right-4 md:right-10 z-50 p-4 bg-gray-800 text-white rounded-lg shadow-lg animate-fade-in-down cursor-pointer"
            onClick={() => {
              setShowInstructions(true);
              setShowPopup(false);
            }}
          >
            Click here to open prototype instructions ↗
          </div>
        )}
        
        <HeroSection t={t} />
        <DashboardSection t={t} />
        <FeaturesSection t={t} />
        <Footer t={t} />
      </div>
    </Fragment>
  );
}