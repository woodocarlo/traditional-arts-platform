"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import allGuidesData from "../../../../public/assets/props.json";

// --- Icons for UI actions ---
const ExpandArrowIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Shuffle Loader ---
const SHUFFLE_MESSAGES = [
  "Curating inspiration...",
  "Focusing creativity...",
  "Composing visuals...",
  "Illuminating ideas...",
];

const ShuffleLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressValue = 0;
    const progressInterval = setInterval(() => {
      progressValue = Math.min(100, progressValue + 4);
      setProgress(progressValue);
    }, 100);

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % SHUFFLE_MESSAGES.length);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-black/60 to-purple-900/60 backdrop-blur-sm">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center w-96 shadow-2xl">
        <div className="h-1 w-full bg-white/10 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-lg font-medium text-white">{SHUFFLE_MESSAGES[messageIndex]}</p>
        <p className="text-sm text-gray-300 mt-2">Preparing your photography inspiration...</p>
      </div>
    </div>
  );
};

// --- Type Definitions ---
type Guide = {
  title: string;
  image_url: string;
  phara: string;
  props?: string[];
  lighting?: string;
  settings?: Record<string, any>;
};

// --- GuideCard Component ---
const GuideCard = ({ guide }: { guide: Guide }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const renderSettings = (settings: Record<string, any> | undefined) => {
    if (!settings) return null;
    return Object.entries(settings).map(([key, value]) => (
      <li key={key} className="text-sm bg-white/5 px-3 py-1.5 rounded-lg">
        <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span> {String(value)}
      </li>
    ));
  };

  return (
    <div className="relative bg-gray-900/80 rounded-xl overflow-hidden border border-white/10 transition-all duration-300 hover:shadow-lg hover:border-purple-400/50 flex flex-col">
      <div className="relative aspect-[4/3]">
        <img
          src={guide.image_url}
          alt={guide.title}
          className="w-full h-full object-contain bg-black transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white truncate">{guide.title}</h3>
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ExpandArrowIcon isOpen={isDetailsOpen} />
          </button>
        </div>
        <div className="relative">
          <p className="text-sm text-gray-300 mt-2">{guide.phara}</p>
          <div
            className={`transition-all duration-300 overflow-hidden ${
              isDetailsOpen ? "max-h-[500px] mt-4" : "max-h-0"
            }`}
          >
            <div className="space-y-4 text-gray-200">
              {guide.props && (
                <div>
                  <h3 className="font-medium text-purple-300 mb-2">Props</h3>
                  <p className="text-sm bg-white/5 p-4 rounded-lg">{guide.props.join(", ")}</p>
                </div>
              )}
              {guide.lighting && (
                <div>
                  <h3 className="font-medium text-purple-300 mb-2">Lighting</h3>
                  <p className="text-sm bg-white/5 p-4 rounded-lg">{guide.lighting}</p>
                </div>
              )}
              {guide.settings && (
                <div>
                  <h3 className="font-medium text-purple-300 mb-2">Camera Settings</h3>
                  <ul className="grid grid-cols-2 gap-2">{renderSettings(guide.settings)}</ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Photo Guidance Component ---
export default function PhotoGuidance() {
  const router = useRouter();
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayedGuides, setDisplayedGuides] = useState<Guide[]>([]);

  const allGuides: Guide[] = allGuidesData.flat();

  const shuffleGuides = useCallback(() => {
    setIsShuffling(true);

    const nextGuides = [...allGuides].sort(() => 0.5 - Math.random()).slice(0, 3);
    const preloadImages = nextGuides.map(
      (guide) =>
        new Promise((res) => {
          const img = new Image();
          img.src = guide.image_url;
          img.onload = res;
          img.onerror = res;
        })
    );

    const minLoadingPromise = new Promise((resolve) => setTimeout(resolve, 4000));

    Promise.all([...preloadImages, minLoadingPromise]).then(() => {
      setDisplayedGuides(nextGuides);
      setIsShuffling(false);
    });
  }, [allGuides]);

  useEffect(() => {
    shuffleGuides();
  }, []);

  return (
    <div className="min-h-screen text-white p-6 relative overflow-hidden">
      <button
        onClick={() => router.push('/AI_generation')}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <CloseIcon />
      </button>

      <div className="max-w-7xl mx-auto flex flex-col min-h-screen">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Photography Inspiration
          </h1>
          <p className="text-lg text-gray-300 mt-3 max-w-2xl mx-auto">
            Discover creative photography techniques and click the arrow to view detailed guidance.
          </p>
        </header>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-6xl">
            {isShuffling && <ShuffleLoader />}
            {displayedGuides.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {displayedGuides.map((guide, index) => (
                  <GuideCard key={index} guide={guide} />
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="text-center mt-12">
          <button
            onClick={shuffleGuides}
            disabled={isShuffling}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isShuffling ? "Curating..." : "Discover New Ideas ✨"}
          </button>
        </footer>
      </div>
    </div>
  );
}