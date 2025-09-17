"use client";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import assets from "./stock.json";

// Placeholder for API keys (use environment variables in production)
const REMOVE_BG_API_KEY = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || "nRffN4sYDj28VMJpNtXuMopL";
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyDZ5S69ygJDM1eJFxvV6AqCEUtl9Uqryiw"

// Icons for the UI
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
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

export default function CraftPostGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>("3:4");
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const steps = [
    'Generating design variations...',
    'Crafting compelling captions...',
    'Assembling visual elements...',
    'Finalizing your posts...',
  ];

  // Handle image upload
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
      
      setLoading(true);
      try {
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

        const processedUrl = URL.createObjectURL(response.data);
        setProcessedImage(processedUrl);
      } catch (error) {
        console.error("Error removing background:", error);
        alert("Failed to remove background. Check API key or try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate caption and hashtags using Gemini API
  const generateCaptionAndHashtags = async (punchline: string) => {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          contents: [{ 
            parts: [{ 
              text: `Generate a catchy social media caption and 5 relevant hashtags for a traditional craft product post. 
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
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
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
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    let width, height;
    
    if (aspectRatio > 1) {
      width = baseSize;
      height = baseSize / aspectRatio;
    } else {
      width = baseSize * aspectRatio;
      height = baseSize;
    }
    
    if (width < minSize) {
      width = minSize;
      height = minSize / aspectRatio;
    } else if (width > maxSize) {
      width = maxSize;
      height = maxSize / aspectRatio;
    }
    
    if (height < minSize) {
      height = minSize;
      width = minSize * aspectRatio;
    } else if (height > maxSize) {
      height = maxSize;
      width = maxSize * aspectRatio;
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

  const drawPostToCanvas = (post: any, index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let canvasWidth, canvasHeight;
    if (aspectRatio === "3:4") {
      canvasWidth = 300;
      canvasHeight = 400;
    } else {
      canvasWidth = 270;
      canvasHeight = 480;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const bgImg = new Image();
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
        const centerImg = new Image();
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
            const overlayImg = new Image();
            overlayImg.onload = () => {
              ctx.globalAlpha = post.opacity;
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
          const overlayImg = new Image();
          overlayImg.onload = () => {
            ctx.globalAlpha = post.opacity;
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
  };

  const drawProcessedImage = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, index: number) => {
    if (!processedImage) return;
    
    const img = new Image();
    img.onload = () => {
      const size = calculateObjectSize(canvasWidth, canvasHeight, index);
      const x = (canvasWidth - size.width) / 2;
      const y = (canvasHeight - size.height) / 2;
      
      ctx.drawImage(img, x, y, size.width, size.height);
    };
    img.src = processedImage;
  };

  const drawTextElements = (ctx: CanvasRenderingContext2D, post: any, canvasWidth: number, canvasHeight: number) => {
    const textColor = getContrastColor(post.bgColor || "dark");
    ctx.fillStyle = textColor;
    
    const centerX = canvasWidth / 2;
    
    ctx.font = `bold 28px ${post.fontFamily || "Arial"}`;
    ctx.textAlign = 'center';
    ctx.fillText(post.heading, centerX, 40);
    
    ctx.font = `22px ${post.fontFamily || "Arial"}`;
    ctx.fillText(post.subheading, centerX, 70);
    
    ctx.font = `20px ${post.fontFamily || "Arial"}`;
    ctx.fillText(post.punchline, centerX, canvasHeight - 30);
  };

  const generatePosts = async () => {
    if (!processedImage) {
      alert("Please upload and process an image first.");
      return;
    }
    
    setGeneratedPosts([]);
    setLoading(true);
    setCurrentStep(0);
    
    // Generate exactly 3 posts
    const numPosts = 3;
    const posts: any[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    for (let i = 0; i < numPosts; i++) {
      const bg = assets.backgrounds[Math.floor(Math.random() * assets.backgrounds.length)];
      const center = Math.random() > 0.3 ? 
        assets.centerImages[Math.floor(Math.random() * assets.centerImages.length)] : 
        { url: "none", name: "None" };
      const overlay = Math.random() > 0.4 ? 
        assets.overlays[Math.floor(Math.random() * assets.overlays.length)] : 
        { url: "none", name: "None" };
      const punchlineObj = assets.punchlines[Math.floor(Math.random() * assets.punchlines.length)];
      
      const fontKeys = Object.keys(fontLibrary);
      const randomFont = fontKeys[Math.floor(Math.random() * fontKeys.length)];
      
      const opacity = Math.floor(Math.random() * 8) + 20;

      const { caption, hashtags } = await generateCaptionAndHashtags(punchlineObj.text);
      const { heading, subheading, punchline } = await generatePostText(punchlineObj.text);

      posts.push({
        bgUrl: bg.url,
        bgColor: bg.color || "dark",
        centerUrl: center.url,
        overlayUrl: overlay.url,
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
    setLoading(false);
  };

  const regenerateImage = async (index: number) => {
    setLoading(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    const updatedPosts = [...generatedPosts];
    
    const bg = assets.backgrounds[Math.floor(Math.random() * assets.backgrounds.length)];
    const center = Math.random() > 0.3 ? 
      assets.centerImages[Math.floor(Math.random() * assets.centerImages.length)] : 
      { url: "none", name: "None" };
    const overlay = Math.random() > 0.4 ? 
      assets.overlays[Math.floor(Math.random() * assets.overlays.length)] : 
      { url: "none", name: "None" };
    
    const fontKeys = Object.keys(fontLibrary);
    const randomFont = fontKeys[Math.floor(Math.random() * fontKeys.length)];
    
    const opacity = Math.floor(Math.random() * 8) + 20;
    
    // Generate new text elements for the regenerated post
    const punchlineObj = assets.punchlines[Math.floor(Math.random() * assets.punchlines.length)];
    const { heading, subheading, punchline } = await generatePostText(punchlineObj.text);
    
    updatedPosts[index] = {
      ...updatedPosts[index],
      bgUrl: bg.url,
      bgColor: bg.color || "dark",
      centerUrl: center.url,
      overlayUrl: overlay.url,
      fontFamily: randomFont,
      opacity: opacity / 100,
      heading,
      subheading,
      punchline,
    };
    
    setGeneratedPosts(updatedPosts);
    setLoading(false);
  };

  const handleShare = async (index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error("Failed to create blob from canvas.");

      const file = new File([blob], 'post.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'My Craft Post',
          text: generatedPosts[index].caption + '\n\n' + generatedPosts[index].hashtags.join(' '),
        });
      } else {
        alert("Web Share API is not supported in this browser. Please download the image manually.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share image.");
    }
  };

  useEffect(() => {
    generatedPosts.forEach((post, index) => {
      setTimeout(() => drawPostToCanvas(post, index), 100);
    });
  }, [generatedPosts]);

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
        
        {loading && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center">
              <h3 className="text-xl font-semibold text-white mb-4">Crafting Your Posts</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
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
                  style={{width: `${(currentStep / steps.length) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
          {/* Upload Section */}
          <div>
            <h4 className="text-2xl font-semibold text-white mb-4">1. Upload Your Craft Image</h4>
            <div className="space-y-2">
              <label className="text-white font-medium">Choose an image of your product:</label>
              <input type="file" accept="image/*" onChange={handleUpload} className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="mt-4 w-32 h-auto rounded-lg border border-white/20" />}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <h4 className="text-2xl font-semibold text-white mb-4">2. Select Your Post Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAspectRatio("3:4")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  aspectRatio === '3:4'
                    ? 'border-purple-400 bg-purple-900/30'
                    : 'border-white/20 bg-black/30 hover:border-white/30'
                }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[150px] h-[200px] bg-white/10 border-white/40 border-2 rounded"></div>
                  <p className="absolute text-white font-semibold bottom-4">Portrait (3:4)</p>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  aspectRatio === '9:16'
                    ? 'border-purple-400 bg-purple-900/30'
                    : 'border-white/20 bg-black/30 hover:border-white/30'
                }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[100px] h-[200px] bg-white/10 border-white/40 border-2 rounded"></div>
                  <p className="absolute text-white font-semibold bottom-4">Story (9:16)</p>
                </div>
              </button>
            </div>
          </div>
          
          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={generatePosts}
              disabled={loading || !processedImage}
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
                {generatedPosts.map((post: any, index: number) => (
                  <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/20">
                    <div className="relative group">
                      <canvas 
                        ref={el => canvasRefs.current[index] = el}
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
                        {navigator.share && (
                          <button onClick={() => handleShare(index)} className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
                            <ShareIcon />
                            Share
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 text-gray-300">
                      <p className="font-semibold text-white">Caption:</p>
                      <p>{post.caption}</p>
                    </div>
                    <div className="mb-4 text-gray-300">
                      <p className="font-semibold text-white">Hashtags:</p>
                      <p>{post.hashtags.join(" ")}</p>
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
      `}</style>
    </div>
  );
}