// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React from 'react';
import Link from 'next/link';
import { Translation } from '../types';
import { BrushIcon, ImageIcon, GrowthIcon, VideoCameraIcon } from './icons';

const FeaturesSection = ({ t }: { t: Translation }) => {
  return (
    <section id="features" className="py-20 bg-[#4D080F] relative overflow-hidden">
      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            {t.featuresTitle}
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
            {t.featuresSubtitle}
          </p>
        </div>  

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          
          {/* Creative Arena Card - WITH NAVIGATION */}
          <Link href="/AI_generation" passHref>
            <div className="relative group bg-gradient-to-br from-purple-900/80 to-indigo-900/80 p-6 rounded-2xl backdrop-blur-sm border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 shadow-2xl cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=400&auto-format&fit=crop"
                onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.onerror = null; img.src = 'https://placehold.co/400x300/1E293B/FFFFFF?text=Art'; }}
                alt="Abstract art background"
                className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300"
              />
              <div className="relative z-10">
                <BrushIcon />
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                  Creative Arena
                </h3>
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                  {t.creativeStudioDesc}
                </p>
                <div className="mt-4 flex items-center text-purple-400">
                  <span className="text-sm font-medium">Launch Your Studio</span>
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Artwork Gallery Card - WITH NAVIGATION */}
          <Link href="/gallery" passHref>
            <div className="relative group bg-gradient-to-br from-green-900/80 to-emerald-900/80 p-6 rounded-2xl backdrop-blur-sm border border-green-700/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105 shadow-2xl cursor-pointer">
              <img 
                src="https://i.postimg.cc/T3hXbZ5X/image.png"
                onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.onerror = null; img.src = 'https://placehold.co/400x300/1E293B/FFFFFF?text=Gallery'; }}
                alt="Art gallery background" 
                className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" 
              />
              <div className="relative z-10">
                <ImageIcon />
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                  {t.artworkGallery}
                </h3>
                <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                  {t.artworkGalleryDesc}
                </p>
                <div className="mt-4 flex items-center text-green-400">
                  <span className="text-sm font-medium">View Gallery</span>
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Growth Wallet Card */}
          <div className="relative group bg-gradient-to-br from-orange-900/80 to-red-900/80 p-6 rounded-2xl backdrop-blur-sm border border-orange-700/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=400&auto-format&fit=crop"
              onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.onerror = null; img.src = 'https://placehold.co/400x300/1E293B/FFFFFF?text=Growth'; }}
              alt="Abstract growth chart background" 
              className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" 
            />
            <div className="relative z-10">
              <GrowthIcon />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors">
                {t.growthWallet}
              </h3>
              <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                {t.growthWalletDesc}
              </p>
            </div>
          </div>

          {/* Host Workshop Card */}
          <div className="relative group bg-gradient-to-br from-amber-900/80 to-yellow-900/80 p-6 rounded-2xl backdrop-blur-sm border border-amber-700/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&auto-format&fit=crop"
              onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.onerror = null; img.src = 'https://placehold.co/400x300/1E293B/FFFFFF?text=Event'; }}
              alt="Audience at an event background" 
              className="absolute inset-0 h-full w-full object-cover opacity-20 group-hover:opacity-35 transition-opacity duration-300" 
            />
            <div className="relative z-10">
              <VideoCameraIcon />
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">
                {t.hostWorkshop}
              </h3>
              <p className="text-slate-300 group-hover:text-slate-200 transition-colors">
                {t.hostWorkshopDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
