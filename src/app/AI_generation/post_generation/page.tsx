"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from 'next/image';
import axios from 'axios';

const REMOVE_BG_API_KEY = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY || "rnYsL35fBiWXmzFF4XxdRULo";

// **REMOVED** The static STORY_TEMPLATE is GONE.
// We will now generate prompts dynamically.


// [Keep all the existing type definitions and icons - they remain the same]

type ShareNavigator = Navigator & {
  share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
};

interface GeneratedPost {
  bgUrl: string;
  bgColor?: string;
  centerUrl?: string;
  overlayUrl?: string;
  text?: string; // This will now be empty, as text is in the image
  heading?: string;
  subheading?: string;
  punchline?: string;
  fontFamily?: string;
  opacity?: number;
  caption?: string;
  hashtags?: string[];
  generatedImage?: string;
}

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
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

const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);
const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
const TwitterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;



export default function CraftPostGenerator() {
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("3:4");
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [generationMessage, setGenerationMessage] = useState<string>("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [postType, setPostType] = useState<string>("Shop Drop");

  const generationSteps = [
    'Analyzing your craft...',
    'Removing background...',
    'Generating design concepts...',
    'Crafting compelling text...',
    'Assembling visual elements...',
    'Finalizing your posts...',
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image uploaded:", file.name, file.size);
      setUploadedImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Remove background immediately
      setIsUploading(true);
      setGenerationMessage('Removing background...');
      
      try {
        const formData = new FormData();
        formData.append('image_file', file);
        formData.append('size', 'auto');

        const response = await axios.post("https://api.remove.bg/v1.0/removebg", formData, {
          headers: {
            "X-Api-Key": REMOVE_BG_API_KEY,
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        });

        const processedUrl = URL.createObjectURL(response.data);
        setProcessedImage(processedUrl);
        setGenerationMessage('Background removed successfully!');
      } catch (error) {
        console.error("Error removing background:", error);
        alert("Failed to remove background. Will use original image.");
        setProcessedImage(uploadedImage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Convert blob URL to base64
  const blobToBase64 = async (blobUrl: string): Promise<string> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generatePosts = async () => {
    if (!uploadedImageFile || !processedImage) {
      alert('Please upload an image first and wait for background removal');
      return;
    }
    
    // **CRITICAL**: Check if description is provided
    if (!description) {
        alert('Please describe your craft first! (e.g., "hand-thrown pottery", "modern art canvas")');
        return;
    }

    console.log('Starting Generation');
    setIsUploading(true);
    setCurrentStep(0);
    setGenerationMessage('Starting generation...');

    try {
      const base64Image = await blobToBase64(processedImage);
      
      const posts: GeneratedPost[] = [];
      let mainCaption = '';
      let mainHashtags: string[] = [];
      const artType = description; // Use the user's description as the art type
      
      let promptList: string[] = [];
      
      // **NEW DYNAMIC PROMPTS**
      if (postType === "Unfold the Tale") {
        promptList = [
          // Slide 1: Intro
          `This is slide 1 of 5 for a [ART_TYPE]. Create a stunning introductory post. The [ART_TYPE] is the hero. Artistically integrate a powerful, short title based on the art (e.g., 'The Legacy of [ART_TYPE]', 'Introducing...'). Aspect ratio: [ASPECT_RATIO].`,
          // Slide 2: Detail
          `This is slide 2 of 5 for a [ART_TYPE]. Create a 'detail spotlight' or 'macro' design. Focus on its unique texture/feature. Artistically integrate text that highlights this specific detail (e.g., 'The Intricate Weave', 'A Closer Look', 'The Hand-Thrown Mark'). Aspect ratio: [ASPECT_RATIO].`,
          // Slide 3: Process
          `This is slide 3 of 5 for a [ART_TYPE]. Create an artistic 'behind-the-scenes' collage implying the creation process (tools, hands, raw materials). Artistically integrate text about the creation (e.g., 'Shaped by Hand', 'Months of Weaving', 'From Raw Clay'). Aspect ratio: [ASPECT_RATIO].`,
          // Slide 4: Heritage
          `This is slide 4 of 5 for a [ART_TYPE]. Create a 'heritage' post. Show the art with cultural motifs from its origin. Artistically integrate text about its cultural story (e.g., 'A Timeless Tradition', 'Our People's Story', 'Modern Heritage'). Aspect ratio: [ASPECT_RATIO].`,
          // Slide 5: CTA
          `This is slide 5 of 5 for a [ART_TYPE]. Create a bold 'hero showcase' post. It should be a strong call to action. Artistically integrate compelling text (e.g., 'Bring Home a Legacy', 'Keep the Story Alive', 'Own a Piece of History'). Aspect ratio: [ASPECT_RATIO].`
        ];
      } else {
        // Shop Drop / Art Spotlight
        promptList = [
          `Create a dynamic social media collage for this [ART_TYPE]. The craft is the hero. Surround it with abstract shapes and cultural motifs from its origin. Artistically integrate the text '[ART_TYPE]' as an elegant title. Aspect ratio: [ASPECT_RATIO].`,
          `Design a 'split-screen' or layered layout for this [ART_TYPE]. One side shows the craft, the other shows stylized raw materials or tools. Artistically integrate the text '[ART_TYPE]' as a clean, modern title. Aspect ratio: [ASPECT_RATIO].`,
          `Generate a 'magazine-style' product showcase for this [ART_TYPE]. Place the craft in a context-rich, beautiful scene. Artistically integrate the text '[ART_TYPE]' as a minimalist, premium title. Aspect ratio: [ASPECT_RATIO].`
        ];
      }

      const numImages = promptList.length;

      for (let i = 0; i < numImages; i++) {
        setCurrentStep(i + 2);
        setGenerationMessage(`Generating ${postType === "Unfold the Tale" ? 'slide' : 'variation'} ${i + 1} of ${numImages}...`);

        const prompt = promptList[i]
            .replace(/\[ART_TYPE\]/g, artType) // 'g' flag to replace all instances
            .replace('[ASPECT_RATIO]', aspectRatio);
        
        // Generate caption for first slide of carousel, or for ALL slides of Shop Drop
        const shouldGenerateCaption = (postType !== "Unfold the Tale") || (i === 0);

        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            imageBase64: base64Image,
            generateCaption: shouldGenerateCaption,
            artType: artType // Send the user's description to the API
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const result = await response.json();

        // Store the main caption/hashtags
        const defaultCaption = `Check out this incredible ${artType}, handmade with generations of skill. A true piece of art.`;
        const defaultHashtags = ['#Handmade', '#Artisan', '#CulturalHeritage', '#SupportLocalArtisans', '#Craftsmanship', `#${artType.replace(/\s/g, '')}`];

        let currentCaption = result.caption || defaultCaption;
        let currentHashtags = result.hashtags || defaultHashtags;

        if (postType === "Unfold the Tale") {
          if (i === 0) {
            mainCaption = currentCaption;
            mainHashtags = currentHashtags;
          } else {
            // Use the same caption for all slides in a carousel
            currentCaption = mainCaption;
            currentHashtags = mainHashtags;
          }
        }

        const generatedPost: GeneratedPost = {
          bgUrl: result.generatedImage || processedImage,
          centerUrl: result.generatedImage || processedImage,
          overlayUrl: 'none',
          text: '', // Text is now part of the image
          caption: currentCaption,
          hashtags: currentHashtags,
          generatedImage: result.generatedImage,
        };

        posts.push(generatedPost);
      }

      setGeneratedPosts(posts);
      setCurrentStep(numImages + 2);
      setGenerationMessage('Posts generated successfully!');

      setTimeout(() => {
        setIsUploading(false);
      }, 1000);

    } catch (error) {
      console.error('Generation Failed:', error);
      alert(`Failed to generate post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsUploading(false);
    }
  };

  const regenerateImage = async (index: number) => {
    if (!processedImage || !description) {
      alert('No processed image or description available');
      return;
    }

    setIsGenerating(true);
    setGenerationMessage('Regenerating post...');

    try {
      const base64Image = await blobToBase64(processedImage);
      const artType = description;

      // Use one of the new, better prompts for regeneration
      const regenPrompts = [
        `Create a completely different, unique social media post design for this [ART_TYPE] with new background, lighting, and visual effects. Make it a stunning collage with cultural patterns. Artistically integrate the text '[ART_TYPE]' as a title. Aspect ratio: [ASPECT_RATIO]`,
        `Generate a new artistic showcase for this [ART_TYPE]. Place it in a modern, minimalist setting but with rich, traditional textures. High-end, luxury feel. Artistically integrate the text '[ART_TYPE]' as a title. Aspect ratio: [ASPECT_RATIO]`
      ];
      
      const prompt = regenPrompts[index % regenPrompts.length]
          .replace(/\[ART_TYPE\]/g, artType)
          .replace('[ASPECT_RATIO]', aspectRatio);

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          imageBase64: base64Image,
          generateCaption: true, // Always generate new caption on regenerate
          artType: artType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate image');
      }

      const result = await response.json();

      const updatedPosts = [...generatedPosts];
      updatedPosts[index] = {
        ...updatedPosts[index],
        centerUrl: result.generatedImage || updatedPosts[index].centerUrl,
        bgUrl: result.generatedImage || updatedPosts[index].bgUrl,
        caption: result.caption || updatedPosts[index].caption,
        hashtags: result.hashtags || updatedPosts[index].hashtags
      };
      
      setGeneratedPosts(updatedPosts);

    } catch (error) {
      console.error('Error regenerating post:', error);
      alert(`Failed to regenerate post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // [Keep canvas drawing functions - NO CHANGES, they just draw the image]
  const getCanvasDimensions = () => {
    if (aspectRatio === "3:4") return { width: 300, height: 400 };
    if (aspectRatio === "1:1") return { width: 350, height: 350 };
    return { width: 270, height: 480 }; // 9:16
  };

  const drawPostToCanvas = (post: GeneratedPost, index: number, canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (post.centerUrl || post.bgUrl) {
      const img = document.createElement('img');
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const imgAspect = img.width / img.height;
        const canvasAspect = canvasWidth / canvasHeight;
        let renderWidth, renderHeight, x, y;
        
        if (imgAspect > canvasAspect) {
          renderWidth = canvasWidth;
          renderHeight = img.height * (canvasWidth / img.width);
          x = 0;
          y = (canvasHeight - renderHeight) / 2;
        } else {
          renderHeight = canvasHeight;
          renderWidth = img.width * (canvasHeight / img.height);
          x = (canvasWidth - renderWidth) / 2;
          y = 0;
        }
        
        ctx.drawImage(img, x, y, renderWidth, renderHeight);
      };
      img.src = post.centerUrl || post.bgUrl;
    }
  };
  
  // The drawTextElements function is GONE, as it's no longer needed.

  const handleShare = async (canvas: HTMLCanvasElement | null, caption: string, hashtags: string[]) => {
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
          text: caption + '\n\n' + hashtags.join(' '),
        });
      } else {
        alert("Web Share API is not supported. Please download the image manually.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      alert("Failed to share image.");
    }
  };

  const onClose = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  // [Keep CarouselPost, SinglePostCard, ShareOverlay, PostCaption components - NO CHANGES]
  const CarouselPost = ({ posts }: { posts: GeneratedPost[] }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      if (posts[currentSlide]) {
        drawPostToCanvas(posts[currentSlide], currentSlide, canvasRef.current);
      }
    }, [currentSlide, posts]);

    const nextSlide = () => {
      setCurrentSlide(prev => (prev === posts.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
      setCurrentSlide(prev => (prev === 0 ? posts.length - 1 : prev - 1));
    };

    const post = posts[0]; 

    return (
      <div className="bg-white/5 p-4 rounded-lg border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={prevSlide}
            className="flex-shrink-0 p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors shadow-lg z-10"
          >
            <ChevronLeftIcon />
          </button>

          <div className="flex-1 relative group">
            <canvas
              ref={canvasRef}
              className="w-full bg-gray-700 rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {posts.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
            <ShareOverlay
              canvas={canvasRef.current}
              caption={post.caption ?? ''}
              hashtags={post.hashtags ?? []}
            />
          </div>

          <button
            onClick={nextSlide}
            className="flex-shrink-0 p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors shadow-lg z-10"
          >
            <ChevronRightIcon />
          </button>
        </div>
        <PostCaption caption={post.caption} hashtags={post.hashtags} />
      </div>
    );
  };

  const SinglePostCard = ({ post, index }: { post: GeneratedPost, index: number }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
      drawPostToCanvas(post, index, canvasRef.current);
    }, [post]);

    return (
      <div className="bg-white/5 p-4 rounded-lg border border-white/20">
        <div className="relative group">
          <canvas
            ref={canvasRef}
            className="w-full bg-gray-700 mb-4 rounded-lg"
          />
          <ShareOverlay
            canvas={canvasRef.current}
            caption={post.caption ?? ''}
            hashtags={post.hashtags ?? []}
          />
        </div>
        <PostCaption caption={post.caption} hashtags={post.hashtags} />
        <button
          onClick={() => regenerateImage(index)}
          disabled={isGenerating}
          className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors mt-4 disabled:opacity-50"
        >
          {isGenerating ? 'Regenerating...' : 'Regenerate Image'}
        </button>
      </div>
    );
  };
  
  const ShareOverlay = ({ canvas, caption, hashtags }: { canvas: HTMLCanvasElement | null, caption: string, hashtags: string[] }) => (
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-lg">
      <p className="text-2xl font-bold text-white mb-4">Post it on..</p>
      <a href="https.www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
        <InstagramIcon /> Instagram
      </a>
      <a href="https.www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
        <FacebookIcon /> Facebook
      </a>
      <a href="https.www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
        <TwitterIcon /> Twitter
      </a>
      {typeof navigator !== 'undefined' && ((navigator as ShareNavigator).share) && (
        <button onClick={() => handleShare(canvas, caption, hashtags)} className="text-white px-4 py-2 rounded-lg m-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-colors">
          <ShareIcon /> Share
        </button>
      )}
    </div>
  );

  const PostCaption = ({ caption, hashtags }: { caption?: string, hashtags?: string[] }) => (
    <>
      <div className="mb-4 text-gray-300">
        <p className="font-semibold text-white">Caption:</p>
        <p>{caption ?? ''}</p>
      </div>
      <div className="mb-4 text-gray-300">
        <p className="font-semibold text-white">Hashtags:</p>
        <p>{(hashtags ?? []).join(" ")}</p>
      </div>
    </>
  );

  // [Keep the entire JSX return - NO CHANGES]
  return (
    <div className="relative min-h-screen p-8 bg-gradient-to-br from-[#1d002a] via-[#2d1b69] to-[#4b006e] text-white font-['Inter',_sans-serif] overflow-hidden">
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
          <h2 className="text-3xl font-bold text-white">Craft Post Generator</h2>
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
              <h3 className="text-xl font-semibold text-white mt-4">{generationMessage}</h3>
              <div className="mt-4 w-64 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                  style={{width: `${(currentStep / generationSteps.length) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/10 p-8 rounded-2xl border border-white/20 text-center">
              <LoadingSpinner />
              <h3 className="text-xl font-semibold text-white mt-4">{generationMessage}</h3>
            </div>
          </div>
        )}
        
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-2xl font-semibold text-white mb-4">1. Upload Your Craft Images</h4>
              <div className="space-y-2">
                <label className="text-white font-medium">Choose images of your product:</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"/>
                <div className="flex gap-4">
                  {uploadedImage && (
                    <div className="relative group flex-shrink-0">
                      <Image src={uploadedImage} alt="Original" width={112} height={112} className="w-28 h-28 object-cover rounded-lg border-2 border-purple-400" />
                      <p className="text-xs text-center mt-1">Original</p>
                    </div>
                  )}
                  {processedImage && (
                    <div className="relative group flex-shrink-0">
                      <Image src={processedImage} alt="Processed" width={112} height={112} className="w-28 h-28 object-cover rounded-lg border-2 border-green-400" />
                      <p className="text-xs text-center mt-1">Processed</p>
                      <div className="absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setExpandedImage(processedImage)} className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                          <ExpandIcon />
                        </button>
                      </div>
                    </div>
                  )}
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
                      placeholder="Describe your art here (e.g., 'handwoven basket', 'traditional pottery', 'modern art canvas')"
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
                      rows={4}
                    ></textarea>
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
                      <div className="text-xs opacity-90">Generate 3 elegant variations.</div>
                    </button>
                    <button
                      onClick={() => setPostType("Unfold the Tale")}
                      className={`p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-left transition-all transform hover:scale-105 shadow-lg ${postType === 'Unfold the Tale' ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      <div className="font-bold text-base mb-1">Unfold the Tale</div>
                      <div className="text-xs opacity-90">Create a 5-slide story carousel.</div>
                    </button>
                    <button
                      onClick={() => setPostType("Art Spotlight")}
                      className={`p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg text-left transition-all transform hover:scale-105 shadow-lg ${postType === 'Art Spotlight' ? 'ring-2 ring-purple-400' : ''}`}
                    >
                      <div className="font-bold text-base mb-1">Art Spotlight</div>
                      <div className="text-xs opacity-90">Generate 3 sales-focused variations.</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-2xl font-semibold text-white mb-4">3. Select Your Post Format</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setAspectRatio("3:4")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${ aspectRatio === '3:4' ? 'border-purple-400 bg-purple-900/30' : 'border-white/20 bg-black/30 hover:border-white/30' }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[150px] h-[200px] bg-white/10 border-white/40 border-2 rounded" />
                  <p className="absolute text-white font-semibold bottom-4">Portrait (3:4)</p>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio("9:16")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${ aspectRatio === '9:16' ? 'border-purple-400 bg-purple-900/30' : 'border-white/20 bg-black/30 hover:border-white/30' }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[100px] h-[200px] bg-white/10 border-white/40 border-2 rounded" />
                  <p className="absolute text-white font-semibold bottom-4">Story (9:16)</p>
                </div>
              </button>
              <button
                onClick={() => setAspectRatio("1:1")}
                className={`p-4 rounded-lg border-2 transition-all text-left ${ aspectRatio === '1:1' ? 'border-purple-400 bg-purple-900/30' : 'border-white/20 bg-black/30 hover:border-white/30' }`}
              >
                <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="w-[150px] h-[150px] bg-white/10 border-white/40 border-2 rounded" />
                  <p className="absolute text-white font-semibold bottom-4">Post (1:1)</p>
                </div>
              </button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={generatePosts}
              disabled={isUploading || isGenerating || !processedImage}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Generate Posts
            </button>
          </div>
          
          {generatedPosts.length > 0 && (
            <div>
              <h4 className="text-2xl font-semibold text-white mb-4">Your Generated Posts</h4>
              
              {postType === "Unfold the Tale" ? (
                <div className="max-w-md mx-auto">
                  <CarouselPost posts={generatedPosts} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedPosts.map((post, index) => (
                    <SinglePostCard key={index} post={post} index={index} />
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setExpandedImage(null)}
        >
      <Image src={expandedImage} alt="Expanded view" width={800} height={600} className="max-w-[90vw] max-h-[90vh] object-contain" />
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