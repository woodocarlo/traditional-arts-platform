"use client";

import React, { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import NextImage from 'next/image';

// Helper function to extract dominant color (simplified for example)
const getDominantColor = (imgSrc: string, fallbackColor: string = '#ffffff'): Promise<string> => {
    return new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Required for cross-origin image loading
        img.src = imgSrc;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(fallbackColor);
                return;
            }
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
            
            let r = 0, g = 0, b = 0;
            let count = 0;
            const step = 5 * 4; // Sample every 5th pixel to speed up

            for (let i = 0; i < imageData.length; i += step) {
                // Ignore transparent pixels (alpha < 128)
                if (imageData[i + 3] > 128) { 
                    r += imageData[i];
                    g += imageData[i + 1];
                    b += imageData[i + 2];
                    count++;
                }
            }

            if (count === 0) {
                resolve(fallbackColor);
                return;
            }

            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);

            resolve(`rgb(${r}, ${g}, ${b})`);
        };
        img.onerror = () => resolve(fallbackColor);
    });
};


interface FileObj {
  id: number;
  file: File;
  name: string;
  size: number;
  type: 'image' | 'video' | 'audio';
  preview: string | null; // For initial display of images
  src: string; // URL for video/audio or original image
  alt: string;
  height: number;
  // New properties for processed state and user interaction
  isProcessed: boolean;
  postCreationAsked: boolean;
  dominantColor?: string; // Storing dominant color for image background
  errorMessage?: string; // Error message for processing failures
  minPrice?: number; // New property for minimum price
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileObj[]) => void;
  onPromptCreatePost: (file: FileObj) => void; // New prop for post creation
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload, onPromptCreatePost }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [files, setFiles] = useState<FileObj[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [bgRemovedImages, setBgRemovedImages] = useState<Record<number, string>>({});
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Consider moving this to an environment variable in a real app
  const removeBgApiKey = "nRffN4sYDj28VMJpNtXuMopL"; 

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileObj[] = Array.from(fileList).map(file => {
      const id = Date.now() + Math.random();
      const type: 'image' | 'video' | 'audio' = file.type.startsWith('image/') ? 'image' : 
                                                file.type.startsWith('video/') ? 'video' : 'audio';
      
      return {
        id,
        file,
        name: file.name,
        size: file.size,
        type,
        preview: type === 'image' ? URL.createObjectURL(file) : null,
        src: URL.createObjectURL(file), // Used for original media preview, or if no bg removal
        alt: file.name.split('.')[0],
        height: Math.floor(Math.random() * 200) + 300, // Placeholder
        isProcessed: false,
        postCreationAsked: false,
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);

    // Process each new file
    newFiles.forEach(fileObj => {
      if (fileObj.type === 'image') {
        removeBackground(fileObj);
      } else {
        // For video/audio, mark as processed and ask for post creation immediately
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, isProcessed: true } : f));
      }
    });
  };

  const removeBackground = async (fileObj: FileObj) => {
    setProcessingIds(prev => new Set(prev).add(fileObj.id));
    setErrorIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileObj.id);
      return newSet;
    });

    try {
      const formData = new FormData();
      formData.append('image_file', fileObj.file);
      formData.append('size', 'auto');

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': removeBgApiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 413) {
          // Payload Too Large
          throw new Error('File too large');
        }
        throw new Error(`Remove.bg API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const bgRemovedUrl = URL.createObjectURL(blob);

      // Get dominant color from the *original* image for background gradient
      const dominantColor = await getDominantColor(fileObj.preview || fileObj.src);

      setBgRemovedImages(prev => ({ ...prev, [fileObj.id]: bgRemovedUrl }));
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, isProcessed: true, dominantColor } : f
      ));

    } catch (error) {
      console.error('Background removal failed:', error);
      setErrorIds(prev => new Set(prev).add(fileObj.id));
      setFiles(prev => prev.map(f =>
        f.id === fileObj.id ? { ...f, isProcessed: true, errorMessage: (error as Error).message === 'File too large' ? 'File too large' : 'Failed to process' } : f
      ));
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileObj.id);
        return newSet;
      });
    }
  };

  const removeFile = (id: number) => {
    setFiles(prev => prev.filter(file => file.id !== id));
    setBgRemovedImages(prev => {
      const newObj = { ...prev };
      if (newObj[id]) {
        URL.revokeObjectURL(newObj[id]);
        delete newObj[id];
      }
      return newObj;
    });
    setProcessingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setErrorIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Effect to SHOW THE PROMPT for post creation once a file is processed
  useEffect(() => {
    files.forEach(file => {
      // If file is processed but we haven't yet shown the prompt for it
      if (file.isProcessed && !file.postCreationAsked) {
        // Mark as "asked" to show the UI prompt and prevent this from running again
        setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, postCreationAsked: true } : f
        ));
        // DO NOT trigger the navigation here automatically.
      }
    });
  }, [files]); // Dependency array updated


  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(fileObj => {
        formData.append('file', fileObj.file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      onUpload(files);
      setFiles([]);
      // Clear background removed images and revoke URLs
      Object.values(bgRemovedImages).forEach(url => URL.revokeObjectURL(url));
      setBgRemovedImages({});
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      onClose(); // Close modal after successful upload
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto flex flex-row gap-6">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-6 border-b border-slate-700 mb-6">
            <h2 className="text-2xl font-bold text-white">Upload Your Artwork</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className="text-6xl">🎨</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Drop your files here, or click to browse</h3>
                <p className="text-slate-400">Supports images, videos, and audio files up to 50MB each</p>
              </div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Choose Files
              </button>
            </div>
          </div>

            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    {files.map(file => (
                        <div key={file.id} className="flex flex-col bg-slate-800 rounded-lg p-3">
                            {/* Top row for file info and remove button */}
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    {file.type === 'image' && file.preview && (
                                        <NextImage src={file.preview} alt="" width={40} height={40} className="w-10 h-10 object-cover rounded flex-shrink-0" unoptimized />
                                    )}
                                    {file.type === 'video' && (
                                        <video src={file.src} className="w-10 h-10 object-cover rounded flex-shrink-0" muted preload="metadata" />
                                    )}
                                    {file.type === 'audio' && (
                                        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded flex-shrink-0">🎵</div>
                                    )}
                                    <div className="overflow-hidden">
                                        <p className="text-white font-medium truncate">{file.name}</p>
                                        <p className="text-slate-400 text-sm">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            {/* Bottom row for Min Price input */}
                            <div className="w-full flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                                <label htmlFor={`minPrice-${file.id}`} className="text-slate-300 text-sm font-medium">
                                    Minimum Price:
                                </label>
                                <input
                                    id={`minPrice-${file.id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={file.minPrice ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setFiles(prevFiles => prevFiles.map(f => f.id === file.id ? { ...f, minPrice: value === '' ? undefined : parseFloat(value) } : f));
                                    }}
                                    className="w-24 rounded-md px-2 py-1 bg-slate-700 text-white border border-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}


          {files.length > 0 && (
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || files.some(file => file.minPrice === undefined || file.minPrice === null)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  uploading || files.some(file => file.minPrice === undefined || file.minPrice === null) ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                {uploading ? 'Uploading...' : files.some(file => file.minPrice === undefined || file.minPrice === null) ? 'Enter Minimum Prices' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>

        {/* Right side preview of processed files */}
        <div className="w-96 p-6 bg-slate-800 rounded-xl overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Processing & Preview</h3>
          {files.length === 0 && (
            <p className="text-slate-400">Upload files to see processing and creative previews here.</p>
          )}
          {files.map(file => (
            <div key={file.id} className="mb-6 border border-slate-700 rounded-lg p-3 relative">
              <p className="text-white font-medium mb-2 truncate">{file.name}</p>
              {processingIds.has(file.id) && (
                <div className="text-yellow-400 flex items-center justify-center p-4">
                    <svg className="animate-spin h-5 w-5 mr-3 text-yellow-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </div>
              )}
              {errorIds.has(file.id) && (
                <p className="text-red-400 p-4">{file.errorMessage || `Failed to process ${file.name}. Please try again.`}</p>
              )}

              {/* This condition now relies on 'postCreationAsked' being true to show the prompt */}
              {!processingIds.has(file.id) && !errorIds.has(file.id) && file.isProcessed && file.postCreationAsked && (
                <>
                  {/* Image with removed background and gradient */}
                  {file.type === 'image' && bgRemovedImages[file.id] && (
                    <div 
                        className="relative rounded-lg overflow-hidden flex items-center justify-center p-2"
                        style={{
                            minHeight: '200px',
                            backgroundImage: file.dominantColor 
                                ? `radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, ${file.dominantColor} 70%, ${file.dominantColor} 100%)`
                                : 'radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, #334155 70%, #334155 100%)',
                            filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))'
                        }}
                    >
                        <div className="absolute inset-0 z-0 opacity-10" style={{ background: `repeating-linear-gradient(45deg, ${file.dominantColor} 0%, transparent 1px, transparent 5px)`, clipPath: 'polygon(0% 0%, 10% 100%, 0% 100%)' }}></div>
                        <div className="absolute inset-0 z-0 opacity-10" style={{ background: `repeating-linear-gradient(-45deg, ${file.dominantColor} 0%, transparent 1px, transparent 5px)`, clipPath: 'polygon(100% 0%, 90% 100%, 100% 100%)' }}></div>
                        <img src={bgRemovedImages[file.id]} alt={`Background removed ${file.alt}`} className="relative z-10 max-w-[calc(100%-20px)] max-h-[180px] object-contain" />
                    </div>
                  )}

                  {/* Creative preview for Video/Audio */}
                  {file.type === 'video' && (
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-purple-700 to-indigo-900 p-4 shadow-xl">
                      <video src={file.src} controls className="w-full h-auto max-h-48 rounded opacity-90" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none"><span className="text-white text-4xl font-bold backdrop-blur-sm p-2 rounded-full">▶️</span></div>
                      <p className="text-sm text-center text-slate-300 mt-2">Video ready to be shared!</p>
                    </div>
                  )}
                  {file.type === 'audio' && (
                    <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-green-600 to-teal-800 p-4 shadow-xl flex flex-col items-center justify-center min-h-[150px]">
                      <div className="text-white text-6xl mb-3 animate-pulse">🎶</div>
                      <audio src={file.src} controls className="w-full mt-2" />
                      <p className="text-sm text-center text-slate-300 mt-2">Audio ready for its moment!</p>
                    </div>
                  )}

                  {/* "Create a Post?" Prompt */}
                  <div className="mt-4 text-center">
                    <p className="text-lg text-white mb-3">Looks great! Want to create a post with this?</p>
                    <button
                      onClick={() => onPromptCreatePost(file)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      Yes, Create Post
                    </button>
                    <button
                      onClick={() => {}}
                      className="ml-4 px-6 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      No, maybe later
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;