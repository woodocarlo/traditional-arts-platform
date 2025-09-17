"use client";

import React from 'react';

// --- Upload Icon Component ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// --- Upload Button Component ---
const UploadButton = ({ onClick, className = "", children, ...props }) => {
  return (
    <button 
      onClick={onClick}
      className={`bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-all duration-300 shadow-xl transform hover:scale-105 border-2 border-yellow-300 ${className}`}
      {...props}
    >
        <UploadIcon />
        <span className="text-lg">{children || "Upload Your Art"}</span>
    </button>
  );
};

// --- Upload Button Variants ---
export const SimpleUploadButton = ({ onClick, className = "", children }) => (
  <button 
    onClick={onClick}
    className={`bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all duration-300 shadow-lg transform hover:scale-105 ${className}`}
  >
    <UploadIcon />
    <span>{children || "Upload Your Art"}</span>
  </button>
);

export const MinimalUploadButton = ({ onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`bg-yellow-400/80 hover:bg-yellow-500/90 text-black font-medium py-2 px-6 rounded-lg flex items-center gap-2 transition-all duration-200 backdrop-blur-sm ${className}`}
  >
    <UploadIcon />
  </button>
);

export const FloatingUploadButton = ({ onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`fixed bottom-8 right-8 bg-yellow-500 hover:bg-yellow-600 text-black p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 z-50 ${className}`}
  >
    <UploadIcon />
  </button>
);

// --- Default Export ---
export default UploadButton;
