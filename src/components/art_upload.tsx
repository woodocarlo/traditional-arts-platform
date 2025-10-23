"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import Header from './Header';
// import UploadModal from './UploadModal';

interface SideNavProps {
  isOpen: boolean;
  onClose: () => void;
  t: { features: string; instructions: string; prototypeNotes: string };
}

const SideNav: React.FC<SideNavProps> = ({ isOpen, onClose, t }) => (
    <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-50`}>
        <div className="p-4">
            <button onClick={onClose} className="text-2xl mb-4">&times;</button>
            <nav>
                <a href="#" className="block py-2 px-4">{t.features}</a>
                <a href="#" className="block py-2 px-4">{t.instructions}</a>
                <a href="#" className="block py-2 px-4">{t.prototypeNotes}</a>
            </nav>
        </div>
    </div>
);


// --- Background Image Data ---
const overlayImages = [
  'https://i.postimg.cc/9QJn5ZVB/Add-a-little-bit-of-body-text.png', // Elephant
  'https://i.postimg.cc/cLsbbXqH/Add-a-little-bit-of-body-text-1.png'  // Peacock
];

const imagePlacements = [
  // Repositioned to avoid overlap
  { top: '-5%', left: '5%', rotate: 10, scale: 1.0 }, { top: '2%', left: '85%', rotate: -15, scale: 0.9 },
  { top: '10%', left: '45%', rotate: 5, scale: 0.8 }, { top: '20%', left: '20%', rotate: -10, scale: 1.1 },
  { top: '25%', left: '70%', rotate: 15, scale: 1.0 }, { top: '45%', left: '5%', rotate: 20, scale: 1.2 },
  { top: '50%', left: '90%', rotate: -5, scale: 0.95 }, { top: '48%', left: '50%', rotate: -2, scale: 0.85 },
  { top: '65%', left: '30%', rotate: -20, scale: 1.0 }, { top: '70%', left: '75%', rotate: 25, scale: 1.1 },
  { top: '85%', left: '10%', rotate: 8, scale: 0.9 }, { top: '92%', left: '60%', rotate: -12, scale: 1.2 },
  { top: '95%', left: '35%', rotate: 18, scale: 1.0 }, { top: '90%', left: '90%', rotate: -8, scale: 0.8 },
];

// --- Reusable Background Component ---
const RoyalBackground = () => (
  <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
    {imagePlacements.map((style, index) => (
      <Image
        key={index}
        src={overlayImages[index % overlayImages.length]}
        alt="Decorative background pattern"
        width={256}
        height={256}
        className={`absolute mix-blend-luminosity opacity-60 ${
          index % 2 === 0 ? 'w-36 md:w-48' : 'w-56 md:w-72'
        }`}
        style={{
          top: style.top, left: style.left,
          transform: `rotate(${style.rotate}deg) scale(${style.scale})`,
        }}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src="https://placehold.co/256x256/054B09/FFFFFF?text=Image"
        }}
      />
    ))}
  </div>
);

// --- Icon Components ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

import { translations } from '../lib/translations';

// Sample gallery items
const galleryItems = [
    { id: 1, src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto-format&fit=crop', alt: 'Madhubani Painting', height: 400 },
    { id: 2, src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&auto-format&fit=crop', alt: 'Warli Art', height: 300 },
    { id: 3, src: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=800&auto-format&fit=crop', alt: 'Pattachitra', height: 500 },
    { id: 4, src: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=800&auto-format&fit=crop', alt: 'Tanjore Painting', height: 350 },
    { id: 5, src: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto-format&fit=crop', alt: 'Blue Pottery', height: 450 },
    { id: 6, src: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?q=80&w=800&auto-format&fit=crop', alt: 'Kalamkari', height: 320 },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState('photos');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const t = translations[language as 'en' | 'hi'];

  const tabs = [
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'stories', label: 'Stories' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Khand:wght@700&display=swap');
        .font-khand { font-family: 'Khand', sans-serif; }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#054b09] to-[#033d07] text-white relative">
        <RoyalBackground />
        <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} t={t} />
        
        <div className="fixed top-0 left-0 w-full z-40">
           <Header onMenuClick={() => setIsNavOpen(!isNavOpen)} onLanguageToggle={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')} t={t} />
        </div>
        
        <div className="relative z-10 pt-20"> {/* Padding to clear fixed header */}
          <Image
              src='https://i.postimg.cc/cLsbbXqH/Add-a-little-bit-of-body-text-1.png'
              alt="Peacock decoration"
              width={224}
              height={224}
              className="absolute top-52 left-4 md:left-12 lg:left-24 w-40 md:w-56 transform -rotate-12 opacity-80 hidden sm:block pointer-events-none"
          />
          
          <div className="text-center pt-16 pb-8 px-4">
              <h1 className="font-khand text-6xl md:text-8xl text-white drop-shadow-lg tracking-wide">
                  Your Art Sanctuary
              </h1>
          </div>

          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="my-4">
                    <button onClick={() => setIsUploadOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <UploadIcon />
                        <span>Upload Your Art</span>
                    </button>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-2 rounded-full flex flex-wrap justify-center gap-2">
                    {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-full font-medium transition-all duration-300 text-sm md:text-base ${
                        activeTab === tab.id ? 'bg-[#F4C430] text-black shadow-lg' : 'text-white hover:bg-slate-700/50'
                        }`}
                    >
                        {tab.label}
                    </button>
                    ))}
                </div>
            </div>

            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-24">
              {galleryItems.map(item => (
                <div key={item.id} className="break-inside-avoid mb-4">
                  <div className="bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <Image src={item.src} alt={item.alt} width={400} height={item.height} className="w-full h-auto object-cover"
                      onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://placehold.co/400x300/1E293B/FFFFFF?text=Art';
                      }}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white">{item.alt}</h3>
                      <p className="text-slate-400 text-sm">Traditional Indian Art</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} /> */}
    </>
  );
}