"use client";

import React, { useEffect, useState, useRef } from "react";
// We will dynamically load the model-viewer script to ensure it's available.
// import "https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js"; // Removed for dynamic loading
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";



// Helper function to load a script dynamically
const loadScript = (src: string) => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.type = "module"; // model-viewer is a module
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};

const MODEL_VIEWER_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/@google/model-viewer/dist/model-viewer.min.js";

// Helper function to get image dimensions from any URL
const getImageDimensions = (
  url: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Allow cross-origin images (like from postimg.cc)
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (err) => {
      console.error("Error loading image for dimensions:", err);
      // Fallback to a square if it fails
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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // New state to track script loading

  // Keep track of the blob URL to revoke it on cleanup
  const modelBlobUrlRef = useRef<string | null>(null);

  // Effect to load the model-viewer script
  useEffect(() => {
    setIsLoading(true);
    loadScript(MODEL_VIEWER_SCRIPT_URL)
      .then(() => {
        setIsScriptLoaded(true);
        // Note: We don't stop loading here, we wait for the model generation effect
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load AR component. Please try again.");
        setIsLoading(false);
      });
  }, []); // Runs once on mount

  // Effect to create the 3D model
  useEffect(() => {
    // Wait for the script to be loaded and paintingUrl to be present
    if (!isScriptLoaded || !paintingUrl) {
      if (isScriptLoaded && !paintingUrl) {
        setError("No painting URL provided.");
        setIsLoading(false);
      }
      // If script isn't loaded yet, do nothing and wait.
      // The loading state is still true from the first effect.
      return;
    }

    setIsLoading(true);
    setError(null);

    const createModel = async () => {
      try {
        // 1. Get image dimensions from the URL (works for data: and https:)
        const { width, height } = await getImageDimensions(paintingUrl);
        const aspectRatio = height / width;

        // Define a standard width (e.g., 1 meter)
        // You could pass real dimensions here as props if you have them
        const planeWidth = 1.0;
        const planeHeight = planeWidth * aspectRatio;

        // 2. Create a Three.js scene
        const scene = new THREE.Scene();

        // 3. Load the painting as a texture
        const textureLoader = new THREE.TextureLoader();
        // Enable cross-origin loading for external URLs
        textureLoader.setCrossOrigin("Anonymous");

        const texture = await textureLoader.loadAsync(paintingUrl);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false; // Important for GLB export

        // 4. Create a flat plane with the painting texture
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // 5. Export the scene to GLB format
        const exporter = new GLTFExporter();
        exporter.parse(
          scene,
          (gltf) => {
            // The exporter gives us an ArrayBuffer (binary GLB data)
            const blob = new Blob([gltf as ArrayBuffer], { type: "model/gltf-binary" });

            // Create a local URL for this in-memory 3D model
            const url = URL.createObjectURL(blob);
            modelBlobUrlRef.current = url; // Save for cleanup
            setModelUrl(url); // Set the URL for <model-viewer>
            setIsLoading(false);
          },
          (error) => {
            console.error("An error happened during GLTF export:", error);
            setError("Could not generate 3D model.");
            setIsLoading(false);
          },
          { binary: true } // We want a .glb file
        );
      } catch (error) {
        console.error("Error creating model:", error);
        setError("Error loading painting texture.");
        setIsLoading(false);
      }
    };

    createModel();

    // Cleanup function: Revoke the old object URL to prevent memory leaks
    return () => {
      if (modelBlobUrlRef.current) {
        URL.revokeObjectURL(modelBlobUrlRef.current);
        modelBlobUrlRef.current = null;
      }
      setModelUrl(null); // Clear the model URL
    };
  }, [paintingUrl, isScriptLoaded]); // Re-run whenever the paintingUrl OR isScriptLoaded changes

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] h-[90vh] max-w-4xl bg-slate-900 rounded-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex-1 w-full h-full flex items-center justify-center">
          {isLoading && <p>Loading AR Component...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!isLoading && !error && modelUrl && isScriptLoaded && (
            // We must use lowercase 'model-viewer' for the web component
            React.createElement('model-viewer', {
              src: modelUrl,
              ar: true,
              'ar-modes': "webxr scene-viewer quick-look",
              'camera-controls': true,
              'auto-rotate': true,
              style: { width: "100%", height: "100%" },
              alt: "3D model of the painting",
              exposure: "1.2",
              'shadow-intensity': "1",
              'environment-image': "neutral"
            }, React.createElement('button', {
              slot: "ar-button",
              style: {
                backgroundColor: "#F4C430", // Your theme color
                color: "black",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
              }
            }, "View in Your Room (AR)"))
          )}

          {/* Show loading message while script loads but model isn't yet generating */}
          {!isLoading && !error && !modelUrl && isScriptLoaded && (
            <p>Generating AR model...</p>
          )}
        </div>
      </div>
    </div>
  );
}

