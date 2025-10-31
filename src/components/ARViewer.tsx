"use client";

import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// Helper function to load a script dynamically
const loadScript = (src: string) => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.type = "module";
    script.onload = () => resolve(true);
    script.onerror = () => {
      throw new Error(`Failed to load script ${src}`);
    };
    document.head.appendChild(script);
  });
};

const MODEL_VIEWER_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js";

// Helper function to get image dimensions from any URL
const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (err: string | Event) => {
      console.error("Error loading image for dimensions:", err);
      resolve({ width: 1, height: 1 });
    };
    img.src = url;
  });
};

interface ARViewerProps {
  paintingUrl: string;
  onClose: () => void;
}

export default function ARViewer({ paintingUrl, onClose }: ARViewerProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const [progress, setProgress] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const modelBlobUrlRef = useRef<string | null>(null);
  const modelViewerRef = useRef<HTMLElement>(null);
  const tutorialTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to load the model-viewer script
  useEffect(() => {
    setIsLoading(true);
    loadScript(MODEL_VIEWER_SCRIPT_URL)
      .then(() => {
        setIsScriptLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load AR component. Please try again.");
        setIsLoading(false);
      });
  }, []);

  // Effect to create the 3D model
  useEffect(() => {
    if (!isScriptLoaded || !paintingUrl) {
      if (isScriptLoaded && !paintingUrl) {
        setError("No painting URL provided.");
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    const createModel = async () => {
      try {
        setProgress(30);
        const { width, height } = await getImageDimensions(paintingUrl);
        const aspectRatio = height / width;

        setProgress(60);
        const planeWidth = 2.0;
        const planeHeight = planeWidth * aspectRatio;

        const scene = new THREE.Scene();
        const textureLoader = new THREE.TextureLoader();
        textureLoader.setCrossOrigin("Anonymous");

        const texture = await textureLoader.loadAsync(paintingUrl);
        texture.colorSpace = THREE.SRGBColorSpace;

        setProgress(80);
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(geometry, material);
        
        // Add slight rotation for better 3D effect
        plane.rotation.y = -0.3;
        plane.rotation.x = 0.1;
        
        scene.add(plane);

        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (gltf: ArrayBuffer | { [key: string]: unknown }) => {
            if (gltf instanceof ArrayBuffer) {
              const blob = new Blob([gltf], { type: "model/gltf-binary" });
              const url = URL.createObjectURL(blob);
              modelBlobUrlRef.current = url;
              setModelUrl(url);
              setProgress(100);

              // Auto-hide tutorial after 8 seconds
              tutorialTimeoutRef.current = setTimeout(() => {
                setShowTutorial(false);
              }, 8000);

              setTimeout(() => setIsLoading(false), 500);
            }
          },
          (error: ErrorEvent) => {
            console.error("An error happened during GLTF export:", error);
            setError("Could not generate 3D model.");
            setIsLoading(false);
          },
          { binary: true }
        );
      } catch (error) {
        console.error("Error creating model:", error);
        setError("Error loading painting texture.");
        setIsLoading(false);
      }
    };

    createModel();

    return () => {
      if (modelBlobUrlRef.current) {
        URL.revokeObjectURL(modelBlobUrlRef.current);
        modelBlobUrlRef.current = null;
      }
      setModelUrl(null);
      if (tutorialTimeoutRef.current) {
        clearTimeout(tutorialTimeoutRef.current);
      }
    };
  }, [paintingUrl, isScriptLoaded]);



  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div
        className="relative w-[95vw] h-[95vh] max-w-6xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden flex flex-col border border-slate-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
            AR Preview
          </h2>
          <button
            className="bg-slate-700/50 hover:bg-slate-600/50 text-white p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90 backdrop-blur-sm"
            onClick={onClose}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full h-full flex items-center justify-center relative p-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 text-white">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium mb-2">Preparing AR Experience</p>
                <p className="text-sm text-slate-400">Generating 3D model from your painting...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center gap-4 text-white text-center">
              <svg className="w-16 h-16 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium text-lg mb-2">Something went wrong</p>
                <p className="text-slate-300">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors duration-300"
              >
                Go Back
              </button>
            </div>
          )}

          {!isLoading && !error && modelUrl && isScriptLoaded && (
            <>
              {/* Tutorial Animation */}
              {showTutorial && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="bg-black/70 rounded-2xl p-6 max-w-md mx-4 backdrop-blur-sm border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="text-white font-semibold">How to Interact</h3>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-white text-sm">
                        <p>• Drag to rotate view</p>
                        <p>• Scroll to zoom in/out</p>
                        <p>• Click AR button to view in your space</p>
                      </div>
                      <div className="relative ml-4">
                        <div className="w-12 h-12 border-2 border-white/50 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-8 bg-white/20 rounded-sm relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-1 h-4 bg-white rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white transform -rotate-45 animate-pulse"></div>
                      </div>
                    </div>

                    {/* Warning Message */}
                    <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="text-red-200 text-sm">
                        <p className="font-medium">AR/VR Compatibility Notice</p>
                        <p className="mt-1">Your current hardware/camera may not support AR/VR capabilities. The AR feature works best on mobile devices with advanced camera sensors.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowTutorial(false)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg transition-colors duration-200 text-sm font-medium pointer-events-auto"
                    >
                      Got it!
                    </button>

                  </div>
                </div>
              )}

              {/* Model Viewer */}
              {React.createElement('model-viewer', {
                ref: (el: HTMLElement | null) => { modelViewerRef.current = el; },
                src: modelUrl,
                ar: true,
                'ar-modes': "webxr scene-viewer quick-look",

                'camera-controls': true,
                'auto-rotate': true,
                style: { 
                  width: "100%", 
                  height: "100%",
                  borderRadius: "12px"
                },
                alt: "3D model of the painting",
                exposure: "1.2",
                'shadow-intensity': "1",
                'environment-image': "neutral"
              }, React.createElement('button', {
                slot: "ar-button",
                style: {
                  backgroundColor: "#F4C430",
                  color: "black",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 28px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  transition: "all 0.3s ease",
                },
                onMouseOver: (e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#FFD700";
                  (e.target as HTMLButtonElement).style.transform = "translateX(-50%) scale(1.05)";
                },
                onMouseOut: (e: React.MouseEvent<HTMLButtonElement>) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#F4C430";
                  (e.target as HTMLButtonElement).style.transform = "translateX(-50%) scale(1)";
                }
              }, "View in Your Room (AR)"))}
                    

            </>
          )}
        </div>

        {/* Footer with Disclaimer */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-800/90 p-4 text-center backdrop-blur-sm border-t border-slate-700">
          <p className="text-white text-sm">
            The link for AR/VR view will be attached in social media posts so that users can open it to see how the painting would look like on the wall.
          </p>
        </div>
      </div>
    </div>
  );
}