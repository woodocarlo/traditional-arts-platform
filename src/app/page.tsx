"use client";

import React, { useState, useEffect, Fragment, useRef, useCallback } from 'react';
import HeroSection from '../components/HeroSection';
import DashboardSection from '../components/DashboardSection';
import FeaturesSection from '../components/FeaturesSection';


type Language = 'en' | 'hi';

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
const PowerIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>
);
const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const TwitterIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616v.064c0 2.298 1.634 4.218 3.799 4.661-.428.116-.88.178-1.348.178-.285 0-.56-.027-.83-.079.613 1.943 2.413 3.328 4.544 3.365-1.789 1.399-4.049 2.203-6.447 2.203-.418 0-.83-.024-1.23-.07 2.289 1.453 5.013 2.301 7.913 2.301 9.493 0 14.693-7.859 14.693-14.693 0-.224-.005-.447-.014-.67.998-.722 1.864-1.622 2.56-2.658z"></path></svg>
);
const InstagramIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.012 3.584-.07 4.85c-.148 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.148-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.85-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.44-1.441-1.44z"></path></svg>
);
const LinkedInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400 hover:text-white transition-colors"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-4.47 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path></svg>
);
const FacebookIcon = ({className}: {className?: string}) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>);

const BrushIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-[#F4C430]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);
const GrowthIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-[#F4C430]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
);
const VideoCameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-[#F4C430]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 text-[#F4C430]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const TrendingUpIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>);
const CalendarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const LightbulbIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 18h6M12 22V18M9 14.02V14a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v.02M12 2a7.3 7.3 0 0 0-4.63 12.63C7.8 15.07 9 15.45 9 16.5V18h6v-1.5c0-1.05 1.2-1.43 1.63-1.87A7.3 7.3 0 0 0 12 2z"></path></svg>);
const SparklesIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3L9.27 9.27L3 12l6.27 2.73L12 21l2.73-6.27L21 12l-6.27-2.73z"></path></svg>);
const ChartBarIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"></path></svg>);
const UsersIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><path d="M20 8v6M23 11h-6"></path></svg>);

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
        dashboardTitle: "Your Creative Dashboard",
        dashboardSubtitle: "An overview of your digital presence and art business, powered by AI.",
        autopilotTitle: "Creative Autopilot",
        autopilotDesc: "Let your AI assistant take the wheel. Focus on your art while we manage your social presence.",
        monthlyStats: "Monthly Stats",
        monthlyStatsDesc: "Here's a snapshot of your performance this month.",
        postsMade: "Posts Made",
        totalSales: "Total Sales",
        audienceGrowth: "Audience Growth",
        pendingOrders: "Pending Orders",
        order: "Order",
        price: "Price",
        pickup: "Pickup/Shipping",
        upcomingEvents: "Upcoming Events",
        liveWorkshop: "Live Madhubani Workshop",
        onlineTutorial: "Pre-recorded tutorial release",
        trendingTopics: "Trending Topics",
        aiSuggestion: "AI Suggestion",
        aiSuggestionText: "Combining '#AIinArt' with traditional '#MadhubaniRevival' could attract a new, tech-savvy audience. Consider creating a piece that blends these themes.",
        socialEngagement: "Social Media Engagement",
        shares: "Shares",
        comments: "Comments",
        inquiries: "Inquiries",
        off: "OFF",
        on: "ON",
        autopilotEngaged: "Autopilot Engaged",
        autopilotStandby: "Autopilot is Standing By",
        footerRights: "All rights reserved.",
        featuresTitle: "Your All-in-One Digital Toolkit",
        featuresSubtitle: "Select a tool to transform your online presence and grow your art business.",
        creativeStudio: "Creative Studio",
        creativeStudioDesc: "Design, edit, and generate stunning social media posts with AI assistance.",
        artworkGallery: "Artwork Gallery",
        artworkGalleryDesc: "Showcase your portfolio of photos and videos for the world to see.",
        growthWallet: "Growth Wallet",
        growthWalletDesc: "Fund marketing campaigns, manage your budget, and track your audience reach.",
        hostWorkshop: "Host a Workshop",
        hostWorkshopDesc: "Organize and stream live webinars or tutorials directly to your followers.",
        slides: [
          { key: 'intro', variant: 'crimson', titleHtml: "Kalaसखी: <span class='text-[#F4C430]'>Your Art's <br/>Digital Friend.</span>", punchline: "From your studio to social media, automatically. We handle the marketing, you perfect your craft." },
          { key: 'emerald', variant: 'emerald', name: "Vyapar Sarathi", punchline: "You craft the art, we pilot the business. From posts to profits, automatically." },
          { key: 'emerald-2', variant: 'emerald', name: "Vishwa Vani", punchline: "Your art knows no boundaries. Now, your voice won't either. Connect with the world, authentically." },
          { key: 'emerald-3', variant: 'emerald', name: "Digital Pratinidhi", punchline: "Share your craft with the world, without leaving your studio. Your AI avatar hosts workshops for you." },
          { key: 'cyan', variant: 'cyan', name: "Audience Insights", punchline: "Connect with your followers like never before. Understand who loves your art and what they want to see next." },
          { key: 'amber', variant: 'amber', name: "Your Virtual Stage", punchline: "Host live workshops and share your process, all handled by your AI assistant. Build a community and monetize your skills directly." },
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
        dashboardTitle: "आपका रचनात्मक डैशबोर्ड",
        dashboardSubtitle: "एआई द्वारा संचालित आपकी डिजिटल उपस्थिति और कला व्यवसाय का अवलोकन।",
        autopilotTitle: "रचनात्मक ऑटोपायलट",
        autopilotDesc: "अपने एआई सहायक को पहिया लेने दें। अपनी कला पर ध्यान केंद्रित करें जब हम आपकी सामाजिक उपस्थिति का प्रबंधन करते हैं।",
        monthlyStats: "मासिक आँकड़े",
        monthlyStatsDesc: "यहाँ इस महीने के आपके प्रदर्शन का एक स्नैपशॉट है।",
        postsMade: "पोस्ट किए गए",
        totalSales: "कुल बिक्री",
        audienceGrowth: "दर्शक वृद्धि",
        pendingOrders: "लंबित आदेश",
        order: "आदेश",
        price: "कीमत",
        pickup: "पिकअप/शिपिंग",
        upcomingEvents: "आगामी कार्यक्रम",
        liveWorkshop: "लाइव मधुबनी कार्यशाला",
        onlineTutorial: "प्री-रिकॉर्डेड ट्यूटोरियल रिलीज़",
        trendingTopics: "प्रचलित विषय",
        aiSuggestion: "एआई सुझाव",
        aiSuggestionText: "पारंपरिक '#MadhubaniRevival' के साथ '#AIinArt' को मिलाने से एक नया, तकनीक-प्रेमी दर्शक आकर्षित हो सकता है। इन विषयों को मिलाने वाली एक कलाकृति बनाने पर विचार करें।",
        socialEngagement: "सोशल मीडिया एंगेजमेंट",
        shares: "शेयर",
        comments: "टिप्पणियाँ",
        inquiries: "पूछताछ",
        off: "बंद",
        on: "चालू",
        autopilotEngaged: "ऑटोपायलट संलग्न",
        autopilotStandby: "ऑटोपायलट स्टैंडबाय पर है",
        footerRights: "सर्वाधिकार सुरक्षित।",
        featuresTitle: "आपका ऑल-इन-वन डिजिटल टूलकिट",
        featuresSubtitle: "अपनी ऑनलाइन उपस्थिति बदलने और अपने कला व्यवसाय को बढ़ाने के लिए एक उपकरण चुनें।",
        creativeStudio: "क्रिएटिव स्टूडियो",
        creativeStudioDesc: "एआई सहायता से शानदार सोशल मीडिया पोस्ट डिजाइन, संपादित करें और बनाएं।",
        artworkGallery: "कलाकृति गैलरी",
        artworkGalleryDesc: "दुनिया को देखने के लिए अपनी तस्वीरों और वीडियो का पोर्टफोलियो प्रदर्शित करें।",
        growthWallet: "ग्रोथ वॉलेट",
        growthWalletDesc: "विपणन अभियानों को निधि दें, अपने बजट का प्रबंधन करें, और अपनी दर्शक पहुंच को ट्रैक करें।",
        hostWorkshop: "एक कार्यशाला की मेजबानी करें",
        hostWorkshopDesc: "अपने अनुयायियों को सीधे लाइव वेबिनार या ट्यूटोरियल व्यवस्थित और स्ट्रीम करें।",
        slides: [
          { key: 'intro', variant: 'crimson', titleHtml: "Kalaसखी: <span class='text-[#F4C430]'>आपकी कला का <br/>डिजिटल मित्र।</span>", punchline: "आपके स्टूडियो से सोशल मीडिया तक, स्वचालित रूप से। हम मार्केटिंग संभालते हैं, आप अपनी कला को निखारते हैं।" },
          { key: 'emerald', variant: 'emerald', name: "व्यापार सारथी", punchline: "आप कला बनाते हैं, हम व्यवसाय चलाते हैं। पोस्ट से मुनाफे तक, स्वचालित रूप से।" },
          { key: 'emerald-2', variant: 'emerald', name: "विश्व वाणी", punchline: "आपकी कला कोई सीमा नहीं जानती। अब, आपकी आवाज़ भी नहीं। दुनिया से जुड़ें, प्रामाणिक रूप से।" },
          { key: 'emerald-3', variant: 'emerald', name: "डिजिटल प्रतिनिधि", punchline: "अपने स्टूडियो को छोड़े बिना अपनी कला को दुनिया के साथ साझा करें। आपका एआई अवतार आपके लिए कार्यशालाओं की मेजबानी करता है।" },
          { key: 'cyan', variant: 'cyan', name: "दर्शक अंतर्दृष्टि", punchline: "अपने अनुयायियों से ऐसे जुड़ें जैसे पहले कभी नहीं। समझें कि आपकी कला को कौन पसंद करता है और वे आगे क्या देखना चाहते हैं।" },
          { key: 'amber', variant: 'amber', name: "आपका वर्चुअल स्टेज", punchline: "लाइव कार्यशालाओं की मेजबानी करें और अपनी प्रक्रिया साझा करें, यह सब आपके एआई सहायक द्वारा नियंत्रित किया जाता है। एक समुदाय बनाएं और अपने कौशल का मुद्रीकरण करें।" },
        ],
    }
};

// --- UI Components ---
const SideNav = ({ isOpen, onClose, t }: { isOpen: boolean; onClose: () => void; t: any }) => {
  return (
    <Fragment>
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
    </Fragment>
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
                    <pattern id="rangoli" patternUnits="userSpaceOnUse" width="300" height="300" className="opacity-[0.03]">
                        <g transform="translate(150, 150)">
                           <g className="animate-[spin_45s_linear_infinite]">
                               {[...Array(8)].map((_, i) => (
                                   <path key={i} transform={`rotate(${i * 45})`} d="M 0 -120 C 50 -100, 50 -50, 0 -30 C -50 -50, -50 -100, 0 -120" stroke="#F4C430" strokeWidth="1.5" fill="none"/>
                               ))}
                           </g>
                           <g className="animate-[spin_60s_linear_infinite_reverse]">
                                {[...Array(8)].map((_, i) => (
                                     <circle key={i} transform={`rotate(${i * 45}) translate(0, -75)`} cx="0" cy="0" r="10" stroke="#F4C430" strokeWidth="1.5" fill="none"/>
                                ))}
                           </g>
                           <circle cx="0" cy="0" r="20" fill="none" stroke="#F4C430" strokeWidth="1.5"/>
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
    <div className="absolute -top-1/3 -left-1/4 h-[200%] w-[60%] rotate-12 bg-gradient-to-b from-white/20 via-white/5 to-transparent blur-2xl" style={{ animation: 'shine 8s ease-in-out infinite' }} />
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
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center p-4">
        {children}
      </div>
    </div>
  );
}

const GlobalStyles = () => (
  <style>{` @keyframes shine { 0% { transform: translateX(-120%) rotate(12deg); opacity: 0; } 15% { opacity: 0.3; } 50% { transform: translateX(40%) rotate(12deg); opacity: 0.2; } 85% { opacity: 0.25; } 100% { transform: translateX(160%) rotate(12deg); opacity: 0; } } @keyframes pulse { 50% { opacity: 0.5; } }`}</style>
);





const Footer = ({ t }: { t: any }) => (
    <footer className="bg-black/30 border-t border-slate-800/50 py-6">
        <div className="container mx-auto px-4 text-center text-slate-400">
            <div className="flex justify-center space-x-6 mb-3">
                <a href="#"><TwitterIcon className="text-slate-400 hover:text-white transition-colors" /></a>
                <a href="#"><InstagramIcon className="text-slate-400 hover:text-white transition-colors" /></a>
                <a href="#"><LinkedInIcon /></a>
            </div>
            <p className="text-sm">&copy; {new Date().getFullYear()} Kalaसखी. {t.footerRights}</p>
        </div>
    </footer>
);

// --- Main App Component ---
export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prevLang => (prevLang === 'en' ? 'hi' : 'en'));
  };

  const t = translations[language];

  return (
    <Fragment>
      <SideNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} t={t} />
      <div className={`font-sans bg-black transition-all duration-300 ease-in-out ${isNavOpen ? 'md:ml-60' : 'ml-0'}`}>
        <HeroSection onMenuClick={() => setIsNavOpen(!isNavOpen)} onLanguageToggle={toggleLanguage} t={t} />
        <DashboardSection t={t} />
        <FeaturesSection t={t} />
        <Footer t={t} />
      </div>
    </Fragment>
  );
}

