// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState, useEffect } from 'react';
import { Translation, Slide as SlideType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const RangoliBackground = () => {
    return (
        <div
            className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden"
            style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, transparent 100%)',
            }}
        >
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="rangoli" patternUnits="userSpaceOnUse" width="300" height="300" className="opacity-[0.01]">
                        <g transform="translate(150, 150)">
                            <g className="animate-[spin_45s_linear_infinite]">
                                {[...Array(8)].map((_, i) => (
                                    <path key={i} transform={`rotate(${i * 45})`} d="M 0 -120 C 50 -100, 50 -50, 0 -30 C -50 -50, -50 -100, 0 -120" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
                                ))}
                            </g>
                            <g className="animate-[spin_60s_linear_infinite_reverse]" transform="rotate(22.5)">
                                {[...Array(8)].map((_, i) => (
                                    <circle key={i} transform={`rotate(${i * 45}) translate(0, -75)`} cx="0" cy="0" r="10" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
                                ))}
                            </g>
                            <circle cx="0" cy="0" r="20" fill="none" stroke="#8B4513" strokeWidth="1.5"/>
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rangoli)" />
            </svg>
        </div>
    );
};

const ShineSweep = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-1/3 -left-1/4 h-[200%] w-[60%] rotate-12 bg-gradient-to-b from-white/10 via-white/2 to-transparent blur-2xl" style={{ animation: 'shine 8s ease-in-out infinite' }} />
  </div>
);

function Slide({ active, variant, children }: { active: boolean; variant: string; children: React.ReactNode }) {
  const variantGradient = (v: string) => {
    switch (v) {
      case 'crimson': return 'bg-gradient-to-br from-red-900/80 via-red-800/80 to-rose-900/80';
      case 'emerald': return 'bg-gradient-to-br from-emerald-900/80 via-green-800/80 to-teal-900/80';
      case 'violet': return 'bg-gradient-to-br from-purple-900/80 via-violet-800/80 to-indigo-900/80';
      case 'cyan': return 'bg-gradient-to-br from-cyan-900/80 via-sky-800/80 to-blue-900/80';
      case 'amber': return 'bg-gradient-to-br from-amber-900/80 via-orange-800/80 to-red-900/80';
      default: return 'bg-black/80';
    }
  };

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`absolute inset-0 ${variantGradient(variant)} backdrop-blur-sm`} />
      <ShineSweep />
      <div className="relative z-20 flex flex-col items-center justify-center text-center p-4 h-screen">
        {children}
      </div>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{` 
    @keyframes shine { 
      0% { transform: translateX(-120%) rotate(12deg); opacity: 0; } 
      15% { opacity: 0.3; } 
      50% { transform: translateX(40%) rotate(12deg); opacity: 0.2; } 
      85% { opacity: 0.25; } 
      100% { transform: translateX(160%) rotate(12deg); opacity: 0; } 
    } 
    @keyframes pulse { 
      50% { opacity: 0.5; } 
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(2rem); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

const HeroSection = ({ t }: { t: Translation }) => {
  const [current, setCurrent] = useState(0);
  const slides: SlideType[] = t.slides;
  
  const next = () => setCurrent(p => (p === slides.length - 1 ? 0 : p + 1));
  const prev = () => setCurrent(p => (p === 0 ? slides.length - 1 : p - 1));

  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-gradient-to-b from-black to-[#1a0303]">
      <GlobalStyles />
      <RangoliBackground />
      <div className="relative w-full h-full z-10">
        {slides.map((s, i) => (
          <Slide key={s.key} active={i === current} variant={s.variant}>
            {s.key === 'intro' ? (
              <div className="max-w-5xl mx-auto px-4">
                <h2 
                  className="text-6xl md:text-7xl lg:text-10xl font-black mb-2 leading-tight drop-shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: s.titleHtml }} 
                />
                <p className="max-w-3xl mx-auto text-xl md:text-2xl lg:text-3xl text-stone-200 mb-10 drop-shadow-lg leading-relaxed">
                  {s.punchline}
                </p>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="bg-white text-black font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl text-xl"
                >
                  Explore Now
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wider mb-2 drop-shadow-xl">
                  Kala<span style={{ color: '#F4C430' }}>सखी</span>
                </h1>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight text-white drop-shadow-2xl">
                  {s.name}
                </h2>
                <p className="max-w-3xl mx-auto text-xl md:text-2xl text-stone-200 drop-shadow-lg">
                  {s.punchline}
                </p>
              </div>
            )}
          </Slide>
        ))}
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
        <ChevronLeftIcon />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
        <ChevronRightIcon />
      </button>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)} 
            className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm ${i === current ? 'bg-white w-6' : 'bg-white/50'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;