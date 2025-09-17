// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState, useEffect } from 'react';

// --- Icon Components ---
const HelpCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

// --- Localization Data ---
const translations = {
    en: {
        features: "Features",
        signUp: "Sign Up",
        instructions: "Instructions",
        prototypeNotes: "Prototype Notes",
        note1: "The data on this page is hardcoded. Future versions will connect to our API.",
        note2: "Video rendering is currently slow and will be optimized in the full release.",
        note3: "You can scroll down to explore the app's features.",
        slides: [
          { 
            key: 'intro', 
            variant: 'crimson', 
            titleHtml: "Kala<span style='color: #F4C430'>सखी</span>", 
            subtitle: "Your Art's Digital Friend",
            punchline: "From studio to social media, automatically. We handle marketing while you perfect your craft." 
          },
          { 
            key: 'emerald', 
            variant: 'emerald', 
            name: "Vyapar Sarathi", 
            subtitle: "Business Navigator",
            punchline: "You create the art, we steer the business. From posts to profits, automatically." 
          },
          { 
            key: 'emerald-2', 
            variant: 'emerald', 
            name: "Vishwa Vani", 
            subtitle: "Global Voice",
            punchline: "Your art knows no borders. Now your voice won't either. Connect authentically with the world." 
          },
          { 
            key: 'emerald-3', 
            variant: 'emerald', 
            name: "Digital Pratinidhi", 
            subtitle: "Virtual Representative",
            punchline: "Share your craft globally without leaving your studio. Your AI avatar hosts workshops for you." 
          },
          { 
            key: 'cyan', 
            variant: 'cyan', 
            name: "Audience Insights", 
            subtitle: "Deep Connection",
            punchline: "Understand who loves your art and what they want next. Connect with followers like never before." 
          },
          { 
            key: 'amber', 
            variant: 'amber', 
            name: "Virtual Stage", 
            subtitle: "Live Experiences",
            punchline: "Host live workshops and share your process. Build community and monetize your skills directly." 
          },
        ],
    },
    hi: {
        features: "विशेषताएँ",
        signUp: "साइन अप करें",
        instructions: "निर्देश",
        prototypeNotes: "प्रोटोटाइप नोट्स",
        note1: "इस पेज का डेटा हार्डकोड किया गया है। भविष्य के संस्करण हमारे एपीआई से जुड़ेंगे।",
        note2: "वीडियो रेंडरिंग वर्तमान में धीमी है और पूर्ण रिलीज में अनुकूलित की जाएगी।",
        note3: "आप ऐप की विशेषताओं को देखने के लिए नीचे स्क्रॉल कर सकते हैं।",
        slides: [
          { 
            key: 'intro', 
            variant: 'crimson', 
            titleHtml: "Kala<span style='color: #F4C430'>सखी</span>", 
            subtitle: "आपकी कला का डिजिटल मित्र",
            punchline: "आपके स्टूडियो से सोशल मीडिया तक, स्वचालित रूप से। हम मार्केटिंग संभालते हैं, आप अपनी कला को निखारते हैं।" 
          },
          { 
            key: 'emerald', 
            variant: 'emerald', 
            name: "व्यापार सारथी", 
            subtitle: "व्यवसाय नेविगेटर",
            punchline: "आप कला बनाते हैं, हम व्यवसाय चलाते हैं। पोस्ट से मुनाफे तक, स्वचालित रूप से।" 
          },
          { 
            key: 'emerald-2', 
            variant: 'emerald', 
            name: "विश्व वाणी", 
            subtitle: "वैश्विक आवाज",
            punchline: "आपकी कला कोई सीमा नहीं जानती। अब, आपकी आवाज़ भी नहीं। दुनिया से प्रामाणिक रूप से जुड़ें।" 
          },
          { 
            key: 'emerald-3', 
            variant: 'emerald', 
            name: "डिजिटल प्रतिनिधि", 
            subtitle: "आभासी प्रतिनिधि",
            punchline: "अपने स्टूडियो को छोड़े बिना अपनी कला को दुनिया के साथ साझा करें। आपका एआई अवतार आपके लिए कार्यशालाओं की मेजबानी करता है।" 
          },
          { 
            key: 'cyan', 
            variant: 'cyan', 
            name: "दर्शक अंतर्दृष्टि", 
            subtitle: "गहरा संबंध",
            punchline: "समझें कि आपकी कला को कौन पसंद करता है और वे आगे क्या देखना चाहते हैं। अपने अनुयायियों से पहले कभी नहीं की तरह जुड़ें।" 
          },
          { 
            key: 'amber', 
            variant: 'amber', 
            name: "आभासी मंच", 
            subtitle: "लाइव अनुभव",
            punchline: "लाइव कार्यशालाओं की मेजबानी करें और अपनी प्रक्रिया साझा करें। एक समुदाय बनाएं और अपने कौशल का सीधे मुद्रीकरण करें।" 
          },
        ],
    }
};

// --- UI Components ---
const SideNav = ({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: any }) => {
  return (
    <div className={`fixed inset-y-0 left-0 w-60 bg-gradient-to-b from-slate-800 to-black backdrop-blur-lg border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-5">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><XIcon /></button>
        <h2 className="text-xl font-bold text-white mb-6">{t.instructions}</h2>
        <div>
          <h3 className="text-[#F4C430] font-semibold mb-3 text-sm">{t.prototypeNotes}</h3>
          <ul className="text-slate-300 text-sm space-y-3 list-disc list-inside">
            <li>{t.note1}</li>
            <li>{t.note2}</li>
            <li>{t.note3}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Header = ({ onMenuClick, onLanguageToggle, t }: { onMenuClick: () => void; onLanguageToggle: () => void; t: any }) => (
  <header className="fixed top-0 left-0 right-0 z-40 bg-black/50 backdrop-blur-sm border-b border-slate-800/50">
    <div className="container mx-auto px-4 py-3 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold text-white tracking-wider">
          Kala<span style={{ color: '#F4C430' }}>सखी</span>
        </h1>
      </div>
      <nav className="flex items-center space-x-4">
        <a href="#features" className="text-white/80 hover:text-white font-medium transition-opacity hidden sm:block">{t.features}</a>
        <button onClick={onLanguageToggle} className="p-2 text-white hover:bg-white/10 rounded-full" aria-label="Toggle language">
          <GlobeIcon />
        </button>
        <button onClick={onMenuClick} className="p-2 text-white hover:bg-white/10 rounded-full" aria-label="Open instructions">
          <HelpCircleIcon />
        </button>
        <a href="#" className="bg-[#F4C430] text-black font-bold py-2 px-5 rounded-lg hover:bg-amber-400 transition-colors shadow-md">{t.signUp}</a>
      </nav>
    </div>
  </header>
);

const RangoliBackground = () => {
    return (
        <div
            className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden"
            style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, transparent 100%)',
            }}
        >
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <pattern id="rangoli" patternUnits="userSpaceOnUse" width="300" height="300" className="opacity-[0.01]">
                        <g transform="translate(150, 150)">
                            <g className="animate-[spin_45s_linear_infinite]">
                                {[...Array(8)].map((_, i) => (
                                    <path key={i} transform={`rotate(${i * 45})`} d="M 0 -120 C 50 -100, 50 -50, 0 -30 C -50 -50, -50 -100, 0 -120" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
                                ))}
                            </g>
                            <g className="animate-[spin_60s_linear_infinite_reverse]" transform="rotate(22.5)">
                                {[...Array(8)].map((_, i) => (
                                    <circle key={i} transform={`rotate(${i * 45}) translate(0, -75)`} cx="0" cy="0" r="10" stroke="#8B4513" strokeWidth="1.5" fill="none"/>
                                ))}
                            </g>
                            <circle cx="0" cy="0" r="20" fill="none" stroke="#8B4513" strokeWidth="1.5"/>
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rangoli)" />
            </svg>
        </div>
    );
};

const ShineSweep = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-1/3 -left-1/4 h-[200%] w-[60%] rotate-12 bg-gradient-to-b from-white/10 via-white/2 to-transparent blur-2xl" style={{ animation: 'shine 8s ease-in-out infinite' }} />
  </div>
);

function Slide({ active, variant, children }: { active: boolean; variant: string; children: React.ReactNode }) {
  const variantGradient = (v: string) => {
    switch (v) {
      case 'crimson': return 'bg-gradient-to-br from-red-900/80 via-red-800/80 to-rose-900/80';
      case 'emerald': return 'bg-gradient-to-br from-emerald-900/80 via-green-800/80 to-teal-900/80';
      case 'violet': return 'bg-gradient-to-br from-purple-900/80 via-violet-800/80 to-indigo-900/80';
      case 'cyan': return 'bg-gradient-to-br from-cyan-900/80 via-sky-800/80 to-blue-900/80';
      case 'amber': return 'bg-gradient-to-br from-amber-900/80 via-orange-800/80 to-red-900/80';
      default: return 'bg-black/80';
    }
  };

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`absolute inset-0 ${variantGradient(variant)} backdrop-blur-sm`} />
      <ShineSweep />
      <div className="relative z-20 flex flex-col items-center justify-center text-center p-4 h-screen">
        {children}
      </div>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{` 
    @keyframes shine { 
      0% { transform: translateX(-120%) rotate(12deg); opacity: 0; } 
      15% { opacity: 0.3; } 
      50% { transform: translateX(40%) rotate(12deg); opacity: 0.2; } 
      85% { opacity: 0.25; } 
      100% { transform: translateX(160%) rotate(12deg); opacity: 0; } 
    } 
    @keyframes pulse { 
      50% { opacity: 0.5; } 
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(2rem); }
      to { opacity: 1; transform: translateY(0); }
    }
  `}</style>
);

const HeroSection = ({ onMenuClick, t, onLanguageToggle }: { onMenuClick: () => void; t: any; onLanguageToggle: () => void }) => {
  const [current, setCurrent] = useState(0);
  const slides: any[] = t.slides;
  
  const next = () => setCurrent(p => (p === slides.length - 1 ? 0 : p + 1));
  const prev = () => setCurrent(p => (p === 0 ? slides.length - 1 : p - 1));

  useEffect(() => {
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-gradient-to-b from-black to-[#1a0303]">
      <GlobalStyles />
      <RangoliBackground />
      <Header onMenuClick={onMenuClick} onLanguageToggle={onLanguageToggle} t={t} />
      <div className="relative w-full h-full z-10">
        {slides.map((s, i) => (
          <Slide key={s.key} active={i === current} variant={s.variant}>
            {s.key === 'intro' ? (
              <div className="max-w-5xl mx-auto px-4">
                <h2 
                  className="text-6xl md:text-7xl lg:text-10xl font-black mb-2 leading-tight drop-shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: s.titleHtml }} 
                />
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#F4C430] mb-6 drop-shadow-lg">
                  {s.subtitle}
                </h3>
                <p className="max-w-3xl mx-auto text-xl md:text-2xl lg:text-3xl text-stone-200 mb-10 drop-shadow-lg leading-relaxed">
                  {s.punchline}
                </p>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="bg-white text-black font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl text-xl"
                >
                  Explore Now
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white tracking-wider mb-2 drop-shadow-xl">
                  Kala<span style={{ color: '#F4C430' }}>सखी</span>
                </h1>
                <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 leading-tight text-white drop-shadow-2xl">
                  {s.name}
                </h2>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#F4C430] mb-6 drop-shadow-lg">
                  {s.subtitle}
                </h3>
                <p className="max-w-3xl mx-auto text-xl md:text-2xl text-stone-200 drop-shadow-lg">
                  {s.punchline}
                </p>
              </div>
            )}
          </Slide>
        ))}
      </div>
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
        <ChevronLeftIcon />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
        <ChevronRightIcon />
      </button>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)} 
            className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm ${i === current ? 'bg-white w-6' : 'bg-white/50'}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
export { SideNav, Header };