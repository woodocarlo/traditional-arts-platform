"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import Image from 'next/image';
import { generateBackground, generateCenter, generateOverlay } from "./apiService";

// Placeholder for API keys (use environment variables in production)
const REMOVE_BG_API_KEY = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || " rnYsL35fBiWXmzFF4XxdRULo";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDZ5S69ygJDM1eJFxvV6AqCEUtl9Uqryiw"

// Narrow navigator.share typing for feature detection without using `any`
type ShareNavigator = Navigator & {
  share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
};

// Icons for the UI
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
  
);
const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </svg>
);
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
);

// Social Media Icons
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;

// Font library - you can add more fonts here
const fontLibrary = {
  "Playfair Display": "font-playfair",
  "Montserrat": "font-montserrat",
  "Pacifico": "font-pacifico",
  "Dancing Script": "font-dancing",
  "Roboto": "font-roboto",
  "Oswald": "font-oswald",
  "Lobster": "font-lobster",
  "Merriweather": "font-merriweather",
};

interface GeneratedPost {
  bgUrl: string;
  bgColor?: string;
  centerUrl?: string;
  overlayUrl?: string;
  heading?: string;
  subheading?: string;
  punchline?: string;
  fontFamily?: string;
  opacity?: number;
  caption?: string;
  hashtags?: string[];
}

export default function CraftPostGenerator() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [aspectRatio, setAspectRatio] = useState<string>("3:4");
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isAIDisabled, setIsAIDisabled] = useState<boolean>(false);
  const [description, setDescription] = useState<string>("");
  const [postType, setPostType] = useState<string>("Shop Drop");

  const generationSteps = [
    'Generating design variations...', 
    'Crafting compelling captions...', 
    'Assembling visual elements...', 
    'Finalizing your posts...', 
  ];

  // Handle image upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const urls = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...urls]);
      
      setIsUploading(true);
      try {
        const processed: string[] = [];
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append("image_file", file);
          formData.append("size", "auto");

          const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
            headers: {
              "X-Api-Key": REMOVE_BG_API_KEY,
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
          });

          processed.push(URL.createObjectURL(response.data));
        }
        setProcessedImages(prev => [...prev, ...processed]);
      } catch (error) {
        console.error("Error removing background:", error);
        alert("Failed to remove background. Check API key or try again.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setProcessedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Generate description if needed
  const generateDescription = async (postType: string) => {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent",
        {
          contents: [{
            parts: [{
              text: `Generate a short, engaging description (2-3 sentences) for a ${postType} social media post about a traditional craft product. Make it suitable for the post type.`
            }]
          }],
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: GEMINI_API_KEY },
        }
      );

      let generatedText = "";

      if (response.data.candidates && response.data.candidates[0] &&
          response.data.candidates[0].content && response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0] && response.data.candidates[0].content.parts[0].text) {
        generatedText = response.data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Unexpected API response structure");
      }

      return generatedText.trim();
    } catch (error) {
      console.error("Error generating description:", error);
      return "Beautiful handcrafted item showcasing traditional craftsmanship.";
    }
  };

  // Generate caption and hashtags using Gemini API
  const generateCaptionAndHashtags = async (punchline: string, description: string, postType: string) => {
    let postTypeInstruction = "";
    if (postType === "Shop Drop") {
      postTypeInstruction = "Create an elegant post to showcase the fine details of the art.";
    } else if (postType === "Unfold the Tale") {
      postTypeInstruction = "Share the story behind the work—from inspiration to creation.";
    } else if (postType === "Art Spotlight") {
      postTypeInstruction = "Generate a sales-focused post with a clear call-to-action.";
    }

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent",
        {
          contents: [{
            parts: [{
              text: `Generate a catchy social media caption and 5 relevant hashtags for a traditional craft product post.
              ${postTypeInstruction}
              Based on this description: "${description}"
              Include the punchline: "${punchline}".
              Format your response with the caption first, followed by two line breaks, then the hashtags separated by spaces.`
            }]
          }],
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: GEMINI_API_KEY },
        }
      );
      
      let generatedText = "";
      
      if (response.data.candidates && response.data.candidates[0] && 
          response.data.candidates[0].content && response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0] && response.data.candidates[0].content.parts[0].text) {
        generatedText = response.data.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response structure:", response.data);
        throw new Error("Unexpected API response structure");
      }
      
      const parts = generatedText.split("\n\n");
      
      let caption = "Beautiful handcrafted item. #Craft";
      let hashtags = ["#Handmade", "#Art", "#Craft", "#Traditional", "#Unique"];
      
      if (parts.length >= 2) {
        caption = parts[0];
        const hashtagText = parts[1];
        hashtags = hashtagText.split(/\s+/).filter(tag => tag.startsWith('#'));
        
        if (hashtags.length === 0) {
          hashtags = ["#Handmade", "#Art", "#Craft", "#Traditional", "#Unique"];
        }
      } else if (generatedText.includes('#')) {
        caption = generatedText.replace(/#\w+/g, '').trim();
        hashtags = generatedText.match(/#\w+/g) || ["#Handmade", "#Art", "#Craft", "#Traditional", "#Unique"];
      }
      
      return { caption, hashtags };
    } catch (error) {
      console.error("Error generating caption/hashtags:", error);
      return { 
        caption: "Beautiful handcrafted item. #Craft", 
        hashtags: ["#Handmade", "#Art", "#Craft", "#Traditional", "#Unique"] 
      };
    }
  };

  // Generate text elements for the post using Gemini API
  const generatePostText = async (punchline: string) => {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent",
        {
          contents: [{
            parts: [{
              text: `Generate a very short heading (2-3 words), a very short subheading (2-3 words), and a punchline (3-5 words) for a traditional craft product social media post.
              Use the following punchline as inspiration: "${punchline}".
              Format your response as: heading|subheading|punchline`
            }]
          }],
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: GEMINI_API_KEY },
        }
      );
      
      let generatedText = "";
      
      if (response.data.candidates && response.data.candidates[0] && 
          response.data.candidates[0].content && response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0] && response.data.candidates[0].content.parts[0].text) {
        generatedText = response.data.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response structure:", response.data);
        throw new Error("Unexpected API response structure");
      }
      
      const parts = generatedText.split("|");
      
      let heading = "Handcrafted Beauty";
      let subheading = "Authentic Craft";
      let finalPunchline = punchline;
      
      if (parts.length >= 3) {
        heading = parts[0].trim();
        subheading = parts[1].trim();
        finalPunchline = parts[2].trim();
      }
      
      return { heading, subheading, punchline: finalPunchline };
    } catch (error) {
      console.error("Error generating post text:", error);
      return { 
        heading: "Handcrafted Beauty", 
        subheading: "Authentic Craft",
        punchline: punchline
      };
    }
  };

  const calculateObjectSize = (canvasWidth: number, canvasHeight: number, index: number) => {
    const sizeVariation = [0.7, 0.6, 0.5, 0.65][index % 4];
    const baseSize = Math.min(canvasWidth, canvasHeight) * sizeVariation;
    const minSize = Math.min(canvasWidth, canvasHeight) * 0.4;
    const maxSize = Math.min(canvasWidth, canvasHeight) * 0.8;

    let width, height;

    if (canvasWidth > canvasHeight) {
      width = baseSize;
      height = baseSize * (canvasHeight / canvasWidth);
    } else {
      width = baseSize * (canvasWidth / canvasHeight);
      height = baseSize;
    }

    if (width < minSize) {
      width = minSize;
      height = minSize * (canvasHeight / canvasWidth);
    } else if (width > maxSize) {
      width = maxSize;
      height = maxSize * (canvasHeight / canvasWidth);
    }

    if (height < minSize) {
      height = minSize;
      width = minSize * (canvasWidth / canvasHeight);
    } else if (height > maxSize) {
      height = maxSize;
      width = maxSize * (canvasWidth / canvasHeight);
    }

    return { width, height };
  };

  const getContrastColor = (bgColor: string) => {
    const color = bgColor.toLowerCase();
    if (color.includes('white') || color.includes('light') || 
        color.includes('beige') || color.includes('cream') ||
        color.includes('yellow') || color.includes('pink')) {
      return '#000000';
    } else {
      return '#FFFFFF';
    }
  };



  const drawProcessedImage = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, index: number) => {
     if (processedImages.length === 0) return;

     const img = document.createElement('img') as HTMLImageElement;
    img.onload = () => {
      const size = calculateObjectSize(canvasWidth, canvasHeight, index);
      const x = (canvasWidth - size.width) / 2;
      const y = (canvasHeight - size.height) / 2;
      
      ctx.drawImage(img, x, y, size.width, size.height);
    };
    img.src = processedImages[0];
  };

  const drawTextElements = (ctx: CanvasRenderingContext2D, post: GeneratedPost, canvasWidth: number, canvasHeight: number) => {
    const textColor = getContrastColor(post.bgColor || "dark");
    ctx.fillStyle = textColor;
    
    const centerX = canvasWidth / 2;
    
    ctx.font = `bold 28px ${post.fontFamily || "Arial"}`;
    ctx.textAlign = 'center';
  ctx.fillText(post.heading ?? '', centerX, 40);
    
    ctx.font = `22px ${post.fontFamily || "Arial"}`;
  ctx.fillText(post.subheading ?? '', centerX, 70);
    
    ctx.font = `20px ${post.fontFamily || "Arial"}`;
  ctx.fillText(post.punchline ?? '', centerX, canvasHeight - 30);
  };

  const generatePosts = async () => {
    if (processedImages.length === 0) {
      alert("Please upload and process an image first.");
      return;
    }

    setGeneratedPosts([]);
    setIsGenerating(true);
    setCurrentStep(0);

    const numPosts = 3;
    const posts: GeneratedPost[] = [];

    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    let finalDescription = description;
    if (isAIDisabled) {
      finalDescription = await generateDescription(postType);
    }

    for (let i = 0; i < numPosts; i++) {
      // Generate background using Vertex AI
      const bgUrl = await generateBackground({
        postType,
        description: finalDescription,
        aspectRatio,
        image: processedImages[0],
      });

      // Generate center image using Vertex AI
      const centerUrl = Math.random() > 0.3 ? await generateCenter({
        postType,
        description: finalDescription,
        aspectRatio,
        image: processedImages[0],
      }) : "none";

      // Generate overlay using Vertex AI
      const overlayUrl = Math.random() > 0.4 ? await generateOverlay({
        postType,
        description: finalDescription,
        aspectRatio,
        image: processedImages[0],
      }) : "none";

      // Use punchlines from stock.json or generate new ones
      const punchlineObj = { text: "Crafted with passion, just for you." }; // Placeholder, can be generated via AI

      const fontKeys = Object.keys(fontLibrary);
      const randomFont = fontKeys[Math.floor(Math.random() * fontKeys.length)];

      const opacity = Math.floor(Math.random() * 8) + 20;

      const { caption, hashtags } = await generateCaptionAndHashtags(punchlineObj.text, finalDescription, postType);
      const { heading, subheading, punchline } = await generatePostText(punchlineObj.text);

      posts.push({
        bgUrl,
        bgColor: "dark", // Default, can be adjusted
        centerUrl,
        overlayUrl,
        heading,
        subheading,
        punchline,
        fontFamily: randomFont,
        opacity: opacity / 100,
        caption,
        hashtags,
      });
    }

    setGeneratedPosts(posts);
    setIsGenerating(false);
  };

  const regenerateImage = async (index: number) => {
    setIsGenerating(true);
    setCurrentStep(0);

    for (let i = 0; i < generationSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    const updatedPosts = [...generatedPosts];

    let finalDescription = description;
    if (isAIDisabled) {
      finalDescription = await generateDescription(postType);
    }

    // Generate background using Vertex AI
    const bgUrl = await generateBackground({
      postType,
      description: finalDescription,
      aspectRatio,
      image: processedImages[0],
    });

    // Generate center image using Vertex AI
    const centerUrl = Math.random() > 0.3 ? await generateCenter({
      postType,
      description: finalDescription,
      aspectRatio,
      image: processedImages[0],
    }) : "none";

    // Generate overlay using Vertex AI
    const overlayUrl = Math.random() > 0.4 ? await generateOverlay({
      postType,
      description: finalDescription,
      aspectRatio,
      image: processedImages[0],
    }) : "none";

    const fontKeys = Object.keys(fontLibrary);
    const randomFont = fontKeys[Math.floor(Math.random() * fontKeys.length)];

    const opacity = Math.floor(Math.random() * 8) + 20;

    // Generate new text elements for the regenerated post
    const punchlineObj = { text: "Crafted with passion, just for you." }; // Placeholder
    const { heading, subheading, punchline } = await generatePostText(punchlineObj.text);

    updatedPosts[index] = {
      ...updatedPosts[index],
      bgUrl,
      bgColor: "dark",
      centerUrl,
      overlayUrl,
      fontFamily: randomFont,
      opacity: opacity / 100,
      heading,
      subheading,
      punchline,
    };

    setGeneratedPosts(updatedPosts);
    setIsGenerating(false);
  };

  const handleShare = async (index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Failed to create blob from canvas.");

      const file = new File([blob], 'post.png', { type: 'image/png' });

      const nav = typeof navigator !== 'undefined' ? (navigator as ShareNavigator) : undefined;
      if (nav && typeof nav.share === 'function') {
        await nav.share({
          files: [file],
          title: 'My Craft Post',
          text: (generatedPosts[index]?.caption ?? '') + '\n\n' + ((generatedPosts[index]?.hashtags ?? []).join(' ')),
        });
      } else {
        alert("Web Share API is not supported in this browser. Please download the image manually.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share image.");
    }
  };

  const drawPostToCanvasCallback = useCallback((post: GeneratedPost, index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let canvasWidth, canvasHeight;
    if (aspectRatio === "3:4") {
      canvasWidth = 300;
      canvasHeight = 400;
    } else if (aspectRatio === "1:1") {
      canvasWidth = 350;
      canvasHeight = 350;
    } else {
      canvasWidth = 270;
      canvasHeight = 480;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const bgImg = document.createElement('img') as HTMLImageElement;
    bgImg.onload = () => {
      const bgAspect = bgImg.width / bgImg.height;
      const canvasAspect = canvasWidth / canvasHeight;

      let bgRenderWidth, bgRenderHeight, bgX, bgY;

      if (bgAspect > canvasAspect) {
        bgRenderHeight = canvasHeight;
        bgRenderWidth = bgImg.width * (canvasHeight / bgImg.height);
        bgX = (canvasWidth - bgRenderWidth) / 2;
        bgY = 0;
      } else {
        bgRenderWidth = canvasWidth;
        bgRenderHeight = bgImg.height * (canvasWidth / bgImg.width);
        bgX = 0;
        bgY = (canvasHeight - bgRenderHeight) / 2;
      }

      ctx.drawImage(bgImg, bgX, bgY, bgRenderWidth, bgRenderHeight);

      if (post.centerUrl && post.centerUrl !== "none") {
        const centerImg = document.createElement('img') as HTMLImageElement;
        centerImg.onload = () => {
          const centerAspect = centerImg.width / centerImg.height;

          let centerRenderWidth, centerRenderHeight, centerX, centerY;

          if (centerAspect > canvasAspect) {
            centerRenderHeight = canvasHeight;
            centerRenderWidth = centerImg.width * (canvasHeight / centerImg.height);
            centerX = (canvasWidth - centerRenderWidth) / 2;
            centerY = 0;
          } else {
            centerRenderWidth = canvasWidth;
            centerRenderHeight = centerImg.height * (canvasWidth / centerImg.width);
            centerX = 0;
            centerY = (canvasHeight - centerRenderHeight) / 2;
          }

          ctx.drawImage(centerImg, centerX, centerY, centerRenderWidth, centerRenderHeight);
          drawProcessedImage(ctx, canvasWidth, canvasHeight, index);

          if (post.overlayUrl && post.overlayUrl !== "none") {
            const overlayImg = document.createElement('img') as HTMLImageElement;
            overlayImg.onload = () => {
              ctx.globalAlpha = post.opacity ?? 1.0;
              ctx.drawImage(overlayImg, 0, 0, canvasWidth, canvasHeight);
              ctx.globalAlpha = 1.0;
            };
            overlayImg.src = post.overlayUrl;
          }
        };
        centerImg.src = post.centerUrl;
      } else {
        drawProcessedImage(ctx, canvasWidth, canvasHeight, index);

        if (post.overlayUrl && post.overlayUrl !== "none") {
          const overlayImg = document.createElement('img') as HTMLImageElement;
          overlayImg.onload = () => {
            ctx.globalAlpha = post.opacity ?? 1.0;
            ctx.drawImage(overlayImg, 0, 0, canvasWidth, canvasHeight);
            ctx.globalAlpha = 1.0;
            drawTextElements(ctx, post, canvasWidth, canvasHeight);
          };
          overlayImg.src = post.overlayUrl;
        } else {
          drawTextElements(ctx, post, canvasWidth, canvasHeight);
        }
      }
    };
    bgImg.src = post.bgUrl;
  }, [aspectRatio]);

  useEffect(() => {
    generatedPosts.forEach((post, index) => {
      setTimeout(() => drawPostToCanvasCallback(post, index), 100);
    });
  }, [generatedPosts, processedImages, drawPostToCanvasCallback]);

  const onClose = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className="relative min-h-screen p-8 bg-gradient-to-br from-[#1d002a] via-[#2d1b69] to-[#4b006e] text-white font-['Inter',_sans-serif] overflow-hidden">
      {/* Mandela Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/backgrounds/mandela.png')`,
          backgroundRepeat: "repeat",
          backgroundSize: "800px 800px",
          backgroundPosition: "0 0",
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-white">Craft Post Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <p className="text-lg text-gray-200 mb-8 max-w-3xl">
          Upload an image of your craft and let our AI generate beautiful social media posts for you in seconds.
        </p>
        
        {isUploading && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center flex flex-col items-center">
              <LoadingSpinner />
              <h3 className="text-xl font-semibold text-white mt-4">Uploading image...</h3>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Crafting Your Posts</h3>
              <div className="space-y-4">
                {generationSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {index < currentStep ? (
                      <span className="text-green-400">✓</span>
                    ) : index === currentStep ? (
                      <LoadingSpinner />
                    ) : (
                      <span className="text-gray-500">○</span>
                    )}
                    <p className="text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full animate-pulse"
                  style={{width: `${(currentStep / generationSteps.length) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-4">1. Upload Your Craft Images</h4>
              <div className="space-y-2">
                <label className="text-white font-medium">Choose images of your product:</label>
                <input type="file" accept="image/*" multiple onChange={handleUpload} className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
                <div className="relative">
                  <div className="flex overflow-x-auto space-x-4 py-4 scrollbar-hide" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group flex-shrink-0">
                        <Image src={image} alt={`Uploaded ${index}`} width={112} height={112} className="w-28 h-28 object-cover rounded-lg border-2 border-white/20 group-hover:border-purple-400 transition-all" />
                        <div className="absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => removeImage(index)} className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                            <CloseIcon />
                          </button>
                          <button onClick={() => setExpandedImage(image)} className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                            <ExpandIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-white mb-4">2. Customize Your Post</h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Craft Your Message</label>
                  <div className="flex items-start gap-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isAIDisabled ? "You have selected auto AI description generation." : "add a background story or describe the art."}
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
                      rows={4}
                      disabled={isAIDisabled}
                    ></textarea>
                    <div className="flex flex-col gap-2">
                      <button className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors shadow-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                          <line x1="12" y1="19" x2="12" y2="23"></line>
                          <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                      </button>
                      <button
                        onClick={() => setIsAIDisabled(!isAIDisabled)}
                        className={`p-3 rounded-full text-white transition-colors shadow-lg ${isAIDisabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="text-lg text-white mb-4">Set Your Stage</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPostType("Shop Drop")}
                      className={`p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-left transition-all transform hover:scale-105 shadow-lg ${postType === 'Shop Drop' ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      <div className="font-bold text-base mb-1">Shop Drop</div>
                      <div className="text-xs opacity-90">Create an elegant post to showcase the fine details of your art.</div>
                    </button>
                    <button
                      onClick={() => setPostType("Unfold the Tale")}
                      className={`p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-left transition-all transform hover:scale-105 shadow-lg ${postType === 'Unfold the Tale' ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      <div className="font-bold text-base mb-1">Unfold the Tale</div>
                      <div className="text-xs opacity-90">Share the story behind your work—from inspiration to creation.</div>
                    </button>
                    <button
                      onClick={() => setPostType("Art Spotlight")}
                      className={`p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-left transition-all transform hover:scale-105 shadow-lg ${postType === 'Art Spotlight' ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      <div className="font-bold text-base mb-1">Art Spotlight</div>
                      <div className="text-xs opacity-90">Generate a sales-focused post with a clear call-to-action.</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <h4 className="text-2xl font-semibold text-white mb-4">3. Select Your Post Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setAspectRatio("3:4")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${ aspectRatio === '3:4'
                    ? 'border-purple-400 bg-purple-900/30'
                    : 'border-white/20 bg-black/30 hover:border-white/30'
                }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[150px] h-[200px] bg-white/10 border-white/40 border-2 rounded relative">
                    <svg className="absolute w-full h-full" viewBox="0 0 150 200" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="150" y2="200" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4 4" />
                    </svg>
                  </div>
                  <p className="absolute text-white font-semibold bottom-4">Portrait (3:4)</p>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${ aspectRatio === '9:16'
                    ? 'border-purple-400 bg-purple-900/30'
                    : 'border-white/20 bg-black/30 hover:border-white/30'
                }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[100px] h-[200px] bg-white/10 border-white/40 border-2 rounded relative">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 200" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="100" y2="200" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4 4" />
                    </svg>
                  </div>
                  <p className="absolute text-white font-semibold bottom-4">Story (9:16)</p>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio("1:1")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${ aspectRatio === '1:1'
                    ? 'border-purple-400 bg-purple-900/30'
                    : 'border-white/20 bg-black/30 hover:border-white/30'
                }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[150px] h-[150px] bg-white/10 border-white/40 border-2 rounded relative">
                    <svg className="absolute w-full h-full" viewBox="0 0 150 150" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="150" y2="150" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4 4" />
                    </svg>
                  </div>
                  <p className="absolute text-white font-semibold bottom-4">Post (1:1)</p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={generatePosts}
              disabled={isUploading || isGenerating || processedImages.length === 0}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Generate Posts
            </button>
          </div>
          
          {/* Generated Posts */}
          {generatedPosts.length > 0 && (
            <div>
              <h4 className="text-2xl font-semibold text-white mb-4">Your Generated Posts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedPosts.map((post: GeneratedPost, index: number) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/20">
                    <div className="relative group">
                      <canvas 
                        ref={(el: HTMLCanvasElement | null) => { canvasRefs.current[index] = el; return; }}
                        className="w-full bg-gray-700 mb-4 rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-lg">
                        <p className="text-2xl font-bold text-white mb-4">Post it on..</p>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                          <InstagramIcon />
                          Instagram
                        </a>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                          <FacebookIcon />
                          Facebook
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                          <TwitterIcon />
                          Twitter
                        </a>
                        {typeof navigator !== 'undefined' && ((navigator as ShareNavigator).share) && (
                          <button onClick={() => handleShare(index)} className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                            <ShareIcon />
                            Share
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 text-gray-300">
                      <p className="font-semibold text-white">Caption:</p>
                      <p>{post.caption ?? ''}</p>
                    </div>
                    <div className="mb-4 text-gray-300">
                      <p className="font-semibold text-white">Hashtags:</p>
                      <p>{(post.hashtags ?? []).join(" ")}</p>
                    </div>
                    <button 
                      onClick={() => regenerateImage(index)}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Regenerate Image
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setExpandedImage(null)}
        >
          <img src={expandedImage} alt="Expanded view" className="max-w-[90vw] max-h-[90vh] object-contain" />
          <button onClick={() => setExpandedImage(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70">
            <CloseIcon />
          </button>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@500;700&family=Pacifico&family=Dancing+Script:wght@700&family=Roboto:wght@500;700&family=Oswald:wght@500&family=Lobster&family=Merriweather:wght@700&display=swap');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-pacifico { font-family: 'Pacifico', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .font-oswald { font-family: 'Oswald', sans-serif; }
        .font-lobster { font-family: 'Lobster', cursive; }
        .font-merriweather { font-family: 'Merriweather', serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
