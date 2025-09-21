"use client";

import { useState } from "react";
import { translations } from "@/lib/translations";
import { InstructionsProvider, useInstructions } from "@/contexts/InstructionsContext";
import { Header } from "@/components/Header";
import SideNav from "@/components/SideNav";

interface RootLayoutClientProps {
  children: React.ReactNode;
  geistSansClass: string;
  geistMonoClass: string;
}

export function RootLayoutClient({ children, geistSansClass, geistMonoClass }: RootLayoutClientProps) {
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  };

  return (
    <html lang={language}>
      <body className={`${geistSansClass} ${geistMonoClass} antialiased`}>
        <InstructionsProvider>
          <RootLayoutContent 
            language={language} 
            toggleLanguage={toggleLanguage}
          >
            {children}
          </RootLayoutContent>
        </InstructionsProvider>
      </body>
    </html>
  );
}

function RootLayoutContent({ 
  children, 
  language, 
  toggleLanguage 
}: { 
  children: React.ReactNode; 
  language: "en" | "hi"; 
  toggleLanguage: () => void;
}) {
  const { showInstructions, setShowInstructions } = useInstructions();

  return (
    <>
      <Header 
        onMenuClick={() => setShowInstructions(!showInstructions)} 
        onLanguageToggle={toggleLanguage}
        t={translations[language]}
      />
      <SideNav 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        t={translations[language]}
      />
      <div className={`transition-all duration-300 ease-in-out ${showInstructions ? 'ml-80' : 'ml-0'}`}>
        {children}
      </div>
    </>
  );
}