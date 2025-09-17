// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState, Fragment } from 'react';
import HeroSection from '../components/HeroSection';
import DashboardSection from '../components/DashboardSection';
import FeaturesSection from '../components/FeaturesSection';
import { translations } from '../lib/translations';
import { Translation } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import SideNav from '../components/SideNav';


type Language = 'en' | 'hi';

// --- Main App Component ---
export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'hi' : 'en'));
  };

  const t = translations[language];

  return (
    <Fragment>
      <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} t={t} />
      <div className={`font-sans bg-black transition-all duration-300 ease-in-out ${isNavOpen ? 'md:ml-60' : 'ml-0'}`}>
        <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} onLanguageToggle={toggleLanguage} t={t} />
        <HeroSection t={t} />
        <DashboardSection t={t} />
        <FeaturesSection t={t} />
        <Footer t={t} />
      </div>
    </Fragment>
  );
}

