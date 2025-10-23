"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import SideNav from '../../components/SideNav';
import UploadModal from '../../components/UploadModal';
import UploadButton from './upload';
import { useInstructions } from '@/contexts/InstructionsContext';
import ARViewer from '../../components/ARViewer'; // <-- IMPORT THE NEW AR COMPONENT

// Type definitions
interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  // accept the common known types but allow any string to accommodate runtime data
  type?: 'image' | 'video' | 'audio' | string;
  posts: number;
  purchases: number;
  date: string;
  timestamp?: number;
  isUserUpload?: boolean;
  name?: string;
  minPrice?: number;
}

interface UploadedFile {
  file: File;
  name: string;
  type: string;
  size: number;
  minPrice?: number;
  id: number;
  preview?: string | null;
  src: string;
  alt: string;
  height: number;
  isProcessed: boolean;
  postCreationAsked: boolean;
  dominantColor?: string;
  errorMessage?: string;
}

import { translations } from '../../lib/translations';

// --- Background Image Data (Using Public Assets) ---
const overlayImages = [
  '/assets/backgrounds/elephant.png',
  '/assets/backgrounds/peacock.png'
];

const imagePlacements = [
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
        alt=""
        width={256}
        height={256}
        className={`absolute mix-blend-luminosity opacity-60 ${
          index % 2 === 0 ? 'w-36 md:w-48' : 'w-56 md:w-72'
        }`}
        style={{
          top: style.top, 
          left: style.left,
          transform: `rotate(${style.rotate}deg) scale(${style.scale})`,
        }}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.currentTarget;
          target.src = "https://placehold.co/256x256/054B09/FFFFFF?text=Image";
        }}
      />
    ))}
  </div>
);

// --- Back Icon Component ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);



// Sample gallery items
const galleryItems: GalleryItem[] = [
    { id: 1, src: 'https://i.postimg.cc/CLjf6gpY/image.png', alt: 'Madhubani Painting', type: 'image', posts: 12, purchases: 5, date: '2023-10-15' },
    { id: 2, src: 'https://i.postimg.cc/Bn6wBNRc/image.png', alt: 'Warli Art', type: 'image', posts: 8, purchases: 3, date: '2023-09-22' },
    { id: 3, src: 'https://i.postimg.cc/Tw7KgdbV/image.png', alt: 'Pattachitra', type: 'image', posts: 15, purchases: 7, date: '2023-11-05' },
    { id: 4, src: 'https://i.postimg.cc/2yS4N9QJ/image.png', alt: 'Tanjore Painting', type: 'image', posts: 6, purchases: 2, date: '2023-08-30' },
    { id: 5, src: 'https://i.postimg.cc/Lsk4BHcV/719Lgc-Xp4-L-SY879.jpg', alt: 'Blue Pottery', type: 'image', posts: 9, purchases: 4, date: '2025-09-28' },
    { id: 6, src: 'https://i.postimg.cc/zvZ9dWTr/image.png', alt: 'Home Decor', type: 'image', posts: 11, purchases: 6, date: '2023-09-15' },
    { id: 7, src: 'https://www.w3schools.com/html/mov_bbb.mp4', alt: 'Traditional Dance', type: 'video', posts: 5, purchases: 2, date: '2023-09-10' },
    { id: 8, src: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', alt: 'Temple Bells', type: 'audio', posts: 3, purchases: 1, date: '2023-08-25' },
];

// Enhanced Image Modal Component
const ImageModal = ({ item, isOpen, onClose }: { item: GalleryItem | null, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen || !item) return null;
  
  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <button 
          className="absolute top-6 right-6 z-10 bg-black/80 hover:bg-black text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            {item.type === 'image' || !item.type ? (
              <Image 
                src={item.src} 
                alt={item.alt} 
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            ) : item.type === 'video' ? (
              <video
                src={item.src}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <div className="flex items-center justify-center p-8 bg-slate-800/90 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <audio src={item.src} controls className="w-full min-w-[300px]" />
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-t from-black/90 to-transparent p-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4 text-white">{item.alt}</h3>
              <div className="flex justify-between items-center text-lg text-slate-300">
                <div className="flex gap-8">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                      <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <strong>{item.posts}</strong> Posts
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    <strong>{item.purchases}</strong> Purchases
                  </span>
                </div>
                <span className="text-slate-400">Uploaded: {item.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('photos');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [arItem, setArItem] = useState<GalleryItem | null>(null); // <-- ADD AR ITEM STATE
  const { setInstructions } = useInstructions();

  const t = translations[language];

  useEffect(() => {
    setInstructions(
      <>
        <h2 className="text-xl font-bold text-gray-100">Gallery Instructions</h2>
        <ul className="space-y-2 list-disc list-inside text-gray-300">
          <li>
            <p className="text-gray-300">
              The Art Gallery is your personal sanctuary for managing and promoting your masterpieces.
            </p>
          </li>
          <li>
            <p>
              <strong>Comprehensive Media Upload:</strong> Upload your artwork photos, videos, or even audio recordings of your legacy story (which can be used for future podcast generation).
            </p>
          </li>
          <li>
            <p>
              <strong>View in AR:</strong> Click the "View in AR" button on any photo to see it on your wall using your phone's camera!
            </p>
          </li>
          <li>
            <p>
            <strong>Instant Post Creation Prompt:</strong> Upon image upload, you&apos;ll be prompted with the option to immediately create a social media post for that artwork.
          </p>
          </li>
          <li>
            <p>
              <strong>Smart Price Optimization Input:</strong> Define a minimum acceptable selling price for your crafts; our AI will then intelligently optimize the pricing to maximize sales while ensuring your profitability.
            </p>
          </li>
        </ul>
      </>
    );
  }, [setInstructions]);

  // Load uploaded files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('galleryUploadedFiles');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setUploadedFiles(parsedFiles);
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
  }, []);

  // Save uploaded files to localStorage whenever uploadedFiles changes
  useEffect(() => {
    if (uploadedFiles.length >= 0) {
      localStorage.setItem('galleryUploadedFiles', JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles]);

  // Handle new file uploads - add to top
  const handleFileUpload = useCallback((files: UploadedFile[]) => {
    const processFiles = async () => {
      const processedFiles = await Promise.all(
        files.map(async (file, index) => {
          return new Promise<GalleryItem>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target && e.target.result) {
                const timestamp = Date.now() + index; // Ensure unique timestamps
                resolve({
                  id: timestamp,
                  src: e.target.result as string,
                  alt: file.name,
                  name: file.name,
                  type: file.type.startsWith('image/') ? 'image' :
                         file.type.startsWith('video/') ? 'video' :
                         file.type.startsWith('audio/') ? 'audio' : undefined,
                  timestamp: timestamp,
                  date: new Date().toISOString().split('T')[0],
                  posts: 0,
                  purchases: 0,
                  isUserUpload: true,
                  minPrice: file.minPrice,
                });
              }
            };
            reader.readAsDataURL(file.file);
          });
        })
      );

      // Add new files to the beginning of the array
      setUploadedFiles(prev => [...processedFiles, ...prev]);
      setIsUploadOpen(false);
    };

    processFiles();
  }, []);

  // Handle delete
  const handleDelete = useCallback((item: GalleryItem) => {
    // NOTE: As per instructions, window.confirm() is not allowed.
    // Implement a custom confirmation modal here if desired.
    // For now, deleting directly.
    if (item.isUserUpload) {
      setUploadedFiles(prev => prev.filter(file => file.timestamp !== item.timestamp));
    }
  }, []);

  // Handle create post
  const handleCreatePost = useCallback((item: GalleryItem) => {
    console.log('Navigating to AI generation for:', item);
    router.push('/AI_generation');
  }, [router]);

  // Handle prompt create post from UploadModal
  const handlePromptCreatePost = useCallback((file: Partial<GalleryItem> & { id?: number; name?: string; minPrice?: number; src?: string; alt?: string; type?: string }) => {
    try {
      console.log('Directly creating post for:', file);
      // Convert FileObj to GalleryItem format for handleCreatePost
      const galleryItem: GalleryItem = {
        id: file.id ?? Date.now(),
        src: file.src ?? '',
        alt: file.alt ?? file.name ?? 'Uploaded Art',
        type: (file.type as GalleryItem['type']) ?? undefined,
        posts: 0,
        purchases: 0,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        isUserUpload: true,
        name: file.name,
        minPrice: file.minPrice,
      };
      handleCreatePost(galleryItem);
    } catch (error)
 {
      console.error('Error in handlePromptCreatePost:', error);
    }
  }, [handleCreatePost]);

  // Combine uploaded files first, then original gallery items
  const allGalleryItems = [...uploadedFiles, ...galleryItems];

  // Filter items based on active tab
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'photos':
        return allGalleryItems.filter(item => 
          item.type === 'image' || !item.type
        );
      case 'videos':
        return allGalleryItems.filter(item => 
          item.type === 'video'
        );
      case 'stories': // Audio files
        return allGalleryItems.filter(item => 
          item.type === 'audio'
        );
      default:
        return allGalleryItems;
    }
  };

  const filteredItems = getFilteredItems();

  const tabs = [
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
    { id: 'stories', label: 'Audio' },
  ];

  const handleImageClick = useCallback((item: GalleryItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Khand:wght@700&display=swap');
        .font-khand { font-family: 'Khand', sans-serif; }
        
        .gallery-item {
          break-inside: avoid;
          margin-bottom: 1rem;
          position: relative;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .gallery-item:hover {
          transform: scale(1.02);
        }
        
        .gallery-item-content {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          position: relative;
        }
        
        .gallery-item-img-container {
          position: relative;
          width: 100%;
          overflow: hidden;
        }
        
        .gallery-item-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }
        
        .gallery-item-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          opacity: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          text-align: center;
          transition: opacity 0.3s ease;
        }
        
        .gallery-item:hover .gallery-item-overlay {
          opacity: 1;
        }
        
        /* Responsive overlay layouts based on container aspect ratio */
        .overlay-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        
        /* For tall/portrait images */
        .gallery-item-img-container[data-aspect="portrait"] .overlay-content {
          padding: 2rem 1rem;
        }
        
        .gallery-item-img-container[data-aspect="portrait"] .overlay-content h3 {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }
        
        .gallery-item-img-container[data-aspect="portrait"] .overlay-stats {
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .gallery-item-img-container[data-aspect="portrait"] .overlay-actions {
          flex-direction: column;
          width: 100%;
        }
        
        .gallery-item-img-container[data-aspect="portrait"] .action-btn {
          width: 100%;
          justify-content: center;
        }
        
        /* For wide/landscape images */
        .gallery-item-img-container[data-aspect="landscape"] .overlay-content {
          padding: 1rem 2rem;
        }
        
        .gallery-item-img-container[data-aspect="landscape"] .overlay-content h3 {
          font-size: 1.4rem;
          margin-bottom: 0.8rem;
        }
        
        .gallery-item-img-container[data-aspect="landscape"] .overlay-stats {
          flex-direction: row;
          justify-content: space-around;
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .gallery-item-img-container[data-aspect="landscape"] .overlay-actions {
          flex-direction: row;
          gap: 1rem;
        }
        
        /* For square images - default */
        .overlay-content h3 {
          font-size: 1.3rem;
          font-weight: bold;
          margin-bottom: 1rem;
          color: white;
          line-height: 1.2;
        }
        
        .overlay-stats {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin-bottom: 1.5rem;
          color: #F4C430;
          font-weight: 600;
          font-size: 1rem;
        }
        
        .overlay-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .action-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
        }
        
        .btn-primary {
          background: #F4C430;
          color: #1a202c;
        }
        
        .btn-primary:hover {
          background: #E6B800;
          transform: translateY(-2px);
        }

        /* --- NEW AR BUTTON STYLE --- */
        .btn-secondary {
          background: #059669; /* A green color */
          color: white;
        }
        
        .btn-secondary:hover {
          background: #047857;
          transform: translateY(-2px);
        }
        /* --- END NEW STYLE --- */

        .btn-danger {
          background: #e53e3e;
          color: white;
        }
        
        .btn-danger:hover {
          background: #c53030;
          transform: translateY(-2px);
        }
        
        /* Audio and video specific styling */
        .audio-item .overlay-content {
          background: linear-gradient(135deg, rgba(244, 196, 48, 0.2), rgba(15, 23, 42, 0.9));
        }
        
        .video-item .overlay-content {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(15, 23, 42, 0.9));
        }
        
        .gallery-grid {
          column-count: 1;
          column-gap: 1rem;
        }
        
        @media (min-width: 640px) {
          .gallery-grid {
            column-count: 2;
          }
        }
        
        @media (min-width: 768px) {
          .gallery-grid {
            column-count: 3;
          }
        }
        
        @media (min-width: 1024px) {
          .gallery-grid {
            column-count: 4;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-[#042f2e] via-[#054b09] to-[#033d07] text-white relative">
        <RoyalBackground />
        
        <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} t={t} />
        
        <div className="fixed top-0 left-0 w-full z-50">
          <Header 
            onMenuClick={() => setIsNavOpen(!isNavOpen)} 
            onLanguageToggle={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')} 
            t={t} 
          />
        </div>

        <div className="fixed top-20 left-4 z-40">
          <Link href="/" className="flex items-center justify-center bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 border border-slate-600/50 hover:border-slate-400/50 shadow-lg">
            <BackIcon />
          </Link>
        </div>
        
        <div className="relative z-10 pt-20">
          <Image
              src='/assets/backgrounds/peacock.png'
              alt=""
              width={320}
              height={320}
              className="absolute top-40 left-4 md:left-12 lg:left-20 w-56 md:w-72 lg:w-80 transform -rotate-12 opacity-70 hidden sm:block pointer-events-none z-5"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget;
                target.src = 'https://i.postimg.cc/cLsbbXqH/Add-a-little-bit-of-body-text-1.png';
              }}
          />
          
          <div className="text-center pt-16 pb-8 px-4 relative z-10">
              <h1 className="font-khand text-6xl md:text-8xl text-white drop-shadow-lg tracking-wide">
                  Your Art Sanctuary
              </h1>
          </div>

          <div className="container mx-auto px-4 py-6 relative z-10">
            <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="my-4">
                    <UploadButton onClick={() => setIsUploadOpen(true)}>
                      Share Your Masterpiece
                    </UploadButton>
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

            <div className="gallery-grid pb-24">
              {filteredItems.map(item => {
                // Determine aspect ratio for responsive overlay
                const getAspectRatio = (item: GalleryItem) => {
                  if (item.type === 'audio') return 'square';
                  // For now, we'll use a simple approach - you could enhance this by loading image dimensions
                  const id = item.id || 0;
                  if (id % 3 === 0) return 'portrait';
                  if (id % 3 === 1) return 'landscape';
                  return 'square';
                };

                const aspectRatio = getAspectRatio(item);

                return (
                  <div 
                    key={`${item.id}-${item.timestamp || ''}`} 
                    className={`gallery-item ${item.type === 'audio' ? 'audio-item' : ''} ${item.type === 'video' ? 'video-item' : ''}`}
                  >
                    <div className="gallery-item-content">
                      <div 
                        className="gallery-item-img-container" 
                        data-aspect={aspectRatio}
                      >
                        <div onClick={() => (item.type !== 'audio' ? handleImageClick(item) : null)}>
                          {item.type === 'image' || !item.type ? (
                            <Image 
                              src={item.src} 
                              alt={item.alt} 
                              width={400}
                              height={300}
                              className="gallery-item-img"
                              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                const target = e.currentTarget;
                                target.src = 'https://placehold.co/400x300/1E293B/FFFFFF?text=Art';
                              }}
                            />
                          ) : item.type === 'video' ? (
                            <video
                              src={item.src}
                              className="gallery-item-img"
                              poster="https://placehold.co/400x300/1E293B/FFFFFF?text=Video"
                            />
                          ) : (
                            <div className="flex items-center justify-center p-8 h-48 bg-gradient-to-br from-slate-700 to-slate-900">
                              <div className="text-center">
                                <div className="text-6xl mb-4">🎵</div>
                                <p className="text-white text-sm">Audio File</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Responsive Hover Overlay */}
                        <div className="gallery-item-overlay">
                          <div className="overlay-content">
                            <h3>{item.alt}</h3>
                            <div className="overlay-stats">
                              <div>
                                G<strong>{item.posts}</strong>
                                <div className="text-sm">Posts</div>
                              </div>
                              <div>
                                <strong>{item.purchases}</strong>
                                <div className="text-sm">Sales</div>
                              </div>
                            </div>
                            <div className="text-xs mb-4 text-gray-300">
                              {item.date}
                            </div>
                            <div className="overlay-actions">
                              <button 
                                className="action-btn btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreatePost(item);
                                }}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Create Post
                              </button>

                              {/* --- ADD AR BUTTON --- */}
                              {(item.type === 'image' || !item.type) && (
                                <button
                                  className="action-btn btn-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setArItem(item);
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </svg>
                                  View in AR
                                </button>
                              )}
                              {/* --- END AR BUTTON --- */}

                              {item.isUserUpload && (
                                <button 
                                  className="action-btn btn-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Bypassing window.confirm per instructions
                                    // You should add a custom modal here
                                    handleDelete(item);
                                  }}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-white truncate">{item.alt}</h3>
                        <p className="text-slate-400 text-xs">
                          {item.isUserUpload ? 'Your Upload' : 
                            item.type === 'video' ? 'Video Content' :
                            item.type === 'audio' ? 'Audio Content' : 'Traditional Indian Art'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Show message when no items match the filter */}
            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-50">
                  {activeTab === 'photos' ? '🖼️' : activeTab === 'videos' ? '🎥' : '🎵'}
                </div>
                <h3 className="text-xl font-semibold mb-2">No {activeTab} found</h3>
                <p className="text-slate-400">Upload some {activeTab} to see them here!</p>
              </div>
            )}
          </div>
        </div>

        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)}
          onUpload={handleFileUpload}
          onPromptCreatePost={handlePromptCreatePost}
        />
        
        <ImageModal 
          item={selectedItem} 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
        />

        {/* --- ADD AR MODAL RENDER --- */}
        {arItem && (
          <ARViewer 
            paintingUrl={arItem.src}
            onClose={() => setArItem(null)}
          />
        )}
        {/* --- END AR MODAL RENDER --- */}

      </div>
    </>
  );
}
