"use client";
import React, { useState, useRef, useEffect } from "react";
import CreatePostSection from "./CreatePostSection";
import PostGeneration from "./post_generation/page";
import PhotoGuidance from "./photo_guidance/page";
import CreateYourOwn from "./create_your_own/page";
import { useInstructions } from "@/contexts/InstructionsContext";

// An inline SVG for the back arrow icon
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6"
  >
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />yy
  </svg>
);

// --- Icons for the Feature Cards ---
const PodcastIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const SocialMediaIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

export default function KalaSakhiLandingPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const expandedSectionRef = useRef<HTMLDivElement | null>(null);
  const { setInstructions } = useInstructions();

  // Update instructions based on expanded section
  useEffect(() => {
    // A reusable header component for consistent styling
    const InstructionsHeader = () => (
      <div className="mb-3">
        <h3 className="font-semibold text-lg tracking-wide uppercase text-purple-300">
          Instructions for Prototype
        </h3>
      </div>
    );

    // ...inside the useEffect hook of your component

    const sectionInstructions = {
      default: (
        <>
          <InstructionsHeader />
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>
              <strong>Social Media Post Generation:</strong> Choose your artwork, select the optimal aspect ratio for your platform, and instantly generate engaging posts with trending hashtags and captivating captions.
            </li>
            <li>
              <strong>Podcast Creation:</strong> Select language and duration, choose between audio-only or face-based podcasts, upload face video if needed, and generate AI-powered scripts, audio, and lip-sync videos.
            </li>
            <li>
              <strong>Photography Guidance:</strong> Get expert tips for capturing professional-quality photos of your crafts, including lighting, angles, composition, and staging recommendations.
            </li>
            <li>
              <strong>&quot;Create Your Own Post&quot; Studio:</strong> Utilize an
              intuitive canvas editor, empowered by a vast library of stock
              images and AI-generated visuals from Gemini, to craft and
              customize unique posts.
            </li>
          </ul>
        </>
      ),
      1: (
        <>
          <InstructionsHeader />
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>
              <strong>Language Selection:</strong> Choose from a wide array of
              languages for your podcast.
            </li>
            <li>
              <strong>Duration Control:</strong> Define the desired length of your
              podcast.
            </li>
            <li>
              <strong>Audio-Visual Options:</strong> Select between audio-only or
              an A/V podcast. (Note: Face-cloning is not implemented in this
              prototype).
            </li>
            <li>
              <strong>Content Generation:</strong> Opt for a fully AI-generated
              script, or input specific questions to guide the AI.
            </li>
            <li>
              <strong>Face Video Upload:</strong> For face podcasts, click &ldquo;Upload Face Video&rdquo; to record or upload a video of your face for lip-sync animation.
            </li>
            <li>
              <strong>Narrator Gender:</strong> Select male or female narrator for the voice and lip-sync.
            </li>
            <li>
              <strong>Creating the Podcast:</strong> Enter a main topic, select suggested topics if needed, and click &ldquo;Create Podcast&rdquo; to generate the script, audio, and video.
            </li>
          </ul>
        </>
      ),
      4: (
        <>
          <InstructionsHeader />
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>
              <strong>Artwork Selection:</strong> Choose the specific art or
              craft piece you wish to promote.
            </li>
            <li>
              <strong>Aspect Ratio:</strong> Select the optimal aspect ratio for
              your desired social media platform.
            </li>
            <li>
              <strong>AI-Powered Generation:</strong> Instantly generate posts with
              trending hashtags and engaging captions.
            </li>
            <li>
              <strong>Iterate:</strong> Easily generate more variations if you&apos;re not
              satisfied.
            </li>
          </ul>
        </>
      ),
      3: (
        <>
          <InstructionsHeader />
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>
              <strong>&quot;Studio at Home&quot; Guidance:</strong> Learn to capture
              professional, studio-quality photos using just a smartphone.
            </li>
            <li>
              <strong>Visual & Detailed Instructions:</strong> Each tip includes
              clear graphics, step-by-step methods, and recommended camera
              settings.
            </li>
          </ul>
        </>
      ),
      5: (
        <>
          <InstructionsHeader />
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>
              <strong>Upload Your Photo:</strong> Start by uploading an image of your traditional art piece.
            </li>
            <li>
              <strong>Drawing Tools:</strong> Use the brush to add freehand sketches, adjust color and size as needed.
            </li>
            <li>
              <strong>Text Addition:</strong> Add custom text with adjustable color, font size, and various font options by clicking on the canvas.
            </li>
            <li>
              <strong>Edit & Download:</strong> Clear the canvas to start over or download your customized post.
            </li>
          </ul>
        </>
      )
    };

    // Set the instructions, defaulting to the main view if no section is expanded
    setInstructions(
      sectionInstructions[expandedSection as keyof typeof sectionInstructions] ||
      sectionInstructions.default
    );
  }, [expandedSection, setInstructions]);

  const cardData = [
    {
      id: 1,
      title: "Create a Podcast",
      details:
        "Transform your craft stories into engaging audio content. Our AI-powered podcast creator helps you script, record, and edit professional-quality podcasts about your traditional art. Share the history, techniques, and passion behind your work with a global audience.",
      buttonText: "Start Recording",
      image:
        "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      Icon: PodcastIcon,
    },
    {
      id: 4,
      title: "Social Media Posts",
      details:
        "Effortlessly create stunning social media content that showcases your traditional crafts. Our AI assistant generates captivating captions, and creates visually appealing layouts. From Instagram stories to Facebook posts, reach thousands of potential customers with professionally crafted content that tells your unique story and drives sales.",
      buttonText: "Generate Posts",
      image:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      Icon: SocialMediaIcon,
    },
    {
      id: 3,
      title: "Photography Guidance",
      details:
        "Capture stunning photos of your crafts with AI-powered guidance. Get real-time suggestions for lighting, angles, composition, and staging to make your art pieces look museum-worthy, using either a smartphone or professional camera",
      buttonText: "Get Photo Tips",
      image:
        "https://i.postimg.cc/hG7XR1W4/photography-lighting.jpg",
      Icon: CameraIcon,
    },
    {
      id: 5,
      title: "Create Your Own Post",
      details:
        "Design and customize your marketing materials with our intuitive editor. Mix and match templates, add your own images, write compelling copy, and create everything from business cards to promotional flyers. Full creative control with AI assistance to ensure your brand stays authentic to your traditional roots while appealing to modern audiences.",
      buttonText: "Coming Soon",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      Icon: EditIcon,
    },
  ];

  const handleCardClick = (cardId: number) => {
    if (expandedSection === cardId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(cardId);
    }
  };
  
  // Scroll into view when a section is expanded
  useEffect(() => {
    if (expandedSection && expandedSectionRef.current) {
      const timer = setTimeout(() => {
        if (expandedSectionRef.current) {
          expandedSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 200); // A small delay ensures the element is rendered before scrolling
      return () => clearTimeout(timer);
    }
  }, [expandedSection]);


  return (
    <>
      <main
        className="
          relative
          flex
          flex-col
          items-center
          justify-start
          min-h-screen
          w-full
          bg-gradient-to-br from-[#4b006e] via-[#2d1b69] to-[#1d002a]
          text-white
          font-['Inter',_sans-serif]
          p-4
          pt-24 sm:pt-32
          overflow-hidden
        "
      >
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

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="
            absolute 
            top-24 
            left-8 
            flex 
            items-center 
            justify-center 
            p-3
            bg-white/10
            hover:bg-white/20
            rounded-full
            transition-all
            duration-300
            focus:outline-none
            focus:ring-4
            focus:ring-white/30
            z-20
          "
          aria-label="Go back"
        >
          <BackArrowIcon />
        </button>

        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto w-full relative z-10">
          <h2
            className="
              text-5xl 
              md:text-7xl 
              font-bold 
              text-transparent 
              bg-clip-text
              bg-gradient-to-r from-gray-100 via-purple-200 to-gray-400
              mb-6
              font-['Hind',_sans-serif]
            "
          >
            From Heritage to Hashtags.
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-12">
            Bring your timeless craft to the digital world, effortlessly.
          </p>
        </div>

        {/* Interactive Cards */}
        <div className="flex w-full max-w-6xl mx-auto h-[480px] gap-4 mt-4 px-4 relative z-10">
          {cardData.map((card) => {
            const isHovered = hoveredCard === card.id;

            return (
              <div
                key={card.id}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`
                  relative p-6 rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md
                  flex flex-col items-center justify-center text-center overflow-hidden
                  transition-all duration-500 ease-in-out cursor-pointer
                  hover:border-purple-400/50 hover:bg-black/40
                  ${isHovered ? "flex-[3]" : "flex-[1]"}
                `}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 opacity-20 transition-opacity duration-500"
                  style={{
                    backgroundImage: `url('${card.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between items-center h-full w-full p-6">
                  {/* Top Section: Icon and Title */}
                  <div className="text-center">
                    <card.Icon
                      className={`
                        transition-all duration-500 ease-in-out text-white/90 mb-4 mx-auto
                        ${isHovered ? "w-16 h-16" : "w-20 h-20"}
                      `}
                    />
                    <h3
                      className={`
                        font-bold text-xl transition-all duration-500 ease-in-out
                        ${
                          isHovered
                            ? "opacity-0 -translate-y-4"
                            : "opacity-100 translate-y-0"
                        }
                      `}
                    >
                      {card.title}
                    </h3>
                  </div>

                  {/* Bottom Section: Details and Button */}
                  <div
                    className={`
                      w-full max-w-md text-center
                      transition-all duration-500 ease-in-out
                      ${
                        isHovered
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-10"
                      }
                    `}
                  >
                    {/* Show title again here for the expanded view */}
                    <h3 className="font-bold text-2xl mb-4">{card.title}</h3>
                    <p className="text-gray-200 text-base leading-relaxed mb-6">
                      {card.details}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.id === 5) {
                          setExpandedSection(5);
                        } else {
                          handleCardClick(card.id);
                        }
                      }}
                      className={`px-8 py-3 rounded-lg text-white font-semibold transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 shadow-lg
                                 ${card.id === 5
                                   ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 transform hover:scale-105 hover:shadow-purple-500/25'
                                   : 'bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 transform hover:scale-105 hover:shadow-purple-500/25'
                                 }`}
                    >
                      {card.id === 5 ? 'Open Studio' : card.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Expanded Section */}
          {expandedSection && (
            <div
              ref={expandedSectionRef}
              className="w-full bg-gradient-to-bl from-[#1d002a] via-[#2d1b69] to-[#4b006e] relative"
            >
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

              <div className="relative z-10">
                {expandedSection === 3 ? (
                  <PhotoGuidance />
                ) : expandedSection === 4 ? (
                  <PostGeneration />
                ) : expandedSection === 5 ? (
                  <CreateYourOwn />
                ) : (
                  (() => {
                    const card = cardData.find(
                      (card) => card.id === expandedSection
                    );
                    return card ? (
                      <CreatePostSection
                        cardId={expandedSection}
                        onClose={() => setExpandedSection(null)}
                        cardData={card}
                      />
                    ) : null;
                  })()
                )}
              </div>
            </div>
          )}
    </>
  );
}